/* ============================================================
   Web admin — remaining modules + shell → window.WebApp
   templates · tasks · tamper · AI/rebar · users · logs
   ============================================================ */
const { useState: useStateW2 } = React;

/* ---------- 黒板テンプレート管理 ---------- */
function CreateTemplateModal({ onClose, onCreate, initial }) {
  const M = window.MOCK;
  const FIELDS = ["設計値", "実測値", "施工内容", "立会者", "測点", "備考"];
  const [d, setD] = useStateW2(initial
    ? { name: initial.name, workType: initial.workType, category: initial.category || "鉄筋", layout: initial.layout || "general", reusable: initial.reusable, active: initial.active, fields: initial.fieldList || ["設計値", "実測値", "備考"] }
    : { name: "", workType: M.WORK_TYPES[1], category: "鉄筋", layout: "general", reusable: true, active: true, fields: ["設計値", "実測値", "備考"] });
  const [err, setErr] = useStateW2(false);
  const [customFld, setCustomFld] = useStateW2("");
  const CATEGORIES = ["鉄筋", "コンクリート", "型枠", "鉄骨", "設備", "電気", "仕上", "防水", "共通"];
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const toggleField = (name) => setD(p => ({ ...p, fields: p.fields.includes(name) ? p.fields.filter(x => x !== name) : [...p.fields, name] }));
  const addCustom = () => { const v = customFld.trim(); if (!v) return; setD(p => ({ ...p, fields: p.fields.includes(v) ? p.fields : [...p.fields, v] })); setCustomFld(""); };
  const submit = () => {
    if (!d.name.trim()) { setErr(true); return; }
    onCreate({ id: initial ? initial.id : "TPL-" + Math.floor(10 + Math.random() * 90), name: d.name, workType: d.workType, category: d.category, fieldList: d.fields, fields: d.fields.length + 3, active: d.active, reusable: d.reusable, by: initial ? initial.by : "田中 美咲", uses: initial ? initial.uses : 0, layout: d.layout });
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.4)", zIndex: 50, display: "grid", placeItems: "center", animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 760, maxWidth: "94vw", maxHeight: "90vh", overflow: "auto", boxShadow: "var(--sh-4)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
          <div className="row gap-8"><Icon name="board" size={18} color="var(--accent)" /><span style={{ fontWeight: 800, fontSize: 16 }}>{initial ? "テンプレート編集" : "新規黒板テンプレート作成"}</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="row" style={{ alignItems: "stretch" }}>
          <div className="col gap-14" style={{ flex: 1, padding: 20, borderRight: "1px solid var(--line-2)" }}>
            <label className="fld">テンプレート名 <span style={{ color: "var(--st-redo)" }}>＊必須</span>
              <input className="inp" value={d.name} onChange={e => f("name", e.target.value)} placeholder="例：配筋検査 標準黒板" style={err && !d.name.trim() ? { borderColor: "var(--st-redo)" } : {}} />
              {err && !d.name.trim() && <span style={{ color: "var(--st-redo)", fontSize: 11, fontWeight: 600 }}>テンプレート名を入力してください</span>}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label className="fld">適用工種<select className="inp" value={d.workType} onChange={e => f("workType", e.target.value)}>{M.WORK_TYPES.map(w => <option key={w}>{w}</option>)}</select></label>
              <label className="fld">種別<select className="inp" value={d.category} onChange={e => f("category", e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
            </div>
            <label className="fld">レイアウト<select className="inp" value={d.layout} onChange={e => f("layout", e.target.value)}>
              <option value="general">汎用</option><option value="rebar">配筋（豆図枠あり）</option><option value="dimension">出来形（寸法）</option>
            </select></label>
            <div className="fld">入力項目（黒板に表示する欄）
              <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
                {[...new Set([...FIELDS, ...d.fields])].map(name => { const on = d.fields.includes(name); const custom = !FIELDS.includes(name); return (
                  <button key={name} onClick={() => toggleField(name)} className="chip" style={{ cursor: "pointer", border: "1px solid " + (on ? "var(--accent)" : "var(--line)"), background: on ? "var(--accent-soft)" : "var(--surface)", color: on ? "var(--accent-ink)" : "var(--ink-3)" }}>
                    {on && <Icon name="check" size={12} color="var(--accent-ink)" />}{name}{custom && <span style={{ fontSize: 9, opacity: .7, marginLeft: 2 }}>自由</span>}
                  </button>
                ); })}
              </div>
              <div className="row gap-8" style={{ marginTop: 8 }}>
                <input className="inp" value={customFld} onChange={e => setCustomFld(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="自由項目を追加（例：気温）" style={{ flex: 1, fontSize: 13 }} />
                <button className="btn sm" onClick={addCustom}><Icon name="plus" size={14} />追加</button>
              </div>
            </div>
            <div className="row gap-16">
              <label className="row gap-6" style={{ fontSize: 13, fontWeight: 600, cursor: "pointer" }}><input type="checkbox" checked={d.reusable} onChange={e => f("reusable", e.target.checked)} />他現場へ転用可</label>
              <label className="row gap-6" style={{ fontSize: 13, fontWeight: 600, cursor: "pointer" }}><input type="checkbox" checked={d.active} onChange={e => f("active", e.target.checked)} />有効にする</label>
            </div>
          </div>
          <div className="col center" style={{ width: 230, padding: 20, background: "var(--bg)", gap: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>プレビュー</div>
            <Blackboard data={{ workType: d.workType, category: d.category, subcategory: "（テンプレート）", design: d.fields.includes("設計値") ? "—" : undefined, actual: d.fields.includes("実測値") ? "—" : undefined, point: "—", location: "—" }} scale={1} variant="compact" />
          </div>
        </div>
        <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)", position: "sticky", bottom: 0, background: "var(--surface)" }}>
          <button className="btn" onClick={onClose} style={{ marginLeft: "auto" }}>キャンセル</button>
          <button className="btn primary" onClick={submit}><Icon name={initial ? "check" : "plus"} size={15} />{initial ? "更新する" : "テンプレートを作成"}</button>
        </div>
      </div>
    </div>
  );
}

function AiTemplateModal({ onClose, onCreate }) {
  const M = window.MOCK;
  const [msgs, setMsgs] = useStateW2([{ ai: true, text: "どんな黒板テンプレートを作成しますか？工種や記載したい項目を教えてください。" }]);
  const [txt, setTxt] = useStateW2("");
  const [draft, setDraft] = useStateW2(null);
  const [busy, setBusy] = useStateW2(false);
  const endRef = useStateW2 && React.useRef(null);
  const send = (preset) => {
    const q = preset || txt;
    if (!q.trim()) return;
    setMsgs(m => [...m, { ai: false, text: q }]);
    setTxt(""); setBusy(true);
    setTimeout(() => {
      const wt = M.WORK_TYPES.find(w => q.includes(w)) || "配筋検査";
      const fields = ["設計値", "実測値"];
      if (/かぶり|スランプ|温度|本数|径|ピッチ/.test(q)) fields.push("測点");
      if (/立会|検査員/.test(q)) fields.push("立会者");
      fields.push("備考");
      const d = { id: "TPL-AI" + Math.floor(10 + Math.random() * 90), name: `${wt} AI黒板`, workType: wt, category: "鉄筋", fields: fields.length + 3, fieldList: fields, active: true, reusable: true, by: "AI生成", uses: 0 };
      setDraft(d);
      setMsgs(m => [...m, { ai: true, text: `「${wt}」向けの黒板テンプレート案を生成しました。プレビューをご確認ください。項目：${fields.join("・")}。よろしければ「この内容で作成」を押してください。` }]);
      setBusy(false);
    }, 900);
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.45)", zIndex: 50, display: "grid", placeItems: "center", animation: "fadeIn .15s", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 860, maxWidth: "95vw", height: 580, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "var(--sh-4)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", flex: "none" }}>
          <div className="row gap-8"><span className="center" style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)" }}><Icon name="cpu" size={17} color="var(--accent-ink)" /></span><span style={{ fontWeight: 800, fontSize: 16 }}>AI 黒板テンプレート作成</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="row" style={{ flex: 1, minHeight: 0 }}>
          {/* chat */}
          <div className="col" style={{ flex: 1, minWidth: 0, borderRight: "1px solid var(--line)" }}>
            <div className="col gap-12" style={{ flex: 1, overflow: "auto", padding: 18 }}>
              {msgs.map((m, i) => (
                <div key={i} className="row gap-8" style={{ alignItems: "flex-start", flexDirection: m.ai ? "row" : "row-reverse" }}>
                  {m.ai && <span className="center" style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", flex: "none" }}><Icon name="cpu" size={15} color="var(--accent-ink)" /></span>}
                  <div style={{ maxWidth: "82%", background: m.ai ? "var(--bg-2)" : "var(--accent)", color: m.ai ? "var(--ink)" : "#fff", padding: "9px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.6 }}>{m.text}</div>
                </div>
              ))}
              {busy && <div className="row gap-8"><span className="center" style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", flex: "none" }}><Icon name="cpu" size={15} color="var(--accent-ink)" /></span><div style={{ background: "var(--bg-2)", padding: "9px 14px", borderRadius: 12, fontSize: 13, color: "var(--ink-3)" }}>生成中…</div></div>}
            </div>
            <div style={{ padding: "0 18px 10px" }} className="row gap-6 wrap">
              {["配筋検査の黒板", "コンクリート打設（スランプ・空気量）", "出来形管理"].map(p => <button key={p} className="chip" onClick={() => send(p)} style={{ cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>{p}</button>)}
            </div>
            <div className="row gap-8" style={{ padding: 14, borderTop: "1px solid var(--line)", flex: "none" }}>
              <input className="inp" value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder="例：配筋検査用。かぶり厚と本数を記載" style={{ flex: 1 }} />
              <button className="btn primary" onClick={() => send()} disabled={busy || !txt.trim()} style={{ padding: "0 14px" }}><Icon name="send" size={17} color="#fff" /></button>
            </div>
          </div>
          {/* preview */}
          <div className="col center" style={{ width: 360, flex: "none", padding: 24, background: "var(--bg)", gap: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>黒板プレビュー</div>
            {draft ? (
              <React.Fragment>
                <Blackboard data={{ workType: draft.workType, category: draft.category, subcategory: "（AI生成）", design: "—", actual: "—", point: "—", location: "—" }} scale={1.25} variant="compact" />
                <div style={{ textAlign: "center" }}><div style={{ fontWeight: 700, fontSize: 15 }}>{draft.name}</div><div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{draft.workType} ・ {draft.fieldList.join("・")}</div></div>
              </React.Fragment>
            ) : (
              <div className="center" style={{ flex: 1, color: "var(--ink-4)", fontSize: 12.5, textAlign: "center", flexDirection: "column", gap: 8 }}><Icon name="board" size={36} color="var(--ink-4)" />AIと相談すると<br />ここに黒板案が表示されます</div>
            )}
          </div>
        </div>
        {/* footer: 確認・エクスポート */}
        <div className="row gap-10" style={{ padding: "14px 20px", borderTop: "1px solid var(--line)", flex: "none", justifyContent: "flex-end", alignItems: "center" }}>
          {draft && <span className="muted" style={{ fontSize: 12.5, marginRight: "auto" }}>「{draft.name}」を黒板テンプレートに登録します</span>}
          <button className="btn" onClick={onClose}>キャンセル</button>
          <button className="btn primary lg" disabled={!draft} style={!draft ? { opacity: .5 } : {}} onClick={() => draft && onCreate(draft)}><Icon name="check" size={17} />確認してエクスポート</button>
        </div>
      </div>
    </div>
  );
}

function AutoImportModal({ current, onClose, onSet }) {
  const FOLDERS = [
    { id: "f1", name: "現場写真ドロップ / 配筋検査", path: "BuildBase/PJ-2041/配筋検査", count: 18 },
    { id: "f2", name: "現場写真ドロップ / コンクリート打設", path: "BuildBase/PJ-2041/打設", count: 6 },
    { id: "f3", name: "共有ドライブ / 当日アップロード", path: "SharedDrive/2026-06-16", count: 24 },
    { id: "f4", name: "現場写真ドロップ / 出来形", path: "BuildBase/PJ-2041/出来形", count: 9 },
  ];
  const [pick, setPick] = useStateW2(current ? current.id : null);
  const [rule, setRule] = useStateW2("filename");
  const sel = FOLDERS.find(f => f.id === pick);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.4)", zIndex: 50, display: "grid", placeItems: "center", animation: "fadeIn .15s", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 560, maxWidth: "94vw", maxHeight: "90vh", overflow: "auto", boxShadow: "var(--sh-4)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="row gap-8"><Icon name="folder" size={18} color="var(--accent)" /><span style={{ fontWeight: 800, fontSize: 16 }}>黒板 自動取込（フォルダ連携）</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="col gap-14" style={{ padding: 20 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.6 }}>監視フォルダを選択すると、そのフォルダに投入された資料（写真・図面・配筋リスト等）から<b style={{ color: "var(--ink)" }}>自動で黒板を生成</b>します。</div>
          <div className="fld">対象フォルダを選択
            <div className="col gap-8" style={{ marginTop: 6 }}>
              {FOLDERS.map(f => { const on = pick === f.id; return (
                <button key={f.id} onClick={() => setPick(f.id)} className="card" style={{ padding: 12, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", outline: on ? "2px solid var(--accent)" : "none", background: on ? "var(--accent-soft)" : "var(--surface)" }}>
                  <Icon name="folder" size={20} color={on ? "var(--accent-ink)" : "var(--ink-4)"} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{f.name}</div><div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{f.path}</div></div>
                  <span className="chip" style={{ background: "var(--bg-2)", color: "var(--ink-3)" }}>{f.count} 件</span>
                </button>
              ); })}
            </div>
          </div>
          <label className="fld">黒板生成ルール
            <select className="inp" value={rule} onChange={e => setRule(e.target.value)}>
              <option value="filename">ファイル名から工種・測点を判定</option>
              <option value="exif">撮影日時・GPSから施工箇所を判定</option>
              <option value="rebar">配筋リストを解析して項目を自動入力</option>
            </select>
          </label>
          {sel && <div className="card" style={{ padding: 12, background: "var(--accent-soft)", boxShadow: "none", fontSize: 12.5, color: "var(--accent-ink)" }}><Icon name="cpu" size={15} color="var(--accent-ink)" /> このフォルダの {sel.count} 件から黒板を自動生成し、撮影タスクに紐付けます。</div>}
        </div>
        <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
          {current && <button className="btn danger" onClick={() => onSet(null)}>連携を解除</button>}
          <button className="btn" onClick={onClose} style={{ marginLeft: "auto" }}>キャンセル</button>
          <button className="btn primary" disabled={!sel} style={!sel ? { opacity: .5 } : {}} onClick={() => onSet(sel)}><Icon name="check" size={15} />このフォルダを連携</button>
        </div>
      </div>
    </div>
  );
}

function Templates({ go, onUse }) {
  const M = window.MOCK;
  const [tpls, setTpls] = useStateW2(M.templates.map(t => ({ ...t })));
  const [creating, setCreating] = useStateW2(false);
  const [aiOpen, setAiOpen] = useStateW2(false);
  const [editing, setEditing] = useStateW2(null);
  const [newId, setNewId] = useStateW2(null);
  const flash = (id) => { setNewId(id); setTimeout(() => setNewId(null), 2400); };
  const create = (t) => { setTpls(ts => [t, ...ts]); setCreating(false); flash(t.id); };
  const saveEdit = (t) => { setTpls(ts => ts.map(x => x.id === t.id ? t : x)); setEditing(null); flash(t.id); };
  const duplicate = (t) => { const c = { ...t, id: "TPL-" + Math.floor(10 + Math.random() * 90), name: t.name + "（コピー）", uses: 0 }; setTpls(ts => [c, ...ts]); flash(c.id); };
  const toggleActive = (t) => setTpls(ts => ts.map(x => x.id === t.id ? { ...x, active: !x.active } : x));
  const [sel, setSel] = useStateW2([]);
  const toggleSel = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const delSelected = () => { setTpls(ts => ts.filter(t => !sel.includes(t.id))); setSel([]); };
  const [importOpen, setImportOpen] = useStateW2(false);
  const [watchFolder, setWatchFolder] = useStateW2(null);
  const [fil, setFil] = useStateW2({ workType: "all", category: "all", site: "all" });
  const setF = (k, v) => setFil(p => ({ ...p, [k]: v }));
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const wtOpts = uniq(tpls.map(t => t.workType));
  const catOpts = uniq(tpls.map(t => t.category));
  const SITES = ["湾岸ロジ新築", "城南第一マンション", "中央区庁舎"];
  const catMatch = (t) => (fil.workType === "all" || t.workType === fil.workType) && (fil.category === "all" || t.category === fil.category);
  const filActive = fil.workType !== "all" || fil.category !== "all" || fil.site !== "all";
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)" }}>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>黒板管理</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>工種別の黒板レイアウトを管理し、テンプレートからCSVで黒板を一括作成できます。</div></div>
        <div className="row gap-8">
          {sel.length > 0 && <>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-ink)", alignSelf: "center" }}>{sel.length} 件選択中</span>
            <button className="btn danger" onClick={delSelected}><Icon name="x" size={15} color="var(--st-redo)" />選択を削除</button>
            <button className="btn" onClick={() => setSel([])}>選択解除</button>
            <span style={{ width: 1, background: "var(--line)", margin: "4px 2px" }}></span>
          </>}
          <button className="btn" onClick={() => setImportOpen(true)} style={{ background: watchFolder ? "var(--st-approved-soft)" : "var(--surface)", borderColor: watchFolder ? "#bfe6cd" : "var(--line)", color: watchFolder ? "var(--st-approved)" : "var(--ink)" }}><Icon name="folder" size={15} color={watchFolder ? "var(--st-approved)" : undefined} />{watchFolder ? "自動取込: 連携中" : "黒板自動取込"}</button>
          <button className="btn" onClick={() => setAiOpen(true)} style={{ background: "var(--accent-soft)", borderColor: "var(--accent-soft-2)", color: "var(--accent-ink)" }}><Icon name="cpu" size={15} color="var(--accent-ink)" />AI作成</button>
          <button className="btn" onClick={() => setCreating(true)}><Icon name="plus" size={15} />テンプレート作成</button>
        </div>
      </div>
      {/* 黒板様式 フィルター（工種・種別・現場） */}
      <div className="row gap-12" style={{ marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <Icon name="filter" size={15} color="var(--ink-4)" />
        <label className="row gap-6" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>工種<select className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 12.5 }} value={fil.workType} onChange={e => setF("workType", e.target.value)}><option value="all">すべて</option>{wtOpts.map(w => <option key={w}>{w}</option>)}</select></label>
        <label className="row gap-6" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>種別<select className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 12.5 }} value={fil.category} onChange={e => setF("category", e.target.value)}><option value="all">すべて</option>{catOpts.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="row gap-6" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>現場<select className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 12.5 }} value={fil.site} onChange={e => setF("site", e.target.value)}><option value="all">全現場共通</option>{SITES.map(s => <option key={s}>{s}</option>)}</select></label>
        {filActive && <button className="btn ghost sm" onClick={() => setFil({ workType: "all", category: "all", site: "all" })}><Icon name="x" size={13} />クリア</button>}
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{tpls.filter(catMatch).length} 件</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {tpls.filter(catMatch).length === 0 && <div className="muted" style={{ gridColumn: "1/-1", padding: 30, textAlign: "center", fontSize: 13 }}>該当する黒板様式はありません。</div>}
        {tpls.filter(catMatch).map(t => (
          <div key={t.id} className="card fade-up" style={{ padding: 16, opacity: t.active ? 1 : .62, display: "flex", flexDirection: "column", position: "relative", outline: newId === t.id ? "2px solid var(--st-approved)" : sel.includes(t.id) ? "2px solid var(--accent)" : "none" }}>
            <div onClick={() => toggleSel(t.id)} title="選択" style={{ position: "absolute", top: 10, left: 10, width: 22, height: 22, borderRadius: 6, border: "2px solid " + (sel.includes(t.id) ? "var(--accent)" : "var(--line)"), background: sel.includes(t.id) ? "var(--accent)" : "rgba(255,255,255,.92)", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 2 }}>{sel.includes(t.id) && <Icon name="check" size={13} color="#fff" />}</div>
            <Blackboard data={{ workType: t.workType, subcategory: "（テンプレート）", design: "—", actual: "—", point: "—", location: "—" }} scale={0.95} variant="compact" />
            <div className="row spread" style={{ marginTop: 12 }}>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}{newId === t.id && <span className="chip" style={{ marginLeft: 6, background: "var(--st-approved-soft)", color: "var(--st-approved)", fontSize: 10 }}>新規</span>}</div><div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{t.workType} ・ {t.fields}項目</div></div>
              {t.active ? <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}>有効</span> : <span className="chip" style={{ background: "var(--st-none-soft)", color: "var(--ink-3)" }}>停止中</span>}
            </div>
            <div className="row spread" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-2)" }}>
              <span className="num muted" style={{ fontSize: 11.5 }}>使用 {t.uses} 回 {t.reusable && "・ 転用可"}</span>
              <div className="row gap-4">
                <button className="btn ghost sm" title="編集" onClick={() => setEditing(t)}><Icon name="edit" size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {creating && <CreateTemplateModal onClose={() => setCreating(false)} onCreate={create} />}
      {importOpen && <AutoImportModal current={watchFolder} onClose={() => setImportOpen(false)} onSet={(f) => { setWatchFolder(f); setImportOpen(false); }} />}
      {aiOpen && <AiTemplateModal onClose={() => setAiOpen(false)} onCreate={(t) => { setAiOpen(false); create(t); }} />}
      {editing && <CreateTemplateModal initial={editing} onClose={() => setEditing(null)} onCreate={saveEdit} />}
    </div>
  );
}

/* ---------- 撮影タスク管理 ---------- */
function CreateTaskModal({ onClose, onCreate }) {
  const M = window.MOCK;
  const assignees = M.users.filter(u => /現場|協力/.test(u.role)).map(u => u.name);
  const blank = { name: "", workType: M.WORK_TYPES[2], floor: "", area: "", item: "", bbId: "", assignee: assignees[0] || "", due: "", requirement: "", drawingId: M.drawings[0].id, pinX: null, pinY: null };
  const [d, setD] = useStateW2(blank);
  const [err, setErr] = useStateW2(false);
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const placePin = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - r.left) / r.width * 1000) / 10;
    const y = Math.round((e.clientY - r.top) / r.height * 1000) / 10;
    setD(p => ({ ...p, pinX: x, pinY: y }));
  };
  const dwg = M.drawings.find(x => x.id === d.drawingId) || M.drawings[0];
  const fromBoard = (id) => {
    const b = M.blackboards.find(x => x.id === id);
    setD(p => ({ ...p, bbId: id, workType: b ? b.workType : p.workType, floor: b ? b.floor : p.floor, item: b ? b.subcategory : p.item, name: p.name || (b ? `${b.location} ${b.subcategory}` : "") }));
  };
  const submit = () => {
    if (!d.name.trim()) { setErr(true); return; }
    const due = d.due ? d.due.slice(5).replace("-", "/") : "—";
    onCreate({ ...d, due, id: "T-" + Math.floor(2000 + Math.random() * 8000), status: "none" });
  };
  const Row = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.4)", zIndex: 50, display: "grid", placeItems: "center", animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 560, maxWidth: "94vw", maxHeight: "90vh", overflow: "auto", boxShadow: "var(--sh-4)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
          <div className="row gap-8"><Icon name="list" size={18} color="var(--accent)" /><span style={{ fontWeight: 800, fontSize: 16 }}>新規撮影タスク作成</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="col gap-14" style={{ padding: 20 }}>
          <label className="fld">タスク名 <span style={{ color: "var(--st-redo)" }}>＊必須</span>
            <input className="inp" value={d.name} onChange={e => f("name", e.target.value)} placeholder="例：3F 東側 大梁 G1 主筋本数・径" style={err && !d.name.trim() ? { borderColor: "var(--st-redo)" } : {}} />
            {err && !d.name.trim() && <span style={{ color: "var(--st-redo)", fontSize: 11, fontWeight: 600 }}>タスク名を入力してください</span>}
          </label>
          <label className="fld">使用黒板（任意・選択で項目を自動反映）
            <select className="inp" value={d.bbId} onChange={e => fromBoard(e.target.value)}>
              <option value="">— 黒板を選択 —</option>
              {M.blackboards.map(b => <option key={b.id} value={b.id}>{b.name}（{b.location}）</option>)}
            </select>
          </label>
          <Row>
            <label className="fld">工種<select className="inp" value={d.workType} onChange={e => f("workType", e.target.value)}>{M.WORK_TYPES.map(w => <option key={w}>{w}</option>)}</select></label>
            <label className="fld">検査項目<input className="inp" value={d.item} onChange={e => f("item", e.target.value)} placeholder="例：主筋本数・径" /></label>
          </Row>
          <Row>
            <label className="fld">階<input className="inp" value={d.floor} onChange={e => f("floor", e.target.value)} placeholder="例：3F" /></label>
            <label className="fld">エリア<input className="inp" value={d.area} onChange={e => f("area", e.target.value)} placeholder="例：東エリア" /></label>
          </Row>
          <Row>
            <label className="fld">担当者<select className="inp" value={d.assignee} onChange={e => f("assignee", e.target.value)}>{assignees.map(a => <option key={a}>{a}</option>)}</select></label>
            <label className="fld">期限<input type="date" className="inp" value={d.due} onChange={e => f("due", e.target.value)} /></label>
          </Row>
          <label className="fld">撮影要件
            <textarea className="inp" rows={2} value={d.requirement} onChange={e => f("requirement", e.target.value)} placeholder="例：全景・近景の2枚以上、黒板の測点が読めること" />
          </label>
          {/* 図面Pin（撮影箇所マーカー）作成 */}
          <div className="fld">
            <div className="row spread">
              <span>図面Pin（撮影箇所マーカー）<span className="muted" style={{ fontWeight: 400 }}> 任意</span></span>
              {d.pinX != null
                ? <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}><Icon name="pin" size={12} color="var(--st-approved)" />設定済み {d.pinX}, {d.pinY}</span>
                : <span className="chip" style={{ background: "var(--st-none-soft)", color: "var(--ink-3)" }}>未設定</span>}
            </div>
            <select className="inp" value={d.drawingId} onChange={e => setD(p => ({ ...p, drawingId: e.target.value, pinX: null, pinY: null }))} style={{ marginBottom: 8 }}>
              {M.drawings.map(dw => <option key={dw.id} value={dw.id}>{dw.name}（{dw.number}）</option>)}
            </select>
            <div onClick={placePin} style={{ position: "relative", width: "100%", height: 220, background: "#f7f5ee", borderRadius: 8, border: "1px solid #ddd", cursor: "crosshair", overflow: "hidden" }}>
              <svg viewBox="0 0 520 220" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <rect x="30" y="24" width="460" height="172" fill="none" stroke="#2b4a8a" strokeWidth="2" />
                {[130, 230, 330, 430].map(x => <line key={x} x1={x} y1="24" x2={x} y2="196" stroke="#9bb0d6" strokeWidth="1" />)}
                {[80, 136].map(y => <line key={y} x1="30" y1={y} x2="490" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
                <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="130" y="80" width="100" height="56" /><rect x="330" y="80" width="100" height="56" /></g>
                <text x="38" y="18" fill="#2b4a8a" fontSize="11" fontFamily="monospace">{dwg.name} {dwg.number}</text>
              </svg>
              {d.pinX != null && (
                <svg style={{ position: "absolute", left: d.pinX + "%", top: d.pinY + "%", width: 24, height: 24, transform: "translate(-50%,-100%)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }} viewBox="0 0 24 24">
                  <path d="M12 23s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" fill="var(--accent)" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="10" r="3" fill="#fff" />
                </svg>
              )}
              <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.45)", padding: "3px 8px", borderRadius: 5 }}>
                <Icon name="pin" size={12} color="#fff" /> 図面をクリックしてPinを配置
              </div>
              {d.pinX != null && <button onClick={e => { e.stopPropagation(); setD(p => ({ ...p, pinX: null, pinY: null })); }} className="btn sm" style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px" }}>Pinを消す</button>}
            </div>
          </div>
        </div>
        <div className="row gap-10" style={{ padding: 16, borderTop: "1px solid var(--line)", position: "sticky", bottom: 0, background: "var(--surface)" }}>
          <button className="btn" onClick={onClose} style={{ marginLeft: "auto" }}>キャンセル</button>
          <button className="btn primary" onClick={submit}><Icon name="plus" size={15} />タスクを作成</button>
        </div>
      </div>
    </div>
  );
}

function FilSel({ label, value, onChange, options, render }) {
  return (
    <label className="row gap-6" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>{label}
      <select className="inp" style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }} value={value} onChange={e => onChange(e.target.value)}>
        <option value="all">すべて</option>
        {options.map(o => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </label>
  );
}

function Tasks() {
  const M = window.MOCK;
  const [tasks, setTasks] = useStateW2(M.tasks.map(t => ({ ...t })));
  const [sel, setSel] = useStateW2([]);
  const [creating, setCreating] = useStateW2(false);
  const [newId, setNewId] = useStateW2(null);
  const [published, setPublished] = useStateW2(0);
  const [fil, setFil] = useStateW2({ workType: "all", area: "all", bbId: "all", assignee: "all", due: "all", status: "all" });
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const delSelected = () => { setTasks(ts => ts.filter(t => !sel.includes(t.id))); setSel([]); };
  const uniq = (a) => [...new Set(a)];
  const opts = { workType: uniq(tasks.map(t => t.workType)), area: uniq(tasks.map(t => `${t.floor} ${t.area}`)), bbId: uniq(tasks.map(t => t.bbId)), assignee: uniq(tasks.map(t => t.assignee)), due: uniq(tasks.map(t => t.due)) };
  const bbName = (id) => { const b = M.blackboards.find(x => x.id === id); return b ? b.name : id; };
  const setF = (k, v) => setFil(p => ({ ...p, [k]: v }));
  const filActive = Object.values(fil).some(v => v !== "all");
  const filtered = tasks.filter(t =>
    (fil.workType === "all" || t.workType === fil.workType) &&
    (fil.area === "all" || `${t.floor} ${t.area}` === fil.area) &&
    (fil.bbId === "all" || t.bbId === fil.bbId) &&
    (fil.assignee === "all" || t.assignee === fil.assignee) &&
    (fil.due === "all" || t.due === fil.due) &&
    (fil.status === "all" || t.status === fil.status));
  const visibleIds = filtered.map(t => t.id);
  const allSel = visibleIds.length > 0 && visibleIds.every(id => sel.includes(id));
  const create = (t) => {
    setTasks(ts => [t, ...ts]);
    setCreating(false);
    setNewId(t.id);
    setTimeout(() => setNewId(null), 2400);
  };
  const publish = () => { setPublished(sel.length); setSel([]); setTimeout(() => setPublished(0), 2600); };
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: "18px 26px 12px" }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>黒板タスク</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>黒板・Pin・CSVからタスクを生成し、担当者へ割り当てます。</div></div>
        <div className="row gap-8">
          {sel.length > 0 && <button className="btn danger" onClick={delSelected}><Icon name="x" size={15} color="var(--st-redo)" />選択を削除（{sel.length}）</button>}
          <button className="btn primary" onClick={() => setCreating(true)}><Icon name="plus" size={15} />タスク作成</button>
        </div>
      </div>
      <div className="row gap-12" style={{ padding: "0 26px 12px", flexWrap: "wrap", alignItems: "center" }}>
        <Icon name="filter" size={15} color="var(--ink-4)" />
        <FilSel label="工種" value={fil.workType} onChange={v => setF("workType", v)} options={opts.workType} />
        <FilSel label="階/エリア" value={fil.area} onChange={v => setF("area", v)} options={opts.area} />
        <FilSel label="黒板" value={fil.bbId} onChange={v => setF("bbId", v)} options={opts.bbId} render={bbName} />
        <FilSel label="担当者" value={fil.assignee} onChange={v => setF("assignee", v)} options={opts.assignee} />
        <FilSel label="期限" value={fil.due} onChange={v => setF("due", v)} options={opts.due} />
        <FilSel label="状態" value={fil.status} onChange={v => setF("status", v)} options={["none", "shooting", "pending", "approved", "redo"]} render={s => M.STATUS[s].label} />
        {filActive && <button className="btn ghost sm" onClick={() => setFil({ workType: "all", area: "all", bbId: "all", assignee: "all", due: "all", status: "all" })}><Icon name="x" size={13} />クリア</button>}
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{filtered.length} 件</span>
        <button className="btn sm" style={{ marginLeft: "auto" }} onClick={() => setSel(allSel ? sel.filter(id => !visibleIds.includes(id)) : [...new Set([...sel, ...visibleIds])])}>{allSel ? "選択解除" : "表示中を全選択"}</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data">
            <thead><tr><th style={{ width: 36 }}></th><th>タスク名</th><th>工種</th><th>階/エリア</th><th>黒板</th><th>担当者</th><th>期限</th><th>状態</th></tr></thead>
            <tbody>{filtered.map(t => { const b = M.blackboards.find(x => x.id === t.bbId); return (
              <tr key={t.id} className={sel.includes(t.id) ? "sel" : ""} style={newId === t.id ? { background: "var(--st-approved-soft)" } : {}}>
                <td onClick={() => toggle(t.id)}><div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid " + (sel.includes(t.id) ? "var(--accent)" : "var(--line)"), background: sel.includes(t.id) ? "var(--accent)" : "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>{sel.includes(t.id) && <Icon name="check" size={12} color="#fff" />}</div></td>
                <td style={{ fontWeight: 600 }}>{t.name}{t.pinX != null && <Icon name="pin" size={13} color="var(--accent)" style={{ marginLeft: 6, verticalAlign: "-2px" }} />}{newId === t.id && <span className="chip" style={{ marginLeft: 8, background: "var(--st-approved-soft)", color: "var(--st-approved)", fontSize: 10 }}>新規</span>}</td><td>{t.workType}</td><td>{t.floor} {t.area}</td><td className="muted">{b && b.name}</td><td>{t.assignee}</td><td className="num">{t.due}</td><td><StatusBadge status={t.status} /></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </div>
      {creating && <CreateTaskModal onClose={() => setCreating(false)} onCreate={create} />}
      {published > 0 && <div className="pop-in" style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "11px 16px", borderRadius: 10, boxShadow: "var(--sh-3)", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, zIndex: 60 }}><Icon name="check" size={16} color="#86efac" />{published} 件のタスクをiPadへ発行しました</div>}
    </div>
  );
}

/* （改ざん検知機能は削除されました） */

/* ---------- AI黒板 / 配筋マーカー（拡張入口） ---------- */
function AiRebar() {
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)", gap: 18 }}>
      <div>
        <div className="row gap-8"><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>AI 黒板作成 / 配筋マーカー</h1><span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>拡張モジュール</span></div>
        <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>配筋リストや構造図からの黒板自動生成・豆図キャプチャー・配筋マーカー（順次提供予定）。</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {[
          { icon: "cpu", t: "AI 豆図付き黒板作成", d: "配筋リストをアップロードすると、AIが豆図位置を認識し自動で切り出して豆図付き黒板を生成します。", cta: "配筋リストをアップロード" },
          { icon: "ruler", t: "配筋リストから情報抽出", d: "構造図・配筋リストから種別・径・本数・ピッチを抽出し、黒板項目へ自動反映します。", cta: "リストを解析" },
          { icon: "grid", t: "配筋マーカー", d: "撮影写真上に配筋本数・径を自動マーキング。配筋検査の確認作業を効率化します。", cta: "マーカーを試す" },
        ].map(c => (
          <div key={c.t} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="center" style={{ width: 48, height: 48, borderRadius: 13, background: "var(--accent-soft)" }}><Icon name={c.icon} size={24} color="var(--accent-ink)" /></div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{c.t}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.6, flex: 1 }}>{c.d}</div>
            <button className="btn" style={{ alignSelf: "flex-start" }}>{c.cta}<Icon name="chevR" size={14} /></button>
          </div>
        ))}
      </div>
      {/* faux豆図 preview */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>プレビュー：配筋図からの豆図キャプチャー</div>
        <div className="row gap-20 wrap" style={{ alignItems: "center" }}>
          <div style={{ position: "relative", width: 280, height: 200, background: "#f7f5ee", borderRadius: 8, border: "1px solid #ddd", flex: "none" }}>
            <svg viewBox="0 0 280 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <g stroke="#2b4a8a" strokeWidth="1.5" fill="none">{[40, 80, 120, 160, 200, 240].map(x => <line key={x} x1={x} y1="20" x2={x} y2="180" />)}{[40, 80, 120, 160].map(y => <line key={y} x1="20" y1={y} x2="260" y2={y} />)}</g>
              <rect x="78" y="58" width="86" height="66" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="5 4" />
              <circle cx="121" cy="91" r="4" fill="var(--st-redo)" />
            </svg>
            <span className="chip" style={{ position: "absolute", left: 78, top: 38, background: "var(--accent)", color: "#fff", fontSize: 10 }}>AI検出: 柱C3</span>
          </div>
          <Icon name="chevR" size={22} color="var(--ink-4)" />
          <Blackboard data={{ workType: "配筋検査", subcategory: "帯筋 D13", design: "D13@100", actual: "D13@98", point: "No.2", location: "2F 柱 C3" }} scale={1.2} style={{ width: 280 }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- ユーザー権限 ---------- */
function Users() {
  const M = window.MOCK;
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)" }}>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>ユーザー / 権限管理</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>役割ごとに操作権限を制御。協力会社は自社タスクのみ操作可能です。</div></div>
        <button className="btn primary"><Icon name="plus" size={15} />ユーザー招待</button>
      </div>
      <div className="row gap-8 wrap" style={{ marginBottom: 14 }}>{M.roles.map(r => <span key={r} className="chip" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>{r}</span>)}</div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data">
          <thead><tr><th>氏名</th><th>メール</th><th>会社</th><th>役割</th><th>状態</th></tr></thead>
          <tbody>{M.users.map(u => (
            <tr key={u.email}><td><span className="row gap-8"><span className="center" style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 12, flex: "none" }}>{u.name[0]}</span><b>{u.name}</b></span></td>
              <td className="mono muted" style={{ fontSize: 12 }}>{u.email}</td><td>{u.company}</td><td><span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>{u.role}</span></td>
              <td>{u.status === "有効" ? <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}>有効</span> : <span className="chip" style={{ background: "var(--st-none-soft)", color: "var(--ink-3)" }}>{u.status}</span>}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- 操作ログ ---------- */
function Logs() {
  const M = window.MOCK;
  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)" }}>
      <div style={{ marginBottom: 18 }}><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>操作ログ</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>監査用の操作履歴。変更前後のデータも保持します。</div></div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data">
          <thead><tr><th>日時</th><th>ユーザー</th><th>操作</th><th>対象</th></tr></thead>
          <tbody>{M.auditLog.map((l, i) => (
            <tr key={i}><td className="num muted">{l.at}</td><td><b>{l.user}</b></td><td>{l.action}</td><td className="mono muted">{l.target}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- 勤怠履歴 ---------- */
function Attendance() {
  const M = window.MOCK;
  const store = usePhotoStore();
  const rows = store.attendance || [];
  const working = rows.filter(a => a.status === "working").length;
  const fmtDur = (a) => { if (!a.clockOut) return "—"; const [h1, m1] = a.clockIn.split(":").map(Number); const [h2, m2] = a.clockOut.split(":").map(Number); const mins = (h2 * 60 + m2) - (h1 * 60 + m1); return Math.floor(mins / 60) + "h" + String(mins % 60).padStart(2, "0"); };
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: "18px 26px 12px" }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>勤怠履歴</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>iPhone の出勤・退勤打刻がリアルタイムに記録されます。</div></div>
        <div className="row gap-8">
          <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}><span className="dot" style={{ background: "var(--st-approved)" }}></span>出勤中 {working}</span>
          <span className="chip" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>本日 {rows.filter(a => a.date === "2026/06/16").length} 名</span>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data">
            <thead><tr><th>氏名</th><th>役割</th><th>日付</th><th>出勤</th><th>退勤</th><th>実働</th><th>状態</th></tr></thead>
            <tbody>{rows.map(a => (
              <tr key={a.id}>
                <td><span className="row gap-8"><span className="center" style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 12, flex: "none" }}>{a.user[0]}</span><b>{a.user}</b></span></td>
                <td className="muted">{a.role}</td>
                <td className="num">{a.date}</td>
                <td className="num" style={{ fontWeight: 600 }}>{a.clockIn}</td>
                <td className="num" style={{ fontWeight: 600 }}>{a.clockOut || "—"}</td>
                <td className="num muted">{fmtDur(a)}</td>
                <td>{a.status === "working"
                  ? <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}><span className="dot" style={{ background: "var(--st-approved)" }}></span>出勤中</span>
                  : <span className="chip" style={{ background: "var(--st-none-soft)", color: "var(--ink-3)" }}>退勤済</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- スナップショット履歴（自動保存・2D/3D） ---------- */
function Plan2D({ label }) {
  return (
    <svg viewBox="0 0 320 220" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <rect x="22" y="20" width="276" height="180" fill="none" stroke="#2b4a8a" strokeWidth="2" />
      {[90, 158, 226].map(x => <line key={x} x1={x} y1="20" x2={x} y2="200" stroke="#9bb0d6" strokeWidth="1" />)}
      {[80, 140].map(y => <line key={y} x1="22" y1={y} x2="298" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
      <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="90" y="80" width="68" height="60" /><rect x="226" y="80" width="0" height="0" /></g>
      <text x="28" y="14" fill="#2b4a8a" fontSize="10" fontFamily="monospace">{label}</text>
    </svg>
  );
}
function Model3D({ label }) {
  return (
    <svg viewBox="0 0 320 220" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <g stroke="#5b7fc4" strokeWidth="1.4" fill="none" opacity="0.9">
        {/* iso grid floor */}
        <path d="M40 170 L160 120 L280 170 L160 220 Z" fill="#e8eefb" stroke="#9bb0d6" />
        {/* box 1 */}
        <path d="M110 150 L160 130 L210 150 L210 100 L160 80 L110 100 Z" fill="#dbe6fb" />
        <path d="M110 100 L160 80 L160 130 L110 150 Z" fill="#c7d8f6" />
        <path d="M210 100 L160 80 L160 130 L210 150 Z" fill="#b3c9f1" />
        {/* box 2 */}
        <path d="M170 165 L205 152 L240 165 L240 138 L205 125 L170 138 Z" fill="#dbe6fb" />
        <path d="M170 138 L205 125 L205 152 L170 165 Z" fill="#c7d8f6" />
        <path d="M240 138 L205 125 L205 152 L240 165 Z" fill="#b3c9f1" />
      </g>
      <text x="14" y="18" fill="#5b7fc4" fontSize="10" fontFamily="monospace">{label}</text>
    </svg>
  );
}
function Snapshots({ pushToast }) {
  const M = window.MOCK;
  const snaps = [
    { id: "SNAP-0612", at: "2026/06/12 16:40", by: "田中 美咲", note: "2F 配筋図 Rev.3 反映・補強筋追加", auto: true,
      files: [{ t: "2D", name: "2F 伏図（配筋）", no: "S-201 Rev.3" }, { t: "2D", name: "1F 平面図", no: "A-101 Rev.2" }, { t: "3D", name: "2F 配筋 3Dモデル", no: "BIM" }, { t: "3D", name: "全体構造", no: "IFC" }] },
    { id: "SNAP-0610", at: "2026/06/10 09:15", by: "佐藤 健一", note: "開口部 O1 位置修正", auto: true,
      files: [{ t: "2D", name: "2F 伏図（配筋）", no: "S-201 Rev.2" }, { t: "3D", name: "2F 配筋 3Dモデル", no: "BIM" }, { t: "3D", name: "設備ルート", no: "IFC" }] },
    { id: "SNAP-0605", at: "2026/06/05 14:20", by: "田中 美咲", note: "基礎伏図 確定版", auto: false,
      files: [{ t: "2D", name: "基礎伏図", no: "S-101 Rev.4" }, { t: "2D", name: "2F 伏図（配筋）", no: "S-201 Rev.1" }, { t: "3D", name: "全体構造", no: "IFC" }] },
    { id: "SNAP-0528", at: "2026/05/28 10:05", by: "高橋 由紀", note: "初期モデル登録", auto: true,
      files: [{ t: "2D", name: "1F 平面図", no: "A-101 Rev.1" }, { t: "3D", name: "全体構造", no: "IFC" }] },
  ];
  const [open, setOpen] = useStateW2(null);
  const [preview, setPreview] = useStateW2(null);
  const [cfg, setCfg] = useStateW2({ enabled: true, from: "08:00", to: "18:00", interval: "30", editing: false,
    milestones: [{ date: "2026/06/30", label: "2F 躯体完了" }, { date: "2026/07/31", label: "上棟" }, { date: "2026/09/30", label: "竣工" }] });
  const setC = (k, v) => setCfg(p => ({ ...p, [k]: v }));
  const [msDraft, setMsDraft] = useStateW2({ date: "", label: "" });
  const addMs = () => { if (!msDraft.label.trim()) return; setCfg(p => ({ ...p, milestones: [...p.milestones, { date: msDraft.date || "—", label: msDraft.label }] })); setMsDraft({ date: "", label: "" }); };
  const delMs = (i) => setCfg(p => ({ ...p, milestones: p.milestones.filter((_, x) => x !== i) }));
  const snap = open ? snaps.find(s => s.id === open) : null;

  if (snap) {
    return (
      <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)", position: "relative" }}>
        <div className="row spread" style={{ padding: "18px 26px 12px" }}>
          <div>
            <button className="btn ghost sm" onClick={() => setOpen(null)} style={{ marginBottom: 6, paddingLeft: 4 }}><Icon name="chevL" size={16} />スナップショット履歴に戻る</button>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{snap.id}</h1>
            <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>{snap.at} ・ {snap.by} ・ {snap.note}</div>
          </div>
          <button className="btn" onClick={() => pushToast && pushToast("この時点のモデルを復元しました。", "approved")}><Icon name="sync" size={15} />この版を復元</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16, alignContent: "start" }}>
          {snap.files.map((f, i) => (
            <button key={i} className="card fade-up" onClick={() => setPreview(f)} style={{ overflow: "hidden", display: "flex", flexDirection: "column", textAlign: "left", cursor: "pointer", padding: 0 }}>
              <div style={{ position: "relative", aspectRatio: "16/11", background: f.t === "3D" ? "#f2f6fe" : "#f7f5ee", borderBottom: "1px solid var(--line)" }}>
                {f.t === "3D" ? <Model3D label={f.no} /> : <Plan2D label={`${f.name} ${f.no}`} />}
                <span className="chip" style={{ position: "absolute", top: 8, left: 8, background: f.t === "3D" ? "var(--accent-soft)" : "#fff", color: f.t === "3D" ? "var(--accent-ink)" : "#2b4a8a", border: "1px solid var(--line)" }}>{f.t}</span>
              </div>
              <div style={{ padding: "11px 13px" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{f.name}</div>
                <div className="num muted" style={{ fontSize: 11, marginTop: 3 }}>{f.no}</div>
              </div>
            </button>
          ))}
        </div>
        {preview && (
          <div onClick={() => setPreview(null)} style={{ position: "absolute", inset: 0, background: "rgba(19,24,32,.5)", zIndex: 40, display: "grid", placeItems: "center", animation: "fadeIn .15s", padding: 24 }}>
            <div onClick={e => e.stopPropagation()} className="card pop-in" style={{ width: 720, maxWidth: "94vw", overflow: "hidden", boxShadow: "var(--sh-4)" }}>
              <div className="row spread" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
                <div className="row gap-8"><span className="chip" style={{ background: preview.t === "3D" ? "var(--accent-soft)" : "var(--st-none-soft)", color: preview.t === "3D" ? "var(--accent-ink)" : "var(--ink-2)" }}>{preview.t}</span><span style={{ fontWeight: 800, fontSize: 15 }}>{preview.name}　{preview.no}</span></div>
                <button className="btn ghost sm" onClick={() => setPreview(null)}><Icon name="x" size={18} /></button>
              </div>
              <div style={{ position: "relative", aspectRatio: "16/10", background: preview.t === "3D" ? "#f2f6fe" : "#f7f5ee" }}>
                {preview.t === "3D" ? <Model3D label={preview.no} /> : <Plan2D label={`${preview.name} ${preview.no}`} />}
                {preview.t === "3D" && <div className="row gap-6" style={{ position: "absolute", bottom: 12, right: 12 }}><span className="chip" style={{ background: "#fff", border: "1px solid var(--line)" }}><Icon name="move" size={13} />回転</span><span className="chip" style={{ background: "#fff", border: "1px solid var(--line)" }}><Icon name="zoomIn" size={13} />ズーム</span></div>}
              </div>
              <div className="row gap-8" style={{ padding: 14, borderTop: "1px solid var(--line)", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => pushToast && pushToast(`${preview.name} をダウンロードしました。`, "approved")}><Icon name="download" size={15} />ダウンロード</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: "18px 26px 12px" }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>スナップショット履歴</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>2D図面・3Dモデルを自動保存。保存時間帯・間隔を設定し、任意の時点へロールバックできます。</div></div>
        <button className="btn" onClick={() => setC("editing", !cfg.editing)}><Icon name="edit" size={15} />{cfg.editing ? "設定を閉じる" : "自動保存設定"}</button>
      </div>
      {/* 自動保存設定 */}
      <div style={{ padding: "0 26px 14px" }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="row spread" style={{ alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div className="row gap-10" style={{ alignItems: "center" }}>
              <button onClick={() => setC("enabled", !cfg.enabled)} style={{ width: 42, height: 24, borderRadius: 999, border: "none", cursor: "pointer", background: cfg.enabled ? "var(--st-approved)" : "var(--line)", position: "relative", transition: "background .15s" }}><span style={{ position: "absolute", top: 2, left: cfg.enabled ? 20 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "var(--sh-1)" }}></span></button>
              <span style={{ fontWeight: 700, fontSize: 14 }}>自動保存 {cfg.enabled ? "ON" : "OFF"}</span>
            </div>
            {cfg.editing ? (
              <div className="row gap-16 wrap" style={{ alignItems: "center" }}>
                <label className="row gap-6" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>保存時間帯
                  <input type="time" className="inp" value={cfg.from} onChange={e => setC("from", e.target.value)} style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }} />
                  <span>〜</span>
                  <input type="time" className="inp" value={cfg.to} onChange={e => setC("to", e.target.value)} style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }} />
                </label>
                <label className="row gap-6" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>保存間隔
                  <select className="inp" value={cfg.interval} onChange={e => setC("interval", e.target.value)} style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }}>
                    {["5", "10", "15", "30", "60", "120"].map(m => <option key={m} value={m}>{m} 分ごと</option>)}
                  </select>
                </label>
                <button className="btn primary sm" onClick={() => { setC("editing", false); pushToast && pushToast("自動保存設定を保存しました。", "approved"); }}><Icon name="check" size={14} color="#fff" />保存</button>
              </div>
            ) : (
              <div className="row gap-8 wrap">
                <span className="chip" style={{ background: "var(--bg-2)", color: "var(--ink-2)" }}><Icon name="clock" size={13} />{cfg.from}〜{cfg.to}</span>
                <span className="chip" style={{ background: "var(--bg-2)", color: "var(--ink-2)" }}><Icon name="sync" size={13} />{cfg.interval}分ごとに保存</span>
              </div>
            )}
          </div>
          {/* マイルストーン設計 */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-2)" }}>
            <div className="row gap-6" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 10 }}><Icon name="board" size={15} color="var(--accent-ink)" />マイルストーン設計<span className="muted" style={{ fontWeight: 400 }}>（節目で自動的に確定スナップショットを作成）</span></div>
            <div className="row gap-8 wrap" style={{ alignItems: "center" }}>
              {cfg.milestones.map((m, i) => (
                <span key={i} className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", paddingRight: cfg.editing ? 4 : 10 }}>
                  <Icon name="pin" size={13} color="var(--accent-ink)" /><span className="num">{m.date}</span> {m.label}
                  {cfg.editing && <button className="btn ghost sm" onClick={() => delMs(i)} style={{ padding: "2px 4px", marginLeft: 2 }}><Icon name="x" size={12} /></button>}
                </span>
              ))}
              {cfg.milestones.length === 0 && <span className="muted" style={{ fontSize: 12 }}>マイルストーン未設定</span>}
            </div>
            {cfg.editing && (
              <div className="row gap-8" style={{ marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input type="date" className="inp" value={msDraft.date ? msDraft.date.replace(/\//g, "-") : ""} onChange={e => setMsDraft(d => ({ ...d, date: e.target.value.replace(/-/g, "/") }))} style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }} />
                <input className="inp" value={msDraft.label} onChange={e => setMsDraft(d => ({ ...d, label: e.target.value }))} placeholder="マイルストーン名（例：配筋完了）" style={{ width: 220, padding: "5px 10px", fontSize: 12.5 }} />
                <button className="btn sm" onClick={addMs}><Icon name="plus" size={14} />追加</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px" }}>
        <div className="col" style={{ position: "relative", paddingLeft: 22 }}>
          <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 2, background: "var(--line)" }}></div>
          {snaps.map((s, i) => (
            <div key={s.id} className="fade-up" style={{ position: "relative", marginBottom: 14 }}>
              <div style={{ position: "absolute", left: -22, top: 22, width: 12, height: 12, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--surface)", border: "2px solid " + (i === 0 ? "var(--accent)" : "var(--line)") }}></div>
              <button className="card" onClick={() => setOpen(s.id)} style={{ width: "100%", textAlign: "left", cursor: "pointer", padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                <div className="center" style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-soft)", flex: "none" }}><Icon name="layers" size={22} color="var(--accent-ink)" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row gap-8" style={{ alignItems: "center" }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 13.5 }}>{s.id}</span>
                    {i === 0 && <span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", fontSize: 10 }}>最新</span>}
                    {s.auto ? <span className="chip" style={{ background: "var(--st-none-soft)", color: "var(--ink-3)", fontSize: 10 }}>自動保存</span> : <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)", fontSize: 10 }}>確定版</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{s.note}</div>
                  <div className="num muted" style={{ fontSize: 11.5, marginTop: 3 }}>{s.at} ・ {s.by}</div>
                </div>
                <div className="row gap-6" style={{ flex: "none" }}>
                  <span className="chip" style={{ background: "var(--st-none-soft)", color: "#2b4a8a" }}>2D {s.files.filter(f => f.t === "2D").length}</span>
                  <span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>3D {s.files.filter(f => f.t === "3D").length}</span>
                  {i !== 0 && <span onClick={e => { e.stopPropagation(); pushToast && pushToast(`${s.id}（${s.at}）の状態へロールバックしました。`, "approved"); }} className="chip" style={{ cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-2)" }}><Icon name="sync" size={13} />ロールバック</span>}
                  <Icon name="chevR" size={18} color="var(--ink-4)" />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 図面・資料一覧 ---------- */
function DocsLibrary({ pushToast }) {
  const M = window.MOCK;
  const base = [
    ...M.drawings.map(d => ({ id: d.id, name: `${d.name}（${d.number}）`, cat: "図面", floor: d.floor, ver: d.version, by: d.by, at: d.at, fmt: "PDF" })),
    { id: "DOC-1", name: "施工計画書 第3版", cat: "資料", floor: "—", ver: "v3", by: "佐藤 健一", at: "2026/05/30 09:00", fmt: "PDF" },
    { id: "DOC-2", name: "鉄筋 仕様書", cat: "資料", floor: "—", ver: "v1", by: "田中 美咲", at: "2026/05/20 14:10", fmt: "PDF" },
    { id: "DOC-3", name: "配筋リスト 2F", cat: "資料", floor: "2F", ver: "v2", by: "田中 美咲", at: "2026/06/05 11:00", fmt: "Excel" },
    { id: "DOC-4", name: "製品カタログ（止水板）", cat: "その他", floor: "—", ver: "—", by: "高橋 由紀", at: "2026/05/15 16:30", fmt: "PDF" },
  ];
  const [docs] = useStateW2(base);
  const [cat, setCat] = useStateW2("all");
  const [q, setQ] = useStateW2("");
  const cats = ["図面", "資料", "その他"];
  const list = docs.filter(d => (cat === "all" || d.cat === cat) && (q === "" || d.name.includes(q)));
  const catColor = { "図面": "var(--accent)", "資料": "var(--st-approved)", "その他": "var(--ink-3)" };
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: "18px 26px 12px" }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>図面・資料一覧</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>設計図・仕様書・配筋リストなどをアップロードし、現場・管理で閲覧できます。</div></div>
        <button className="btn primary" onClick={() => pushToast && pushToast("ファイルをアップロードしました。", "approved")}><Icon name="upload" size={15} />アップロード</button>
      </div>
      <div className="row gap-12" style={{ padding: "0 26px 12px", flexWrap: "wrap", alignItems: "center" }}>
        {[["all", "すべて"], ...cats.map(c => [c, c])].map(([k, label]) => (
          <button key={k} className={"btn sm" + (cat === k ? " primary" : "")} onClick={() => setCat(k)}>{label}{k !== "all" && <span className="num" style={{ marginLeft: 4, opacity: .7 }}>{docs.filter(d => d.cat === k).length}</span>}</button>
        ))}
        <div className="row gap-8" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 9, padding: "6px 11px", minWidth: 220, marginLeft: "auto" }}>
          <Icon name="search" size={16} color="var(--ink-4)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ファイル名で検索" style={{ border: "none", background: "none", outline: "none", flex: 1, fontSize: 13 }} />
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16, alignContent: "start" }}>
        {list.map(d => (
          <div key={d.id} className="card fade-up" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", aspectRatio: "4/3", background: "#f7f5ee", borderBottom: "1px solid var(--line)" }}>
              {d.cat === "図面" ? (
                <svg viewBox="0 0 320 240" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <rect x="24" y="20" width="272" height="200" fill="none" stroke="#2b4a8a" strokeWidth="2" />
                  {[90, 156, 222].map(x => <line key={x} x1={x} y1="20" x2={x} y2="220" stroke="#9bb0d6" strokeWidth="1" />)}
                  {[80, 140].map(y => <line key={y} x1="24" y1={y} x2="296" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
                  <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="90" y="80" width="66" height="60" /><rect x="222" y="80" width="0" height="0" /></g>
                  <text x="30" y="14" fill="#2b4a8a" fontSize="11" fontFamily="monospace">{d.name}</text>
                </svg>
              ) : (
                <div className="center" style={{ position: "absolute", inset: 0 }}>
                  <div className="center" style={{ width: 64, height: 80, borderRadius: 8, background: "#fff", border: "1px solid var(--line)", boxShadow: "var(--sh-1)", flexDirection: "column", gap: 6 }}>
                    <Icon name="file" size={30} color={d.fmt === "Excel" ? "var(--st-approved)" : "var(--st-redo)"} />
                    <span className="num" style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-4)" }}>{d.fmt}</span>
                  </div>
                </div>
              )}
              <span className="chip" style={{ position: "absolute", top: 8, left: 8, background: "#fff", color: catColor[d.cat], border: "1px solid var(--line)" }}>{d.cat}</span>
            </div>
            <div style={{ padding: "11px 13px", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>{d.name}</div>
              <div className="num muted" style={{ fontSize: 11, marginTop: 4 }}>{d.floor !== "—" && d.floor + " ・ "}{d.ver} ・ {d.by}</div>
              <div className="num muted" style={{ fontSize: 11, marginTop: 2 }}>{d.at}</div>
              <div className="row gap-6" style={{ marginTop: 10 }}>
                <button className="btn sm" style={{ flex: 1 }} onClick={() => pushToast && pushToast(`${d.name} を表示しました。`, "approved")}><Icon name="eye" size={14} />閲覧</button>
                <button className="btn ghost sm" title="ダウンロード" onClick={() => pushToast && pushToast(`${d.name} をダウンロードしました。`, "approved")}><Icon name="download" size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Toast ---------- */
function Toasts({ items }) {
  return (
    <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 60 }}>
      {items.map(t => { const s = window.MOCK.STATUS[t.kind]; return (
        <div key={t.id} className="pop-in" style={{ background: "var(--ink)", color: "#fff", padding: "11px 16px", borderRadius: 10, boxShadow: "var(--sh-3)", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: s ? s.color : "#fff" }}></span>{t.msg}
        </div>
      ); })}
    </div>
  );
}

/* ---------- Web shell ---------- */
function WebApp() {
  const [scr, setScr] = useStateW2("dash");
  const [toasts, setToasts] = useStateW2([]);
  const [csvTemplate, setCsvTemplate] = useStateW2(null);
  const pushToast = (msg, kind) => { const id = Date.now() + Math.random(); setToasts(t => [...t, { id, msg, kind }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200); };

  const nav = [
    { k: "dash", icon: "dash", label: "ダッシュボード" },
    { k: "docs", icon: "folder", label: "図面・資料一覧" },
    { k: "snapshots", icon: "layers", label: "スナップショット履歴" },
    { k: "attendance", icon: "clock", label: "勤怠履歴" },
    { sec: "黒板" },
    { k: "templates", icon: "board", label: "黒板管理" },
    { k: "photos", icon: "grid", label: "工事写真管理" },
    { sec: "帳票" },
    { k: "ftpl", icon: "list", label: "帳票テンプレート" },
    { k: "fsubmit", icon: "file", label: "帳票管理" },
  ];

  const M = window.MOCK;
  let body;
  if (scr === "dash") body = <Dashboard go={setScr} />;
  else if (scr === "projects") body = <Projects />;
  else if (scr === "drawings") body = <Drawings />;
  else if (scr === "templates") body = <Templates go={setScr} onUse={(t) => { setCsvTemplate(t); setScr("csv"); }} />;
  else if (scr === "csv") body = <CsvWizard template={csvTemplate} onBack={() => setScr("templates")} />;
  else if (scr === "tasks") body = <Tasks />;
  else if (scr === "photos") body = <PhotoManager pushToast={pushToast} go={setScr} />;
  else if (scr === "docs") body = <DocsLibrary pushToast={pushToast} />;
  else if (scr === "snapshots") body = <Snapshots pushToast={pushToast} />;
  else if (scr === "attendance") body = <Attendance />;
  else if (scr === "ftpl") body = <FormTemplates pushToast={pushToast} />;
  else if (scr === "fsubmit") body = <FormSubmissions pushToast={pushToast} />;
  else if (scr === "issues") body = <Issues pushToast={pushToast} />;
  else if (scr === "ledger") body = <LedgerWizard onBack={() => setScr("photos")} />;
  else if (scr === "ai") body = <AiRebar />;
  else if (scr === "users") body = <Users />;
  else if (scr === "logs") body = <Logs />;

  return (
    <div className="row" style={{ height: "100%", minHeight: 0, alignItems: "stretch" }}>
      {/* sidebar */}
      <div className="col" style={{ width: 232, background: "#11161f", color: "#cfd6e2", flex: "none", overflow: "auto" }}>
        <div className="row gap-10" style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div className="center" style={{ width: 34, height: 34, borderRadius: 9, background: "#fff", flex: "none", overflow: "hidden" }}><img src="assets/buildbase-mark.png" alt="BuildBase" style={{ width: 27, height: 27, objectFit: "contain" }} /></div>
          <div style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 14, color: "#fff", lineHeight: 1.1 }}>BuildBase</div><div style={{ fontSize: 10.5, color: "#7e8aa0" }}>工事写真管理</div></div>
        </div>
        <div className="col" style={{ padding: "10px 10px", gap: 2 }}>
          {nav.map((n, i) => {
            if (n.sec) return <div key={"s" + i} style={{ fontSize: 10.5, fontWeight: 700, color: "#6b7689", padding: "12px 10px 5px", letterSpacing: ".04em" }}>{n.sec}</div>;
            const active = scr === n.k || (n.k === "templates" && scr === "csv") || (n.k === "photos" && scr === "ledger");
            return (
            <button key={n.k} onClick={() => setScr(n.k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", background: active ? "var(--accent)" : "transparent", color: active ? "#fff" : "#cfd6e2", fontSize: 13, fontWeight: 600, transition: "background .12s" }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.06)"; }} onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <Icon name={n.icon} size={17} color={active ? "#fff" : "#9aa6ba"} />{n.label}
              {n.ext && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, background: "rgba(255,255,255,.12)", padding: "1px 5px", borderRadius: 4 }}>EXT</span>}
            </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }}></div>
        <div className="row gap-8" style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <span className="center" style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 12 }}>田</span>
          <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, color: "#fff", fontWeight: 600 }}>田中 美咲</div><div style={{ fontSize: 10.5, color: "#7e8aa0" }}>案件管理者</div></div>
        </div>
      </div>
      {/* content */}
      <div className="col web-body" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>{body}</div>
      <Toasts items={toasts} />
    </div>
  );
}

window.WebApp = WebApp;
