const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `API napaka (${response.status})`);
  }
  return data;
}

export const api = {
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  registerMember: (token, member) => request("/members", { method: "POST", body: member, token }),
  getMember: (token, memberId) => request(`/members/${encodeURIComponent(memberId)}`, { token }),
  createSubscription: (token, subscription) =>
    request("/subscriptions", { method: "POST", body: subscription, token }),
  createPayment: (token, payment) => request("/payments", { method: "POST", body: payment, token }),
  checkIn: (token, access) => request("/access/check-in", { method: "POST", body: access, token }),
  uploadDocument: (token, memberId, document) =>
    request(`/members/${encodeURIComponent(memberId)}/documents`, {
      method: "POST",
      body: document,
      token
    })
};

export { API_URL };
