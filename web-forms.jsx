/* ============================================================
   Web admin — 帳票テンプレート管理 + 帳票確認・承認
   Exports → window: FormTemplates, FormSubmissions
   ============================================================ */
const { useState: useStateFm } = React;

/* ---------- 帳票テンプレート管理 ---------- */
function CreateFormTplModal({ onClose, onCreate, initial }) {
  const M = window.MOCK;
  const TYPES = ["写真台帳", "是正報告書"];
  const [d, setD] = useStateFm(initial || { name: "", type: TYPES[0], scope: "全工事共通", fieldsText: "", active: true });
  const [err, setErr] = useStateFm(false);
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const iconFor = { "作業日報": "log", "検査チェックシート": "list", "是正報告書": "redo", "安全巡視表": "shield", "写真台帳": "grid" };
  const submit = () => {
    if (!d.name.trim()) { setErr(true); return; }
    const list = (d.fieldsText || "").split(/[\n、,]/).map(s => s.trim()).filter(Boolean);
    onCreate({ id: initial ? initial.id : "FT-" + Math.floor(10 + Math.random() * 90), name: d.name, type: d.type, icon: iconFor[d.type] || "file", fields: list.length || (initial ? initial.fields : 5), fieldList: list.length ? list : (initial ? initial.fieldList : []), active: d.active, scope: d.scope, by: "田中 美咲", uses: initial ? initial.uses : 0 });
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.4)", zIndex: 50, display: "grid", placeItems: "center", animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 560, maxWidth: "94vw", maxHeight: "90vh", overflow: "auto", boxShadow: "var(--sh-4)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="row gap-8"><Icon name="file" size={18} color="var(--accent)" /><span style={{ fontWeight: 800, fontSize: 16 }}>{initial ? "帳票テンプレート編集" : "新規帳票テンプレート作成"}</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="col gap-14" style={{ padding: 20 }}>
          <label className="fld">テンプレート名 <span style={{ color: "var(--st-redo)" }}>＊必須</span>
            <input className="inp" value={d.name} onChange={e => f("name", e.target.value)} placeholder="例：鉄筋検査チェックシート" style={err && !d.name.trim() ? { borderColor: "var(--st-redo)" } : {}} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="fld">帳票種類<select className="inp" value={d.type} onChange={e => f("type", e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
            <label className="fld">適用範囲<input className="inp" value={d.scope} onChange={e => f("scope", e.target.value)} /></label>
          </div>
          <label className="fld">入力項目（改行・読点区切り）
            <textarea className="inp" rows={4} value={d.fieldsText} onChange={e => f("fieldsText", e.target.value)} placeholder={"主筋 径・本数\n帯筋 ピッチ\nかぶり厚 …"} />
          </label>
          <label className="row gap-6" style={{ fontSize: 13, fontWeight: 600, cursor: "pointer" }}><input type="checkbox" checked={d.active} onChange={e => f("active", e.target.checked)} />有効にする</label>
        </div>
        <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
          <button className="btn" onClick={onClose} style={{ marginLeft: "auto" }}>キャンセル</button>
          <button className="btn primary" onClick={submit}><Icon name={initial ? "check" : "plus"} size={15} />{initial ? "更新する" : "作成"}</button>
        </div>
      </div>
    </div>
  );
}

function FormTemplates({ pushToast }) {
  const M = window.MOCK;
  const [tpls, setTpls] = useStateFm(M.formTemplates.filter(t => ["写真台帳", "是正報告書"].includes(t.type)).map(t => ({ ...t })));
  const [creating, setCreating] = useStateFm(false);
  const [editing, setEditing] = useStateFm(null);
  const [newId, setNewId] = useStateFm(null);
  const flash = (id) => { setNewId(id); setTimeout(() => setNewId(null), 2400); };
  const create = (t) => { setTpls(ts => [t, ...ts]); setCreating(false); flash(t.id); };
  const save = (t) => { setTpls(ts => ts.map(x => x.id === t.id ? t : x)); setEditing(null); flash(t.id); };
  const dup = (t) => { const c = { ...t, id: "FT-" + Math.floor(10 + Math.random() * 90), name: t.name + "（コピー）", uses: 0 }; setTpls(ts => [c, ...ts]); flash(c.id); };
  const toggle = (t) => setTpls(ts => ts.map(x => x.id === t.id ? { ...x, active: !x.active } : x));
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)" }}>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>帳票テンプレート管理</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>黒板台帳（写真台帳）と指摘帳票（是正報告書）のテンプレートを管理します。</div></div>
        <button className="btn primary" onClick={() => pushToast && pushToast("CSVをインポートしました。", "approved")}><Icon name="upload" size={15} />CSVインポート</button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data">
          <thead><tr><th>帳票名</th><th>適用範囲</th><th>使用回数</th><th>状態</th><th>操作</th></tr></thead>
          <tbody>{tpls.map(t => (
            <tr key={t.id} style={newId === t.id ? { background: "var(--st-approved-soft)" } : {}}>
              <td style={{ fontWeight: 600 }}><span className="row gap-8"><Icon name={t.icon} size={16} color="var(--accent)" />{t.name}{newId === t.id && <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)", fontSize: 10 }}>新規</span>}</span></td>
              <td className="muted">{t.scope}</td><td className="num muted">{t.uses}</td>
              <td>{t.active ? <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}>有効</span> : <span className="chip" style={{ background: "var(--st-none-soft)", color: "var(--ink-3)" }}>停止中</span>}</td>
              <td><div className="row gap-4">
                <button className="btn ghost sm" title={t.active ? "停止" : "有効化"} onClick={() => toggle(t)}><Icon name={t.active ? "eye" : "checkCircle"} size={15} /></button>
                <button className="btn ghost sm" title="複製" onClick={() => dup(t)}><Icon name="layers" size={15} /></button>
                <button className="btn ghost sm" title="編集" onClick={() => setEditing({ ...t, fieldsText: (t.fieldList || []).join("\n") })}><Icon name="edit" size={15} /></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {creating && <CreateFormTplModal onClose={() => setCreating(false)} onCreate={create} />}
      {editing && <CreateFormTplModal initial={editing} onClose={() => setEditing(null)} onCreate={save} />}
    </div>
  );
}

/* ---------- 帳票確認・承認 ---------- */
function fieldValues(sub) {
  const M = window.MOCK;
  if (sub.type === "作業日報") return [["作業内容", "2F 東エリア 大梁・柱 配筋"], ["作業時間", "08:00 - 17:00"], ["作業人員", "鉄筋工 6名"], ["使用機械", "—"], ["天候", "晴れ"], ["気温", "24℃"], ["安全事項", "開口部養生・KY実施"], ["翌日予定", "2F 西エリア 配筋"], ["備考", "—"]];
  if (sub.type === "検査チェックシート") return M.inspectionItems.map(i => [i.name, i.spec + "（" + (i.result === "ok" ? "OK" : i.result === "ng" ? "NG" : "未確認") + "）", i.result]);
  if (sub.type === "是正報告書") return [["指摘内容", "開口補強筋 未設置"], ["発生場所", sub.location], ["原因", "施工手順の確認漏れ"], ["是正内容", "D16 補強筋 4本を設置"], ["再発防止策", "打設前チェックリストに追加"]];
  if (sub.type === "安全巡視表") return [["保護具着用", "OK"], ["開口部養生", "一部NG"], ["電気設備", "OK"], ["整理整頓", "OK"], ["重機作業", "OK"], ["特記事項", "東側手すり養生を是正指示"]];
  return [["工種", "配筋検査"], ["施工箇所", sub.location], ["写真区分", "施工中"], ["コメント", "—"]];
}

function SubmissionDrawer({ sub, onClose, onOutput }) {
  const M = window.MOCK;
  const PINST = window.PIN_STATUS || { open: { label: "未対応", color: "var(--st-redo)", soft: "var(--st-redo-soft)" }, checking: { label: "未確認", color: "var(--st-pending)", soft: "var(--st-pending-soft)" }, done: { label: "確認済", color: "var(--st-approved)", soft: "var(--st-approved-soft)" } };
  const dwg = sub.drawingId ? M.drawings.find(d => d.id === sub.drawingId) : null;
  const isLedger = sub.type === "工事写真台帳";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.5)", zIndex: 40, display: "grid", placeItems: "center", animation: "fadeIn .15s", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} className="pop-in" style={{ width: isLedger ? 760 : 1080, maxWidth: "96vw", maxHeight: "92vh", display: "flex", flexDirection: "column", background: "var(--surface)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--sh-4)" }}>
        {/* header */}
        <div className="row spread" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", flex: "none" }}>
          <div className="row gap-10">
            <span className="center" style={{ width: 30, height: 30, borderRadius: 7, background: "#217346", flex: "none" }}><Icon name="table" size={17} color="#fff" /></span>
            <div><div style={{ fontWeight: 800, fontSize: 15.5 }}>{sub.title}</div><div className="muted" style={{ fontSize: 11.5 }}>{sub.type} ・ {sub.location} ・ {sub.date} ・ {sub.author}</div></div>
          </div>
          <div className="row gap-8">
            <button className="btn sm" onClick={() => onOutput(sub, "Excel")}><Icon name="table" size={14} />Excel出力</button>
            <button className="btn sm" onClick={() => onOutput(sub, "PDF")}><Icon name="file" size={14} />PDF出力</button>
            <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
        </div>
        {/* excel-like body */}
        <div style={{ flex: 1, overflow: "auto", background: "#eef1f4", padding: 18 }}>
          <div style={{ background: "#fff", border: "1px solid #cbd2da", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
            {/* ledger title bar */}
            <div style={{ borderBottom: "1px solid #cbd2da", padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, background: "#f7f9fb" }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{isLedger ? (sub.ledgerType || "工事写真台帳") : (sub.type === "現場報告" ? "現場報告書" : "是正報告書")}</span>
              <span className="muted" style={{ fontSize: 11.5 }}>{M.project.name}</span>
              <span className="muted" style={{ fontSize: 11.5, marginLeft: "auto" }}>{sub.id}</span>
            </div>

            {isLedger ? (
              /* ====== 工事写真台帳：1行1写真（左=写真 / 右=コメント） ====== */
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "44px 300px 1fr", background: "#f0f3f6", borderBottom: "1px solid #cbd2da", fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>
                  <div style={{ padding: "8px 10px", borderRight: "1px solid #cbd2da" }}>No.</div>
                  <div style={{ padding: "8px 10px", borderRight: "1px solid #cbd2da" }}>写真</div>
                  <div style={{ padding: "8px 10px" }}>記事（コメント）</div>
                </div>
                {(sub.rows || []).map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 300px 1fr", borderBottom: "1px solid #e2e7ec", alignItems: "stretch" }}>
                    <div className="num" style={{ padding: "10px", borderRight: "1px solid #e2e7ec", fontWeight: 700, color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                    <div style={{ padding: 10, borderRight: "1px solid #e2e7ec" }}>
                      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 4, overflow: "hidden", boxShadow: "var(--sh-1)" }}>
                        <PhotoFrame hue={r.hue} rounded={4} style={{ position: "absolute", inset: 0 }} />
                        <div style={{ position: "absolute", right: 5, bottom: 5, width: "46%" }}><Blackboard data={{ workType: "配筋検査", subcategory: "—", design: "—", actual: "—", point: "No." + (i + 1), location: sub.location }} scale={0.4} variant="compact" /></div>
                      </div>
                    </div>
                    <div style={{ padding: "12px 14px", fontSize: 13, lineHeight: 1.6, display: "flex", alignItems: "center" }}>{r.comment}</div>
                  </div>
                ))}
              </div>
            ) : (
              /* ====== 是正報告書：左=設計図(番号Pin) / 右=Pin番号ごとにコメント＋写真 ====== */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ borderRight: "1px solid #cbd2da", padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>設計図 ・ {dwg ? `${dwg.name}（${dwg.number}）` : "—"}</div>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "5/4", background: "#f7f5ee", border: "1px solid #ddd", borderRadius: 6, overflow: "hidden" }}>
                    <svg viewBox="0 0 600 480" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                      <rect x="30" y="30" width="540" height="420" fill="none" stroke="#2b4a8a" strokeWidth="2" />
                      {[150, 270, 390, 510].map(x => <line key={x} x1={x} y1="30" x2={x} y2="450" stroke="#9bb0d6" strokeWidth="1" />)}
                      {[140, 250, 360].map(y => <line key={y} x1="30" y1={y} x2="570" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
                      <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="150" y="140" width="120" height="110" /><rect x="390" y="140" width="120" height="110" /></g>
                      <text x="40" y="22" fill="#2b4a8a" fontSize="13" fontFamily="monospace">{dwg ? `${dwg.name} ${dwg.number}` : ""}</text>
                    </svg>
                    {(sub.pins || []).map((p, i) => (
                      <div key={i} style={{ position: "absolute", left: p.x + "%", top: p.y + "%", transform: "translate(-50%,-50%)", width: 28, height: 28, borderRadius: "50%", background: PINST[p.st].color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, border: "2px solid #fff", boxShadow: "var(--sh-2)", fontFamily: "var(--font-en)" }}>{i + 1}</div>
                    ))}
                  </div>
                  {sub.overall && <div style={{ marginTop: 12, fontSize: 12.5 }}><b style={{ color: "var(--ink-3)" }}>総コメント：</b>{sub.overall}</div>}
                </div>
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", background: "#f0f3f6", borderBottom: "1px solid #cbd2da", fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>
                    <div style={{ padding: "8px 8px", borderRight: "1px solid #cbd2da" }}>No.</div>
                    <div style={{ padding: "8px 10px" }}>指摘コメント / 写真</div>
                  </div>
                  {(sub.pins || []).map((p, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", borderBottom: "1px solid #e2e7ec" }}>
                      <div style={{ padding: "10px 0", borderRight: "1px solid #e2e7ec", display: "flex", justifyContent: "center" }}>
                        <span className="center" style={{ width: 24, height: 24, borderRadius: "50%", background: PINST[p.st].color, color: "#fff", fontWeight: 800, fontSize: 12, fontFamily: "var(--font-en)", flex: "none", alignSelf: "flex-start" }}>{i + 1}</span>
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div className="row gap-6" style={{ marginBottom: 5 }}><span className="chip" style={{ background: PINST[p.st].soft, color: PINST[p.st].color, fontSize: 10.5 }}>{PINST[p.st].label}</span><span className="muted" style={{ fontSize: 11 }}>担当: {p.worker}</span></div>
                        <div style={{ fontSize: 13, lineHeight: 1.55 }}>{p.comment}</div>
                        {(p.photos && p.photos.length > 0) && <div className="row gap-6 wrap" style={{ marginTop: 8 }}>{p.photos.map((h, pi) => <PhotoFrame key={pi} hue={h} style={{ width: 92, height: 70 }} rounded={5} />)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateSubmissionModal({ onClose, onCreate }) {
  const M = window.MOCK;
  const [d, setD] = useStateFm({ type: M.FORM_TYPES[0], title: "", location: "", date: "2026/06/09" });
  const [err, setErr] = useStateFm(false);
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!d.title.trim()) { setErr(true); return; }
    const tpl = M.formTemplates.find(t => t.type === d.type);
    onCreate({ id: "SB-" + Math.floor(3000 + Math.random() * 6000), templateId: tpl ? tpl.id : "FT-1", type: d.type, title: d.title, project: M.project.name, author: "田中 美咲", company: "大和建設", date: d.date, status: "submitted", version: 1, photos: 0, location: d.location || "—", returnComment: null });
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.4)", zIndex: 50, display: "grid", placeItems: "center", animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 480, maxWidth: "94vw", boxShadow: "var(--sh-4)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="row gap-8"><Icon name="plus" size={18} color="var(--accent)" /><span style={{ fontWeight: 800, fontSize: 16 }}>新規帳票作成</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="col gap-14" style={{ padding: 20 }}>
          <label className="fld">帳票種類<select className="inp" value={d.type} onChange={e => f("type", e.target.value)}>{M.FORM_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
          <label className="fld">帳票名 <span style={{ color: "var(--st-redo)" }}>＊必須</span>
            <input className="inp" value={d.title} onChange={e => f("title", e.target.value)} placeholder="例：2026/06/09 作業日報（2F 配筋）" style={err && !d.title.trim() ? { borderColor: "var(--st-redo)" } : {}} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="fld">場所<input className="inp" value={d.location} onChange={e => f("location", e.target.value)} placeholder="2F 東エリア" /></label>
            <label className="fld">日付<input type="date" className="inp" value="2026-06-09" onChange={e => f("date", e.target.value.replace(/-/g, "/"))} /></label>
          </div>
        </div>
        <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
          <button className="btn" onClick={onClose} style={{ marginLeft: "auto" }}>キャンセル</button>
          <button className="btn primary" onClick={submit}><Icon name="plus" size={15} />作成</button>
        </div>
      </div>
    </div>
  );
}

function FormSubmissions({ pushToast }) {
  const M = window.MOCK;
  const store = usePhotoStore();
  const [subs, setSubs] = useStateFm(M.submissions.map(s => ({ ...s })));
  const [type, setType] = useStateFm("all");
  const [status, setStatus] = useStateFm("all");
  const [active, setActive] = useStateFm(null);
  const [tab, setTab] = useStateFm("review");
  const [sel, setSel] = useStateFm([]);
  const [creating, setCreating] = useStateFm(false);
  const [newId, setNewId] = useStateFm(null);
  // iPadで確認された現場報告（iPhone由来）を帳票として取り込む
  const reportSubs = (store.reports || []).filter(r => r.status === "confirmed").map(r => ({
    id: r.id, templateId: "FT-RPT", type: "現場報告",
    title: (r.kind === "board" ? "黒板付き現場報告" : "現場報告") + " — " + r.location,
    project: M.project.name, author: r.by, company: r.company,
    date: (r.confirmedAt || r.takenAt || "2026/06/16").slice(0, 10),
    photos: 1, location: r.location, status: "approved", drawingId: "DWG-201",
    overall: r.comment,
    pins: [{ x: 46, y: 50, st: "done", worker: r.by, comment: r.comment, photos: [r.hue] }],
    fromField: true,
  }));
  const allSubs = [...reportSubs, ...subs];
  const list = allSubs.filter(s => (type === "all" || s.type === type));
  const visibleIds = list.map(s => s.id);
  const allSel = visibleIds.length > 0 && visibleIds.every(id => sel.includes(id));
  const toggleSel = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const output = (ids, fmt) => { pushToast(`${ids.length} 件の帳票を${fmt}で出力しました。`, "approved"); };
  const create = (s) => { setSubs(ss => [s, ...ss]); setCreating(false); setNewId(s.id); setTimeout(() => setNewId(null), 2600); };
  const del = () => { setSubs(ss => ss.filter(s => !sel.includes(s.id))); pushToast(`${sel.length} 件の帳票を削除しました。`, "redo"); setSel([]); };
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: "18px 26px 12px" }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>帳票管理</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>帳票を複数選択してPDF / Excel 出力・削除を行えます。</div></div>
      </div>
      {(
        <React.Fragment>
        <div className="row gap-12" style={{ padding: "0 26px 12px", flexWrap: "wrap", alignItems: "center" }}>
          <Icon name="filter" size={15} color="var(--ink-4)" />
          <label className="row gap-6" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>種類<select className="inp" style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }} value={type} onChange={e => setType(e.target.value)}><option value="all">すべて</option>{[...M.FORM_TYPES, "現場報告"].map(t => <option key={t}>{t}</option>)}</select></label>
          <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{list.length} 件</span>
          {sel.length > 0 && <div className="row gap-8" style={{ marginLeft: "auto", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-ink)" }}>{sel.length} 件選択</span>
            <button className="btn danger sm" onClick={del}><Icon name="x" size={14} color="var(--st-redo)" />削除</button>
            <button className="btn sm" onClick={() => output(sel, "Excel")}><Icon name="table" size={14} />Excel出力</button>
            <button className="btn primary sm" onClick={() => output(sel, "PDF")}><Icon name="file" size={14} />PDF出力</button>
          </div>}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px" }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data">
              <thead><tr><th style={{ width: 36 }} onClick={() => setSel(allSel ? [] : visibleIds)}><div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid " + (allSel ? "var(--accent)" : "var(--line)"), background: allSel ? "var(--accent)" : "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>{allSel && <Icon name="check" size={12} color="#fff" />}</div></th><th>帳票</th><th>種類</th><th>担当者</th><th>場所</th><th>日付</th><th>写真</th></tr></thead>
              <tbody>{list.map(s => (
                <tr key={s.id} className={sel.includes(s.id) ? "sel" : ""} style={newId === s.id ? { background: "var(--st-approved-soft)" } : {}}>
                  <td onClick={e => { e.stopPropagation(); toggleSel(s.id); }}><div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid " + (sel.includes(s.id) ? "var(--accent)" : "var(--line)"), background: sel.includes(s.id) ? "var(--accent)" : "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>{sel.includes(s.id) && <Icon name="check" size={12} color="#fff" />}</div></td>
                  <td style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => setActive(s)}>{s.title}{newId === s.id && <span className="chip" style={{ marginLeft: 8, background: "var(--st-approved-soft)", color: "var(--st-approved)", fontSize: 10 }}>新規</span>}</td>
                  <td><span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>{s.type}</span></td>
                  <td>{s.author}</td><td className="muted">{s.location}</td><td className="num">{s.date}</td><td className="num">{s.photos}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        </React.Fragment>
      )}
      {active && <SubmissionDrawer sub={active} onClose={() => setActive(null)} onOutput={(s, fmt) => { output([s.id], fmt); setActive(null); }} />}
      {creating && <CreateSubmissionModal onClose={() => setCreating(false)} onCreate={create} />}
    </div>
  );
}

Object.assign(window, { FormTemplates, FormSubmissions });
