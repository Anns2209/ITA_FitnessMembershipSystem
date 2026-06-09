const assert = require("assert");
const { createService } = require("../app/service");

describe("Subscription Service", () => {
  const subscriptions = [];
  const db = {
    query(sql, params) {
      if (sql.startsWith("INSERT")) {
        subscriptions.push({
          id: subscriptions.length + 1,
          member_id: params[0],
          type: params[1],
          status: params[2],
        });
        return Promise.resolve({ rows: [] });
      }

      const rows = subscriptions
        .filter((subscription) => subscription.member_id === params[0])
        .sort((a, b) => b.id - a.id)
        .slice(0, 1);
      return Promise.resolve({ rows });
    },
  };
  const service = createService(db);

  it("should create a subscription", (done) => {
    service.createSubscription(1, "monthly", (err, res) => {
      assert.equal(err, null);
      assert.equal(res.message, "Subscription created");
      done();
    });
  });

  it("should return subscription status", (done) => {
    service.getSubscriptionStatus(1, (err, res) => {
      assert.equal(err, null);
      assert.equal(res.status, "active");
      done();
    });
  });

});
