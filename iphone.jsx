/* ============================================================
   iPhone 現場端 — 撮影タスク → 黒板付き撮影 → iPadへ送信（確認待ち）
   Exports → window: PhoneApp
   ============================================================ */
const { useState: useStatePh, useRef: useRefPh, useEffect: useEffectPh } = React;

/* 音声入力（既定）/ 手書き入力 切替パッド */
function HandwritePad({ fieldKey, label, value, onChange, onText, voiceSample }) {
  const ref = useRefPh(null);
  const drawing = useRefPh(false);
  const last = useRefPh(null);
  const [mode, setMode] = useStatePh("voice");
  const [listening, setListening] = useStatePh(false);
  useEffectPh(() => {
    if (mode !== "pen") return;
    const c = ref.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    c.width = rect.width; c.height = rect.height;
    const ctx = c.getContext("2d");
    ctx.lineWidth = 3.2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#15391f";
    ctx.clearRect(0, 0, c.width, c.height);
    if (value) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height); img.src = value; }
  }, [fieldKey, mode]);
  const pos = (e) => { const r = ref.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; };
  const down = (e) => { e.preventDefault(); drawing.current = true; last.current = pos(e); };
  const move = (e) => { if (!drawing.current) return; e.preventDefault(); const ctx = ref.current.getContext("2d"); const p = pos(e); ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last.current = p; };
  const up = () => { if (!drawing.current) return; drawing.current = false; onChange(ref.current.toDataURL()); };
  const clear = () => { const c = ref.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); onChange(""); };
  const listen = () => {
    if (listening) return;
    setListening(true);
    setTimeout(() => { setListening(false); onText && onText(voiceSample || "（音声入力）"); onChange && onChange("voice"); }, 1500);
  };
  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row spread" style={{ alignItems: "center" }}>
        <span style={{ fontSize: "calc(12.5px * var(--field-scale))", fontWeight: 700, color: "var(--ink-2)" }}>{mode === "voice" ? "音声入力" : "手書き入力"}：{label}</span>
        <div className="row gap-4">
          <button className={"btn sm" + (mode === "voice" ? " primary" : "")} onClick={() => setMode("voice")} style={{ padding: "6px 10px" }}><Icon name="mic" size={14} color={mode === "voice" ? "#fff" : undefined} />音声</button>
          <button className={"btn sm" + (mode === "pen" ? " primary" : "")} onClick={() => setMode("pen")} style={{ padding: "6px 10px" }}><Icon name="edit" size={14} color={mode === "pen" ? "#fff" : undefined} />手書き</button>
        </div>
      </div>
      {mode === "voice" ? (
        <div className="col center" style={{ width: "100%", height: 230, background: "#fff", border: "1.5px solid var(--line)", borderRadius: 12, gap: 14 }}>
          <button onClick={listen} className="center" style={{ width: 88, height: 88, borderRadius: "50%", border: "none", cursor: "pointer", background: listening ? "var(--st-redo)" : "var(--accent)", boxShadow: listening ? "0 0 0 8px var(--st-redo-soft)" : "0 0 0 8px var(--accent-soft)", transition: "all .2s" }}>
            <Icon name="mic" size={36} color="#fff" />
          </button>
          <div style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 600, color: listening ? "var(--st-redo)" : "var(--ink-3)" }}>{listening ? "聞き取り中…" : "タップして音声入力"}</div>
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", height: 230, background: "#fff", border: "1.5px solid var(--line)", borderRadius: 12, overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,.05)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderTop: "1px dashed #d8dde4", pointerEvents: "none" }}></div>
          {!value && <div className="center" style={{ position: "absolute", inset: 0, color: "var(--ink-4)", fontSize: "calc(13px * var(--field-scale))", pointerEvents: "none" }}>ここに手書きで記入</div>}
          <canvas ref={ref} onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onTouchStart={down} onTouchMove={move} onTouchEnd={up} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }} />
          <button className="btn ghost sm" onClick={clear} style={{ position: "absolute", top: 6, right: 6 }}><Icon name="x" size={14} />消す</button>
        </div>
      )}
    </div>
  );
}

function PhoneStatusChip({ status }) {
  const M = window.MOCK;
  const s = M.STATUS[status] || M.STATUS.none;
  const label = status === "pending" ? "送信済・確認待ち" : status === "approved" ? "確認済" : "未撮影";
  return <span className="chip" style={{ background: s.soft, color: s.color, fontSize: "calc(10.5px * var(--field-scale))" }}><span className="dot" style={{ background: s.color }}></span>{label}</span>;
}

/* 図面ビューア（タスクのPin表示） */
function PhoneDrawingModal({ task, onClose }) {
  const M = window.MOCK;
  const dwg = M.drawings.find(d => d.id === task.drawingId) || M.drawings[0];
  const px = task.pinX != null ? task.pinX : 50, py = task.pinY != null ? task.pinY : 46;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(19,24,32,.5)", zIndex: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end", animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ margin: 0, borderRadius: "20px 20px 0 0", padding: 16, animation: "fadeUp .22s" }}>
        <div className="row spread" style={{ marginBottom: 12 }}>
          <div className="row gap-8"><Icon name="map" size={18} color="var(--accent)" /><div><div style={{ fontWeight: 800, fontSize: "calc(15px * var(--field-scale))" }}>{dwg.name}</div><div className="num muted" style={{ fontSize: 11 }}>{dwg.number} ・ {dwg.version}</div></div></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ position: "relative", width: "100%", aspectRatio: "5/4", background: "#f7f5ee", borderRadius: 10, border: "1px solid #ddd", overflow: "hidden" }}>
          <svg viewBox="0 0 500 400" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <rect x="28" y="28" width="444" height="344" fill="none" stroke="#2b4a8a" strokeWidth="2.5" />
            {[130, 230, 330, 430].map(x => <line key={x} x1={x} y1="28" x2={x} y2="372" stroke="#9bb0d6" strokeWidth="1" />)}
            {[120, 210, 300].map(y => <line key={y} x1="28" y1={y} x2="472" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
            <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="130" y="120" width="100" height="90" /><rect x="330" y="120" width="100" height="90" /></g>
            <text x="36" y="20" fill="#2b4a8a" fontSize="13" fontFamily="monospace">{dwg.name} {dwg.number}</text>
          </svg>
          <svg style={{ position: "absolute", left: px + "%", top: py + "%", width: 30, height: 30, transform: "translate(-50%,-100%)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }} viewBox="0 0 24 24"><path d="M12 23s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" fill="var(--accent)" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="10" r="3" fill="#fff" /></svg>
        </div>
        <div className="col gap-6" style={{ marginTop: 12, fontSize: "calc(12.5px * var(--field-scale))", color: "var(--ink-3)" }}>
          <div className="row gap-6"><Icon name="pin" size={14} />{task.floor} {task.area || ""} ・ {task.name}</div>
          <div className="row gap-6"><Icon name="board" size={14} />撮影要件: {task.requirement}</div>
        </div>
      </div>
    </div>
  );
}

/* 電子黒板編集（コンパクト・縦画面・手書き） */
function PhoneBoardEdit({ board, task, onBack, onNext, openDrawing }) {
  const editable = [["設計値", "design"], ["実測値", "actual"], ["施工内容", "content"], ["立会者", "witness"], ["備考", "note"]];
  const [d, setD] = useStatePh({ ...board });
  const [hw, setHw] = useStatePh({});
  const [field, setField] = useStatePh("actual");
  const curLabel = (editable.find(e => e[1] === field) || ["", ""])[0];
  const setHandwriting = (key, dataUrl) => {
    setHw(p => ({ ...p, [key]: dataUrl }));
    const RECOG = { design: "D10@200", actual: "D10@198 OK", content: "配筋完了・清掃済", witness: "佐藤 健一", note: "良好" };
    setD(p => ({ ...p, [key]: dataUrl ? (RECOG[key] || "（手書き）") : (board[key] || "") }));
  };
  return (
    <div className="col" style={{ height: "100%" }}>
      <FieldTopBar title="電子黒板編集" onBack={onBack} online={true} setOnline={() => {}} queue={0}
        right={task && task.drawingId ? <button className="btn ghost sm" onClick={openDrawing} style={{ padding: "6px 8px" }}><Icon name="map" size={17} /></button> : null} />
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 16, gap: 14, background: "var(--bg)" }}>
        <div className="center" style={{ padding: "2px 0" }}>
          <div style={{ width: 256 }}><Blackboard data={d} scale={1.05} /></div>
        </div>
        <div className="col gap-8">
          <div className="row gap-6" style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}><Icon name="edit" size={15} />黒板に手書きで記入</div>
          <select value={field} onChange={e => setField(e.target.value)} className="inp" style={{ width: "100%", padding: "14px 16px", fontSize: "calc(17px * var(--field-scale))", fontWeight: 700, borderRadius: 12 }}>
            {editable.map(([label, key]) => <option key={key} value={key}>{hw[key] ? "✓ " : ""}{label}{key === "actual" ? "（必須）" : ""}</option>)}
          </select>
        </div>
        <HandwritePad fieldKey={field} label={curLabel} value={hw[field] || ""} onChange={(url) => setHandwriting(field, url)} onText={(t) => setD(p => ({ ...p, [field]: t }))} voiceSample={({ design: "D10@200", actual: "D10@198 OK", content: "配筋完了・清掃済", witness: "佐藤 健一", note: "良好" })[field] || "（音声入力）"} />
        <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>黒板に反映（認識結果・修正可）
          <input className="inp" value={d[field] === "（手書き）" ? "" : (d[field] || "")} onChange={e => setD(p => ({ ...p, [field]: e.target.value }))} placeholder={hw[field] ? "認識中…修正できます" : "手書きすると認識結果が表示されます"} style={{ fontSize: "calc(14px * var(--field-scale))", fontFamily: field === "design" || field === "actual" ? "var(--font-mono)" : "inherit" }} />
        </label>
        <div className="card" style={{ padding: 12, background: "var(--accent-soft)", borderColor: "var(--accent-soft-2)" }}>
          <div className="row gap-6" style={{ fontSize: "calc(12px * var(--field-scale))", fontWeight: 700, color: "var(--accent-ink)" }}><Icon name="cpu" size={15} color="var(--accent-ink)" />自動入力（タスク連携）</div>
          <div className="row gap-12 wrap" style={{ marginTop: 8, fontSize: "calc(11.5px * var(--field-scale))", color: "var(--ink-2)" }}>
            <span><b>工種:</b> {d.workType}</span><span><b>施工箇所:</b> {d.location}</span><span><b>測点:</b> {d.point}</span><span><b>撮影者:</b> {d.shooter}</span>
          </div>
        </div>
      </div>
      <div className="row gap-10" style={{ padding: 14, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        {task && task.drawingId && <button className="btn lg" onClick={openDrawing}><Icon name="map" size={17} />図面</button>}
        <button className="btn primary lg" style={{ flex: 1 }} onClick={() => onNext(d)}><Icon name="camera" size={17} />この黒板で撮影する</button>
      </div>
    </div>
  );
}

/* 指摘対応（図面確認 + 手書きコメント + 対応済確認） */
function PhoneIssueResp({ issue, onBack, onDone }) {
  const M = window.MOCK;
  const dwg = M.drawings.find(d => d.id === (issue.drawingId || "DWG-201")) || M.drawings[0];
  const sev = M.SEVERITY[issue.severity] || { label: "中", color: "var(--st-pending)", soft: "var(--st-pending-soft)" };
  const [hw, setHw] = useStatePh("");
  const [comment, setComment] = useStatePh("");
  const px = issue.pinX != null ? issue.pinX : 46, py = issue.pinY != null ? issue.pinY : 50;
  return (
    <div className="col" style={{ height: "100%" }}>
      <FieldTopBar title="指摘対応" onBack={onBack} online={true} setOnline={() => {}} queue={0}
        right={<span className="chip" style={{ background: sev.soft, color: sev.color }}>{sev.label}</span>} />
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 16, gap: 14, background: "var(--bg)" }}>
        <div className="card" style={{ padding: 12, background: "var(--st-redo-soft)", borderColor: "#f3cfcf" }}>
          <div className="row gap-6" style={{ fontWeight: 700, color: "var(--st-redo)", fontSize: "calc(13px * var(--field-scale))" }}><Icon name="redo" size={16} color="var(--st-redo)" />指摘内容</div>
          <div style={{ marginTop: 6, fontSize: "calc(13.5px * var(--field-scale))", lineHeight: 1.6 }}>{issue.content}</div>
          <div className="num muted" style={{ fontSize: 11.5, marginTop: 8 }}>{issue.location} ・ 指示: {issue.reporter} ・ 期限 {issue.due}</div>
        </div>
        {/* 図面 */}
        <div className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>図面（指摘箇所）
          <div style={{ position: "relative", width: "100%", aspectRatio: "5/4", background: "#f7f5ee", borderRadius: 10, border: "1px solid #ddd", overflow: "hidden", marginTop: 4 }}>
            <svg viewBox="0 0 500 400" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <rect x="28" y="28" width="444" height="344" fill="none" stroke="#2b4a8a" strokeWidth="2.5" />
              {[130, 230, 330, 430].map(x => <line key={x} x1={x} y1="28" x2={x} y2="372" stroke="#9bb0d6" strokeWidth="1" />)}
              {[120, 210, 300].map(y => <line key={y} x1="28" y1={y} x2="472" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
              <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="130" y="120" width="100" height="90" /><rect x="330" y="120" width="100" height="90" /></g>
              <text x="36" y="20" fill="#2b4a8a" fontSize="13" fontFamily="monospace">{dwg.name} {dwg.number}</text>
            </svg>
            <svg style={{ position: "absolute", left: px + "%", top: py + "%", width: 30, height: 30, transform: "translate(-50%,-100%)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }} viewBox="0 0 24 24"><path d="M12 23s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" fill="var(--st-redo)" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="10" r="3" fill="#fff" /></svg>
          </div>
        </div>
        {/* 手書き対応コメント */}
        <HandwritePad fieldKey="resp" label="対応コメント" value={hw} onChange={(url) => { setHw(url); if (url && !comment) setComment("是正完了しました。"); }} onText={(t) => setComment(t)} voiceSample="配筋ピッチを@150に修正し、是正完了しました。" />
        <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>対応内容（認識結果・修正可）
          <input className="inp" value={comment} onChange={e => setComment(e.target.value)} placeholder="手書きすると認識結果が表示されます" style={{ fontSize: "calc(14px * var(--field-scale))" }} />
        </label>
        <div className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>是正後写真（任意）
          <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
            <button className="btn" style={{ width: 84, height: 64, flexDirection: "column", gap: 4 }}><Icon name="camera" size={20} /><span style={{ fontSize: 10 }}>撮影</span></button>
          </div>
        </div>
      </div>
      <div className="row gap-10" style={{ padding: 14, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        <button className="btn lg" style={{ flex: 1 }} onClick={onBack}>キャンセル</button>
        <button className="btn primary lg" style={{ flex: 2, background: "var(--st-approved)", borderColor: "var(--st-approved)", opacity: comment.trim() ? 1 : .5 }} disabled={!comment.trim()} onClick={() => onDone(issue)}><Icon name="check" size={18} />対応済として提出</button>
      </div>
    </div>
  );
}

/* 設定トグル */
function ProfileToggle({ label, sub, on, onToggle }) {
  return (
    <button onClick={onToggle} className="row spread" style={{ width: "100%", border: "none", background: "none", padding: "12px 12px", cursor: "pointer", textAlign: "left" }}>
      <span style={{ minWidth: 0 }}><span style={{ fontSize: "calc(13.5px * var(--field-scale))", fontWeight: 600 }}>{label}</span>{sub && <span className="muted" style={{ display: "block", fontSize: "calc(11px * var(--field-scale))", marginTop: 1 }}>{sub}</span>}</span>
      <span style={{ width: 44, height: 26, borderRadius: 999, background: on ? "var(--st-approved)" : "var(--line)", position: "relative", transition: "background .15s", flex: "none" }}><span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }}></span></span>
    </button>
  );
}

/* 個人アカウント画面（アイコン・各種設定の変更） */
function PhoneProfile({ profile, setProfile, onBack, flash }) {
  const M = window.MOCK;
  const [d, setD] = useStatePh({ ...profile });
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const COLORS = [["var(--accent-soft)", "var(--accent-ink)"], ["#ffe3d2", "#b4480f"], ["#d7f0dd", "#1c7a3e"], ["#e6ddff", "#5a3bb0"], ["#ffe1ee", "#b0285e"], ["#d6eefb", "#1c6aa8"]];
  const ROLES = (M.roles || ["現場作業者", "現場責任者", "協力会社ユーザー"]);
  const SITES = ["湾岸ロジ新築", "城南第一マンション", "中央区庁舎"];
  const save = () => { setProfile(d); flash && flash("プロフィールを更新しました"); onBack(); };
  return (
    <div className="col" style={{ height: "100%" }}>
      <FieldTopBar title="アカウント" onBack={onBack} online={true} setOnline={() => {}} queue={0} />
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 16, gap: 16, background: "var(--bg)" }}>
        {/* アイコン編集 */}
        <div className="col center" style={{ gap: 12 }}>
          <div className="center" style={{ width: 96, height: 96, borderRadius: "50%", background: d.color, color: d.textColor, fontWeight: 800, fontSize: 38, position: "relative" }}>{d.initial}
            <span className="center" style={{ position: "absolute", right: -2, bottom: -2, width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", border: "2px solid #fff" }}><Icon name="camera" size={15} color="#fff" /></span>
          </div>
          <button className="btn sm" onClick={() => flash && flash("写真ライブラリから選択（デモ）")}><Icon name="camera" size={14} />写真をアップロード</button>
          <div className="col gap-8" style={{ width: "100%" }}>
            <div className="muted" style={{ fontSize: "calc(12px * var(--field-scale))", fontWeight: 700 }}>アイコンの色</div>
            <div className="row gap-8 wrap">
              {COLORS.map(([bg, fg]) => <button key={bg} onClick={() => setD(p => ({ ...p, color: bg, textColor: fg }))} className="center" style={{ width: 40, height: 40, borderRadius: "50%", background: bg, color: fg, fontWeight: 800, border: d.color === bg ? "2.5px solid var(--accent)" : "2px solid var(--line)", cursor: "pointer" }}>{d.color === bg ? <Icon name="check" size={16} color={fg} /> : (d.initial || "A")}</button>)}
            </div>
          </div>
        </div>
        {/* プロフィール項目 */}
        <div className="card" style={{ padding: 14 }}>
          <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>表示名
            <input className="inp" value={d.name} onChange={e => f("name", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }} />
          </label>
          <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))", marginTop: 10 }}>イニシャル（アイコン文字）
            <input className="inp" maxLength={2} value={d.initial} onChange={e => f("initial", e.target.value.slice(0, 2))} style={{ fontSize: "calc(14px * var(--field-scale))", width: 96 }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>役割<select className="inp" value={d.role} onChange={e => f("role", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></label>
            <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>現場<select className="inp" value={d.site} onChange={e => f("site", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{SITES.map(s => <option key={s}>{s}</option>)}</select></label>
          </div>
          <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))", marginTop: 10 }}>会社<input className="inp" value={d.company} onChange={e => f("company", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
          <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))", marginTop: 10 }}>メール<input className="inp" type="email" value={d.email} onChange={e => f("email", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
          <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))", marginTop: 10 }}>電話<input className="inp" value={d.phone} onChange={e => f("phone", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
        </div>
        {/* 通知設定 */}
        <div className="card" style={{ padding: 4 }}>
          <ProfileToggle label="撮影タスクの通知" sub="新しいタスク・期限のお知らせ" on={d.notifyTask} onToggle={() => f("notifyTask", !d.notifyTask)} />
          <div style={{ height: 1, background: "var(--line-2)", margin: "0 12px" }}></div>
          <ProfileToggle label="指摘・差戻しの通知" sub="是正依頼が届いたとき" on={d.notifyIssue} onToggle={() => f("notifyIssue", !d.notifyIssue)} />
        </div>
        <button className="btn lg" style={{ width: "100%", borderColor: "var(--st-redo)", color: "var(--st-redo)" }} onClick={() => flash && flash("ログアウトしました（デモ）")}><Icon name="redo" size={16} color="var(--st-redo)" />ログアウト</button>
      </div>
      <div className="row gap-10" style={{ padding: 14, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        <button className="btn lg" style={{ flex: 1 }} onClick={onBack}>キャンセル</button>
        <button className="btn primary lg" style={{ flex: 2 }} onClick={save}><Icon name="check" size={17} />保存する</button>
      </div>
    </div>
  );
}

/* 黒板を作成（テンプレート様式 — 適用工種/種別/レイアウト/入力項目/プレビュー） */
function PhoneBoardCreate({ initial, onBack, onCreate }) {
  const M = window.MOCK;
  const FIELDS = ["設計値", "実測値", "施工内容", "立会者", "測点", "備考"];
  const CATEGORIES = ["鉄筋", "コンクリート", "型枠", "鉄骨", "設備", "電気", "仕上", "防水", "共通"];
  const [d, setD] = useStatePh(initial || { name: "", workType: M.WORK_TYPES[1], category: "鉄筋", layout: "general", reusable: true, active: true, fields: ["設計値", "実測値", "備考"] });
  const [err, setErr] = useStatePh(false);
  const [customFld, setCustomFld] = useStatePh("");
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const toggleField = (name) => setD(p => ({ ...p, fields: p.fields.includes(name) ? p.fields.filter(x => x !== name) : [...p.fields, name] }));
  const addCustom = () => { const v = customFld.trim(); if (!v) return; setD(p => ({ ...p, fields: p.fields.includes(v) ? p.fields : [...p.fields, v] })); setCustomFld(""); };
  const submit = () => { if (!d.name.trim()) { setErr(true); return; } onCreate({ ...d }); };
  const preview = { workType: d.workType, category: d.category, subcategory: "（テンプレート）", design: d.fields.includes("設計値") ? "—" : undefined, actual: d.fields.includes("実測値") ? "—" : undefined, point: d.fields.includes("測点") ? "—" : undefined, location: "—" };
  return (
    <div className="col" style={{ height: "100%" }}>
      <FieldTopBar title="黒板を作成" onBack={onBack} online={true} setOnline={() => {}} queue={0} />
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 16, gap: 14, background: "var(--bg)" }}>
        <div className="col center" style={{ gap: 8 }}>
          <div className="muted" style={{ fontSize: "calc(11.5px * var(--field-scale))", fontWeight: 700 }}>プレビュー</div>
          <div style={{ width: 256 }}><Blackboard data={preview} scale={1.05} variant="compact" /></div>
        </div>
        <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>テンプレート名 <span style={{ color: "var(--st-redo)" }}>＊必須</span>
          <input className="inp" value={d.name} onChange={e => f("name", e.target.value)} placeholder="例：配筋検査 標準黒板" style={{ fontSize: "calc(14px * var(--field-scale))", ...(err && !d.name.trim() ? { borderColor: "var(--st-redo)" } : {}) }} />
          {err && !d.name.trim() && <span style={{ color: "var(--st-redo)", fontSize: 11, fontWeight: 600 }}>テンプレート名を入力してください</span>}
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>適用工種<select className="inp" value={d.workType} onChange={e => f("workType", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{M.WORK_TYPES.map(w => <option key={w}>{w}</option>)}</select></label>
          <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>種別<select className="inp" value={d.category} onChange={e => f("category", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
        </div>
        <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>レイアウト<select className="inp" value={d.layout} onChange={e => f("layout", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }}><option value="general">汎用</option><option value="rebar">配筋（豆図枠あり）</option><option value="dimension">出来形（寸法）</option></select></label>
        <div className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>入力項目（黒板に表示する欄）
          <div className="row gap-8 wrap" style={{ marginTop: 6 }}>
            {[...new Set([...FIELDS, ...d.fields])].map(name => { const on = d.fields.includes(name); const custom = !FIELDS.includes(name); return (
              <button key={name} onClick={() => toggleField(name)} className="chip" style={{ cursor: "pointer", border: "1px solid " + (on ? "var(--accent)" : "var(--line)"), background: on ? "var(--accent-soft)" : "var(--surface)", color: on ? "var(--accent-ink)" : "var(--ink-3)", fontWeight: 700 }}>{on && <Icon name="check" size={12} color="var(--accent-ink)" />}{name}{custom && <span style={{ fontSize: 9, opacity: .7, marginLeft: 2 }}>自由</span>}</button>
            ); })}
          </div>
          <div className="row gap-8" style={{ marginTop: 10 }}>
            <input className="inp" value={customFld} onChange={e => setCustomFld(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="自由項目を追加（例：気温）" style={{ flex: 1, fontSize: "calc(13px * var(--field-scale))" }} />
            <button className="btn sm" onClick={addCustom}><Icon name="plus" size={14} />追加</button>
          </div>
        </div>
        <div className="row gap-16" style={{ flexWrap: "wrap" }}>
          <label className="row gap-6" style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 600, cursor: "pointer" }}><input type="checkbox" checked={d.reusable} onChange={e => f("reusable", e.target.checked)} />他現場へ転用可</label>
          <label className="row gap-6" style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 600, cursor: "pointer" }}><input type="checkbox" checked={d.active} onChange={e => f("active", e.target.checked)} />有効にする</label>
        </div>
      </div>
      <div className="row gap-10" style={{ padding: 14, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        <button className="btn lg" style={{ flex: 1 }} onClick={onBack}>キャンセル</button>
        <button className="btn primary lg" style={{ flex: 2 }} onClick={submit}><Icon name="check" size={17} />この黒板で報告する</button>
      </div>
    </div>
  );
}

/* 現場報告（黒板作成 or 原図 ＋ 音声/手書きコメント → iPad指摘へ送信） */
function PhoneReport({ profile, onBack, onDone }) {
  const M = window.MOCK;
  const [kind, setKind] = useStatePh("board");
  const [board, setBoard] = useStatePh(null);   // 作成した黒板様式
  const [building, setBuilding] = useStatePh(false);
  const [shot, setShot] = useStatePh(false);
  const [hw, setHw] = useStatePh("");
  const [comment, setComment] = useStatePh("");
  const hue = 150 + (comment.length % 6) * 14;
  const chooseKind = (k) => { setKind(k); if (k === "board" && !board) setBuilding(true); };
  const previewBoard = board ? { workType: board.workType, category: board.category, subcategory: board.name || "現場報告 黒板", design: board.fields.includes("設計値") ? "—" : undefined, actual: board.fields.includes("実測値") ? "—" : undefined, point: board.fields.includes("測点") ? "—" : undefined, location: profile.site } : null;
  const submit = () => {
    window.PhotoStore.submitReport({ kind, comment: comment.trim(), by: profile.name, company: profile.company, role: profile.role, site: profile.site, location: profile.site + " 現場", board: kind === "board" ? previewBoard : null, boardName: board ? board.name : null, hue });
    onDone("iPadの指摘へ報告を送信しました（確認待ち）");
  };
  if (building) {
    return <PhoneBoardCreate initial={board} onBack={() => { setBuilding(false); if (!board) setKind("raw"); }} onCreate={(b) => { setBoard(b); setBuilding(false); }} />;
  }
  return (
    <div className="col" style={{ height: "100%" }}>
      <FieldTopBar title="報告を作成" onBack={onBack} online={true} setOnline={() => {}} queue={0} />
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 16, gap: 14, background: "var(--bg)" }}>
        {/* 報告の種類 */}
        <div className="col gap-8">
          <div className="row gap-6" style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}><Icon name="board" size={15} />報告の種類を選択</div>
          <div className="row gap-10">
            {[["board", "黒板を作成", "board"], ["raw", "原図のまま", "camera"]].map(([k, label, ic]) => (
              <button key={k} onClick={() => chooseKind(k)} className="card" style={{ flex: 1, padding: 14, cursor: "pointer", border: kind === k ? "2px solid var(--accent)" : "2px solid var(--line)", background: kind === k ? "var(--accent-soft)" : "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <Icon name={ic} size={22} color={kind === k ? "var(--accent-ink)" : "var(--ink-3)"} />
                <span style={{ fontWeight: 700, fontSize: "calc(13px * var(--field-scale))", color: kind === k ? "var(--accent-ink)" : "var(--ink-2)" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* 作成した黒板 */}
        {kind === "board" && (
          <div className="card" style={{ padding: 12 }}>
            <div className="row spread" style={{ marginBottom: previewBoard ? 10 : 0 }}>
              <span className="row gap-6" style={{ fontSize: "calc(12.5px * var(--field-scale))", fontWeight: 700, color: "var(--ink-2)" }}><Icon name="board" size={15} color="var(--accent)" />{board ? (board.name || "現場報告 黒板") : "黒板が未作成です"}</span>
              <button className="btn sm" onClick={() => setBuilding(true)}><Icon name="edit" size={13} />{board ? "編集" : "作成"}</button>
            </div>
            {previewBoard && <div className="center"><div style={{ width: 220 }}><Blackboard data={previewBoard} scale={0.95} variant="compact" /></div></div>}
          </div>
        )}
        {/* 写真 */}
        <div className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>写真
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", boxShadow: "var(--sh-2)", marginTop: 4, background: "var(--bg-2)" }}>
            {shot ? <React.Fragment>
              <PhotoFrame hue={hue} rounded={12} style={{ position: "absolute", inset: 0 }} />
              {kind === "board" && previewBoard && <div style={{ position: "absolute", right: 10, bottom: 10, width: "42%" }}><Blackboard data={previewBoard} scale={0.6} variant="compact" /></div>}
              <button className="btn sm" onClick={() => setShot(false)} style={{ position: "absolute", top: 8, right: 8 }}><Icon name="redo" size={13} />撮り直す</button>
            </React.Fragment> : <button onClick={() => setShot(true)} className="col center" style={{ position: "absolute", inset: 0, border: "none", background: "none", cursor: "pointer", color: "var(--ink-4)", gap: 8 }}><Icon name="camera" size={34} color="var(--ink-4)" /><span style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 600 }}>タップして撮影</span></button>}
          </div>
        </div>
        {/* コメント（音声/手書き） */}
        <HandwritePad fieldKey="report" label="報告コメント" value={hw} onChange={(url) => { setHw(url); if (url && !comment) setComment("現場の状況を報告します。"); }} onText={(t) => setComment(t)} voiceSample="配筋検査、所定のピッチで施工完了。是正箇所はありません。" />
        <label className="fld" style={{ fontSize: "calc(12.5px * var(--field-scale))" }}>コメント（認識結果・修正可）
          <textarea className="inp" rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="音声入力・手書き、または直接入力できます" style={{ fontSize: "calc(14px * var(--field-scale))" }} />
        </label>
      </div>
      <div className="row gap-10" style={{ padding: 14, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        <button className="btn lg" style={{ flex: 1 }} onClick={onBack}>キャンセル</button>
        <button className="btn primary lg" style={{ flex: 2, opacity: comment.trim() ? 1 : .5 }} disabled={!comment.trim()} onClick={submit}><Icon name="send" size={17} color="#fff" />iPadへ報告を送信</button>
      </div>
    </div>
  );
}

function PhoneApp({ tweaks }) {
  const store = usePhotoStore();
  const M = window.MOCK;
  const [screen, setScreen] = useStatePh("list");
  const [task, setTask] = useStatePh(null);
  const [board, setBoard] = useStatePh(null);
  const [shot, setShot] = useStatePh(null);
  const [drawingTask, setDrawingTask] = useStatePh(null);
  const [reshoot, setReshoot] = useStatePh(null);
  const [respIssue, setRespIssue] = useStatePh(null);
  const [doneIssues, setDoneIssues] = useStatePh([]);
  const myIssues = (M.issues || []).filter(i => i.status !== "done");
  const [toast, setToast] = useStatePh(null);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2800); };
  const [profile, setProfile] = useStatePh({ name: "山本 涼", initial: "山", role: "現場作業者", site: "湾岸ロジ新築", company: "大和建設", email: "yamamoto@daiwa-const.co.jp", phone: "090-1234-5678", color: "var(--accent-soft)", textColor: "var(--accent-ink)", notifyTask: true, notifyIssue: true });

  const tasks = store.tasks;
  const me = profile.name;
  const myAtt = (store.attendance || []).find(a => a.user === me && a.status === "working");

  // 出勤ゲート：未出勤ならアカウント＋大きな出勤ボタンを表示
  if (!myAtt) {
    return (
      <div className="col" style={{ height: "100%", background: "var(--bg)", position: "relative" }}>
        <div className="col center" style={{ flex: 1, padding: "8px 28px 28px", gap: 0, textAlign: "center" }}>
          <img src="assets/buildbase-logo.png" alt="BuildBase" style={{ width: "78%", maxWidth: 290, objectFit: "contain", marginBottom: 26 }} />
          <div className="center" style={{ width: 92, height: 92, borderRadius: "50%", background: profile.color, color: profile.textColor, fontWeight: 800, fontSize: 36, marginBottom: 18 }}>{profile.initial}</div>
          <div style={{ fontWeight: 800, fontSize: "calc(22px * var(--field-scale))", whiteSpace: "nowrap" }}>{profile.name}</div>
          <div className="muted" style={{ fontSize: "calc(13px * var(--field-scale))", marginTop: 4 }}>{profile.role} ・ {profile.site}</div>
          <div className="num" style={{ fontSize: "calc(13px * var(--field-scale))", color: "var(--ink-3)", marginTop: 18 }}>2026/06/16（火）</div>
          <div className="num" style={{ fontSize: "calc(44px * var(--field-scale))", fontWeight: 800, letterSpacing: ".02em", marginTop: 2 }}>9:41</div>
          <button className="btn primary" style={{ marginTop: 30, width: "min(280px, 80%)", height: 64, fontSize: "calc(18px * var(--field-scale))", borderRadius: 16 }} onClick={() => { window.PhotoStore.clockIn(me, "現場作業者"); flash("出勤しました。今日も安全第一で。"); }}>
            <Icon name="clock" size={22} color="#fff" />出勤
          </button>
        </div>
        {toast && <div className="pop-in" style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, boxShadow: "var(--sh-3)", display: "flex", alignItems: "center", gap: 10, fontSize: "calc(12.5px * var(--field-scale))", fontWeight: 600, maxWidth: "88%", zIndex: 50 }}><Icon name="checkCircle" size={18} color="#86efac" />{toast}</div>}
      </div>
    );
  }
  const todo = tasks.filter(t => t.status === "none");
  const shotTasks = tasks.filter(t => t.status !== "none");

  const openShoot = (t) => { const b = M.blackboards.find(x => x.id === t.bbId) || M.blackboards[0]; setTask(t); setBoard({ ...b }); setScreen("boardEdit"); };

  if (screen === "iresp") {
    return <PhoneIssueResp issue={respIssue} onBack={() => setScreen("list")} onDone={(iss) => { setDoneIssues(d => [...d, iss.id]); flash("指摘への対応を提出しました（対応済）"); setScreen("list"); }} />;
  }
  if (screen === "boardEdit") {
    return <div className="col" style={{ height: "100%", position: "relative" }}>
      <PhoneBoardEdit board={board} task={task} onBack={() => setScreen("list")} onNext={(d) => { setBoard(d); setScreen("camera"); }} openDrawing={() => setDrawingTask(task)} />
      {drawingTask && <PhoneDrawingModal task={drawingTask} onClose={() => setDrawingTask(null)} />}
    </div>;
  }

  if (screen === "camera") {
    return <div className="col" style={{ height: "100%" }}>
      <CameraScreen board={board} tweaks={tweaks} online={true} onBack={() => setScreen("list")}
        onShot={(s, done) => { if (done === "done") { setScreen(s ? "preview" : screen); } else { setShot(s); setScreen("preview"); } }} />
    </div>;
  }
  if (screen === "preview") {
    return <div className="col" style={{ height: "100%" }}>
      <PreviewScreen shot={shot} online={true} onBack={() => setScreen("camera")} onRetake={() => setScreen("camera")}
        onSave={() => { window.PhotoStore.shoot(task.id, { hue: 150 + (task.id.charCodeAt(task.id.length - 1) % 6) * 16, takenAt: "2026/06/16 09:42" }); flash("iPadへ送信しました（確認待ち）"); setScreen("list"); }} />
    </div>;
  }
  if (screen === "profile") {
    return <PhoneProfile profile={profile} setProfile={setProfile} onBack={() => setScreen("list")} flash={flash} />;
  }
  if (screen === "report") {
    return <PhoneReport profile={profile} onBack={() => setScreen("list")} onDone={(m) => { flash(m); setScreen("list"); }} />;
  }

  return (
    <div className="col" style={{ height: "100%", background: "var(--bg)", position: "relative" }}>
      {/* header */}
      <div className="col" style={{ flex: "none", background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div className="row spread" style={{ padding: "12px 16px 8px" }}>
          <button onClick={() => setScreen("profile")} className="row gap-8" style={{ minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
            <div className="center" style={{ width: 34, height: 34, borderRadius: "50%", background: profile.color, color: profile.textColor, fontWeight: 800, fontSize: 14, flex: "none" }}>{profile.initial}</div>
            <div style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: "calc(15px * var(--field-scale))", lineHeight: 1.1 }}>{profile.name}</div><div className="muted" style={{ fontSize: "calc(10.5px * var(--field-scale))" }}>{profile.role} ・ {profile.site}</div></div>
          </button>
          <button className="btn ghost sm" onClick={() => setScreen("profile")} title="アカウント"><Icon name="gear" size={20} /></button>
        </div>
      </div>

      {/* task list */}
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 14, gap: 12 }}>
        <div className="row gap-6" style={{ alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: "calc(13px * var(--field-scale))" }}>ToDoリスト</span>
          <span className="num" style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "var(--accent)", borderRadius: 999, padding: "1px 7px" }}>{todo.length + myIssues.filter(i => !doneIssues.includes(i.id)).length}</span>
        </div>
        {todo.length === 0 && myIssues.filter(i => !doneIssues.includes(i.id)).length === 0 && <div className="muted" style={{ fontSize: "calc(12.5px * var(--field-scale))", padding: "4px 2px 8px" }}>本日のタスクはありません。</div>}
        {todo.map(t => {
          const b = M.blackboards.find(x => x.id === t.bbId);
          return (
            <div key={t.id} className="card fade-up" style={{ padding: 14 }}>
              <div className="row spread" style={{ alignItems: "flex-start" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "calc(14.5px * var(--field-scale))", lineHeight: 1.3 }}>{t.name}</div>
                  <div className="row gap-10 wrap" style={{ marginTop: 6, fontSize: "calc(11.5px * var(--field-scale))", color: "var(--ink-3)" }}>
                    <span className="row gap-3"><Icon name="building" size={13} />{t.workType}</span>
                    <span className="row gap-3"><Icon name="layers" size={13} />{t.floor} {t.area || ""}</span>
                    {t.pinX != null && <span className="row gap-3" style={{ color: "var(--accent-ink)" }}><Icon name="pin" size={13} color="var(--accent-ink)" />図面Pin</span>}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: "calc(11.5px * var(--field-scale))", color: "var(--ink-4)", background: "var(--bg)", borderRadius: 8, padding: "7px 10px" }}>{b && b.name} ・ {t.requirement}</div>
              <div className="row gap-8" style={{ marginTop: 12 }}>
                {t.drawingId && <button className="btn lg" onClick={() => setDrawingTask(t)}><Icon name="map" size={17} />図面</button>}
                <button className="btn primary lg" style={{ flex: 1 }} onClick={() => openShoot(t)}>
                  <Icon name="camera" size={17} />黒板を編集して撮影
                </button>
              </div>
            </div>
          );
        })}

        {/* 指摘（ToDoに統合） */}
        {myIssues.map(i => { const sev = M.SEVERITY[i.severity] || { label: "中", color: "var(--st-pending)", soft: "var(--st-pending-soft)" }; const done = doneIssues.includes(i.id); return (
          <div key={i.id} className="card fade-up" style={{ padding: 14, opacity: done ? .6 : 1 }}>
            <div className="row spread" style={{ alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="row gap-6" style={{ marginBottom: 4 }}><span className="chip" style={{ background: "var(--st-redo-soft)", color: "var(--st-redo)", fontSize: 10 }}>指摘</span><span className="chip" style={{ background: sev.soft, color: sev.color, fontSize: 10 }}>{sev.label}</span><span className="num muted" style={{ fontSize: 11 }}>{i.location}</span></div>
                <div style={{ fontWeight: 600, fontSize: "calc(13px * var(--field-scale))", lineHeight: 1.5 }}>{i.content}</div>
              </div>
              {done && <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}><Icon name="check" size={12} color="var(--st-approved)" />対応済</span>}
            </div>
            {!done && <div className="row gap-8" style={{ marginTop: 12 }}>
              <button className="btn lg" onClick={() => setDrawingTask({ drawingId: i.drawingId || "DWG-201", pinX: i.pinX, pinY: i.pinY, floor: i.location, name: i.content, requirement: "指摘箇所を確認してください" })}><Icon name="map" size={17} />図面</button>
              <button className="btn primary lg" style={{ flex: 1 }} onClick={() => { setRespIssue(i); setScreen("iresp"); }}><Icon name="edit" size={17} />対応する</button>
            </div>}
          </div>
        ); })}

        {/* 現場報告 */}
        <button className="btn primary lg" style={{ width: "100%", marginTop: 8 }} onClick={() => setScreen("report")}>
          <Icon name="send" size={17} color="#fff" />報告を作成（黒板 / 原図 ＋ コメント）
        </button>

        <div className="row gap-6" style={{ alignItems: "center", marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <span style={{ fontWeight: 800, fontSize: "calc(13px * var(--field-scale))" }}>送信済</span>
          <span className="num" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", background: "var(--bg-2)", borderRadius: 999, padding: "1px 7px" }}>{shotTasks.length}</span>
        </div>
        {shotTasks.length === 0 && <div className="muted" style={{ fontSize: "calc(12.5px * var(--field-scale))", padding: "4px 2px 8px" }}>撮影したタスクはここに移動します。</div>}
        {shotTasks.map(t => {
          const b = M.blackboards.find(x => x.id === t.bbId);
          return (
            <div key={t.id} className="card fade-up" style={{ padding: 13, opacity: t.status === "approved" ? .72 : 1 }}>
              <div className="row spread" style={{ alignItems: "flex-start" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "calc(13.5px * var(--field-scale))", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                  <div className="muted" style={{ marginTop: 4, fontSize: "calc(11px * var(--field-scale))" }}>{b && b.name} ・ {t.floor} {t.area || ""}</div>
                </div>
              </div>
              {t.status === "pending" && <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setReshoot(t)}><Icon name="redo" size={14} />撮り直して再送信</button>}
            </div>
          );
        })}

        {/* 退勤 */}
        <div style={{ marginTop: 10, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          {myAtt
            ? <button className="btn lg" style={{ width: "100%", borderColor: "var(--st-redo)", color: "var(--st-redo)" }} onClick={() => { window.PhotoStore.clockOut(me); flash("退勤しました。お疲れさまでした"); }}><Icon name="clock" size={17} color="var(--st-redo)" />退勤する</button>
            : <div className="muted center" style={{ fontSize: "calc(11.5px * var(--field-scale))", padding: "6px 0" }}>出勤すると退勤ボタンが表示されます</div>}
        </div>
      </div>

      {/* home indicator */}
      {toast && <div className="pop-in" style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, boxShadow: "var(--sh-3)", display: "flex", alignItems: "center", gap: 10, fontSize: "calc(12.5px * var(--field-scale))", fontWeight: 600, maxWidth: "88%", zIndex: 50 }}><Icon name="checkCircle" size={18} color="#86efac" />{toast}</div>}
      {drawingTask && <PhoneDrawingModal task={drawingTask} onClose={() => setDrawingTask(null)} />}
      {reshoot && (() => { const ph = store.photos.find(p => p.taskId === reshoot.id); return (
        <div onClick={() => setReshoot(null)} style={{ position: "absolute", inset: 0, background: "rgba(19,24,32,.5)", zIndex: 60, display: "grid", placeItems: "center", animation: "fadeIn .15s", padding: 18 }}>
          <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: "100%", maxWidth: 340, overflow: "hidden", boxShadow: "var(--sh-4)" }}>
            <div style={{ padding: "14px 16px 10px", fontWeight: 800, fontSize: "calc(15px * var(--field-scale))" }}>撮り直しますか？</div>
            <div style={{ padding: "0 16px", fontSize: "calc(12.5px * var(--field-scale))", color: "var(--ink-3)" }}>前回撮影した写真を置き換えて再送信します。</div>
            <div style={{ padding: 16 }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 10, overflow: "hidden", boxShadow: "var(--sh-2)" }}>
                <PhotoFrame hue={ph ? ph.hue : 152} rounded={10} style={{ position: "absolute", inset: 0 }} label="前回の写真" />
                <div style={{ position: "absolute", right: 8, bottom: 8, width: "42%" }}><Blackboard data={M.blackboards.find(b => b.id === reshoot.bbId)} scale={0.5} variant="compact" /></div>
              </div>
              <div className="num muted" style={{ fontSize: 11, marginTop: 8, textAlign: "center" }}>{reshoot.name}{ph ? " ・ " + ph.takenAt.slice(11) : ""}</div>
            </div>
            <div className="row gap-10" style={{ padding: "0 16px 16px" }}>
              <button className="btn lg" style={{ flex: 1 }} onClick={() => setReshoot(null)}>キャンセル</button>
              <button className="btn primary lg" style={{ flex: 1 }} onClick={() => { const t = reshoot; setReshoot(null); openShoot(t); }}><Icon name="camera" size={17} />撮り直す</button>
            </div>
          </div>
        </div>
      ); })()}
    </div>
  );
}

window.PhoneApp = PhoneApp;
