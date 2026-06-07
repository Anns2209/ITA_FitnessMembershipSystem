const store = require("./store");
const auth = require("./auth");

const ok = (body, statusCode = 200) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body)
});

const error = (message, statusCode = 400) => ok({ error: message }, statusCode);

function parse(event) {
  if (!event?.body) return {};
  return typeof event.body === "string" ? JSON.parse(event.body) : event.body;
}

function requireUser(event) {
  const user = auth.getUser(event);
  if (!user) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  return user;
}

function saveAudit(type, payload) {
  const audits = store.read("audits");
  const entry = { auditId: store.id("audit"), type, payload, createdAt: new Date().toISOString() };
  audits.push(entry);
  store.write("audits", audits);
  return entry;
}

async function login(event) {
  const body = parse(event);
  if (!body.email || !body.password) return error("email and password are required");
  const role = body.email.endsWith("@fitness.local") ? "staff" : "member";
  return ok({ token: auth.sign({ sub: body.email, role }), role });
}

async function authorize(event) {
  const token = event?.headers?.authorization || event?.headers?.Authorization || event?.authorizationToken;
  const payload = auth.verify(token);
  const principalId = payload?.sub || "anonymous";
  const effect = payload ? "Allow" : "Deny";
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [{ Action: "execute-api:Invoke", Effect: effect, Resource: event.methodArn || "*" }]
    },
    context: payload || {}
  };
}

async function registerMember(event) {
  try {
    const user = requireUser(event);
    const body = parse(event);
    if (!body.name || !body.email) return error("name and email are required");
    const members = store.read("members");
    const member = {
      memberId: store.id("mem"),
      name: body.name,
      email: body.email,
      cardId: body.cardId || store.id("card"),
      status: "active",
      createdBy: user.sub,
      createdAt: new Date().toISOString()
    };
    members.push(member);
    store.write("members", members);
    saveAudit("USER_REGISTERED", { memberId: member.memberId, email: member.email });
    return ok(member, 201);
  } catch (err) {
    return error(err.message, err.statusCode || 500);
  }
}

async function getMember(event) {
  try {
    requireUser(event);
    const memberId = event.pathParameters?.memberId;
    const member = store.read("members").find((row) => row.memberId === memberId);
    return member ? ok(member) : error("member not found", 404);
  } catch (err) {
    return error(err.message, err.statusCode || 500);
  }
}

async function createSubscription(event) {
  try {
    requireUser(event);
    const body = parse(event);
    if (!body.memberId || !body.validUntil) return error("memberId and validUntil are required");
    const subscriptions = store.read("subscriptions");
    const subscription = {
      subscriptionId: store.id("sub"),
      memberId: body.memberId,
      plan: body.plan || "monthly",
      validUntil: body.validUntil,
      status: "active",
      createdAt: new Date().toISOString()
    };
    subscriptions.push(subscription);
    store.write("subscriptions", subscriptions);
    saveAudit("SUBSCRIPTION_CREATED", subscription);
    return ok(subscription, 201);
  } catch (err) {
    return error(err.message, err.statusCode || 500);
  }
}

async function createPayment(event) {
  try {
    requireUser(event);
    const body = parse(event);
    if (!body.memberId || !body.amount) return error("memberId and amount are required");
    const payments = store.read("payments");
    const payment = {
      paymentId: store.id("pay"),
      memberId: body.memberId,
      amount: Number(body.amount),
      status: body.status || "paid",
      providerRef: body.providerRef || null,
      createdAt: new Date().toISOString()
    };
    payments.push(payment);
    store.write("payments", payments);
    saveAudit("PAYMENT_RECORDED", payment);
    return ok({ payment, queuedNotification: true }, 201);
  } catch (err) {
    return error(err.message, err.statusCode || 500);
  }
}

async function checkIn(event) {
  try {
    requireUser(event);
    const body = parse(event);
    const member = store.read("members").find((row) => row.cardId === body.cardId || row.memberId === body.memberId);
    if (!member) return error("member not found", 404);
    const now = new Date();
    const subscription = store
      .read("subscriptions")
      .filter((row) => row.memberId === member.memberId && row.status === "active")
      .sort((a, b) => new Date(b.validUntil) - new Date(a.validUntil))[0];
    const hasValidSubscription = subscription && new Date(subscription.validUntil) >= now;
    const hasDebt = store.read("payments").some((row) => row.memberId === member.memberId && row.status === "failed");
    const allowed = Boolean(member.status === "active" && hasValidSubscription && !hasDebt);
    const access = {
      accessId: store.id("access"),
      memberId: member.memberId,
      allowed,
      reason: allowed ? "ACCESS_GRANTED" : "ACCESS_DENIED",
      checkedAt: now.toISOString()
    };
    const accesses = store.read("accesses");
    accesses.push(access);
    store.write("accesses", accesses);
    saveAudit("ACCESS_CHECK", access);
    return ok(access);
  } catch (err) {
    return error(err.message, err.statusCode || 500);
  }
}

async function uploadDocument(event) {
  try {
    requireUser(event);
    const body = parse(event);
    const memberId = event.pathParameters?.memberId || body.memberId;
    if (!memberId || !body.fileName) return error("memberId and fileName are required");
    const document = {
      documentId: store.id("doc"),
      memberId,
      fileName: body.fileName,
      contentType: body.contentType || "application/octet-stream",
      status: "pending-scan",
      uploadedAt: new Date().toISOString()
    };
    const documents = store.read("documents");
    documents.push(document);
    store.write("documents", documents);
    saveAudit("DOCUMENT_UPLOAD_REQUESTED", document);
    return ok(document, 201);
  } catch (err) {
    return error(err.message, err.statusCode || 500);
  }
}

async function memberDbChange(event) {
  const records = event.Records || [];
  const changes = records.map((record) => ({
    eventName: record.eventName,
    memberId: record.dynamodb?.Keys?.memberId?.S || record.memberId || "unknown"
  }));
  changes.forEach((change) => saveAudit("MEMBER_DB_CHANGE", change));
  return { processed: changes.length, changes };
}

async function documentUploaded(event) {
  const records = event.Records || [];
  const documents = store.read("documents");
  const processed = records.map((record) => {
    const key = decodeURIComponent(record.s3?.object?.key || "");
    const document = documents.find((row) => key.endsWith(row.fileName));
    if (document) document.status = "verified";
    saveAudit("DOCUMENT_UPLOADED", { bucket: record.s3?.bucket?.name, key, documentId: document?.documentId });
    return { key, documentId: document?.documentId || null };
  });
  store.write("documents", documents);
  return { processed: processed.length, files: processed };
}

async function processNotification(event) {
  const records = event.Records || [];
  const notifications = store.read("notifications");
  records.forEach((record) => {
    const message = typeof record.body === "string" ? JSON.parse(record.body) : record.body;
    notifications.push({ notificationId: store.id("ntf"), ...message, sentAt: new Date().toISOString() });
    saveAudit("NOTIFICATION_SENT", message);
  });
  store.write("notifications", notifications);
  return { processed: records.length };
}

async function nightlySubscriptionAudit() {
  const soon = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const expiring = store.read("subscriptions").filter((row) => new Date(row.validUntil).getTime() <= soon);
  expiring.forEach((subscription) => saveAudit("SUBSCRIPTION_EXPIRING", subscription));
  return { expiringCount: expiring.length, subscriptions: expiring };
}

async function gateSensorEvent(event) {
  const cardId = event.detail?.cardId || event.cardId;
  const token = auth.sign({ sub: "iot-gate@fitness.local", role: "device" });
  return checkIn({ headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ cardId }) });
}

async function paymentProviderWebhook(event) {
  const body = parse(event);
  if (!body.providerRef || !body.memberId || !body.amount) return error("providerRef, memberId and amount are required");
  const token = auth.sign({ sub: "payment-provider", role: "integration" });
  const response = await createPayment({ headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  saveAudit("PAYMENT_WEBHOOK_RECEIVED", { providerRef: body.providerRef, statusCode: response.statusCode });
  return response;
}

async function logAlert(event) {
  const message = Buffer.from(event.awslogs?.data || "", "base64").toString("utf8");
  const alert = saveAudit("LOG_ALERT", { message: message || "cloudwatch alert received" });
  return { alertId: alert.auditId };
}

module.exports = {
  login,
  authorize,
  registerMember,
  getMember,
  createSubscription,
  createPayment,
  checkIn,
  uploadDocument,
  memberDbChange,
  documentUploaded,
  processNotification,
  nightlySubscriptionAudit,
  gateSensorEvent,
  paymentProviderWebhook,
  logAlert
};
