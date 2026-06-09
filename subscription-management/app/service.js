const { pool } = require("./database");

function createService(db = pool) {
  function createSubscription(memberId, type, callback) {
    db.query(
      "INSERT INTO subscriptions (member_id, type, status) VALUES ($1, $2, $3)",
      [memberId, type, "active"]
    )
      .then(() => callback(null, { message: "Subscription created" }))
      .catch(callback);
  }

  function getSubscriptionStatus(memberId, callback) {
    db.query(
      "SELECT status FROM subscriptions WHERE member_id = $1 ORDER BY id DESC LIMIT 1",
      [memberId]
    )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return callback(null, { status: "not found" });
        }

        callback(null, { status: rows[0].status });
      })
      .catch(callback);
  }

  return {
    createSubscription,
    getSubscriptionStatus,
  };
}

module.exports = {
  ...createService(),
  createService,
};
