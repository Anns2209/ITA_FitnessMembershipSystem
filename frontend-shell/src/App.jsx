import { lazy, Suspense } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

const MemberApp = lazy(() => import("memberApp/App"));
const SubscriptionApp = lazy(() => import("subscriptionApp/App"));
const PaymentApp = lazy(() => import("paymentApp/App"));

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "16px",
  backgroundColor: "#f9f9f9",
};

function Home() {
  return (
    <div>
      <h2>Fitness Membership Management System</h2>
      <p>
        Shell aplikacija med izvajanjem dinamično nalaga samostojne Micro
        Frontend module.
      </p>

      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        <div style={cardStyle}>
          <h3>Member Frontend</h3>
          <p>Pregled in dodajanje članov fitness centra.</p>
          <Link to="/members">Odpri Member Frontend</Link>
        </div>

        <div style={cardStyle}>
          <h3>Subscription Frontend</h3>
          <p>Ustvarjanje naročnin in preverjanje statusa naročnine.</p>
          <Link to="/subscriptions">Odpri Subscription Frontend</Link>
        </div>

        <div style={cardStyle}>
          <h3>Payment Frontend</h3>
          <p>Pregled plačil, neporavnanih obveznosti in dodajanje plačil.</p>
          <Link to="/payments">Odpri Payment Frontend</Link>
        </div>
      </div>
    </div>
  );
}

function RemoteModule({ children }) {
  return (
    <Suspense fallback={<p>Nalaganje Micro Frontend modula...</p>}>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          minHeight: "100vh",
          background: "#f5f7fb",
        }}
      >
        <header
          style={{
            background: "#1f2937",
            color: "white",
            padding: "20px",
          }}
        >
          <h1 style={{ margin: 0 }}>Frontend Shell</h1>
          <p style={{ marginTop: "8px" }}>
            Micro Frontends arhitektura za fitness membership sistem
          </p>
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
            <Route
              path="/members"
              element={
                <RemoteModule>
                  <MemberApp />
                </RemoteModule>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <RemoteModule>
                  <SubscriptionApp />
                </RemoteModule>
              }
            />
            <Route
              path="/payments"
              element={
                <RemoteModule>
                  <PaymentApp />
                </RemoteModule>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
