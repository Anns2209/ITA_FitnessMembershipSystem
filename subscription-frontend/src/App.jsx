import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

function App() {
  const [memberId, setMemberId] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("monthly");
  const [statusResult, setStatusResult] = useState(null);
  const [createResult, setCreateResult] = useState(null);
  const [error, setError] = useState("");

  const checkStatus = async () => {
    try {
      setError("");
      setStatusResult(null);

      const res = await axios.get(`${API_URL}/subscription-status/${memberId}`);
      setStatusResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Napaka pri preverjanju statusa naročnine.");
    }
  };

  const createSubscription = async () => {
    try {
      setError("");
      setCreateResult(null);

      const res = await axios.post(`${API_URL}/subscription`, {
        memberId: Number(memberId),
        type: subscriptionType,
      });

      console.log("Create subscription response:", res.data);
      setCreateResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Napaka pri ustvarjanju naročnine.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Subscription Frontend</h1>

      <input
        placeholder="Member ID"
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
      />

      <select
        value={subscriptionType}
        onChange={(e) => setSubscriptionType(e.target.value)}
      >
        <option value="monthly">monthly</option>
        <option value="yearly">yearly</option>
      </select>

      <div style={{ marginTop: "10px" }}>
        <button onClick={createSubscription}>Create Subscription</button>
        <button onClick={checkStatus} style={{ marginLeft: "10px" }}>
          Check Status
        </button>
      </div>

      {createResult && (
        <p>
          <strong>Create response:</strong> {createResult.message}
        </p>
      )}

      {statusResult && (
        <p>
          <strong>Status:</strong> {statusResult.status}
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          <strong>{error}</strong>
        </p>
      )}
    </div>
  );
}

export default App;