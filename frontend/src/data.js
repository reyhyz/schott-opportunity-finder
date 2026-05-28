/* API client — replaces hardcoded seed data */

window.API_BASE = "http://localhost:8000";

window.queryOpportunities = async function (queryText) {
  const res = await fetch(`${window.API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: queryText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

window.uploadFile = async function (file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${window.API_BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

window.fetchSources = async function () {
  const res = await fetch(`${window.API_BASE}/sources`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
