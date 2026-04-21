import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8081";

function App() {
  const [payments, setPayments] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [searchMemberId, setSearchMemberId] = useState("");

  const fetchAllPayments = async () => {
    const res = await axios.get(`${API_URL}/payments`);
    setPayments(res.data);
  };

  const fetchPaymentsByMember = async () => {
    if (!searchMemberId) return;
    const res = await axios.get(`${API_URL}/payments/${searchMemberId}`);
    setPayments(res.data);
  };

  const fetchUnpaidPayments = async () => {
    const res = await axios.get(`${API_URL}/payments/unpaid`);
    setPayments(res.data);
  };

  const addPayment = async () => {
    if (!memberId || !amount) return;

    await axios.post(`${API_URL}/payments`, null, {
      params: {
        memberId,
        amount,
      },
    });

    setMemberId("");
    setAmount("");
    fetchAllPayments();
  };

  useEffect(() => {
    fetchAllPayments();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Payment Frontend</h1>

      <h2>Create Payment</h2>
      <input
        placeholder="Member ID"
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
      />
      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={addPayment}>Add Payment</button>

      <h2>Search Payments</h2>
      <input
        placeholder="Search by Member ID"
        value={searchMemberId}
        onChange={(e) => setSearchMemberId(e.target.value)}
      />
      <button onClick={fetchPaymentsByMember}>Search</button>
      <button onClick={fetchAllPayments}>Show All</button>
      <button onClick={fetchUnpaidPayments}>Show Unpaid</button>

      <h2>Payments</h2>
      <ul>
        {payments.map((p) => (
          <li key={p.id}>
            Member: {p.memberId} | Amount: {p.amount} | Status: {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
