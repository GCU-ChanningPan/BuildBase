/* ============================================================
   iPad field — 帳票機能
   帳票選択 → 作業日報 / 検査チェックシート / 指摘登録
   Exports → window: FieldForms
   ============================================================ */
const { useState: useStateIf } = React;

// Pinの状態（未対応 / 未確認 / 確認済）
window.PIN_STATUS = {
  open:     { key: "open",     label: "未対応", color: "var(--st-redo)",     soft: "var(--st-redo-soft)" },
  checking: { key: "checking", label: "未確認", color: "var(--st-pending)",  soft: "var(--st-pending-soft)" },
  done:     { key: "done",     label: "確認済", color: "var(--st-approved)", soft: "var(--st-approved-soft)" },
};
window.PIN_WORKERS = ["山本 涼", "中村 拓也", "高橋 由紀", "佐藤 健一"];

function BigChoice({ icon, title, sub, tone, badge, onClick }) {
  return (
    <button onClick={onClick} className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", position: "relative", width: "100%" }}>
      <div className="center" style={{ width: 52, height: 52, borderRadius: 14, background: tone, flex: "none" }}><Icon name={icon} size={26} color="#fff" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "calc(16px * var(--field-scale))" }}>{title}</div>
        <div style={{ fontSize: "calc(12px * var(--field-scale))", color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
      </div>
      {badge && <span className="num" style={{ background: "var(--st-redo)", color: "#fff", borderRadius: 999, fontSize: 12, fontWeight: 800, padding: "2px 9px" }}>{badge}</span>}
      <Icon name="chevR" size={20} color="var(--ink-4)" />
    </button>
  );
}

/* 指摘ホーム */
function IssueHome({ openReport, openDetail, flash }) {
  const M = window.MOCK;
  const store = usePhotoStore();
  const pendingReports = (store.reports || []).filter(r => r.status === "pending");
  const PIN_ST = window.PIN_STATUS;
  const [fil, setFil] = useStateIf({ location: "all", site: "all", status: "all" });
  const setF = (k, v) => setFil(p => ({ ...p, [k]: v }));
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const locOpts = uniq(M.issues.map(i => i.location));
  const SITES = ["湾岸ロジ新築", "城南第一マンション", "中央区庁舎"];
  const filActive = fil.location !== "all" || fil.site !== "all" || fil.status !== "all";
  const list = M.issues.filter(i => {
    const st = i.status === "done" ? "done" : "open";
    return (fil.location === "all" || i.location === fil.location) && (fil.status === "all" || st === fil.status);
  });
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 22, gap: 18, background: "var(--bg)" }}>
      <button className="card" onClick={openReport} style={{ padding: 20, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", width: "100%" }}>
        <div className="center" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--st-redo)", flex: "none" }}><Icon name="redo" size={28} color="#fff" /></div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: "calc(17px * var(--field-scale))" }}>是正報告書を作成</div><div style={{ fontSize: "calc(12px * var(--field-scale))", color: "var(--ink-3)", marginTop: 2 }}>図面でPinを立て、指摘コメントを記入</div></div>
        <Icon name="chevR" size={20} color="var(--ink-4)" />
      </button>

      {/* 現場（iPhone）からの報告 — 確認待ち */}
      {pendingReports.length > 0 && (
        <div>
          <div className="row spread" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}>現場からの報告（確認待ち）</span>
            <span className="chip" style={{ background: "var(--st-pending-soft)", color: "var(--st-pending)" }}><span className="dot" style={{ background: "var(--st-pending)" }}></span>{pendingReports.length} 件</span>
          </div>
          <div className="col gap-10">
            {pendingReports.map(r => { const b = r.bbId ? M.blackboards.find(x => x.id === r.bbId) : null; return (
              <div key={r.id} className="card fade-up" style={{ padding: 14 }}>
                <div className="row gap-12" style={{ alignItems: "flex-start" }}>
                  <div style={{ position: "relative", width: 124, aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", flex: "none", boxShadow: "var(--sh-1)" }}>
                    <PhotoFrame hue={r.hue} rounded={0} style={{ position: "absolute", inset: 0 }} />
                    {b && <div style={{ position: "absolute", right: 4, bottom: 4, width: "50%" }}><Blackboard data={b} scale={0.42} variant="compact" /></div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row gap-6" style={{ marginBottom: 4 }}>
                      <span className="chip" style={{ background: r.kind === "board" ? "var(--accent-soft)" : "var(--bg-2)", color: r.kind === "board" ? "var(--accent-ink)" : "var(--ink-3)", fontSize: 11 }}>{r.kind === "board" ? "黒板付き" : "原図のまま"}</span>
                      <span className="mono muted" style={{ fontSize: 11 }}>{r.id}</span>
                    </div>
                    <div style={{ fontSize: "calc(13px * var(--field-scale))", lineHeight: 1.5 }}>{r.comment}</div>
                    <div className="num muted" style={{ fontSize: 11, marginTop: 6 }}>{r.by}（{r.company}） ・ {r.location} ・ {r.takenAt.slice(11)}</div>
                  </div>
                </div>
                <div className="row gap-8" style={{ marginTop: 12 }}>
                  <button className="btn danger" style={{ flex: 1 }} onClick={() => { window.PhotoStore.rejectReport(r.id); flash && flash("報告を差戻しました（iPhoneで再報告）"); }}><Icon name="redo" size={15} color="var(--st-redo)" />差戻し</button>
                  <button className="btn primary" style={{ flex: 2, background: "var(--st-approved)", borderColor: "var(--st-approved)" }} onClick={() => { window.PhotoStore.confirmReport(r.id, "田中 美咲"); flash && flash("確認しました。Web帳票管理へ反映しました"); }}><Icon name="check" size={16} />確認して帳票管理へ</button>
                </div>
              </div>
            ); })}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)", marginBottom: 10 }}>指摘履歴</div>
        <div className="row gap-10 wrap" style={{ marginBottom: 12, alignItems: "center" }}>
          <Icon name="filter" size={15} color="var(--ink-4)" />
          <label className="row gap-6" style={{ fontSize: "calc(12px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}>場所<select className="inp" style={{ width: "auto", padding: "8px 10px", fontSize: "calc(13px * var(--field-scale))" }} value={fil.location} onChange={e => setF("location", e.target.value)}><option value="all">すべて</option>{locOpts.map(l => <option key={l}>{l}</option>)}</select></label>
          <label className="row gap-6" style={{ fontSize: "calc(12px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}>現場<select className="inp" style={{ width: "auto", padding: "8px 10px", fontSize: "calc(13px * var(--field-scale))" }} value={fil.site} onChange={e => setF("site", e.target.value)}><option value="all">全現場</option>{SITES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className="row gap-6" style={{ fontSize: "calc(12px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}>状態<select className="inp" style={{ width: "auto", padding: "8px 10px", fontSize: "calc(13px * var(--field-scale))" }} value={fil.status} onChange={e => setF("status", e.target.value)}><option value="all">すべて</option><option value="open">未対応</option><option value="done">完了</option></select></label>
          {filActive && <button className="btn ghost sm" onClick={() => setFil({ location: "all", site: "all", status: "all" })}><Icon name="x" size={13} />クリア</button>}
        </div>
        <div className="col gap-10">
          {list.length === 0 && <div className="muted center" style={{ padding: 24, fontSize: "calc(13px * var(--field-scale))" }}>該当する指摘はありません。</div>}
          {list.map(i => { const done = i.status === "done"; const st = done ? PIN_ST.done : PIN_ST.open; return (
            <button key={i.id} onClick={() => openDetail(i)} className="card" style={{ padding: 14, textAlign: "left", cursor: "pointer", width: "100%" }}>
              <div className="row spread"><span className="row gap-6"><span className="chip" style={{ background: st.soft, color: st.color, fontSize: 11 }}><span className="dot" style={{ background: st.color }}></span>{st.label}</span><span className="mono muted" style={{ fontSize: 11 }}>{i.id}</span></span><span className="num muted" style={{ fontSize: 11 }}>{i.location}</span></div>
              <div style={{ fontSize: "calc(13px * var(--field-scale))", marginTop: 6, lineHeight: 1.5 }}>{i.content}</div>
              <div className="row gap-6" style={{ marginTop: 8, alignItems: "center" }}><Icon name="map" size={14} color="var(--accent)" /><span style={{ fontSize: 11.5, color: "var(--accent-ink)", fontWeight: 600 }}>図面を開いて状態・コメントを編集</span><Icon name="chevR" size={15} color="var(--ink-4)" style={{ marginLeft: "auto" }} /></div>
            </button>
          ); })}
        </div>
      </div>
    </div>
  );
}

/* 是正報告書の作成（上＝図面 / 下＝Pinごとの状態・コメント＋総コメント） */
function IssueReport({ onBack, onSubmit }) {
  const M = window.MOCK;
  const [drawingId, setDrawingId] = useStateIf(M.drawings[0].id);
  const [mode, setMode] = useStateIf("pin");
  const [pins, setPins] = useStateIf([]);
  const [strokes, setStrokes] = useStateIf([]);
  const [overall, setOverall] = useStateIf("");
  const PIN_ST = window.PIN_STATUS;
  const drawing = React.useRef(false);
  const areaRef = React.useRef(null);
  const dwg = M.drawings.find(d => d.id === drawingId) || M.drawings[0];
  const ST = [["open", "未対応"], ["checking", "未確認"], ["done", "確認済"]];
  const pt = (e) => { const r = areaRef.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: (t.clientX - r.left) / r.width * 100, y: (t.clientY - r.top) / r.height * 100 }; };
  const down = (e) => { const p = pt(e); if (mode === "pin") { setPins(ps => [...ps, { x: p.x, y: p.y, comment: "", st: "open", worker: window.PIN_WORKERS[0] }]); } else { drawing.current = true; setStrokes(s => [...s, [p]]); } };
  const move = (e) => { if (mode === "pen" && drawing.current) { const p = pt(e); setStrokes(s => { const c = s.slice(); c[c.length - 1] = [...c[c.length - 1], p]; return c; }); } };
  const up = () => { drawing.current = false; };
  const setPin = (i, k, v) => setPins(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: v } : p));
  const delPin = (i) => setPins(ps => ps.filter((_, idx) => idx !== i));
  const ready = pins.length > 0;
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title="是正報告書の作成" onBack={onBack} online={true} setOnline={() => {}} queue={0}
        right={<span className="chip" style={{ background: "var(--st-redo-soft)", color: "var(--st-redo)" }}><Icon name="pin" size={13} color="var(--st-redo)" />指摘 {pins.length}</span>} />
      {/* 上：選択した設計図 */}
      <div className="col" style={{ flex: "0 0 46%", minHeight: 0, padding: "12px 16px", gap: 8, background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <div className="row gap-8" style={{ alignItems: "center" }}>
          <select className="inp" value={drawingId} onChange={e => { setDrawingId(e.target.value); setPins([]); setStrokes([]); }} style={{ flex: 1, fontSize: "calc(13px * var(--field-scale))" }}>{M.drawings.map(d => <option key={d.id} value={d.id}>{d.name}（{d.number}）</option>)}</select>
          <button className={"btn sm" + (mode === "pin" ? " primary" : "")} onClick={() => setMode("pin")}><Icon name="pin" size={15} color={mode === "pin" ? "#fff" : undefined} />Pin</button>
          <button className={"btn sm" + (mode === "pen" ? " primary" : "")} onClick={() => setMode("pen")}><Icon name="edit" size={15} color={mode === "pen" ? "#fff" : undefined} />ペン</button>
          <button className="btn ghost sm" onClick={() => setStrokes([])} title="書込み消去"><Icon name="x" size={15} /></button>
        </div>
        <div ref={areaRef} onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onTouchStart={down} onTouchMove={move} onTouchEnd={up}
          style={{ position: "relative", flex: 1, minHeight: 0, background: "#f7f5ee", borderRadius: 10, border: "1px solid #ddd", cursor: mode === "pen" ? "crosshair" : "copy", overflow: "hidden", touchAction: "none" }}>
          <svg viewBox="0 0 600 360" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <rect x="30" y="30" width="540" height="300" fill="none" stroke="#2b4a8a" strokeWidth="2" />
            {[150, 270, 390, 510].map(x => <line key={x} x1={x} y1="30" x2={x} y2="330" stroke="#9bb0d6" strokeWidth="1" />)}
            {[120, 220].map(y => <line key={y} x1="30" y1={y} x2="570" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
            <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="150" y="120" width="120" height="100" /><rect x="390" y="120" width="120" height="100" /></g>
            <text x="38" y="22" fill="#2b4a8a" fontSize="13" fontFamily="monospace">{dwg.name} {dwg.number}</text>
          </svg>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {strokes.map((s, i) => <polyline key={i} points={s.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--st-redo)" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />)}
          </svg>
          {pins.map((p, i) => (
            <div key={i} style={{ position: "absolute", left: p.x + "%", top: p.y + "%", transform: "translate(-50%,-50%)", width: 26, height: 26, borderRadius: "50%", background: PIN_ST[p.st].color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, border: "2px solid #fff", boxShadow: "var(--sh-2)", pointerEvents: "none", fontFamily: "var(--font-en)" }}>{i + 1}</div>
          ))}
          <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.45)", padding: "3px 8px", borderRadius: 5 }}>{mode === "pin" ? "図面をタップして指摘Pinを配置" : "ドラッグして図面に書き込み"}</div>
        </div>
      </div>
      {/* 下：Pinごとの状態・コメント + 総コメント */}
      <div className="col" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16, gap: 12, background: "var(--surface)" }}>
        <div style={{ fontWeight: 700, fontSize: "calc(14px * var(--field-scale))" }}>指摘ごとの状態・コメント</div>
        {pins.length === 0 && <div className="muted" style={{ fontSize: 12.5 }}>上の図面をタップして指摘Pinを追加してください。</div>}
        {pins.map((p, i) => (
          <div key={i} className="card" style={{ padding: 12, boxShadow: "none", background: "var(--bg)" }}>
            <div className="row spread" style={{ alignItems: "center" }}>
              <span className="row gap-8" style={{ alignItems: "center" }}>
                <span className="center" style={{ width: 24, height: 24, borderRadius: "50%", background: PIN_ST[p.st].color, color: "#fff", fontWeight: 800, fontSize: 12, fontFamily: "var(--font-en)", flex: "none" }}>{i + 1}</span>
                <span style={{ fontWeight: 700, fontSize: "calc(13px * var(--field-scale))" }}>指摘 No.{i + 1}</span>
              </span>
              <div className="row gap-6" style={{ alignItems: "center" }}>
                {ST.map(([k, label]) => <button key={k} onClick={() => setPin(i, "st", k)} className="chip" style={{ cursor: "pointer", border: "1px solid " + (p.st === k ? PIN_ST[k].color : "var(--line)"), background: p.st === k ? PIN_ST[k].soft : "var(--surface)", color: p.st === k ? PIN_ST[k].color : "var(--ink-3)", fontWeight: 700 }}>{label}</button>)}
                <button className="btn ghost sm" onClick={() => delPin(i)} style={{ padding: "2px 6px" }}><Icon name="x" size={14} /></button>
              </div>
            </div>
            <textarea className="inp" rows={2} value={p.comment} onChange={e => setPin(i, "comment", e.target.value)} placeholder={`No.${i + 1} の指摘内容・是正指示`} style={{ marginTop: 10, fontSize: "calc(13px * var(--field-scale))" }} />
            <label className="row gap-8" style={{ marginTop: 8, alignItems: "center", fontSize: "calc(12px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}><Icon name="users" size={15} color="var(--ink-4)" />担当作業員
              <select className="inp" value={p.worker} onChange={e => setPin(i, "worker", e.target.value)} style={{ width: "auto", padding: "5px 8px", fontSize: "calc(13px * var(--field-scale))" }}>{window.PIN_WORKERS.map(w => <option key={w}>{w}</option>)}</select>
            </label>
            <div className="row gap-8 wrap" style={{ marginTop: 10, alignItems: "center" }}>
              {(p.photos || []).map((h, pi) => (
                <div key={pi} style={{ position: "relative" }}>
                  <PhotoFrame hue={h} style={{ width: 76, height: 58 }} rounded={6} />
                  <button onClick={() => setPin(i, "photos", (p.photos || []).filter((_, x) => x !== pi))} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "var(--ink)", color: "#fff", border: "2px solid #fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={11} color="#fff" /></button>
                </div>
              ))}
              <button className="btn" style={{ width: 76, height: 58, flexDirection: "column", gap: 3 }} onClick={() => setPin(i, "photos", [...(p.photos || []), 18 + (p.photos || []).length * 34])}><Icon name="camera" size={18} /><span style={{ fontSize: 10 }}>撮影</span></button>
            </div>
          </div>
        ))}
        <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))", marginTop: 4 }}>総コメント（全体所見）
          <textarea className="inp" rows={2} value={overall} onChange={e => setOverall(e.target.value)} placeholder="例：本日の是正指示まとめ。打設前までに全件是正のこと。" style={{ fontSize: "calc(13.5px * var(--field-scale))" }} />
        </label>
      </div>
      <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        <button className="btn lg" style={{ flex: 1 }} onClick={onBack}>キャンセル</button>
        <button className="btn primary lg" style={{ flex: 2, opacity: ready ? 1 : .5 }} disabled={!ready} onClick={() => onSubmit(`是正報告書（指摘${pins.length}件）のExcelを生成し、Web帳票管理へアップロードしました`)}><Icon name="table" size={18} />是正報告書を作成（Excel）</button>
      </div>
    </div>
  );
}

/* 作業日報入力 */
function DailyReport({ onBack, onSubmit }) {
  const M = window.MOCK;
  const [d, setD] = useStateIf({ work: "2F 東エリア 大梁・柱 配筋", hours: "08:00 - 17:00", crew: "鉄筋工 6名", weather: "晴れ", temp: "24", safety: "", tomorrow: "", note: "" });
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const W = ["晴れ", "曇り", "雨", "雪"];
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title="作業日報" onBack={onBack} online={true} setOnline={() => {}} queue={0} />
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 20, gap: 16, background: "var(--bg)" }}>
        <div className="card" style={{ padding: 14, background: "var(--accent-soft)", borderColor: "var(--accent-soft-2)" }}>
          <div className="row gap-6" style={{ fontSize: "calc(12px * var(--field-scale))", fontWeight: 700, color: "var(--accent-ink)" }}><Icon name="cpu" size={15} color="var(--accent-ink)" />自動入力</div>
          <div className="row gap-16 wrap" style={{ marginTop: 8, fontSize: "calc(12.5px * var(--field-scale))" }}>
            <span><b>工事:</b> 湾岸ロジ新築</span><span><b>日付:</b> 2026/06/09</span><span><b>担当:</b> 山本 涼</span>
          </div>
        </div>
        <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>作業内容<textarea className="inp" rows={2} value={d.work} onChange={e => f("work", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>作業時間<input className="inp" value={d.hours} onChange={e => f("hours", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
          <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>作業人員<input className="inp" value={d.crew} onChange={e => f("crew", e.target.value)} style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
        </div>
        <div className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>天候
          <div className="row gap-8" style={{ marginTop: 4 }}>{W.map(w => <button key={w} className={"btn" + (d.weather === w ? " primary" : "")} onClick={() => f("weather", w)} style={{ flex: 1 }}>{w}</button>)}</div>
        </div>
        <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>安全事項<input className="inp" value={d.safety} onChange={e => f("safety", e.target.value)} placeholder="KY実施・開口部養生 など" style={{ fontSize: "calc(14px * var(--field-scale))" }} /></label>
        <div className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>写真
          <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
            <PhotoFrame hue={150} style={{ width: 88, height: 66 }} /><PhotoFrame hue={170} style={{ width: 88, height: 66 }} />
            <button className="btn" style={{ width: 88, height: 66, flexDirection: "column", gap: 4 }}><Icon name="camera" size={20} /><span style={{ fontSize: 10 }}>撮影</span></button>
          </div>
        </div>
      </div>
      <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        <button className="btn lg" style={{ flex: 1 }} onClick={onBack}>下書き保存</button>
        <button className="btn primary lg" style={{ flex: 2 }} onClick={() => onSubmit("作業日報を提出しました")}><Icon name="upload" size={18} />提出する</button>
      </div>
    </div>
  );
}

/* 検査チェックシート */
function InspectionSheet({ onBack, onSubmit }) {
  const M = window.MOCK;
  const [items, setItems] = useStateIf(M.inspectionItems.map(i => ({ ...i })));
  const set = (idx, res) => setItems(it => it.map((x, i) => i === idx ? { ...x, result: res } : x));
  const RES = [["ok", "OK", "var(--st-approved)"], ["ng", "NG", "var(--st-redo)"], ["unset", "未", "var(--ink-4)"]];
  const ngCount = items.filter(i => i.result === "ng").length;
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title="鉄筋検査チェックシート" onBack={onBack} online={true} setOnline={() => {}} queue={0}
        right={ngCount > 0 ? <span className="chip" style={{ background: "var(--st-redo-soft)", color: "var(--st-redo)" }}>NG {ngCount}</span> : null} />
      <div className="col" style={{ flex: 1, overflow: "auto", padding: 18, gap: 10, background: "var(--bg)" }}>
        <div style={{ fontSize: "calc(12.5px * var(--field-scale))", color: "var(--ink-3)" }}>2F 東 大梁 G2 ・ 山本 涼 ・ 2026/06/09</div>
        {items.map((it, idx) => (
          <div key={idx} className="card" style={{ padding: 14 }}>
            <div className="row spread gap-10">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "calc(14px * var(--field-scale))" }}>{it.name}</div>
                <div className="mono" style={{ fontSize: "calc(12px * var(--field-scale))", color: "var(--ink-3)", marginTop: 2 }}>規格: {it.spec}</div>
              </div>
              <div className="row gap-6" style={{ flex: "none" }}>
                {RES.map(([k, lbl, col]) => (
                  <button key={k} onClick={() => set(idx, k)} style={{ minWidth: 52, padding: "10px 6px", borderRadius: 10, border: "2px solid " + (it.result === k ? col : "var(--line)"), background: it.result === k ? col : "var(--surface)", color: it.result === k ? "#fff" : "var(--ink-3)", fontWeight: 800, fontSize: "calc(14px * var(--field-scale))", cursor: "pointer" }}>{lbl}</button>
                ))}
              </div>
            </div>
            {it.result === "ng" && <div className="row gap-8" style={{ marginTop: 10 }}>
              <input className="inp" placeholder="NG内容・指摘メモ" style={{ fontSize: "calc(13px * var(--field-scale))" }} />
              <button className="btn"><Icon name="camera" size={16} /></button>
            </div>}
          </div>
        ))}
      </div>
      <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        <button className="btn lg" style={{ flex: 1 }} onClick={onBack}>下書き保存</button>
        <button className="btn primary lg" style={{ flex: 2 }} onClick={() => onSubmit("検査チェックシートを提出しました")}><Icon name="upload" size={18} />提出する</button>
      </div>
    </div>
  );
}

/* 指摘・是正（現場：是正対応） */
function FieldIssues({ onBack, onSubmit }) {
  const M = window.MOCK;
  const mine = M.issues.filter(i => i.assignee === "中村 拓也" || i.status === "doing" || i.status === "open");
  const [sel, setSel] = useStateIf(mine[0]);
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title="指摘・是正対応" onBack={onBack} online={true} setOnline={() => {}} queue={0}
        right={<span className="chip" style={{ background: "var(--st-redo-soft)", color: "var(--st-redo)" }}>{mine.length} 件</span>} />
      <div className="row" style={{ flex: 1, minHeight: 0 }}>
        <div className="col" style={{ width: 260, borderRight: "1px solid var(--line)", overflow: "auto", background: "var(--surface)" }}>
          {mine.map(i => { const sev = M.SEVERITY[i.severity]; return (
            <button key={i.id} onClick={() => setSel(i)} style={{ display: "block", padding: 13, border: "none", borderBottom: "1px solid var(--line-2)", background: sel && sel.id === i.id ? "var(--accent-soft)" : "transparent", textAlign: "left", cursor: "pointer", width: "100%" }}>
              <div className="row gap-6"><span className="chip" style={{ background: sev.soft, color: sev.color, fontSize: 10 }}>{sev.label}</span><Pill def={M.ISSUE_STATUS[i.status]} /></div>
              <div style={{ fontWeight: 600, fontSize: "calc(12.5px * var(--field-scale))", marginTop: 6, lineHeight: 1.4 }}>{i.location}</div>
            </button>
          ); })}
        </div>
        {sel && <div className="col" style={{ flex: 1, overflow: "auto", padding: 18, gap: 14 }}>
          <div className="card" style={{ padding: 14, background: "var(--st-redo-soft)", borderColor: "#f3cfcf" }}>
            <div className="row gap-6" style={{ fontWeight: 700, color: "var(--st-redo)", fontSize: "calc(13px * var(--field-scale))" }}><Icon name="redo" size={16} color="var(--st-redo)" />指摘内容</div>
            <div style={{ marginTop: 6, fontSize: "calc(13.5px * var(--field-scale))", lineHeight: 1.6 }}>{sel.content}</div>
            <div className="num muted" style={{ fontSize: 11.5, marginTop: 8 }}>指示: {sel.reporter} ・ 期限 {sel.due}</div>
          </div>
          <div className="row gap-12">
            <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>是正前</div><PhotoFrame hue={sel.hueBefore} style={{ width: "100%", aspectRatio: "4/3" }} rounded={8} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>是正後（撮影）</div>
              <button className="btn center" style={{ width: "100%", aspectRatio: "4/3", flexDirection: "column", gap: 6, borderStyle: "dashed" }}><Icon name="camera" size={26} /><span style={{ fontSize: 12 }}>是正後を撮影</span></button>
            </div>
          </div>
          <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>是正コメント<textarea className="inp" rows={2} placeholder="是正内容を入力" style={{ fontSize: "calc(13.5px * var(--field-scale))" }} /></label>
          <button className="btn primary lg" onClick={() => onSubmit("是正報告を提出しました（確認待ち）")}><Icon name="upload" size={18} />是正完了を報告</button>
        </div>}
      </div>
    </div>
  );
}

/* 指摘履歴の詳細（図面を開いてPinの状態切替＋コメント） */
function IssueDetail({ issue, onBack, onSubmit }) {
  const M = window.MOCK;
  const PIN_ST = window.PIN_STATUS;
  const dwg = M.drawings.find(d => d.id === issue.drawingId) || M.drawings[0];
  // 指摘から表示用Pinを生成（座標・状態・コメント）
  const seed = issue.id.charCodeAt(issue.id.length - 1);
  const initPins = [
    { x: 30 + (seed % 5) * 6, y: 38, st: issue.status === "done" ? "done" : "open", comment: issue.content, worker: issue.assignee || window.PIN_WORKERS[0] },
    ...(issue.comments && issue.comments.length > 1 ? [{ x: 62, y: 56, st: "done", comment: issue.comments[issue.comments.length - 1].text, worker: issue.assignee || window.PIN_WORKERS[0] }] : []),
  ];
  const [pins, setPins] = useStateIf(initPins);
  const [sel, setSel] = useStateIf(0);
  const [overall, setOverall] = useStateIf("");
  const setPin = (i, k, v) => setPins(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: v } : p));
  const ST = [["open", "未対応"], ["checking", "未確認"], ["done", "確認済"]];
  const cur = pins[sel];
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title={"指摘 " + issue.id} onBack={onBack} online={true} setOnline={() => {}} queue={0}
        right={<span className="chip" style={{ background: "var(--st-redo-soft)", color: "var(--st-redo)" }}><Icon name="pin" size={13} color="var(--st-redo)" />{pins.length}</span>} />
      {/* 上：図面 + Pin（タップで選択） */}
      <div className="col" style={{ flex: "0 0 46%", minHeight: 0, padding: "12px 16px", gap: 8, background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <div className="row gap-8" style={{ alignItems: "center", fontSize: "calc(13px * var(--field-scale))" }}>
          <Icon name="map" size={16} color="var(--accent)" /><b>{dwg.name}（{dwg.number}）</b>
          <span className="muted" style={{ marginLeft: "auto", fontSize: 11.5 }}>{issue.location}</span>
        </div>
        <div style={{ position: "relative", flex: 1, minHeight: 0, background: "#f7f5ee", borderRadius: 10, border: "1px solid #ddd", overflow: "hidden" }}>
          <svg viewBox="0 0 600 360" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <rect x="30" y="30" width="540" height="300" fill="none" stroke="#2b4a8a" strokeWidth="2" />
            {[150, 270, 390, 510].map(x => <line key={x} x1={x} y1="30" x2={x} y2="330" stroke="#9bb0d6" strokeWidth="1" />)}
            {[120, 220].map(y => <line key={y} x1="30" y1={y} x2="570" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
            <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="150" y="120" width="120" height="100" /><rect x="390" y="120" width="120" height="100" /></g>
            <text x="38" y="22" fill="#2b4a8a" fontSize="13" fontFamily="monospace">{dwg.name} {dwg.number}</text>
          </svg>
          {pins.map((p, i) => (
            <button key={i} onClick={() => setSel(i)} style={{ position: "absolute", left: p.x + "%", top: p.y + "%", transform: "translate(-50%,-50%)", width: sel === i ? 32 : 26, height: sel === i ? 32 : 26, borderRadius: "50%", background: PIN_ST[p.st].color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, border: sel === i ? "3px solid var(--accent)" : "2px solid #fff", boxShadow: "var(--sh-2)", cursor: "pointer", fontFamily: "var(--font-en)" }}>{i + 1}</button>
          ))}
          <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.45)", padding: "3px 8px", borderRadius: 5 }}>Pinをタップして状態・コメントを編集</div>
        </div>
      </div>
      {/* 下：選択Pinの状態切替＋コメント、総コメント */}
      <div className="col" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16, gap: 12, background: "var(--surface)" }}>
        {cur && (
          <div className="card" style={{ padding: 14, boxShadow: "none", background: "var(--bg)" }}>
            <div className="row spread" style={{ alignItems: "center" }}>
              <span className="row gap-8" style={{ alignItems: "center" }}>
                <span className="center" style={{ width: 26, height: 26, borderRadius: "50%", background: PIN_ST[cur.st].color, color: "#fff", fontWeight: 800, fontSize: 12, fontFamily: "var(--font-en)", flex: "none" }}>{sel + 1}</span>
                <span style={{ fontWeight: 700, fontSize: "calc(14px * var(--field-scale))" }}>指摘 No.{sel + 1} の状態</span>
              </span>
              <div className="row gap-6">
                {ST.map(([k, label]) => <button key={k} onClick={() => setPin(sel, "st", k)} className="chip" style={{ cursor: "pointer", border: "1px solid " + (cur.st === k ? PIN_ST[k].color : "var(--line)"), background: cur.st === k ? PIN_ST[k].soft : "var(--surface)", color: cur.st === k ? PIN_ST[k].color : "var(--ink-3)", fontWeight: 700 }}>{label}</button>)}
              </div>
            </div>
            <textarea className="inp" rows={3} value={cur.comment} onChange={e => setPin(sel, "comment", e.target.value)} placeholder={`No.${sel + 1} のコメント`} style={{ marginTop: 10, fontSize: "calc(13.5px * var(--field-scale))" }} />
            <label className="row gap-8" style={{ marginTop: 8, alignItems: "center", fontSize: "calc(12px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}><Icon name="users" size={15} color="var(--ink-4)" />担当作業員
              <select className="inp" value={cur.worker} onChange={e => setPin(sel, "worker", e.target.value)} style={{ width: "auto", padding: "5px 8px", fontSize: "calc(13px * var(--field-scale))" }}>{window.PIN_WORKERS.map(w => <option key={w}>{w}</option>)}</select>
            </label>
            <div className="row gap-8 wrap" style={{ marginTop: 10, alignItems: "center" }}>
              {(cur.photos || []).map((h, pi) => (
                <div key={pi} style={{ position: "relative" }}>
                  <PhotoFrame hue={h} style={{ width: 76, height: 58 }} rounded={6} />
                  <button onClick={() => setPin(sel, "photos", (cur.photos || []).filter((_, x) => x !== pi))} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "var(--ink)", color: "#fff", border: "2px solid #fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={11} color="#fff" /></button>
                </div>
              ))}
              <button className="btn" style={{ width: 76, height: 58, flexDirection: "column", gap: 3 }} onClick={() => setPin(sel, "photos", [...(cur.photos || []), 18 + (cur.photos || []).length * 34])}><Icon name="camera" size={18} /><span style={{ fontSize: 10 }}>撮影</span></button>
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: "calc(12.5px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>指摘一覧（タップで図面のPinを選択）</div>
          <div className="col gap-6">
            {pins.map((p, i) => (
              <button key={i} onClick={() => setSel(i)} className="card" style={{ padding: "9px 12px", boxShadow: "none", background: sel === i ? "var(--accent-soft)" : "var(--bg)", textAlign: "left", cursor: "pointer", width: "100%" }}>
                <div className="row gap-8" style={{ alignItems: "center" }}>
                  <span className="center" style={{ width: 22, height: 22, borderRadius: "50%", background: PIN_ST[p.st].color, color: "#fff", fontWeight: 800, fontSize: 11, fontFamily: "var(--font-en)", flex: "none" }}>{i + 1}</span>
                  <span className="chip" style={{ background: PIN_ST[p.st].soft, color: PIN_ST[p.st].color, fontSize: 10 }}>{PIN_ST[p.st].label}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-2)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", flex: 1 }}>{p.comment || "（コメントなし）"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <label className="fld" style={{ fontSize: "calc(13px * var(--field-scale))" }}>総コメント（全体所見）
          <textarea className="inp" rows={2} value={overall} onChange={e => setOverall(e.target.value)} placeholder="例：是正状況の所見を記入" style={{ fontSize: "calc(13.5px * var(--field-scale))" }} />
        </label>
      </div>
      <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
        <button className="btn lg" style={{ flex: 1 }} onClick={onBack}>戻る</button>
        <button className="btn primary lg" style={{ flex: 2 }} onClick={() => onSubmit("指摘の状態・コメントを更新しました")}><Icon name="check" size={18} />更新を保存</button>
      </div>
    </div>
  );
}

window.FieldForms = { IssueHome, IssueReport, IssueDetail, DailyReport, InspectionSheet, FieldIssues };
