/* ============================================================
   Web admin shell → window.WebApp
   sidebar · dashboard · projects · drawings+pin · templates ·
   tasks · tamper · AI/rebar · users · logs  (+ imports CSV/photos/ledger)
   ============================================================ */
const { useState: useStateW } = React;

/* ---------- KPI + charts ---------- */
function Kpi({ n, label, color, icon, sub }) {
  return (
    <div className="card" style={{ padding: 16, flex: 1, minWidth: 140 }}>
      <div className="row spread"><span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{label}</span><Icon name={icon} size={16} color={color || "var(--ink-4)"} /></div>
      <div className="num" style={{ fontSize: 30, fontWeight: 800, marginTop: 8, color: color || "var(--ink)", lineHeight: 1 }}>{n}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function Dashboard({ go }) {
  const M = window.MOCK, k = M.kpi;
  const maxTrend = Math.max(...M.uploadTrend);
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)", gap: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>ダッシュボード</h1>
        <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>{M.project.name} ・ 進捗 {M.project.progress}%</div>
      </div>
      <div className="row gap-12 wrap">
        <Kpi n={k.tasksTotal} label="総撮影タスク" icon="list" sub="うち未撮影 41" />
        <Kpi n={k.pending} label="確認待ち" icon="clock" color="var(--st-pending)" sub="本日 +12" />
        <Kpi n={k.approved} label="確認済み" icon="checkCircle" color="var(--st-approved)" />
        <Kpi n={k.redo} label="再撮影" icon="redo" color="var(--st-redo)" sub={`差戻し率 ${(k.redoRate * 100).toFixed(1)}%`} />
        <Kpi n={k.todayUploaded} label="本日アップロード" icon="upload" color="var(--accent)" />
      </div>
      <div className="row gap-16 wrap" style={{ alignItems: "stretch" }}>
        <div className="card" style={{ padding: 18, flex: 2, minWidth: 340 }}>
          <div className="row spread" style={{ marginBottom: 14 }}><span style={{ fontWeight: 700, fontSize: 14 }}>工種別 進捗</span></div>
          <div className="col gap-12">
            {M.progressByWork.map(w => { const pct = Math.round(w.done / w.total * 100); return (
              <div key={w.name}>
                <div className="row spread" style={{ fontSize: 12.5, marginBottom: 5 }}><span style={{ fontWeight: 600 }}>{w.name}</span><span className="num muted">{w.done}/{w.total}（{pct}%）</span></div>
                <div style={{ height: 9, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: pct === 100 ? "var(--st-approved)" : "var(--accent)", borderRadius: 999, transition: "width .6s" }}></div></div>
              </div>
            ); })}
          </div>
        </div>
        <div className="card" style={{ padding: 18, flex: 1, minWidth: 240 }}>
          <div className="row spread" style={{ marginBottom: 14 }}><span style={{ fontWeight: 700, fontSize: 14 }}>写真アップロード推移</span><span className="muted" style={{ fontSize: 11 }}>直近7日</span></div>
          <div className="row gap-8" style={{ alignItems: "flex-end", height: 130 }}>
            {M.uploadTrend.map((v, i) => (
              <div key={i} className="col center" style={{ flex: 1, gap: 6, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "70%", height: (v / maxTrend * 100) + "%", background: i === M.uploadTrend.length - 1 ? "var(--accent)" : "var(--accent-soft-2)", borderRadius: "5px 5px 0 0", transition: "height .6s" }}></div>
                <span className="num" style={{ fontSize: 10, color: "var(--ink-4)" }}>{["月", "火", "水", "木", "金", "土", "日"][i]}</span>
              </div>
            ))}
          </div>
          <div className="row spread" style={{ marginTop: 14, fontSize: 12 }}>
            <span className="muted">写真確認リードタイム</span><span className="num" style={{ fontWeight: 700 }}>{k.leadTimeHrs} 時間</span>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 18 }}>
        <div className="row spread" style={{ marginBottom: 12 }}>
          <span className="row gap-8" style={{ fontWeight: 700, fontSize: 14 }}><Icon name="log" size={17} color="var(--ink-3)" />操作ログ</span>
          <span className="muted" style={{ fontSize: 11.5 }}>監査用の操作履歴（変更前後データを保持）</span>
        </div>
        <table className="data">
          <thead><tr><th style={{ width: 150 }}>日時</th><th style={{ width: 130 }}>ユーザー</th><th>操作</th><th style={{ width: 130 }}>対象</th></tr></thead>
          <tbody>{M.auditLog.map((l, i) => (
            <tr key={i}><td className="num muted">{l.at}</td><td><b>{l.user}</b></td><td>{l.action}</td><td className="mono muted">{l.target}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- 案件管理 ---------- */
function Projects() {
  const M = window.MOCK;
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)" }}>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>案件管理</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>担当する案件の一覧と進捗。</div></div>
        <button className="btn primary"><Icon name="plus" size={15} />案件作成</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 16 }}>
        {M.projects.map(p => (
          <div key={p.id} className="card fade-up" style={{ padding: 18 }}>
            <div className="row spread"><span className="chip num" style={{ background: "var(--bg)", color: "var(--ink-3)" }}>{p.id}</span>
              {p.isPublic && <span className="chip" style={{ background: "var(--st-unsync-soft)", color: "var(--st-unsync)" }}><Icon name="shield" size={13} color="var(--st-unsync)" />公共工事</span>}</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 10, lineHeight: 1.4 }}>{p.name}</div>
            <div className="col gap-6" style={{ marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>
              <span className="row gap-6"><Icon name="users" size={14} />{p.client} / {p.contractor}</span>
              <span className="row gap-6"><Icon name="pin" size={14} />{p.address}</span>
              <span className="row gap-6 num"><Icon name="clock" size={14} />{p.period}</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="row spread" style={{ fontSize: 11.5, marginBottom: 5 }}><span className="muted">進捗</span><span className="num" style={{ fontWeight: 700 }}>{p.progress}%</span></div>
              <div style={{ height: 7, background: "var(--bg-2)", borderRadius: 999 }}><div style={{ width: p.progress + "%", height: "100%", background: "var(--accent)", borderRadius: 999 }}></div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 図面管理 + Pin 編集 ---------- */
function Drawings() {
  const M = window.MOCK;
  const [tab, setTab] = useStateW("list");
  const dwg = M.drawings[0];
  const [pins, setPins] = useStateW(M.pins.filter(p => p.drawingId === dwg.id));
  const [placing, setPlacing] = useStateW(false);
  function onPlace(e) {
    if (!placing) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
    setPins(ps => [...ps, { id: "P-" + (ps.length + 1).toString().padStart(2, "0"), x: +x, y: +y, location: "新規 Pin", status: "none", workType: "配筋検査" }]);
    setPlacing(false);
  }
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: "18px 26px 0" }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>図面管理</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>図面のバージョン管理とPin（撮影箇所）の設定。</div></div>
        <div className="row gap-8"><button className="btn"><Icon name="upload" size={15} />図面アップロード</button></div>
      </div>
      <div className="row gap-8" style={{ padding: "14px 26px 0" }}>
        <button className={"btn sm" + (tab === "list" ? " primary" : "")} onClick={() => setTab("list")}>図面一覧</button>
        <button className={"btn sm" + (tab === "pin" ? " primary" : "")} onClick={() => setTab("pin")}>Pin 編集（{dwg.number}）</button>
      </div>
      {tab === "list" ? (
        <div style={{ flex: 1, overflow: "auto", padding: 26 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data">
              <thead><tr><th>図面名</th><th>図面番号</th><th>階</th><th>工種</th><th>バージョン</th><th>アップロード者</th><th>日時</th><th>公開</th></tr></thead>
              <tbody>{M.drawings.map(d => (
                <tr key={d.id}><td style={{ fontWeight: 600 }}><span className="row gap-8"><Icon name="file" size={15} color="var(--accent)" />{d.name}</span></td>
                  <td className="mono">{d.number}</td><td>{d.floor}</td><td>{d.workType}</td><td className="mono">{d.version}</td><td>{d.by}</td><td className="num muted">{d.at}</td>
                  <td>{d.published ? <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}>公開中</span> : <span className="chip" style={{ background: "var(--st-none-soft)", color: "var(--ink-3)" }}>非公開</span>}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row" style={{ flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflow: "auto", display: "grid", placeItems: "center", padding: 26 }}>
            <div onClick={onPlace} style={{ position: "relative", width: 640, height: 460, background: "#f7f5ee", borderRadius: 6, boxShadow: "var(--sh-2)", border: "1px solid #ddd", cursor: placing ? "crosshair" : "default" }}>
              <svg viewBox="0 0 640 460" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <rect x="40" y="40" width="560" height="380" fill="none" stroke="#2b4a8a" strokeWidth="2.5" />
                {[150, 260, 370, 480].map(x => <line key={x} x1={x} y1="40" x2={x} y2="420" stroke="#9bb0d6" strokeWidth="1" />)}
                {[130, 220, 310, 400].map(y => <line key={y} x1="40" y1={y} x2="600" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
                <g stroke="#2b4a8a" strokeWidth="2" fill="none"><rect x="150" y="130" width="110" height="90" /><rect x="370" y="220" width="110" height="90" /></g>
                <text x="50" y="32" fill="#2b4a8a" fontSize="13" fontFamily="monospace">{dwg.name} {dwg.number}</text>
              </svg>
              {pins.map(p => { const s = M.STATUS[p.status]; return (
                <svg key={p.id} className="pin" style={{ left: p.x + "%", top: p.y + "%" }} viewBox="0 0 24 24">
                  <path d="M12 23s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" fill={s.color} stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="10" r="3" fill="#fff" />
                </svg>
              ); })}
            </div>
          </div>
          <div className="col" style={{ width: 320, borderLeft: "1px solid var(--line)", background: "var(--surface)", overflow: "auto" }}>
            <div className="row spread" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-2)" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Pin 一覧（{pins.length}）</span>
              <button className={"btn sm" + (placing ? " primary" : "")} onClick={() => setPlacing(!placing)}><Icon name="plus" size={14} />{placing ? "図面上をクリック" : "Pin追加"}</button>
            </div>
            <div className="col">
              {pins.map(p => (
                <div key={p.id} className="row spread" style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-2)" }}>
                  <div className="row gap-8" style={{ minWidth: 0 }}><StatusDot status={p.status} /><div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.location}</div><div className="num muted" style={{ fontSize: 11 }}>{p.id} ・ {p.bbId || "黒板未紐付"}</div></div></div>
                  <Icon name="edit" size={15} color="var(--ink-4)" />
                </div>
              ))}
            </div>
            <div style={{ padding: 16, fontSize: 11.5, color: "var(--ink-4)", lineHeight: 1.6 }}>Pinに黒板と撮影タスクを紐付けると、現場端の図面ビューアから直接撮影できます。</div>
          </div>
        </div>
      )}
    </div>
  );
}

window.WebDashboard = Dashboard;
window.WebProjects = Projects;
window.WebDrawings = Drawings;
window.WebKpi = Kpi;
