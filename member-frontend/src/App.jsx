import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

function App() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardId, setCardId] = useState("");

  const fetchMembers = async () => {
    const res = await axios.get(`${API_URL}/members`);
    setMembers(res.data);
  };

  const addMember = async () => {
    await axios.post(`${API_URL}/members`, null, {
      params: {
        name,
        email,
        card_id: cardId,
      },
    });

    setName("");
    setEmail("");
    setCardId("");
    fetchMembers();
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Member Frontend</h1>

      <h2>Add Member</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Card ID"
        value={cardId}
        onChange={(e) => setCardId(e.target.value)}
      />
      <button onClick={addMember}>Add</button>

      <h2>Members</h2>
      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.name} ({m.email}) - Card: {m.card_id}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;