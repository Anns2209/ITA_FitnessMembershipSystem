const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");

process.env.AUTH_SECRET = "test-secret";
process.env.DATA_DIR = path.join(os.tmpdir(), "fitness-serverless-tests");

const handlers = require("../src/handlers");
const store = require("../src/store");

function event(body, token, pathParameters = {}) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    pathParameters,
    body: JSON.stringify(body)
  };
}

async function token() {
  const response = await handlers.login(event({ email: "admin@fitness.local", password: "secret" }));
  return JSON.parse(response.body).token;
}

test.beforeEach(() => store.reset());

test("login returns a signed token and authorizer allows it", async () => {
  const signed = await token();
  const result = await handlers.authorize({ headers: { authorization: `Bearer ${signed}` }, methodArn: "arn:test" });

  assert.equal(result.policyDocument.Statement[0].Effect, "Allow");
  assert.equal(result.principalId, "admin@fitness.local");
});

test("protected member registration rejects missing token", async () => {
  const response = await handlers.registerMember(event({ name: "No Token", email: "no@example.com" }));

  assert.equal(response.statusCode, 401);
});

test("member, subscription, payment and access flow grants access", async () => {
  const signed = await token();
  const memberResponse = await handlers.registerMember(event({ name: "Ana Novak", email: "ana@example.com", cardId: "CARD-1" }, signed));
  const member = JSON.parse(memberResponse.body);

  const subResponse = await handlers.createSubscription(event({ memberId: member.memberId, validUntil: "2099-01-01", plan: "annual" }, signed));
  const payResponse = await handlers.createPayment(event({ memberId: member.memberId, amount: 49.9, status: "paid" }, signed));
  const accessResponse = await handlers.checkIn(event({ cardId: "CARD-1" }, signed));
  const access = JSON.parse(accessResponse.body);

  assert.equal(memberResponse.statusCode, 201);
  assert.equal(subResponse.statusCode, 201);
  assert.equal(payResponse.statusCode, 201);
  assert.equal(access.allowed, true);
  assert.equal(access.reason, "ACCESS_GRANTED");
});

test("access is denied when subscription is expired", async () => {
  const signed = await token();
  const memberResponse = await handlers.registerMember(event({ name: "Bojan Kralj", email: "bojan@example.com", cardId: "CARD-2" }, signed));
  const member = JSON.parse(memberResponse.body);

  await handlers.createSubscription(event({ memberId: member.memberId, validUntil: "2020-01-01" }, signed));
  const accessResponse = await handlers.checkIn(event({ cardId: "CARD-2" }, signed));
  const access = JSON.parse(accessResponse.body);

  assert.equal(access.allowed, false);
  assert.equal(access.reason, "ACCESS_DENIED");
});

test("document upload HTTP request is completed by S3 upload event", async () => {
  const signed = await token();
  const memberResponse = await handlers.registerMember(event({ name: "Cene Kos", email: "cene@example.com" }, signed));
  const member = JSON.parse(memberResponse.body);
  const uploadResponse = await handlers.uploadDocument(event({ fileName: "health.pdf" }, signed, { memberId: member.memberId }));
  const uploaded = JSON.parse(uploadResponse.body);

  const result = await handlers.documentUploaded({
    Records: [{ s3: { bucket: { name: "fitness-files" }, object: { key: `${member.memberId}/health.pdf` } } }]
  });
  const document = store.read("documents").find((row) => row.documentId === uploaded.documentId);

  assert.equal(result.processed, 1);
  assert.equal(document.status, "verified");
});

test("DynamoDB stream event creates audit entries", async () => {
  const result = await handlers.memberDbChange({
    Records: [{ eventName: "INSERT", dynamodb: { Keys: { memberId: { S: "mem_1" } } } }]
  });

  assert.equal(result.processed, 1);
  assert.equal(store.read("audits").some((row) => row.type === "MEMBER_DB_CHANGE"), true);
});

test("SQS notification event persists sent notification", async () => {
  const result = await handlers.processNotification({
    Records: [{ body: JSON.stringify({ memberId: "mem_1", channel: "email", template: "payment-receipt" }) }]
  });

  assert.equal(result.processed, 1);
  assert.equal(store.read("notifications")[0].template, "payment-receipt");
});

test("scheduled subscription audit finds subscriptions expiring in seven days", async () => {
  const signed = await token();
  const memberResponse = await handlers.registerMember(event({ name: "Dina Zajc", email: "dina@example.com" }, signed));
  const member = JSON.parse(memberResponse.body);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await handlers.createSubscription(event({ memberId: member.memberId, validUntil: tomorrow }, signed));
  const result = await handlers.nightlySubscriptionAudit();

  assert.equal(result.expiringCount, 1);
});

test("IoT gate event delegates to check-in", async () => {
  const signed = await token();
  const memberResponse = await handlers.registerMember(event({ name: "Eva Horvat", email: "eva@example.com", cardId: "CARD-9" }, signed));
  const member = JSON.parse(memberResponse.body);
  await handlers.createSubscription(event({ memberId: member.memberId, validUntil: "2099-01-01" }, signed));

  const response = await handlers.gateSensorEvent({ detail: { cardId: "CARD-9" } });
  const access = JSON.parse(response.body);

  assert.equal(access.allowed, true);
});

test("payment provider webhook records integration payment", async () => {
  const response = await handlers.paymentProviderWebhook({
    body: JSON.stringify({ providerRef: "stripe_123", memberId: "mem_1", amount: 25, status: "paid" })
  });
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 201);
  assert.equal(body.payment.providerRef, "stripe_123");
});

test("CloudWatch log alert creates alert audit", async () => {
  const result = await handlers.logAlert({ awslogs: { data: Buffer.from("ERROR payment failed").toString("base64") } });

  assert.match(result.alertId, /^audit_/);
  assert.equal(store.read("audits").some((row) => row.type === "LOG_ALERT"), true);
});
