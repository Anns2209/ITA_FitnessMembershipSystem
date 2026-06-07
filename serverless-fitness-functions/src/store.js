const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const dataDir = () => process.env.DATA_DIR || path.join("/tmp", "fitness-serverless-data");
const file = (name) => path.join(dataDir(), `${name}.json`);

function ensure() {
  fs.mkdirSync(dataDir(), { recursive: true });
}

function read(name) {
  ensure();
  const target = file(name);
  if (!fs.existsSync(target)) return [];
  return JSON.parse(fs.readFileSync(target, "utf8"));
}

function write(name, rows) {
  ensure();
  fs.writeFileSync(file(name), JSON.stringify(rows, null, 2));
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function reset() {
  fs.rmSync(dataDir(), { recursive: true, force: true });
}

module.exports = { read, write, id, reset };
