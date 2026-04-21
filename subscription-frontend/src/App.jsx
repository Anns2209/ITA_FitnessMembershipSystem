import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

function App() {
  const [memberId, setMemberId] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("monthly");
  const [statusResult, setStatusResult] = useState(null);
  const [createResult, setCreateResult] = useState(null);

  const checkStatus = async () => {
    if (!memberId) return;

    const res = await axios.get(`${API_URL}/subscription-status/${memberId}`);
    setStatusResult(res.data);
  };

  const createSubscription = async () => {
    if (!memberId || !subscriptionType) return;

    const res = await axios.post(`${API_URL}/subscription`, {
      memberId: parseInt(memberId),
      type: subscriptionType,
    });

    setCreateResult(res.data);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Subscription Frontend</h1>

      <h2>Create Subscription</h2>
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

      <button onClick={createSubscription}>Create Subscription</button>

      {createResult && (
        <p>
          <strong>Response:</strong> {createResult.message}
        </p>
      )}

      <h2>Check Subscription Status</h2>
      <button onClick={checkStatus}>Check Status</button>

      {statusResult && (
        <p>
          <strong>Status:</strong> {statusResult.status}
        </p>
      )}
    </div>
  );
}

export default App;