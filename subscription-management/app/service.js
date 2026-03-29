const db = require("./database");

function createSubscription(memberId, type, callback) {
  db.run(
    "INSERT INTO subscriptions (memberId, type, status) VALUES (?, ?, ?)",
    [memberId, type, "active"],
    function (err) {
      if (err) return callback(err);

      callback(null, { message: "Subscription created" });
    }
  );
}

function getSubscriptionStatus(memberId, callback) {
  db.get(
    "SELECT * FROM subscriptions WHERE memberId = ?",
    [memberId],
    (err, row) => {
      if (err) return callback(err);

      if (!row) {
        return callback(null, { status: "not found" });
      }

      callback(null, { status: row.status });
    }
  );
}

module.exports = {
  createSubscription,
  getSubscriptionStatus
};