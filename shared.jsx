/* ============================================================
   Shared components → window
   Icons · StatusBadge · Blackboard (電子黒板) · PhotoFrame · etc.
   ============================================================ */

/* ---------- Inline icon set (stroke 1.7, 24-grid) ---------- */
function Icon({ name, size = 18, color = "currentColor", style }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", style };
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-6h5v6"/></>,
    camera: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.4-2.2A1 1 0 0 1 9.2 4.3h5.6a1 1 0 0 1 .8.5L17 7h2.5A1.5 1.5 0 0 1 21 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/><circle cx="12" cy="13" r="3.4"/></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    map: <><path d="m9 5-6 2.5v13L9 18l6 2.5 6-2.5v-13L15 7.5 9 5z"/><path d="M9 5v13M15 7.5v13"/></>,
    phone: <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></>,
    message: <><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V6a1 1 0 0 1 1-1z"/></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></>,
    send: <><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></>,
    board: <><rect x="3" y="4" width="18" height="14" rx="1.5"/><path d="M7 8.5h10M7 12h6M9 21h6M12 18v3"/></>,
    sync: <><path d="M20 11a8 8 0 0 0-14-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 4.5L20 16"/><path d="M20 20v-4h-4"/></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-2 8-2 8h16s-2-1-2-8"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/></>,
    check: <path d="m5 12.5 4.5 4.5L19 7.5"/>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9.5"/></>,
    x: <path d="M6 6l12 12M18 6 6 18"/>,
    xCircle: <><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></>,
    redo: <><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v4h-4"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>,
    download: <><path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/></>,
    chevR: <path d="m9 6 6 6-6 6"/>,
    chevD: <path d="m6 9 6 6 6-6"/>,
    chevL: <path d="m15 6-6 6 6 6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    filter: <path d="M3 5h18l-7 8v6l-4 2v-8z"/>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>,
    folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    dash: <><rect x="3" y="3" width="8" height="9" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/></>,
    building: <><path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16"/><path d="M14 9h4a1 1 0 0 1 1 1v11"/><path d="M8 8h3M8 12h3M8 16h3M3 21h18"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.5M21 20c0-2.7-1.6-4.3-4-4.8"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></>,
    cpu: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></>,
    log: <><path d="M5 4h14M5 9h14M5 14h9M5 19h9"/><circle cx="18" cy="17" r="3"/></>,
    gear: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin: <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5M3 18l9 5 9-5"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    edit: <><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></>,
    wifi_off: <><path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-7.5-2.9M2 8.8A16 16 0 0 1 6 6.4M22 8.8a16 16 0 0 0-6.5-3"/><path d="M12 20h.01"/></>,
    cloud: <><path d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.5-1.5A3.75 3.75 0 0 1 18 18z"/></>,
    arrowDown: <path d="M12 5v14M6 13l6 6 6-6"/>,
    zoomIn: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></>,
    move: <path d="M12 2v20M2 12h20M9 5l3-3 3 3M9 19l3 3 3-3M5 9l-3 3 3 3M19 9l3 3-3 3"/>,
    ruler: <><rect x="2" y="8" width="20" height="8" rx="1" transform="rotate(0 12 12)"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></>,
    table: <><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M3 14.5h18M9 4v16M15 4v16"/></>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
}

/* ---------- Status badge ---------- */
// 黒板の状態は「未撮影 / 撮影済み」の2値に集約
function boardStatus(s) { return s === "none" ? "none" : "shot"; }
window.boardStatus = boardStatus;
/* shared store hook */
function usePhotoStore() { return React.useSyncExternalStore(window.PhotoStore.subscribe, window.PhotoStore.get); }
window.usePhotoStore = usePhotoStore;
function StatusBadge({ status, size }) {
  const s = window.MOCK.STATUS[status] || window.MOCK.STATUS.none;
  return (
    <span className="chip" style={{ background: s.soft, color: s.color, fontSize: size === "lg" ? 13 : 12, padding: size === "lg" ? "6px 11px" : undefined }}>
      <span className="dot" style={{ background: s.color }}></span>{s.label}
    </span>
  );
}
function StatusDot({ status, size = 9 }) {
  const s = window.MOCK.STATUS[status] || window.MOCK.STATUS.none;
  return <span style={{ width: size, height: size, borderRadius: "50%", background: s.color, display: "inline-block", flex: "none" }}></span>;
}

/* ---------- Photo frame (CSS placeholder for construction photo) ---------- */
function PhotoFrame({ hue = 150, label, children, style, board, rounded = 10 }) {
  // abstract "site photo": layered concrete/rebar-ish gradient
  const bg = `linear-gradient(150deg, hsl(${hue} 14% 78%), hsl(${hue} 10% 62%) 55%, hsl(${hue - 20} 12% 48%))`;
  return (
    <div style={{ position: "relative", borderRadius: rounded, overflow: "hidden", background: bg, ...style }}>
      {/* faux rebar grid */}
      <svg width="100%" height="100%" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, opacity: .26 }}>
        <g stroke="#2a2f29" strokeWidth="2.4" opacity="0.7">
          {[20, 50, 80, 110, 140].map((y, i) => <line key={"h" + i} x1="0" y1={y} x2="200" y2={y} />)}
          {[18, 48, 78, 108, 138, 168].map((x, i) => <line key={"v" + i} x1={x} y1="0" x2={x} y2="150" />)}
        </g>
        <g fill="#1a1d19" opacity="0.45">
          {[[18, 20], [48, 50], [78, 80], [108, 110], [138, 50], [168, 110]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="3.6" />)}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.12))" }}></div>
      {label && <div style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,.4)", padding: "3px 7px", borderRadius: 5, fontFamily: "var(--font-mono)" }}>{label}</div>}
      {children}
    </div>
  );
}

/* ---------- The signature: electronic 黒板 (chalkboard) ---------- */
/* scale ~ relative font sizing. variant 'full' shows table; 'compact' fewer rows. */
function Blackboard({ data, scale = 1, style, variant = "full" }) {
  const d = data || {};
  const fs = (n) => Math.round(n * scale * 10) / 10;
  const rows = [
    ["工　種", d.workType || "配筋検査"],
    ["種　別", d.category || "鉄筋"],
    ["細　別", d.subcategory || "—"],
    ["施工箇所", d.location || "—"],
    ["測　点", d.point || "—"],
    ["設計値", d.design || "—"],
    ["実測値", d.actual || "—"],
  ];
  const shown = variant === "compact" ? rows.slice(0, 5) : rows;
  return (
    <div style={{
      background: "linear-gradient(170deg, var(--board-green), var(--board-green-2))",
      border: `${fs(3)}px solid #c9a24a`, borderRadius: fs(4),
      boxShadow: "inset 0 0 30px rgba(0,0,0,.35), 0 4px 14px rgba(0,0,0,.3)",
      padding: fs(10), color: "var(--board-chalk)", fontFamily: "var(--font-jp)",
      ...style,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `1px solid var(--board-line)`, paddingBottom: fs(6), marginBottom: fs(7) }}>
        <div>
          <div style={{ fontSize: fs(13), fontWeight: 700, letterSpacing: ".02em", lineHeight: 1.2 }}>{d.project ? "工事写真" : "工事写真"}</div>
          <div style={{ fontSize: fs(9), opacity: .82, marginTop: fs(2), maxWidth: fs(230), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.project || window.MOCK.project.name}</div>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: fs(9), textAlign: "right", opacity: .9, lineHeight: 1.5 }}>
          <div>{d.date || "2026/06/09"}</div>
          <div>{d.shooter || "山本 涼"}</div>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <tbody>
          {shown.map(([k, v], i) => (
            <tr key={i}>
              <td style={{ width: fs(58), fontSize: fs(9.5), fontWeight: 700, opacity: .88, padding: `${fs(3)}px ${fs(6)}px`, borderBottom: `1px solid var(--board-line)`, verticalAlign: "top", whiteSpace: "nowrap" }}>{k}</td>
              <td style={{ fontSize: fs(10.5), fontFamily: k === "設計値" || k === "実測値" || k === "測　点" ? "var(--font-mono)" : "var(--font-jp)", padding: `${fs(3)}px ${fs(6)}px`, borderBottom: `1px solid var(--board-line)`, color: v === "—" ? "rgba(244,241,232,.45)" : "var(--board-chalk)" }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { Icon, StatusBadge, StatusDot, PhotoFrame, Blackboard, Pill });

/* generic status pill from a {label,color,soft} def */
function Pill({ def, size }) {
  if (!def) return null;
  return <span className="chip" style={{ background: def.soft, color: def.color, fontSize: size === "lg" ? 13 : 12, padding: size === "lg" ? "6px 11px" : undefined }}><span className="dot" style={{ background: def.color }}></span>{def.label}</span>;
}
