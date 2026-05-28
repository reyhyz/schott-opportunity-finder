/* Shared icons, badges, pills, logo */

// ============ ICONS ============
const Icon = {
  Logo: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="var(--color-navy)" />
      {/* "Signal" mark — three rising bars + a dot beacon */}
      <rect x="7" y="20" width="3.5" height="6" rx="1" fill="#7fb6c4" />
      <rect x="13" y="15" width="3.5" height="11" rx="1" fill="#b0d4dc" />
      <rect x="19" y="9" width="3.5" height="17" rx="1" fill="#ffffff" />
      <circle cx="20.75" cy="7" r="2.25" fill="#ffd277" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Chevron: ({ dir = "down", size = 14 }) => {
    const rot = { down: 0, up: 180, left: 90, right: -90 }[dir];
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot}deg)` }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  },
  External: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  ArrowRight: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  ArrowLeft: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Clock: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Capability: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5 12 2" />
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Settings: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  EmptyBox: () => (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22 L32 8 L56 22 L56 50 L32 64 L8 50 Z" opacity="0.4" />
      <path d="M8 22 L32 36 L56 22" opacity="0.7" />
      <line x1="32" y1="36" x2="32" y2="64" opacity="0.7" />
      <circle cx="32" cy="22" r="3" fill="currentColor" stroke="none" opacity="0.8">
        <animate attributeName="r" values="3;5;3" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  ),
  // Source-type icons (small monograms)
  src: {
    "ClinicalTrials.gov": () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    ),
    "Google Patents": () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L4 7 V17 L12 22 L20 17 V7 Z"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="4" y1="7" x2="20" y2="17"/></svg>
    ),
    "PubMed": () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4Z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="14" y2="14"/></svg>
    ),
    "OpenAlex": () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12 L21 12 M12 3 Q21 12 12 21 M12 3 Q3 12 12 21"/></svg>
    ),
    "Crunchbase": () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><polyline points="6 8 12 14 18 8"/><polyline points="6 16 12 22 18 16"/></svg>
    ),
    "OpenFDA": () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L20 5 V12 Q20 18 12 22 Q4 18 4 12 V5 Z"/><polyline points="9 12 11 14 15 10"/></svg>
    ),
    "SEC EDGAR": () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
    ),
  }
};

// ============ COMPONENTS ============

function Logo({ size = "default" }) {
  const isLarge = size === "large";
  return (
    <a href="#/dashboard" className="sg-logo" onClick={(e) => {
      e.preventDefault();
      window.location.hash = "#/dashboard";
    }}>
      <Icon.Logo size={isLarge ? 44 : 28} />
      <span className="sg-logo__text">
        <span className="sg-logo__name">Signal</span>
        <span className="sg-logo__sub">Drug Packaging Intelligence</span>
      </span>
    </a>
  );
}

const DRUG_CLASS_STYLE = {
  mRNA: "pill--mrna",
  "GLP-1": "pill--glp1",
  ADC: "pill--adc",
  Biologic: "pill--biologic",
  "Cell Therapy": "pill--cell",
};

function DrugClassPill({ value }) {
  const cls = DRUG_CLASS_STYLE[value] || "pill--neutral";
  return (
    <span className={`pill ${cls}`}>
      <span className="pill__dot" />
      {value}
    </span>
  );
}

function FormatPill({ value }) {
  return (
    <span className="pill pill--neutral">{value}</span>
  );
}

function CapabilityBadge({ value }) {
  return (
    <span className="badge-cap" title="Matched SCHOTT capability">
      <Icon.Capability size={11} />
      {value}
    </span>
  );
}

function TRLBadge({ trl }) {
  return (
    <span className={`badge-trl badge-trl--${trl}`}>TRL {trl}</span>
  );
}

function SignalStrengthBar({ value }) {
  const pct = Math.round(value * 100);
  return (
    <div className="card__strength">
      <div className="card__strength-row">
        <span className="card__strength-l">Signal strength</span>
        <span className="card__strength-v">{pct}%</span>
      </div>
      <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
        <div className="bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Citation({ source, url }) {
  const SrcIcon = Icon.src[source] || Icon.src["OpenAlex"];
  return (
    <a className="cite" href={`https://${url}`} target="_blank" rel="noopener noreferrer">
      <span className="cite__icon"><SrcIcon /></span>
      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}>
        <span className="cite__src">{source}</span>
        <span className="cite__url">{url}</span>
      </span>
      <span className="cite__ext"><Icon.External size={12} /></span>
    </a>
  );
}

function Skeleton({ w = "100%", h = 14, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, ...style }} />;
}

function SkeletonCard() {
  return (
    <div className="card" aria-busy="true">
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton w={70} h={22} style={{ borderRadius: 9999 }} />
        <Skeleton w={56} h={22} style={{ borderRadius: 9999 }} />
        <Skeleton w={48} h={22} style={{ borderRadius: 9999 }} />
      </div>
      <Skeleton w="90%" h={26} />
      <Skeleton w="60%" h={26} />
      <Skeleton w="100%" h={6} style={{ borderRadius: 9999 }} />
      <Skeleton w="80%" h={14} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton w="100%" h={32} />
        <Skeleton w="100%" h={32} />
        <Skeleton w="100%" h={32} />
      </div>
    </div>
  );
}

// ============ CONFIDENCE BADGE ============

function ConfidenceBadge({ value }) {
  const cls = value === "high" ? "badge-conf--high"
    : value === "medium" ? "badge-conf--medium"
    : "badge-conf--low";
  return <span className={`badge-conf ${cls}`}>{value}</span>;
}

// ============ UPLOAD PANEL ============

const { useState: useUploadState, useRef: useUploadRef } = React;

function UploadPanel() {
  const [files, setFiles] = useUploadState([]);
  const [dragging, setDragging] = useUploadState(false);
  const inputRef = useUploadRef(null);

  async function handleFiles(fileList) {
    for (const file of Array.from(fileList)) {
      const id = `${Date.now()}-${file.name}`;
      setFiles(prev => [...prev, { id, name: file.name, status: "uploading", chunks: null }]);
      try {
        const result = await window.uploadFile(file);
        setFiles(prev => prev.map(f =>
          f.id === id ? { ...f, status: "done", chunks: result.chunks_stored } : f
        ));
      } catch (err) {
        setFiles(prev => prev.map(f =>
          f.id === id ? { ...f, status: "error", error: err.message } : f
        ));
      }
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="upload-panel">
      <div
        className={`upload-drop ${dragging ? "upload-drop--over" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.csv"
          multiple
          style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)}
        />
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
          Drop PDF, TXT, or CSV — or <u>click to browse</u>
        </span>
      </div>

      {files.length > 0 && (
        <div className="upload-list">
          {files.map(f => (
            <div key={f.id} className="upload-item">
              <span className="upload-item__name">{f.name}</span>
              {f.status === "uploading" && <span className="upload-item__status">uploading…</span>}
              {f.status === "done"      && <span className="upload-item__status upload-item__status--ok">{f.chunks} chunks</span>}
              {f.status === "error"     && <span className="upload-item__status upload-item__status--err">{f.error}</span>}
              <button
                className="upload-item__remove"
                onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                aria-label="Remove"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// expose
Object.assign(window, {
  Icon, Logo, DrugClassPill, FormatPill, CapabilityBadge, TRLBadge,
  SignalStrengthBar, Citation, Skeleton, SkeletonCard,
  ConfidenceBadge, UploadPanel,
});
