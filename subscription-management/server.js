const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const db = require("./database");

// naloži proto
const packageDef = protoLoader.loadSync("proto/subscription.proto");
const grpcObject = grpc.loadPackageDefinition(packageDef);
const subscriptionPackage = grpcObject.subscription;

const service = require("./service");

// dodaj service
server.addService(subscriptionPackage.SubscriptionService.service, {

  CreateSubscription: (call, callback) => {
  service.createSubscription(
    call.request.memberId,
    call.request.type,
    callback
  );
},

  GetSubscriptionStatus: (call, callback) => {
  service.getSubscriptionStatus(
    call.request.memberId,
    callback
  );
},

});

// start serverja
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("gRPC server running on port 50051");
    server.start();
  }
);