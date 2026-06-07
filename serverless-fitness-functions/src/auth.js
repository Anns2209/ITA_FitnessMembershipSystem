const crypto = require("node:crypto");

const secret = () => process.env.AUTH_SECRET || "local-development-secret";

function base64url(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

function sign(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  };
  const data = `${base64url(header)}.${base64url(body)}`;
  const signature = crypto.createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function verify(token) {
  if (!token) return null;
  const parts = token.replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = crypto.createHmac("sha256", secret()).update(`${header}.${body}`).digest("base64url");
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function getUser(event) {
  const auth = event?.headers?.authorization || event?.headers?.Authorization;
  return verify(auth);
}

module.exports = { sign, verify, getUser };
