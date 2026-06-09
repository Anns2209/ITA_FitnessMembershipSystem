const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { initializeDatabase, pool } = require("./database");
const service = require("./service");

// naloži proto
const packageDef = protoLoader.loadSync("proto/subscription.proto");
const grpcObject = grpc.loadPackageDefinition(packageDef);
const subscriptionPackage = grpcObject.subscription;

const http = require("http");
const server = new grpc.Server();

// dodaj service
server.addService(subscriptionPackage.SubscriptionService.service, {

  CreateSubscription: (call, callback) => {
    console.log("Creating subscription for member:", call.request.memberId);

    service.createSubscription(
      call.request.memberId,
      call.request.type,
      (err, response) => {
        if (err) {
          console.error("DB error:", err);
          return callback(err);
        }

        callback(null, response);
      }
    );
  },

  GetSubscriptionStatus: (call, callback) => {
    console.log("Fetching subscription for member:", call.request.memberId);

    service.getSubscriptionStatus(
      call.request.memberId,
      (err, response) => {
        if (err) {
          console.error("DB error:", err);
          return callback(err);
        }

        callback(null, response);
      }
    );
  }

});



// start serverja
async function start() {
  await initializeDatabase();

  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("gRPC server running on port 50051");
      server.start();
    }
  );

  http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "UP",
        service: "subscription-management"
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  }).listen(50052, "0.0.0.0", () => {
    console.log("Subscription health check running on port 50052");
  });
}

start().catch(async (err) => {
  console.error("Failed to start subscription service:", err);
  await pool.end();
  process.exit(1);
});
