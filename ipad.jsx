/* ============================================================
   iPad field app shell → window.FieldApp
   home / tasks / drawing+pin / board list + bottom nav
   ============================================================ */
const { useState: useStateF } = React;

function StatTile({ n, label, status, big, onClick }) {
  const s = window.MOCK.STATUS[status];
  return (
    <button onClick={onClick} className="card" style={{ flex: 1, padding: big ? "16px 14px" : "12px 12px", textAlign: "left", cursor: onClick ? "pointer" : "default", borderLeft: `4px solid ${s ? s.color : "var(--line)"}` }}>
      <div className="num" style={{ fontSize: big ? "calc(30px * var(--field-scale))" : "calc(22px * var(--field-scale))", fontWeight: 800, lineHeight: 1, color: s ? s.color : "var(--ink)" }}>{n}</div>
      <div style={{ fontSize: "calc(12px * var(--field-scale))", color: "var(--ink-3)", fontWeight: 600, marginTop: 6 }}>{label}</div>
    </button>
  );
}

function FieldHome({ go }) {
  const M = window.MOCK;
  const counts = { none: 41, pending: 23, approved: 168, redo: 2, unsync: 4 };
  const big = [
    { icon: "map", label: "図面を見る", scr: "drawing", tone: "var(--accent)" },
    { icon: "camera", label: "写真を撮影", scr: "boards", tone: "var(--st-shooting)" },
    { icon: "board", label: "黒板一覧", scr: "boards", tone: "var(--board-green)" },
    { icon: "redo", label: "再撮影指示", scr: "redo", tone: "var(--st-redo)", badge: 2 },
  ];
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 22, gap: 18, background: "var(--bg)" }}>
      <div className="card fade-up" style={{ padding: 18, background: "linear-gradient(120deg, var(--accent), var(--accent-ink))", border: "none", color: "#fff" }}>
        <div style={{ fontSize: 12.5, opacity: .82, fontWeight: 600 }}>本日の現場 ・ 2026/06/09（火）</div>
        <div style={{ fontWeight: 800, fontSize: "calc(19px * var(--field-scale))", marginTop: 4 }}>{M.project.name}</div>
        <div className="row gap-16" style={{ marginTop: 12, fontSize: 12.5 }}>
          <span className="row gap-6" style={{ opacity: .9 }}><Icon name="pin" size={15} color="#fff" />{M.project.address}</span>
          <span className="row gap-6" style={{ opacity: .9 }}><Icon name="users" size={15} color="#fff" />担当: 山本 涼</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)", marginBottom: 10 }}>本日の撮影タスク</div>
        <div className="row gap-10">
          <StatTile n={counts.none} label="未撮影" status="none" big onClick={() => go("tasks")} />
          <StatTile n={counts.pending} label="確認待ち" status="pending" big onClick={() => go("tasks")} />
          <StatTile n={counts.approved} label="確認済み" status="approved" big />
          <StatTile n={counts.redo} label="再撮影" status="redo" big onClick={() => go("redo")} />
          <StatTile n={counts.unsync} label="未送信" status="unsync" big onClick={() => go("sync")} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)", marginBottom: 10 }}>クイック操作</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {big.map(b => (
            <button key={b.label} onClick={() => go(b.scr)} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", position: "relative" }}>
              <div className="center" style={{ width: 56, height: 56, borderRadius: 16, background: b.tone, flex: "none" }}><Icon name={b.icon} size={28} color="#fff" /></div>
              <div style={{ fontWeight: 700, fontSize: "calc(17px * var(--field-scale))" }}>{b.label}</div>
              {b.badge && <span className="num" style={{ position: "absolute", top: 12, right: 12, background: "var(--st-redo)", color: "#fff", borderRadius: 999, fontSize: 12, fontWeight: 800, padding: "2px 9px" }}>{b.badge}</span>}
              <Icon name="chevR" size={20} color="var(--ink-4)" style={{ marginLeft: "auto" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function IFilSel({ label, value, onChange, options, render }) {
  return (
    <label className="row gap-6" style={{ fontSize: "calc(11.5px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)", whiteSpace: "nowrap" }}>{label}
      <select className="inp" style={{ width: "auto", padding: "6px 8px", fontSize: "calc(12.5px * var(--field-scale))" }} value={value} onChange={e => onChange(e.target.value)}>
        <option value="all">すべて</option>
        {options.map(o => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </label>
  );
}

function FieldTemplateModal({ onClose, onCreate }) {
  const M = window.MOCK;
  const FIELDS = ["設計値", "実測値", "施工内容", "立会者", "測点", "備考"];
  const [d, setD] = useStateF({ name: "", workType: M.WORK_TYPES[2], category: "鉄筋", fields: ["設計値", "実測値", "備考"] });
  const [err, setErr] = useStateF(false);
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const toggleField = (name) => setD(p => ({ ...p, fields: p.fields.includes(name) ? p.fields.filter(x => x !== name) : [...p.fields, name] }));
  const submit = () => { if (!d.name.trim()) { setErr(true); return; } onCreate(d.name); };
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(19,24,32,.45)", zIndex: 60, display: "grid", placeItems: "center", animation: "fadeIn .15s", padding: 18 }}>
      <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 560, maxWidth: "94%", maxHeight: "90%", overflow: "auto", boxShadow: "var(--sh-4)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="row gap-8"><Icon name="board" size={18} color="var(--accent)" /><span style={{ fontWeight: 800, fontSize: "calc(16px * var(--field-scale))" }}>黒板テンプレート作成</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="row" style={{ alignItems: "stretch" }}>
          <div className="col gap-14" style={{ flex: 1, padding: 20, borderRight: "1px solid var(--line-2)" }}>
            <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>テンプレート名 <span style={{ color: "var(--st-redo)" }}>＊必須</span>
              <input className="inp" value={d.name} onChange={e => f("name", e.target.value)} placeholder="例：配筋検査 標準黒板" style={{ ...(err && !d.name.trim() ? { borderColor: "var(--st-redo)" } : {}), fontSize: "calc(14px * var(--field-scale))" }} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>適用工種<select className="inp" value={d.workType} onChange={e => f("workType", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{M.WORK_TYPES.map(w => <option key={w}>{w}</option>)}</select></label>
              <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>種別<input className="inp" value={d.category} onChange={e => f("category", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
            </div>
            <div className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>入力項目
              <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
                {FIELDS.map(name => { const on = d.fields.includes(name); return (
                  <button key={name} onClick={() => toggleField(name)} className="chip" style={{ cursor: "pointer", border: "1px solid " + (on ? "var(--accent)" : "var(--line)"), background: on ? "var(--accent-soft)" : "var(--surface)", color: on ? "var(--accent-ink)" : "var(--ink-3)", fontWeight: 700 }}>{on && <Icon name="check" size={12} color="var(--accent-ink)" />}{name}</button>
                ); })}
              </div>
            </div>
          </div>
          <div className="col center" style={{ width: 210, padding: 20, background: "var(--bg)", gap: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>プレビュー</div>
            <Blackboard data={{ workType: d.workType, category: d.category, subcategory: "（テンプレート）", design: d.fields.includes("設計値") ? "—" : undefined, actual: d.fields.includes("実測値") ? "—" : undefined, point: "—", location: "—" }} scale={0.92} variant="compact" />
          </div>
        </div>
        <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
          <button className="btn lg" onClick={onClose} style={{ marginLeft: "auto" }}>キャンセル</button>
          <button className="btn primary lg" onClick={submit}><Icon name="plus" size={16} />作成</button>
        </div>
      </div>
    </div>
  );
}

function FieldTaskModal({ onClose, onCreate }) {
  const M = window.MOCK;
  const [d, setD] = useStateF({ name: "", workType: M.WORK_TYPES[2], floor: "2F", area: "東エリア", bbId: M.blackboards[0].id, assignee: "山本 涼", due: "06/11", drawingId: M.drawings[0].id, pin: null, note: "" });
  const [err, setErr] = useStateF(false);
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const dwg = M.drawings.find(x => x.id === d.drawingId) || M.drawings[0];
  const placePin = (e) => { const r = e.currentTarget.getBoundingClientRect(); f("pin", { x: Math.round((e.clientX - r.left) / r.width * 1000) / 10, y: Math.round((e.clientY - r.top) / r.height * 1000) / 10 }); };
  const submit = () => { if (!d.name.trim()) { setErr(true); return; } onCreate({ id: "TK-" + Math.floor(100 + Math.random() * 900), name: d.name, workType: d.workType, floor: d.floor, area: d.area, bbId: d.bbId, assignee: d.assignee, due: d.due, status: "none", drawingId: d.drawingId, pinX: d.pin ? d.pin.x : null, pinY: d.pin ? d.pin.y : null, note: d.note, requirement: d.note || "全景・近景の2枚以上、黒板の測点が読めること" }); };
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(19,24,32,.45)", zIndex: 60, display: "grid", placeItems: "center", animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 600, maxWidth: "94%", maxHeight: "90%", overflow: "auto", boxShadow: "var(--sh-4)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="row gap-8"><Icon name="plus" size={18} color="var(--accent)" /><span style={{ fontWeight: 800, fontSize: "calc(16px * var(--field-scale))" }}>撮影タスク作成</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="col gap-14" style={{ padding: 20 }}>
          <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>タスク名 <span style={{ color: "var(--st-redo)" }}>＊必須</span>
            <input className="inp" value={d.name} onChange={e => f("name", e.target.value)} placeholder="例：2F 東 大梁 G2 配筋検査" style={{ ...(err && !d.name.trim() ? { borderColor: "var(--st-redo)" } : {}), fontSize: "calc(14px * var(--field-scale))" }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>工種<select className="inp" value={d.workType} onChange={e => f("workType", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{M.WORK_TYPES.map(w => <option key={w}>{w}</option>)}</select></label>
            <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>黒板<select className="inp" value={d.bbId} onChange={e => f("bbId", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{M.blackboards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>階<select className="inp" value={d.floor} onChange={e => f("floor", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{["B1F", "1F", "2F", "3F", "4F", "R階"].map(o => <option key={o}>{o}</option>)}</select></label>
            <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>エリア<select className="inp" value={d.area} onChange={e => f("area", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{["東エリア", "西エリア", "南エリア", "北エリア", "中央エリア", "全域"].map(o => <option key={o}>{o}</option>)}</select></label>
            <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>担当者<select className="inp" value={d.assignee} onChange={e => f("assignee", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{["山本 涼", "中村 拓也", "高橋 由紀", "佐藤 健一"].map(o => <option key={o}>{o}</option>)}</select></label>
            <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>期限<select className="inp" value={d.due} onChange={e => f("due", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{["06/09", "06/10", "06/11", "06/12", "06/13", "06/16"].map(o => <option key={o}>{o}</option>)}</select></label>
          </div>
          {/* 設計図選択 + Pin + 備考 */}
          <div className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>
            <div className="row spread">
              <span>設計図で撮影箇所を指定<span className="muted" style={{ fontWeight: 400 }}> 任意</span></span>
              {d.pin ? <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}><Icon name="pin" size={12} color="var(--st-approved)" />Pin {d.pin.x},{d.pin.y}</span> : <span className="chip" style={{ background: "var(--st-none-soft)", color: "var(--ink-3)" }}>Pin未設定</span>}
            </div>
            <select className="inp" value={d.drawingId} onChange={e => setD(p => ({ ...p, drawingId: e.target.value, pin: null }))} style={{ margin: "8px 0", fontSize: "calc(14px * var(--field-scale))" }}>{M.drawings.map(dw => <option key={dw.id} value={dw.id}>{dw.name}（{dw.number}）</option>)}</select>
            <div onClick={placePin} style={{ position: "relative", width: "100%", height: 200, background: "#f7f5ee", borderRadius: 8, border: "1px solid #ddd", cursor: "crosshair", overflow: "hidden" }}>
              <svg viewBox="0 0 560 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <rect x="28" y="22" width="504" height="156" fill="none" stroke="#2b4a8a" strokeWidth="2" />
                {[150, 270, 390].map(x => <line key={x} x1={x} y1="22" x2={x} y2="178" stroke="#9bb0d6" strokeWidth="1" />)}
                {[90].map(y => <line key={y} x1="28" y1={y} x2="532" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
                <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="150" y="90" width="120" height="88" /></g>
                <text x="34" y="16" fill="#2b4a8a" fontSize="11" fontFamily="monospace">{dwg.name} {dwg.number}</text>
              </svg>
              {d.pin && <svg style={{ position: "absolute", left: d.pin.x + "%", top: d.pin.y + "%", width: 26, height: 26, transform: "translate(-50%,-100%)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }} viewBox="0 0 24 24"><path d="M12 23s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" fill="var(--accent)" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="10" r="3" fill="#fff" /></svg>}
              <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.45)", padding: "3px 8px", borderRadius: 5 }}><Icon name="pin" size={12} color="#fff" /> 図面をタップしてPinを配置</div>
              {d.pin && <button onClick={e => { e.stopPropagation(); f("pin", null); }} className="btn sm" style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px" }}>Pinを消す</button>}
            </div>
          </div>
          <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>備考（撮影要件・指示）<textarea className="inp" rows={2} value={d.note} onChange={e => f("note", e.target.value)} placeholder="例：全景・近景の2枚以上、黒板の測点が読めること" style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
        </div>
        <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
          <button className="btn lg" onClick={onClose} style={{ marginLeft: "auto" }}>キャンセル</button>
          <button className="btn primary lg" onClick={submit}><Icon name="plus" size={16} />作成</button>
        </div>
      </div>
    </div>
  );
}

function FieldTasks({ go, openTask, flash }) {
  const M = window.MOCK;
  const store = usePhotoStore();
  const tasks = store.tasks;
  const [csel, setCsel] = useStateF([]);
  const toggleCsel = (id) => setCsel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const confirmTasks = (taskIds) => {
    const phIds = store.photos.filter(p => p.status === "pending" && taskIds.includes(p.taskId)).map(p => p.id);
    window.PhotoStore.confirm(phIds);
    setCsel([]);
    flash && flash(`${taskIds.length} 件を確認しました（Web写真管理へ反映）`);
  };
  const [status, setStatus] = useStateF("all");
  const [creating, setCreating] = useStateF(false);
  const [tplCreating, setTplCreating] = useStateF(false);
  const [newId, setNewId] = useStateF(null);
  const [fil, setFil] = useStateF({ workType: "all", area: "all", bbId: "all", assignee: "all", due: "all" });
  const [view, setView] = useStateF("detail");
  const setF = (k, v) => setFil(p => ({ ...p, [k]: v }));
  const uniq = (a) => [...new Set(a)];
  const opts = { workType: uniq(tasks.map(t => t.workType)), area: uniq(tasks.map(t => `${t.floor} ${t.area}`)), bbId: uniq(tasks.map(t => t.bbId)), assignee: uniq(tasks.map(t => t.assignee)), due: uniq(tasks.map(t => t.due)) };
  const bbName = (id) => { const b = M.blackboards.find(x => x.id === id); return b ? b.name : id; };
  const filActive = Object.values(fil).some(v => v !== "all");
  const create = (t) => { window.PhotoStore.addTask(t); setCreating(false); setNewId(t.id); setTimeout(() => setNewId(null), 2600); };
  const list = tasks.filter(t =>
    (status === "all" || t.status === status) &&
    (fil.workType === "all" || t.workType === fil.workType) &&
    (fil.area === "all" || `${t.floor} ${t.area}` === fil.area) &&
    (fil.bbId === "all" || t.bbId === fil.bbId) &&
    (fil.assignee === "all" || t.assignee === fil.assignee) &&
    (fil.due === "all" || t.due === fil.due));
  const ord = { pending: 0, none: 1, approved: 2 };
  list.sort((a, b) => (ord[a.status] ?? 9) - (ord[b.status] ?? 9));
  return (
    <div className="col fieldbig" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="col" style={{ flex: "none", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="row spread gap-8" style={{ padding: "12px 18px 8px" }}>
          <div className="row gap-8">
            {[["all", "すべて"], ["none", "未撮影"], ["pending", "確認待ち"], ["approved", "確認済"]].map(([k, label]) => <button key={k} className={"btn sm" + (status === k ? " primary" : "")} onClick={() => setStatus(k)} style={{ whiteSpace: "nowrap" }}>{label}</button>)}
          </div>
          <div className="row gap-8">
            {csel.length > 0 && <button className="btn danger sm" onClick={() => { window.PhotoStore.removeTasks(csel); setCsel([]); flash && flash(`${csel.length} 件のタスクを削除しました`); }}><Icon name="x" size={15} color="var(--st-redo)" />選択を削除（{csel.length}）</button>}
            {csel.length > 0 && <button className="btn primary sm" style={{ background: "var(--st-approved)", borderColor: "var(--st-approved)" }} onClick={() => confirmTasks(csel)}><Icon name="check" size={15} color="#fff" />一括確認（{csel.length}）</button>}
            <button className="btn sm" onClick={() => setTplCreating(true)}><Icon name="board" size={15} />黒板作成</button>
            <button className="btn primary sm" onClick={() => setCreating(true)}><Icon name="plus" size={15} color="#fff" />タスク作成</button>
          </div>
        </div>
        <div className="row gap-10" style={{ padding: "2px 18px 12px", overflowX: "auto", alignItems: "center" }}>
          <Icon name="filter" size={15} color="var(--ink-4)" />
          <IFilSel label="工種" value={fil.workType} onChange={v => setF("workType", v)} options={opts.workType} />
          <IFilSel label="階/エリア" value={fil.area} onChange={v => setF("area", v)} options={opts.area} />
          <IFilSel label="黒板" value={fil.bbId} onChange={v => setF("bbId", v)} options={opts.bbId} render={bbName} />
          <IFilSel label="担当者" value={fil.assignee} onChange={v => setF("assignee", v)} options={opts.assignee} />
          <IFilSel label="期限" value={fil.due} onChange={v => setF("due", v)} options={opts.due} />
          {filActive && <button className="btn ghost sm" onClick={() => setFil({ workType: "all", area: "all", bbId: "all", assignee: "all", due: "all" })} style={{ whiteSpace: "nowrap" }}><Icon name="x" size={13} />クリア</button>}
          <div className="row gap-4" style={{ marginLeft: "auto", flex: "none" }}>
            <button className="btn ghost sm" title="大図表示" onClick={() => setView("grid")} style={{ background: view === "grid" ? "var(--bg-2)" : undefined }}><Icon name="grid" size={18} color={view === "grid" ? "var(--accent)" : undefined} /></button>
            <button className="btn ghost sm" title="詳細表示" onClick={() => setView("detail")} style={{ background: view === "detail" ? "var(--bg-2)" : undefined }}><Icon name="list" size={18} color={view === "detail" ? "var(--accent)" : undefined} /></button>
          </div>
        </div>
      </div>
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 18, gap: 12 }}>
        {list.length === 0 && <div className="muted center" style={{ padding: 40, fontSize: "calc(13px * var(--field-scale))" }}>該当するタスクがありません。</div>}
        {view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {list.map(t => {
              const b = M.blackboards.find(x => x.id === t.bbId);
              const shot = t.status !== "none";
              return (
                <div key={t.id} className="card fade-up" style={{ overflow: "hidden", outline: newId === t.id ? "2px solid var(--st-approved)" : "none" }}>
                  <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--bg-2)" }}>
                    {shot ? <PhotoFrame hue={140 + (t.id.charCodeAt(t.id.length - 1) % 6) * 16} rounded={0} style={{ position: "absolute", inset: 0 }} /> : <div className="center" style={{ position: "absolute", inset: 0, color: "var(--ink-4)", flexDirection: "column", gap: 6 }}><Icon name="camera" size={30} color="var(--ink-4)" /><span style={{ fontSize: 11, fontWeight: 600 }}>未撮影</span></div>}
                    {shot && b && <div style={{ position: "absolute", right: 6, bottom: 6, width: "44%" }}><Blackboard data={b} scale={0.6} variant="compact" /></div>}
                    <div style={{ position: "absolute", top: 8, left: 8 }}><StatusBadge status={t.status} /></div>
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: "calc(13px * var(--field-scale))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{t.floor} {t.area} ・ {b && b.name}</div>
                    {t.status === "pending"
                      ? <button className="btn primary sm" style={{ width: "100%", marginTop: 10, background: "var(--st-approved)", borderColor: "var(--st-approved)" }} onClick={() => confirmTasks([t.id])}><Icon name="check" size={14} color="#fff" />確認</button>
                      : <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>{t.status === "none" ? "iPhoneで撮影" : "確認済"}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : list.map(t => {
          const b = M.blackboards.find(x => x.id === t.bbId);
          return (
            <div key={t.id} className="card fade-up" style={{ padding: 16, outline: newId === t.id ? "2px solid var(--st-approved)" : "none" }}>
              <div className="row spread">
                <div className="row gap-8"><div onClick={() => toggleCsel(t.id)} style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid " + (csel.includes(t.id) ? "var(--accent)" : "var(--line)"), background: csel.includes(t.id) ? "var(--accent)" : "#fff", display: "grid", placeItems: "center", cursor: "pointer", flex: "none" }}>{csel.includes(t.id) && <Icon name="check" size={13} color="#fff" />}</div><StatusDot status={t.status} /><span style={{ fontWeight: 700, fontSize: "calc(15px * var(--field-scale))" }}>{t.name}</span>{t.pinX != null && <Icon name="pin" size={14} color="var(--accent)" />}{newId === t.id && <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)", fontSize: 10 }}>新規</span>}</div>
                <StatusBadge status={t.status} />
              </div>
              <div className="row gap-16 wrap" style={{ marginTop: 10, fontSize: "calc(12.5px * var(--field-scale))", color: "var(--ink-3)" }}>
                <span className="row gap-4"><Icon name="building" size={14} />{t.workType}</span>
                <span className="row gap-4"><Icon name="layers" size={14} />{t.floor} {t.area}</span>
                <span className="row gap-4"><Icon name="board" size={14} />{b && b.name}</span>
                <span className="row gap-4 num"><Icon name="clock" size={14} />期限 {t.due}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-4)", background: "var(--bg)", borderRadius: 8, padding: "8px 10px" }}>撮影要件: {t.requirement}</div>
              <div className="row gap-8" style={{ marginTop: 12 }}>
                <button className="btn sm" onClick={() => go("drawing")}><Icon name="map" size={15} />図面で確認</button>
                {t.status === "pending"
                  ? <button className="btn primary sm" style={{ marginLeft: "auto", background: "var(--st-approved)", borderColor: "var(--st-approved)" }} onClick={() => confirmTasks([t.id])}><Icon name="check" size={15} color="#fff" />確認</button>
                  : <span className="muted" style={{ marginLeft: "auto", fontSize: "calc(12px * var(--field-scale))" }}>{t.status === "none" ? "iPhoneで撮影します" : "確認済"}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {creating && <FieldTaskModal onClose={() => setCreating(false)} onCreate={create} />}
      {tplCreating && <FieldTemplateModal onClose={() => setTplCreating(false)} onCreate={(name) => { setTplCreating(false); flash && flash(`黒板テンプレート「${name}」を作成しました`); }} />}
    </div>
  );
}

function FieldDrawing({ openPin }) {
  const M = window.MOCK;
  const dwg = M.drawings[0];
  const pins = M.pins.filter(p => p.drawingId === dwg.id);
  const [zoom, setZoom] = useStateF(1);
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg-2)" }}>
      <div className="row spread" style={{ padding: "10px 18px", background: "var(--surface)", borderBottom: "1px solid var(--line)", flex: "none" }}>
        <div className="row gap-10">
          <span style={{ fontWeight: 700, fontSize: "calc(14px * var(--field-scale))" }}>{dwg.name}</span>
          <span className="chip num" style={{ background: "var(--bg)", color: "var(--ink-3)" }}>{dwg.number} ・ {dwg.version}</span>
          <span className="chip num" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>{dwg.floor}</span>
        </div>
        <div className="row gap-6">
          <button className="btn ghost sm" onClick={() => setZoom(z => Math.max(.7, z - .15))}>−</button>
          <span className="num" style={{ fontSize: 12, width: 42, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <button className="btn ghost sm" onClick={() => setZoom(z => Math.min(1.8, z + .15))}>＋</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ position: "relative", width: 620 * zoom, height: 440 * zoom, background: "#f7f5ee", borderRadius: 6, boxShadow: "var(--sh-2)", border: "1px solid #ddd", transition: "width .15s, height .15s" }}>
          {/* faux floor plan */}
          <svg viewBox="0 0 620 440" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <rect x="40" y="40" width="540" height="360" fill="none" stroke="#2b4a8a" strokeWidth="2.5" />
            <rect x="40" y="40" width="540" height="360" fill="none" stroke="#2b4a8a" strokeWidth="6" opacity=".25" />
            {[140, 240, 340, 440, 540].map(x => <line key={x} x1={x} y1="40" x2={x} y2="400" stroke="#9bb0d6" strokeWidth="1" />)}
            {[120, 200, 280, 360].map(y => <line key={y} x1="40" y1={y} x2="580" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
            <g stroke="#2b4a8a" strokeWidth="2" fill="none">
              <rect x="140" y="120" width="100" height="80" /><rect x="340" y="200" width="100" height="80" /><rect x="440" y="40" width="100" height="80" />
            </g>
            <text x="50" y="32" fill="#2b4a8a" fontSize="13" fontFamily="monospace">2F 伏図（配筋）S-201</text>
            {["X1", "X2", "X3", "X4", "X5"].map((t, i) => <text key={t} x={138 + i * 100} y="425" fill="#2b4a8a" fontSize="11" fontFamily="monospace">{t}</text>)}
          </svg>
          {pins.map(p => {
            const s = M.STATUS[p.status];
            return (
              <svg key={p.id} className="pin" style={{ left: p.x + "%", top: p.y + "%", width: 26 * Math.min(zoom, 1.2), height: 26 * Math.min(zoom, 1.2) }} viewBox="0 0 24 24" onClick={() => openPin(p)}>
                <path d="M12 23s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" fill={s.color} stroke="#fff" strokeWidth="1.5" />
                <circle cx="12" cy="10" r="3" fill="#fff" />
              </svg>
            );
          })}
        </div>
      </div>
      <div className="row gap-12 center" style={{ padding: "10px 18px", background: "var(--surface)", borderTop: "1px solid var(--line)", flex: "none", flexWrap: "wrap" }}>
        {["none", "shooting", "pending", "approved", "redo"].map(k => (
          <span key={k} className="row gap-6" style={{ fontSize: 11.5, color: "var(--ink-3)" }}><StatusDot status={k} />{M.STATUS[k].label}</span>
        ))}
      </div>
    </div>
  );
}

function PinSheet({ pin, onClose, onShoot }) {
  const M = window.MOCK;
  const b = M.blackboards.find(x => x.id === pin.bbId);
  const t = M.tasks.find(x => x.id === pin.taskId);
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(19,24,32,.35)", display: "grid", placeItems: "end center", zIndex: 30, animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: "100%", maxWidth: 720, margin: 0, borderRadius: "18px 18px 0 0", padding: 22, animation: "fadeUp .22s" }}>
        <div className="row spread">
          <div className="row gap-10"><StatusDot status={pin.status} size={12} /><span style={{ fontWeight: 800, fontSize: 18 }}>{pin.location}</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="row gap-20" style={{ marginTop: 16, alignItems: "flex-start" }}>
          <div className="col gap-10" style={{ flex: 1 }}>
            {[["工種", pin.workType], ["検査項目", pin.item], ["撮影タスク", t && t.name], ["使用黒板", b && b.name], ["撮影要件", t && t.requirement]].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: 11.5, color: "var(--ink-4)", fontWeight: 700 }}>{k}</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</div></div>
            ))}
            <StatusBadge status={pin.status} size="lg" />
          </div>
          <Blackboard data={b} scale={1.05} style={{ width: 240, flex: "none" }} />
        </div>
        <button className="btn primary lg" style={{ width: "100%", marginTop: 18 }} onClick={() => onShoot(b)}><Icon name="camera" size={18} />撮影する</button>
      </div>
    </div>
  );
}

function FieldBoards({ openBoard }) {
  const M = window.MOCK;
  const [q, setQ] = useStateF("");
  const list = M.blackboards.filter(b => b.name.includes(q) || b.subcategory.includes(q));
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row gap-10" style={{ padding: "12px 18px", background: "var(--surface)", borderBottom: "1px solid var(--line)", flex: "none" }}>
        <div className="row gap-8" style={{ flex: 1, background: "var(--bg)", borderRadius: 9, padding: "7px 11px" }}>
          <Icon name="search" size={16} color="var(--ink-4)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="黒板を検索（工種・施工箇所）" style={{ border: "none", background: "none", outline: "none", flex: 1, fontSize: 13 }} />
        </div>
        <button className="btn sm"><Icon name="filter" size={15} />絞り込み</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14, alignContent: "start" }}>
        {list.map(b => (
          <button key={b.id} className="card fade-up" onClick={() => openBoard(b)} style={{ padding: 14, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}>
            <Blackboard data={b} scale={1} variant="compact" />
            <div className="row spread">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "calc(14px * var(--field-scale))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                <div className="num" style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>撮影 {b.photos} 枚 ・ {b.point}</div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfirmScreen() {
  const M = window.MOCK;
  const store = usePhotoStore();
  const pending = store.photos.filter(p => p.status === "pending");
  const confirmedCount = store.photos.filter(p => p.status === "approved").length;
  const [sel, setSel] = useStateF([]);
  const [active, setActive] = useStateF(null);
  const [toast, setToast] = useStateF(null);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const allSel = pending.length > 0 && pending.every(p => sel.includes(p.id));
  const confirm = (ids) => { window.PhotoStore.confirm(ids); setSel(s => s.filter(x => !ids.includes(x))); setActive(null); flash(`${ids.length} 件を確認しました。Web 写真管理へ反映しました`); };
  const reject = (id) => { window.PhotoStore.reject(id); setSel(s => s.filter(x => x !== id)); setActive(null); flash("差戻しました。iPhoneで再撮影します"); };

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)", position: "relative" }}>
      <div className="col" style={{ flex: "none", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="row spread gap-8" style={{ padding: "12px 18px" }}>
          <div className="row gap-10">
            <span className="chip" style={{ background: "var(--st-pending-soft)", color: "var(--st-pending)" }}><Icon name="clock" size={14} color="var(--st-pending)" />確認待ち {pending.length}</span>
            <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}><Icon name="check" size={14} color="var(--st-approved)" />確認済 {confirmedCount}</span>
          </div>
          <div className="row gap-8">
            {pending.length > 0 && <button className="btn sm" onClick={() => setSel(allSel ? [] : pending.map(p => p.id))}>{allSel ? "選択解除" : "すべて選択"}</button>}
            <button className="btn primary sm" disabled={sel.length === 0} style={sel.length === 0 ? { opacity: .5 } : {}} onClick={() => confirm(sel)}><Icon name="check" size={15} color="#fff" />一括確認{sel.length > 0 && `（${sel.length}）`}</button>
          </div>
        </div>
        <div style={{ padding: "0 18px 12px", fontSize: "calc(12px * var(--field-scale))", color: "var(--ink-3)" }}>iPhone から届いた黒板付き写真を検査・確認します。確認すると Web の工事写真管理へ反映されます。</div>
      </div>

      <div className="col" style={{ flex: 1, overflow: "auto", padding: 18 }}>
        {pending.length === 0
          ? <div className="col center" style={{ flex: 1, color: "var(--ink-4)", gap: 10, padding: 50 }}><Icon name="checkCircle" size={40} color="var(--st-approved)" /><div style={{ fontSize: "calc(14px * var(--field-scale))", fontWeight: 600 }}>確認待ちの写真はありません</div><div style={{ fontSize: "calc(12px * var(--field-scale))" }}>iPhone で撮影されるとここに届きます</div></div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}>
            {pending.map(p => {
              const b = M.blackboards.find(x => x.id === p.bbId);
              const on = sel.includes(p.id);
              return (
                <div key={p.id} className="card fade-up" style={{ overflow: "hidden", cursor: "pointer", outline: on ? "2px solid var(--accent)" : "none" }} onClick={() => setActive(p)}>
                  <div style={{ position: "relative", aspectRatio: "4/3" }}>
                    <PhotoFrame hue={p.hue} rounded={0} style={{ position: "absolute", inset: 0 }} />
                    {b && <div style={{ position: "absolute", right: 6, bottom: 6, width: "44%" }}><Blackboard data={b} scale={0.58} variant="compact" /></div>}
                    <div onClick={e => { e.stopPropagation(); toggle(p.id); }} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 7, background: on ? "var(--accent)" : "rgba(255,255,255,.9)", border: "2px solid " + (on ? "var(--accent)" : "#fff"), display: "grid", placeItems: "center" }}>{on && <Icon name="check" size={16} color="#fff" />}</div>
                    <div style={{ position: "absolute", top: 8, left: 8 }}><StatusBadge status="pending" /></div>
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: "calc(13px * var(--field-scale))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b && b.name}</div>
                    <div className="num muted" style={{ fontSize: 11, marginTop: 2 }}>{p.shooter} ・ {p.takenAt.slice(11)} ・ iPhone</div>
                  </div>
                </div>
              );
            })}
          </div>}
      </div>

      {active && (() => { const b = M.blackboards.find(x => x.id === active.bbId); return (
        <div onClick={() => setActive(null)} style={{ position: "absolute", inset: 0, background: "rgba(19,24,32,.4)", zIndex: 30, display: "flex", justifyContent: "flex-end", animation: "fadeIn .15s" }}>
          <div onClick={e => e.stopPropagation()} className="col" style={{ width: 440, maxWidth: "92%", background: "var(--surface)", height: "100%", boxShadow: "var(--sh-4)", animation: "slideL .22s cubic-bezier(.2,.7,.3,1)" }}>
            <div className="row spread" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", flex: "none" }}>
              <div className="row gap-8"><StatusBadge status="pending" size="lg" /><span style={{ fontWeight: 800, fontSize: "calc(15px * var(--field-scale))" }}>{b && b.name}</span></div>
              <button className="btn ghost sm" onClick={() => setActive(null)}><Icon name="x" size={18} /></button>
            </div>
            <div className="col" style={{ flex: 1, overflow: "auto", padding: 18, gap: 14 }}>
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", boxShadow: "var(--sh-2)" }}>
                <PhotoFrame hue={active.hue} rounded={12} style={{ position: "absolute", inset: 0 }} label={`${active.id} 原図 4032×3024`} />
                {b && <div style={{ position: "absolute", right: 12, bottom: 12, width: "40%" }}><Blackboard data={b} scale={0.85} /></div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["工種", active.workType], ["施工箇所", active.location], ["測点", active.point], ["設計値", active.design], ["実測値", active.actual], ["撮影者", active.shooter], ["撮影日時", active.takenAt], ["端末", active.device]].map(([k, v]) => (
                  <div key={k} style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 11px" }}>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontWeight: 700 }}>{k}</div>
                    <div className={["設計値", "実測値", "測点"].includes(k) ? "mono" : ""} style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 600, marginTop: 2 }}>{v || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)", flex: "none" }}>
              <button className="btn danger lg" style={{ flex: 1 }} onClick={() => reject(active.id)}><Icon name="redo" size={16} color="var(--st-redo)" />差戻し</button>
              <button className="btn primary lg" style={{ flex: 2, background: "var(--st-approved)", borderColor: "var(--st-approved)" }} onClick={() => confirm([active.id])}><Icon name="check" size={17} />確認する</button>
            </div>
          </div>
        </div>
      ); })()}

      {toast && <div className="pop-in" style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, boxShadow: "var(--sh-3)", display: "flex", alignItems: "center", gap: 10, fontSize: "calc(13px * var(--field-scale))", fontWeight: 600, maxWidth: "86%", zIndex: 50 }}><Icon name="checkCircle" size={18} color="#86efac" />{toast}</div>}
    </div>
  );
}

function FieldApp({ tweaks }) {
  const [screen, setScreen] = useStateF("tasks");
  const [pin, setPin] = useStateF(null);
  const [board, setBoard] = useStateF(null);
  const [shot, setShot] = useStateF(null);
  const [online, setOnline] = useStateF(false);
  const [queue, setQueue] = useStateF(4);
  const [toast, setToast] = useStateF(null);
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const go = (s) => { setScreen(s); setPin(null); };
  const openBoardEdit = (b) => { setBoard(b); setScreen("boardEdit"); };
  const startCamera = (b) => { setBoard(b); setScreen("camera"); };

  const tabs = [
    { k: "tasks", icon: "board", label: "黒板" },
    { k: "broadcast", icon: "video", label: "共有ビュー" },
    { k: "forms", icon: "redo", label: "指摘" },
  ];
  const showTabs = !["camera", "preview", "boardEdit", "ireport", "idetail"].includes(screen);

  let body;
  if (screen === "home") body = <FieldHome go={go} />;
  else if (screen === "tasks") body = <FieldTasks go={go} flash={flash} openTask={(t) => openBoardEdit(window.MOCK.blackboards.find(b => b.id === t.bbId))} />;
  else if (screen === "drawing") body = <FieldDrawing openPin={setPin} />;
  else if (screen === "boards") body = <FieldBoards openBoard={openBoardEdit} />;
  else if (screen === "boardEdit") body = <BoardEditScreen board={board} tweaks={tweaks} onBack={() => go("boards")} onNext={(d) => { setBoard(d); setScreen("camera"); }} />;
  else if (screen === "camera") body = <CameraScreen board={board} tweaks={tweaks} online={online} onBack={() => setScreen("boardEdit")}
    onShot={(s, done) => { if (done === "done") { setScreen(s ? "preview" : screen); } else { setShot(s); setScreen("preview"); } }} />;
  else if (screen === "preview") body = <PreviewScreen shot={shot} online={online} onBack={() => setScreen("camera")} onRetake={() => setScreen("camera")}
    onSave={() => { if (online) { setQueue(0); flash("アップロードして自動同期しました"); } else { setQueue(q => q + 1); flash("オフライン保存しました（オンライン復帰時に自動同期）"); } go("tasks"); }} />;
  else if (screen === "redo") body = <RedoScreen onBack={() => go("tasks")} onReshoot={(p) => startCamera(window.MOCK.blackboards.find(b => b.id === p.bbId))} />;
  else if (screen === "forms") body = <window.FieldForms.IssueHome flash={flash} openReport={() => setScreen("ireport")} openDetail={(iss) => { setBoard(iss); setScreen("idetail"); }} />;
  else if (screen === "ireport") body = <window.FieldForms.IssueReport onBack={() => go("forms")} onSubmit={(m) => { flash(m); go("forms"); }} />;
  else if (screen === "broadcast") body = <window.BroadcastScreen />;
  else if (screen === "idetail") body = <window.FieldForms.IssueDetail issue={board} onBack={() => go("forms")} onSubmit={(m) => { flash(m); go("forms"); }} />;

  const titleMap = { tasks: "黒板", broadcast: "共有ビュー", drawing: "図面ビューア", boards: "黒板一覧", redo: "再撮影指示", forms: "指摘" };

  return (
    <div className="col" style={{ height: "100%", background: "var(--bg)", position: "relative" }}>
      {showTabs && titleMap[screen] && screen !== "redo" &&
        <FieldTopBar title={titleMap[screen]} online={online} setOnline={setOnline} queue={queue}
          onBack={screen === "drawing" ? () => go("tasks") : undefined} />}
      <div className="col" style={{ flex: 1, minHeight: 0 }}>{body}</div>
      {showTabs &&
        <div className="row" style={{ flex: "none", borderTop: "1px solid var(--line)", background: "var(--surface)", paddingBottom: 4 }}>
          {tabs.map(t => {
            const active = screen === t.k || (t.k === "redo" && screen === "redo");
            return (
              <button key={t.k} onClick={() => go(t.k)} style={{ flex: 1, border: "none", background: "none", padding: "9px 0 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", position: "relative", color: active ? "var(--accent)" : "var(--ink-4)" }}>
                <Icon name={t.icon} size={24} color={active ? "var(--accent)" : "var(--ink-4)"} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>{t.label}</span>
                {t.badge > 0 && <span className="num" style={{ position: "absolute", top: 4, right: "26%", background: "var(--st-unsync)", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, padding: "1px 5px" }}>{t.badge}</span>}
              </button>
            );
          })}
        </div>}
      {pin && <PinSheet pin={pin} onClose={() => setPin(null)} onShoot={(b) => { setPin(null); openBoardEdit(b); }} />}
      {toast && <div className="pop-in" style={{ position: "absolute", bottom: 86, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, boxShadow: "var(--sh-3)", display: "flex", alignItems: "center", gap: 10, fontSize: "calc(13px * var(--field-scale))", fontWeight: 600, maxWidth: "86%", zIndex: 50 }}><Icon name="checkCircle" size={18} color="#86efac" />{toast}</div>}
    </div>
  );
}

window.FieldApp = FieldApp;
