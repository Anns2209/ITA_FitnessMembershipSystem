const assert = require("assert");
const service = require("../app/service");

describe("Subscription Service", () => {

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