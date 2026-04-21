const express = require("express");
const axios = require("axios");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(express.json());

const packageDef = protoLoader.loadSync("../subscription-management/proto/subscription.proto");
const grpcObject = grpc.loadPackageDefinition(packageDef);
const subscriptionPackage = grpcObject.subscription;

const subscriptionClient = new subscriptionPackage.SubscriptionService(
  "subscription-service:50051",
  grpc.credentials.createInsecure()
);

app.get("/members", async (req, res) => {
  const response = await axios.get("http://member-service:8000/members");
  res.json(response.data);
});

app.get("/payments", async (req, res) => {
  const response = await axios.get("http://payment-service:8080/payments");
  res.json(response.data);
});

app.get("/dashboard/:memberId", async (req, res) => {
  const memberId = req.params.memberId;
  const payments = await axios.get(`http://payment-service:8080/payments/${memberId}`);

  res.json({
    memberId,
    payments: payments.data,
  });
});

app.get("/subscription-status/:memberId", (req, res) => {
  const memberId = parseInt(req.params.memberId);

  subscriptionClient.GetSubscriptionStatus({ memberId }, (err, response) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(response);
  });
});

app.post("/subscription", (req, res) => {
  const { memberId, type } = req.body;

  subscriptionClient.CreateSubscription({ memberId, type }, (err, response) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(response);
  });
});

app.listen(3000, () => {
  console.log("Web BFF running on port 3000");
});