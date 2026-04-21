import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>Fitness Membership Management System</h2>
      <p>To je glavna Shell aplikacija, ki povezuje vse Micro Frontends module.</p>

      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        <div style={cardStyle}>
          <h3>Member Frontend</h3>
          <p>Pregled in dodajanje članov fitness centra.</p>
          <a href="http://localhost:5174" target="_blank" rel="noreferrer">
            Odpri Member Frontend
          </a>
        </div>

        <div style={cardStyle}>
          <h3>Subscription Frontend</h3>
          <p>Ustvarjanje naročnin in preverjanje statusa naročnine.</p>
          <a href="http://localhost:5175" target="_blank" rel="noreferrer">
            Odpri Subscription Frontend
          </a>
        </div>

        <div style={cardStyle}>
          <h3>Payment Frontend</h3>
          <p>Pregled plačil, neporavnanih obveznosti in dodajanje plačil.</p>
          <a href="http://localhost:5176" target="_blank" rel="noreferrer">
            Odpri Payment Frontend
          </a>
        </div>
      </div>
    </div>
  );
}

function MembersPage() {
  return (
    <div>
      <h2>Member Module</h2>
      <p>Ta modul omogoča prikaz vseh članov in dodajanje novega člana.</p>
      <a href="http://localhost:5174" target="_blank" rel="noreferrer">
        Odpri Member Frontend
      </a>
    </div>
  );
}

function SubscriptionPage() {
  return (
    <div>
      <h2>Subscription Module</h2>
      <p>Ta modul omogoča ustvarjanje naročnin in preverjanje njihove veljavnosti.</p>
      <a href="http://localhost:5175" target="_blank" rel="noreferrer">
        Odpri Subscription Frontend
      </a>
    </div>
  );
}

function PaymentPage() {
  return (
    <div>
      <h2>Payment Module</h2>
      <p>Ta modul omogoča pregled plačil, iskanje po članu in prikaz neporavnanih obveznosti.</p>
      <a href="http://localhost:5176" target="_blank" rel="noreferrer">
        Odpri Payment Frontend
      </a>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "16px",
  backgroundColor: "#f9f9f9",
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#f5f7fb" }}>
        <header
          style={{
            background: "#1f2937",
            color: "white",
            padding: "20px",
          }}
        >
          <h1 style={{ margin: 0 }}>Frontend Shell</h1>
          <p style={{ marginTop: "8px" }}>Micro Frontends arhitektura za fitness membership sistem</p>
        </header>

        <nav
          style={{
            display: "flex",
            gap: "20px",
            padding: "16px 20px",
            background: "#e5e7eb",
          }}
        >
          <Link to="/">Home</Link>
          <Link to="/members">Members</Link>
          <Link to="/subscriptions">Subscriptions</Link>
          <Link to="/payments">Payments</Link>
        </nav>

        <main style={{ padding: "24px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/subscriptions" element={<SubscriptionPage />} />
            <Route path="/payments" element={<PaymentPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}