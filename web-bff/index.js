const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

//  MEMBER SERVICE
app.get("/members", async (req, res) => {
  const response = await axios.get("http://member-service:8000/members");
  res.json(response.data);
});

//  PAYMENT SERVICE
app.get("/payments", async (req, res) => {
  const response = await axios.get("http://payment-service:8080/payments");
  res.json(response.data);
});

//  COMBINED ENDPOINT 
app.get("/dashboard/:memberId", async (req, res) => {
  const memberId = req.params.memberId;

  const payments = await axios.get(`http://payment-service:8080/payments/${memberId}`);

  res.json({
    memberId,
    payments: payments.data
  });
});

app.listen(3000, () => {
  console.log("Web BFF running on port 3000");
});