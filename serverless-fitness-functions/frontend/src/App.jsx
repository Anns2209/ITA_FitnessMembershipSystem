import { useMemo, useState } from "react";
import { API_URL, api } from "./api";

const today = new Date();
const defaultExpiry = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  .toISOString()
  .slice(0, 10);

const initialMember = { name: "", email: "", cardId: "" };
const initialSubscription = { plan: "monthly", validUntil: defaultExpiry };
const initialPayment = { amount: "39.90", status: "paid" };

function FormField({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Result({ result }) {
  if (!result) return null;
  return (
    <div className={`result ${result.type}`} role="status">
      <strong>{result.title}</strong>
      <span>{result.message}</span>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("fitness_token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("fitness_role") || "");
  const [login, setLogin] = useState({ email: "admin@fitness.local", password: "secret" });
  const [memberForm, setMemberForm] = useState(initialMember);
  const [memberId, setMemberId] = useState(() => localStorage.getItem("fitness_member_id") || "");
  const [member, setMember] = useState(null);
  const [subscription, setSubscription] = useState(initialSubscription);
  const [payment, setPayment] = useState(initialPayment);
  const [checkInId, setCheckInId] = useState("");
  const [document, setDocument] = useState({ fileName: "", contentType: "application/pdf" });
  const [activeView, setActiveView] = useState("members");
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState(null);

  const initials = useMemo(() => {
    const source = member?.name || login.email || "U";
    return source
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }, [member, login.email]);

  async function run(action, successTitle, successMessage) {
    setBusy("request");
    setResult(null);
    try {
      const data = await action();
      setResult({
        type: "success",
        title: successTitle,
        message: typeof successMessage === "function" ? successMessage(data) : successMessage
      });
      return data;
    } catch (error) {
      setResult({ type: "error", title: "Zahteva ni uspela", message: error.message });
      return null;
    } finally {
      setBusy("");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const data = await run(
      () => api.login(login),
      "Prijava uspešna",
      "Token je shranjen in bo dodan zaščitenim API klicem."
    );
    if (data) {
      setToken(data.token);
      setRole(data.role);
      localStorage.setItem("fitness_token", data.token);
      localStorage.setItem("fitness_role", data.role);
    }
  }

  function logout() {
    localStorage.removeItem("fitness_token");
    localStorage.removeItem("fitness_role");
    setToken("");
    setRole("");
    setMember(null);
    setResult(null);
  }

  async function registerMember(event) {
    event.preventDefault();
    const data = await run(
      () => api.registerMember(token, memberForm),
      "Član registriran",
      (created) => `Ustvarjen je član ${created.name} z ID ${created.memberId}.`
    );
    if (data) {
      setMember(data);
      setMemberId(data.memberId);
      setCheckInId(data.cardId);
      localStorage.setItem("fitness_member_id", data.memberId);
      setMemberForm(initialMember);
    }
  }

  async function findMember(event) {
    event.preventDefault();
    const data = await run(
      () => api.getMember(token, memberId),
      "Član najden",
      (found) => `${found.name}, kartica ${found.cardId}.`
    );
    if (data) {
      setMember(data);
      setCheckInId(data.cardId);
      localStorage.setItem("fitness_member_id", data.memberId);
    }
  }

  async function createSubscription(event) {
    event.preventDefault();
    await run(
      () => api.createSubscription(token, { ...subscription, memberId }),
      "Naročnina aktivirana",
      (created) => `${created.plan} paket velja do ${created.validUntil}.`
    );
  }

  async function createPayment(event) {
    event.preventDefault();
    await run(
      () => api.createPayment(token, { ...payment, memberId, amount: Number(payment.amount) }),
      "Plačilo zabeleženo",
      (created) => `Plačilo ${created.payment.amount.toFixed(2)} EUR ima status ${created.payment.status}.`
    );
  }

  async function checkIn(event) {
    event.preventDefault();
    const access = await run(
      () => api.checkIn(token, checkInId.startsWith("mem_") ? { memberId: checkInId } : { cardId: checkInId }),
      "Preverjanje zaključeno",
      (data) => (data.allowed ? "Vstop je dovoljen." : "Vstop je zavrnjen.")
    );
    if (access) {
      setResult({
        type: access.allowed ? "success" : "warning",
        title: access.allowed ? "VSTOP DOVOLJEN" : "VSTOP ZAVRNJEN",
        message: `Odločitev: ${access.reason}. Čas: ${new Date(access.checkedAt).toLocaleString("sl-SI")}.`
      });
    }
  }

  async function uploadDocument(event) {
    event.preventDefault();
    await run(
      () => api.uploadDocument(token, memberId, document),
      "Dokument registriran",
      (created) => `${created.fileName} čaka na S3 varnostni pregled.`
    );
    setDocument({ fileName: "", contentType: "application/pdf" });
  }

  if (!token) {
    return (
      <main className="login-page">
        <section className="login-panel">
          <div className="brand">
            <span className="brand-mark">F</span>
            <div>
              <strong>Fitness FaaS</strong>
              <span>Članstvo in dostop</span>
            </div>
          </div>
          <div className="login-copy">
            <p className="eyebrow">Varen dostop</p>
            <h1>Prijava v nadzorno ploščo</h1>
            <p>Prijava pridobi Bearer token, ki varuje vse nadaljnje klice brezstrežniških funkcij.</p>
          </div>
          <form onSubmit={handleLogin} className="form-stack">
            <FormField label="E-pošta">
              <input
                type="email"
                value={login.email}
                onChange={(event) => setLogin({ ...login, email: event.target.value })}
                required
              />
            </FormField>
            <FormField label="Geslo">
              <input
                type="password"
                value={login.password}
                onChange={(event) => setLogin({ ...login, password: event.target.value })}
                required
              />
            </FormField>
            <button className="primary-button" disabled={Boolean(busy)}>
              {busy ? "Prijavljanje ..." : "Prijava"}
            </button>
          </form>
          <Result result={result} />
          <p className="endpoint">API: {API_URL}</p>
        </section>
        <aside className="login-visual" aria-hidden="true">
          <div className="access-display">
            <span>VHOD A</span>
            <strong>Pripravljen</strong>
            <div className="scanner-line" />
          </div>
        </aside>
      </main>
    );
  }

  const views = [
    { id: "members", label: "Člani" },
    { id: "membership", label: "Naročnine in plačila" },
    { id: "access", label: "Preverjanje vstopa" },
    { id: "documents", label: "Dokumenti" }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand compact">
          <span className="brand-mark">F</span>
          <div>
            <strong>Fitness FaaS</strong>
            <span>Nadzorna plošča</span>
          </div>
        </div>
        <nav>
          {views.map((view) => (
            <button
              key={view.id}
              className={activeView === view.id ? "active" : ""}
              onClick={() => {
                setActiveView(view.id);
                setResult(null);
              }}
            >
              {view.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" />
          <div>
            <strong>API povezan</strong>
            <span>{API_URL}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Brezstrežniško upravljanje</p>
            <h1>{views.find((view) => view.id === activeView)?.label}</h1>
          </div>
          <div className="user-menu">
            <span className="avatar">{initials}</span>
            <div>
              <strong>{login.email}</strong>
              <span>{role === "staff" ? "Osebje" : "Član"}</span>
            </div>
            <button className="quiet-button" onClick={logout}>Odjava</button>
          </div>
        </header>

        {member && (
          <section className="member-strip">
            <div>
              <span>Izbrani član</span>
              <strong>{member.name}</strong>
            </div>
            <div>
              <span>ID člana</span>
              <code>{member.memberId}</code>
            </div>
            <div>
              <span>Kartica</span>
              <code>{member.cardId}</code>
            </div>
            <span className="status-badge">{member.status}</span>
          </section>
        )}

        <Result result={result} />

        {activeView === "members" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">POST /members</p>
                  <h2>Registracija člana</h2>
                </div>
              </div>
              <form onSubmit={registerMember} className="form-grid">
                <FormField label="Ime in priimek">
                  <input
                    value={memberForm.name}
                    onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })}
                    placeholder="Ana Novak"
                    required
                  />
                </FormField>
                <FormField label="E-pošta">
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })}
                    placeholder="ana@example.com"
                    required
                  />
                </FormField>
                <FormField label="ID kartice">
                  <input
                    value={memberForm.cardId}
                    onChange={(event) => setMemberForm({ ...memberForm, cardId: event.target.value })}
                    placeholder="CARD-100"
                  />
                </FormField>
                <button className="primary-button form-action" disabled={Boolean(busy)}>
                  Registriraj člana
                </button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">GET /members/:id</p>
                  <h2>Iskanje člana</h2>
                </div>
              </div>
              <form onSubmit={findMember} className="form-stack">
                <FormField label="ID člana">
                  <input
                    value={memberId}
                    onChange={(event) => setMemberId(event.target.value)}
                    placeholder="mem_..."
                    required
                  />
                </FormField>
                <button className="secondary-button" disabled={Boolean(busy)}>Pridobi podatke</button>
              </form>
            </div>
          </section>
        )}

        {activeView === "membership" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">POST /subscriptions</p>
                  <h2>Nova naročnina</h2>
                </div>
              </div>
              <form onSubmit={createSubscription} className="form-stack">
                <FormField label="ID člana">
                  <input value={memberId} onChange={(event) => setMemberId(event.target.value)} required />
                </FormField>
                <FormField label="Paket">
                  <select
                    value={subscription.plan}
                    onChange={(event) => setSubscription({ ...subscription, plan: event.target.value })}
                  >
                    <option value="monthly">Mesečni</option>
                    <option value="quarterly">Trimesečni</option>
                    <option value="annual">Letni</option>
                  </select>
                </FormField>
                <FormField label="Velja do">
                  <input
                    type="date"
                    value={subscription.validUntil}
                    onChange={(event) => setSubscription({ ...subscription, validUntil: event.target.value })}
                    required
                  />
                </FormField>
                <button className="primary-button" disabled={Boolean(busy)}>Aktiviraj naročnino</button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">POST /payments</p>
                  <h2>Beleženje plačila</h2>
                </div>
              </div>
              <form onSubmit={createPayment} className="form-stack">
                <FormField label="ID člana">
                  <input value={memberId} onChange={(event) => setMemberId(event.target.value)} required />
                </FormField>
                <FormField label="Znesek (EUR)">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={payment.amount}
                    onChange={(event) => setPayment({ ...payment, amount: event.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Status">
                  <select
                    value={payment.status}
                    onChange={(event) => setPayment({ ...payment, status: event.target.value })}
                  >
                    <option value="paid">Plačano</option>
                    <option value="failed">Neuspešno</option>
                  </select>
                </FormField>
                <button className="primary-button" disabled={Boolean(busy)}>Zabeleži plačilo</button>
              </form>
            </div>
          </section>
        )}

        {activeView === "access" && (
          <section className="access-layout">
            <div className="panel access-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">POST /access/check-in</p>
                  <h2>Terminal za vstop</h2>
                </div>
              </div>
              <form onSubmit={checkIn} className="form-stack">
                <FormField label="ID kartice ali člana">
                  <input
                    value={checkInId}
                    onChange={(event) => setCheckInId(event.target.value)}
                    placeholder="CARD-100"
                    required
                  />
                </FormField>
                <button className="scan-button" disabled={Boolean(busy)}>
                  {busy ? "Preverjanje ..." : "Preveri vstop"}
                </button>
              </form>
            </div>
            <div className="gate-visual">
              <span>VHOD A</span>
              <div className="gate-ring">
                <div className="gate-core" />
              </div>
              <strong>Prislonite kartico</strong>
            </div>
          </section>
        )}

        {activeView === "documents" && (
          <section className="content-grid single">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">POST /members/:id/documents</p>
                  <h2>Registracija dokumenta</h2>
                </div>
              </div>
              <form onSubmit={uploadDocument} className="form-grid">
                <FormField label="ID člana">
                  <input value={memberId} onChange={(event) => setMemberId(event.target.value)} required />
                </FormField>
                <FormField label="Ime datoteke">
                  <input
                    value={document.fileName}
                    onChange={(event) => setDocument({ ...document, fileName: event.target.value })}
                    placeholder="zdravnisko-potrdilo.pdf"
                    required
                  />
                </FormField>
                <FormField label="Vrsta datoteke">
                  <select
                    value={document.contentType}
                    onChange={(event) => setDocument({ ...document, contentType: event.target.value })}
                  >
                    <option value="application/pdf">PDF</option>
                    <option value="image/jpeg">JPEG slika</option>
                    <option value="image/png">PNG slika</option>
                  </select>
                </FormField>
                <button className="primary-button form-action" disabled={Boolean(busy)}>
                  Registriraj dokument
                </button>
              </form>
              <p className="helper-text">
                HTTP funkcija registrira metapodatke. Dejanski S3 ObjectCreated dogodek nato sproži funkcijo za pregled dokumenta.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
