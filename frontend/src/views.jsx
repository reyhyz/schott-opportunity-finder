/* Login view + dashboard view + opportunity detail view */

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ============================================================
// LOGIN VIEW
// ============================================================
function LoginView({ onLogin }) {
  const [email, setEmail] = useState("demo@schott.example");
  const [password, setPassword] = useState("demo");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!email || !password) {
      setErr("Please enter your email and password.");
      return;
    }
    setBusy(true);
    setErr("");
    setTimeout(() => {
      onLogin({
        email,
        name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        role: "analyst",
      });
    }, 500);
  }

  function googleLogin() {
    setBusy(true);
    setTimeout(() => {
      onLogin({
        email: "analyst@schott.example",
        name: "Market Intelligence",
        role: "analyst",
      });
    }, 400);
  }

  return (
    <div className="login">
      <div className="login__panel">
        <div className="login__card">
          <div className="login__brand">
            <div className="sg-logo" style={{ flexDirection: "column", gap: 12 }}>
              <Icon.Logo size={44} />
              <span className="sg-logo__text" style={{ alignItems: "center" }}>
                <span className="sg-logo__name" style={{ fontSize: 40 }}>Signal</span>
                <span className="sg-logo__sub" style={{ marginTop: 2 }}>Drug Packaging Intelligence by SCHOTT</span>
              </span>
            </div>
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="field__label" htmlFor="email">Work email</label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@schott.com"
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {err && <div style={{ color: "var(--color-amber)", fontSize: 13 }}>{err}</div>}
            <button type="submit" className="btn btn--primary" disabled={busy} style={{ marginTop: 4 }}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="login__divider">or</div>

          <button className="btn" onClick={googleLogin} disabled={busy}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.4 39.6 16.1 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.5 5.5C41.7 36.5 44 31 44 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <div className="login__demo-hint">
            Demo mode — any credentials work. Press <code>Sign in</code> to continue.
          </div>

          <div className="login__foot">
            Don't have access? <a href="#">Request a seat →</a>
          </div>
        </div>
      </div>

      <aside className="login__aside" aria-hidden="true">
        <div className="login__aside-grid" />
        <div className="login__aside-inner">
          <Icon.Logo size={36} />
          <div>
            <h2 className="login__aside-title">Find tomorrow's packaging opportunities before they're priced in.</h2>
            <p className="login__aside-sub">
              Signal triangulates clinical trials, patent filings, regulatory updates and capital flows
              to surface drug packaging opportunities in the TRL 4–6 window — proven enough to act on,
              early enough to still win.
            </p>
          </div>
          <div className="login__stat-row">
            <div>
              <div className="login__stat-n">6</div>
              <div className="login__stat-l">Public sources</div>
            </div>
            <div>
              <div className="login__stat-n">TRL 4–6</div>
              <div className="login__stat-l">Capture window</div>
            </div>
            <div>
              <div className="login__stat-n">Weekly</div>
              <div className="login__stat-l">Refresh cadence</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ============================================================
// DASHBOARD VIEW
// ============================================================
const DRUG_CLASSES = ["mRNA", "GLP-1", "ADC", "Biologic", "Cell Therapy"];
const FORMATS = ["Vial", "Syringe", "Ampoule", "Cartridge", "Other"];
const SIGNAL_TYPES = [
  { id: "patents", label: "Patents" },
  { id: "trials", label: "Trials" },
  { id: "funding", label: "Funding" },
  { id: "papers", label: "Papers" },
  { id: "regulatory", label: "Regulatory" },
];

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return [open, setOpen, ref];
}

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen, ref] = useDropdown();
  const count = selected.length;
  function toggle(opt) {
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  }
  const display = count === 0
    ? label
    : count === 1
      ? selected[0]
      : `${count} selected`;
  return (
    <div className="select" ref={ref}>
      <button type="button" className="select__trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{display}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {count > 0 && <span className="select__count">{count}</span>}
          <Icon.Chevron size={14} />
        </span>
      </button>
      {open && (
        <div className="select__menu" role="listbox">
          {options.map(opt => (
            <label key={opt} className="select__opt">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              {opt}
            </label>
          ))}
          {count > 0 && (
            <button
              className="select__opt"
              style={{ color: "var(--color-muted)", justifyContent: "center" }}
              onClick={() => onChange([])}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TimingSlider({ value, onChange }) {
  return (
    <div className="range">
      <span style={{ color: "var(--color-muted)", fontSize: 12, marginRight: 2 }}>0</span>
      <input
        type="range"
        min="0"
        max="36"
        step="1"
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        aria-label="Max timing window in months"
      />
      <span className="range__val">≤ {value} mo</span>
    </div>
  );
}

function FilterBar({ filters, setFilters }) {
  const update = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  function toggleArr(k, v) {
    setFilters(f => {
      const arr = f[k];
      return { ...f, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] };
    });
  }
  return (
    <div className="filterbar">
      <div className="filterbar__inner">
        <div className="fgroup">
          <span className="fgroup__label">TRL</span>
          {[4, 5, 6].map(n => (
            <button
              key={n}
              type="button"
              className={`tbtn ${filters.trl.includes(n) ? "tbtn--on" : ""}`}
              onClick={() => toggleArr("trl", n)}
              aria-pressed={filters.trl.includes(n)}
            >{n}</button>
          ))}
        </div>

        <div className="fgroup">
          <span className="fgroup__label">Drug class</span>
          <MultiSelect
            label="All classes"
            options={DRUG_CLASSES}
            selected={filters.drug_class}
            onChange={v => update("drug_class", v)}
          />
        </div>

        <div className="fgroup">
          <span className="fgroup__label">Format</span>
          <MultiSelect
            label="All formats"
            options={FORMATS}
            selected={filters.packaging}
            onChange={v => update("packaging", v)}
          />
        </div>

        <div className="fgroup">
          <span className="fgroup__label">Timing</span>
          <TimingSlider value={filters.timing} onChange={v => update("timing", v)} />
        </div>

        <div className="fgroup" style={{ flexWrap: "wrap" }}>
          <span className="fgroup__label">Signal</span>
          {SIGNAL_TYPES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`chip ${filters.signal_types.includes(s.id) ? "chip--on" : ""}`}
              onClick={() => toggleArr("signal_types", s.id)}
              aria-pressed={filters.signal_types.includes(s.id)}
            >
              <span className="chip__dot" />
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({ opp, onOpen }) {
  return (
    <article className="card">
      <div className="card__top">
        <div className="card__pills">
          <TRLBadge trl={opp.trl_band} />
          <DrugClassPill value={opp.drug_class} />
          <FormatPill value={opp.packaging_format} />
        </div>
      </div>

      <h3 className="card__headline">{opp.headline}</h3>

      <div>
        <CapabilityBadge value={opp.matched_capability} />
      </div>

      <SignalStrengthBar value={opp.signal_strength_score} />

      <div className="card__timing">
        <Icon.Clock />
        Timing window: <strong>{opp.timing_label}</strong>
      </div>

      <div>
        <span className="card__why-l">Why flagged</span>
        <p className="card__why" style={{ margin: 0 }}>
          {truncate(opp.why_flagged, 200)}
        </p>
      </div>

      <div className="cites">
        {opp.signals.slice(0, 3).map(s => (
          <Citation key={s.id} source={s.source_type} url={s.url} />
        ))}
      </div>

      <div className="card__cta">
        <span className="card__score">
          Composite score <strong>{opp.composite_score.toFixed(2)}</strong>
        </span>
        <button className="card__view" onClick={() => onOpen(opp.id)}>
          View all signals
          <Icon.ArrowRight />
        </button>
      </div>
    </article>
  );
}

function truncate(s, n) {
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

// ============================================================
// API-FORMAT OPPORTUNITY CARD
// ============================================================
function ApiOpportunityCard({ opp }) {
  const [expanded, setExpanded] = useState(false);
  const confidenceColor = opp.confidence === "high"
    ? "var(--color-green)" : opp.confidence === "medium"
    ? "var(--color-amber)" : "var(--color-muted)";

  return (
    <article className="card">
      <div className="card__top">
        <div className="card__pills">
          <span className="pill pill--neutral" style={{ fontWeight: 600, color: "var(--color-muted)", fontSize: 11 }}>
            #{opp.rank}
          </span>
          <DrugClassPill value={opp.drug_class} />
          <ConfidenceBadge value={opp.confidence} />
        </div>
      </div>

      <h3 className="card__headline">{opp.title}</h3>

      <div>
        <CapabilityBadge value={opp.schott_competency} />
      </div>

      <div className="card__timing">
        <Icon.Clock />
        {opp.timing_argument}
      </div>

      <div>
        <span className="card__why-l">Description</span>
        <p className="card__why" style={{ margin: 0 }}>{opp.description}</p>
      </div>

      <div className="cites">
        {(opp.sources || []).slice(0, 3).map((src, i) => (
          <span key={i} className="cite" style={{ cursor: "default" }}>
            <span className="cite__url">{src}</span>
          </span>
        ))}
      </div>

      <button
        className="card__view"
        style={{ justifyContent: "flex-start" }}
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? "Hide" : "Show"} evidence
        <Icon.Chevron dir={expanded ? "up" : "down"} size={14} />
      </button>

      {expanded && (
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--color-text)", borderTop: "1px solid var(--color-border-2)", paddingTop: 14 }}>
          {opp.evidence_summary}
        </div>
      )}
    </article>
  );
}

function DashboardView({ user, onLogout, theme, setTheme, onOpen }) {
  const [query, setQuery] = useState("");
  const [apiResults, setApiResults] = useState(null);  // null = show seed view
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [menuOpen, setMenuOpen, menuRef] = useDropdown();

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  async function handleQuery(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await window.queryOpportunities(query);
      setApiResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <header className="nav">
        <Logo />
        <div className="nav__right">
          <button
            className="icon-btn"
            onClick={() => setUploadOpen(o => !o)}
            aria-label="Upload documents"
            title="Upload documents"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Icon.Sun /> : <Icon.Moon />}
          </button>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button className="avatar" onClick={() => setMenuOpen(o => !o)} aria-label="Account menu">
              {initial}
            </button>
            {menuOpen && (
              <div className="menu" role="menu">
                <div className="menu__head">
                  <div className="menu__name">{user.name}</div>
                  <div className="menu__email">{user.email}</div>
                </div>
                <button className="menu__item" role="menuitem" onClick={onLogout}>
                  <Icon.Logout /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {uploadOpen && (
        <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "16px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Upload context documents</span>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setUploadOpen(false)}>×</button>
            </div>
            <UploadPanel />
          </div>
        </div>
      )}

      <main className="main">
        <div className="main__head">
          <div>
            <h1 className="main__title">Opportunities</h1>
            {apiResults && (
              <div className="main__count">
                <strong>{apiResults.opportunities.length}</strong> {apiResults.opportunities.length === 1 ? "opportunity" : "opportunities"} · ranked by Gemini
                <span style={{ marginLeft: 12, color: "var(--color-muted)" }}>
                  Live data: {new Date(apiResults.live_data_timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleQuery} style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          <input
            className="input"
            style={{ flex: 1, fontSize: 15 }}
            placeholder="e.g. prefillable syringes for GLP-1 injectables at scale…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn--primary" disabled={loading} style={{ whiteSpace: "nowrap" }}>
            {loading ? "Analysing…" : "Analyse"}
          </button>
        </form>

        {error && (
          <div style={{ color: "var(--color-amber)", fontSize: 13, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="cards">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        )}

        {!loading && apiResults && apiResults.opportunities.length === 0 && (
          <div className="empty">
            <div className="empty__icon"><Icon.EmptyBox /></div>
            <h3 className="empty__title">No opportunities found</h3>
            <p style={{ margin: 0 }}>Try a different query, or add source documents via the upload panel.</p>
          </div>
        )}

        {!loading && apiResults && apiResults.opportunities.length > 0 && (
          <div className="cards">
            {apiResults.opportunities.map((o, i) => (
              <ApiOpportunityCard key={i} opp={o} />
            ))}
          </div>
        )}

        {!loading && !apiResults && (
          <div className="empty" style={{ border: "none", background: "none" }}>
            <p style={{ margin: 0, color: "var(--color-muted)" }}>
              Enter a query above to surface packaging opportunities from live clinical, patent, and regulatory signals.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================
// OPPORTUNITY DETAIL VIEW
// ============================================================
function phaseLabel(p) {
  return ({
    preclinical: "Preclinical",
    phase_1: "Phase 1",
    phase_2: "Phase 2",
    phase_3: "Phase 3",
    approved: "Approved",
    other: "Other",
  })[p] || p;
}
function fmtMaterial(m) {
  return ({
    borosilicate: "Borosilicate",
    cyclic_olefin_copolymer: "COC",
    glass_polymer: "Glass-polymer",
    other: "Other",
  })[m] || m;
}
function fmtFormat(f) {
  return ({ vial: "Vial", syringe: "Syringe", ampoule: "Ampoule", cartridge: "Cartridge", other: "Other" })[f] || f;
}
function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return d; }
}

function OpportunityDetail({ id, user, onBack, onLogout, theme, setTheme }) {
  const opp = window.SIGNAL_DATA.opportunities.find(o => o.id === id);
  const [menuOpen, setMenuOpen, menuRef] = useDropdown();

  if (!opp) {
    return (
      <div className="shell">
        <header className="nav"><Logo /></header>
        <main className="main">
          <button className="detail__back" onClick={onBack}><Icon.ArrowLeft /> Back to opportunities</button>
          <p>Opportunity not found.</p>
        </main>
      </div>
    );
  }

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div className="shell">
      <header className="nav">
        <Logo />
        <div className="nav__right">
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Icon.Sun /> : <Icon.Moon />}
          </button>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button className="avatar" onClick={() => setMenuOpen(o => !o)} aria-label="Account menu">
              {initial}
            </button>
            {menuOpen && (
              <div className="menu" role="menu">
                <div className="menu__head">
                  <div className="menu__name">{user.name}</div>
                  <div className="menu__email">{user.email}</div>
                </div>
                <button className="menu__item" role="menuitem" onClick={onLogout}>
                  <Icon.Logout /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="detail">
        <button className="detail__back" onClick={onBack}>
          <Icon.ArrowLeft /> Back to opportunities
        </button>

        <div className="detail__pills">
          <TRLBadge trl={opp.trl_band} />
          <DrugClassPill value={opp.drug_class} />
          <FormatPill value={opp.packaging_format} />
          <span className="pill pill--neutral">
            Flagged {fmtDate(opp.created_at)}
          </span>
        </div>

        <h1 className="detail__title">{opp.headline}</h1>

        <div className="detail__statgrid">
          <div className="stat">
            <div className="stat__l">Composite score</div>
            <div className="stat__v">{opp.composite_score.toFixed(2)}</div>
          </div>
          <div className="stat">
            <div className="stat__l">Signal strength</div>
            <div className="stat__v">{Math.round(opp.signal_strength_score * 100)}<small>%</small></div>
          </div>
          <div className="stat">
            <div className="stat__l">Capability match</div>
            <div className="stat__v">{Math.round(opp.capability_match_score * 100)}<small>%</small></div>
          </div>
          <div className="stat">
            <div className="stat__l">Timing window</div>
            <div className="stat__v">{opp.timing_label}</div>
          </div>
        </div>

        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Why flagged</h2>
          </div>
          <p className="section__body" style={{ margin: 0 }}>{opp.why_flagged}</p>
        </section>

        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Why for SCHOTT</h2>
          </div>
          <div className="section__cap">
            <Icon.Capability size={14} /> {opp.matched_capability}
          </div>
          <p className="section__body" style={{ margin: 0 }}>{opp.why_for_schott}</p>
        </section>

        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Contributing signals ({opp.signals.length})</h2>
            <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Sorted by date</div>
          </div>
          <div className="siglist">
            {opp.signals
              .slice()
              .sort((a, b) => new Date(b.published_date) - new Date(a.published_date))
              .map(s => {
                const SrcIcon = Icon.src[s.source_type] || Icon.src["OpenAlex"];
                return (
                  <div key={s.id} className="sigrow">
                    <span className="sigrow__icon"><SrcIcon /></span>
                    <div>
                      <h4 className="sigrow__title">
                        <a href={`https://${s.url}`} target="_blank" rel="noopener noreferrer">{s.title}</a>
                      </h4>
                      <div className="sigrow__meta">
                        <span>{s.source_type}</span>
                        <span>·</span>
                        <span>{fmtDate(s.published_date)}</span>
                      </div>
                      <div className="sigrow__tags">
                        <span className="tag">{fmtFormat(s.tags.packaging_format)}</span>
                        <span className="tag">{s.tags.drug_class}</span>
                        <span className="tag">{fmtMaterial(s.tags.material_ref)}</span>
                        <span className="tag">{phaseLabel(s.tags.phase)}</span>
                      </div>
                    </div>
                    <a className="sigrow__ext" href={`https://${s.url}`} target="_blank" rel="noopener noreferrer">
                      Open <Icon.External size={12} />
                    </a>
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}

Object.assign(window, { LoginView, DashboardView, OpportunityDetail });
