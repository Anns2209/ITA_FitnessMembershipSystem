const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDef = protoLoader.loadSync("proto/subscription.proto");
const grpcObject = grpc.loadPackageDefinition(packageDef);
const subscriptionPackage = grpcObject.subscription;

const server = new grpc.Server();

const subscriptions = [];

const db = require("./database");

server.addService(subscriptionPackage.SubscriptionService.service, {
  CreateSubscription: (call, callback) => {
    const sub = {
      memberId: call.request.memberId,
      type: call.request.type,
      status: "active"
    };

    db.run(
  "INSERT INTO subscriptions (memberId, type, status) VALUES (?, ?, ?)",
  [call.request.memberId, call.request.type, "active"],
  function (err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    console.log("Subscription created with ID:", this.lastID);

    callback(null, { message: "Subscription created" });
  }
);

    console.log("Subscription created:", sub);

    callback(null, { message: "Subscription created" });
  },

  GetSubscriptionStatus: (call, callback) => {
    db.get(
  "SELECT * FROM subscriptions WHERE memberId = ?",
  [call.request.memberId],
  (err, row) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    if (!row) {
      return callback(null, { status: "not found" });
    }

    callback(null, { status: row.status });
  }
);

    if (!sub) {
      return callback(null, { status: "not found" });
    }

    callback(null, { status: sub.status });
  }
});

server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("gRPC server running on port 50051");
  server.start();
});