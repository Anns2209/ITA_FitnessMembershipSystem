import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>Fitness Membership System</h2>
      <p>Shell aplikacija za Micro Frontends arhitekturo.</p>
      <p>Izberi modul iz menija.</p>
    </div>
  );
}

function MembersPage() {
  return (
    <div>
      <h2>Member Frontend</h2>
      <a href="http://localhost:5174" target="_blank" rel="noreferrer">
        Odpri Member Frontend
      </a>
    </div>
  );
}

function SubscriptionPage() {
  return (
    <div>
      <h2>Subscription Frontend</h2>
      <a href="http://localhost:5175" target="_blank" rel="noreferrer">
        Odpri Subscription Frontend
      </a>
    </div>
  );
}

function PaymentPage() {
  return (
    <div>
      <h2>Payment Frontend</h2>
      <a href="http://localhost:5176" target="_blank" rel="noreferrer">
        Odpri Payment Frontend
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1>Frontend Shell</h1>

        <nav style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <Link to="/">Home</Link>
          <Link to="/members">Members</Link>
          <Link to="/subscriptions">Subscriptions</Link>
          <Link to="/payments">Payments</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/subscriptions" element={<SubscriptionPage />} />
          <Route path="/payments" element={<PaymentPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
