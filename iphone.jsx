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

  const tasks = store.tasks;
  const me = "山本 涼";
  const myAtt = (store.attendance || []).find(a => a.user === me && a.status === "working");

  // 出勤ゲート：未出勤ならアカウント＋大きな出勤ボタンを表示
  if (!myAtt) {
    return (
      <div className="col" style={{ height: "100%", background: "var(--bg)", position: "relative" }}>
        <div className="col center" style={{ flex: 1, padding: "8px 28px 28px", gap: 0, textAlign: "center" }}>
          <img src="assets/buildbase-logo.png" alt="BuildBase" style={{ width: "78%", maxWidth: 290, objectFit: "contain", marginBottom: 26 }} />
          <div className="center" style={{ width: 92, height: 92, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 800, fontSize: 36, marginBottom: 18 }}>山</div>
          <div style={{ fontWeight: 800, fontSize: "calc(22px * var(--field-scale))", whiteSpace: "nowrap" }}>山本 涼</div>
          <div className="muted" style={{ fontSize: "calc(13px * var(--field-scale))", marginTop: 4 }}>現場作業者 ・ 湾岸ロジ新築</div>
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

  return (
    <div className="col" style={{ height: "100%", background: "var(--bg)", position: "relative" }}>
      {/* header */}
      <div className="col" style={{ flex: "none", background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div className="row spread" style={{ padding: "12px 16px 8px" }}>
          <div className="row gap-8" style={{ minWidth: 0 }}>
            <div className="center" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 800, fontSize: 14, flex: "none" }}>山</div>
            <div style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: "calc(15px * var(--field-scale))", lineHeight: 1.1 }}>山本 涼</div><div className="muted" style={{ fontSize: "calc(10.5px * var(--field-scale))" }}>現場作業者 ・ 湾岸ロジ新築</div></div>
          </div>
          {myAtt
            ? <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}><span className="dot" style={{ background: "var(--st-approved)" }}></span>出勤中 {myAtt.clockIn}</span>
            : <button className="btn primary sm" onClick={() => { window.PhotoStore.clockIn(me, "現場作業者"); flash("出勤を記録しました"); }}><Icon name="clock" size={15} color="#fff" />出勤</button>}
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
