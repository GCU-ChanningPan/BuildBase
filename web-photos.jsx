/* ============================================================
   Web admin — 工事写真管理 + 写真確認/差戻し + 写真台帳作成
   Exports → window: PhotoManager, LedgerWizard
   ============================================================ */
const { useState: useStateP } = React;

const REASONS = ["写真が不鮮明", "黒板情報に誤り", "黒板が対象物を隠している", "撮影位置が違う", "実測値が未入力", "必要写真が不足", "重複写真", "図面位置が違う"];

function PhotoCard({ p, b, onClick, selectable, sel, onSel }) {
  return (
    <div className="card fade-up" style={{ overflow: "hidden", cursor: "pointer", position: "relative", boxShadow: "var(--sh-1)" }} onClick={onClick}>
      <div style={{ position: "relative", aspectRatio: "4/3" }}>
        <PhotoFrame hue={p.hue} rounded={0} style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", right: 6, bottom: 6, width: "42%", transform: "scale(1)" }}><Blackboard data={b} scale={0.62} variant="compact" /></div>

        {selectable && <div onClick={e => { e.stopPropagation(); onSel(); }} style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 6, background: sel ? "var(--accent)" : "rgba(255,255,255,.85)", border: "2px solid " + (sel ? "var(--accent)" : "#fff"), display: "grid", placeItems: "center" }}>{sel && <Icon name="check" size={15} color="#fff" />}</div>}
      </div>
      <div style={{ padding: "9px 11px" }}>
        <div style={{ fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b && b.name}</div>
        <div className="num" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>{p.id} ・ {p.shooter} ・ {p.takenAt}</div>
      </div>
    </div>
  );
}

function ReviewDrawer({ photo, onClose }) {
  const M = window.MOCK;
  const b = M.blackboards.find(x => x.id === photo.bbId);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.4)", zIndex: 40, display: "flex", justifyContent: "flex-end", animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: "94vw", background: "var(--surface)", height: "100%", overflow: "auto", boxShadow: "var(--sh-4)", animation: "slideL .25s cubic-bezier(.2,.7,.3,1)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
          <div className="row gap-10"><Icon name="grid" size={18} color="var(--accent)" /><span style={{ fontWeight: 800, fontSize: 16 }}>{b && b.name}</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", boxShadow: "var(--sh-2)" }}>
            <PhotoFrame hue={photo.hue} rounded={12} style={{ position: "absolute", inset: 0 }} label={`${photo.id} 原図 4032×3024`} />
            <div style={{ position: "absolute", right: 12, bottom: 12, width: "40%" }}><Blackboard data={b} scale={0.85} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            {[["工種", b.workType], ["施工箇所", b.location], ["測点", b.point], ["設計値", b.design], ["実測値", b.actual], ["撮影者", photo.shooter], ["撮影日時", photo.takenAt], ["GPS", photo.gps]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 11px" }}>
                <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontWeight: 700 }}>{k}</div>
                <div className={["設計値", "実測値", "測点", "GPS"].includes(k) ? "mono" : ""} style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoManager({ pushToast, go }) {
  const M = window.MOCK;
  const store = usePhotoStore();
  const [photos, setPhotos] = useStateP(M.photos.map(p => ({ ...p })));
  const [view, setView] = useStateP("grid");
  const [filter, setFilter] = useStateP("all");
  const [active, setActive] = useStateP(null);
  const [sel, setSel] = useStateP([]);
  const [fil, setFil] = useStateP({ workType: "all", category: "all", site: "all" });
  const setF = (k, v) => setFil(p => ({ ...p, [k]: v }));

  const confirmed = store.photos.filter(p => p.status === "approved");
  const allPhotos = [...confirmed, ...photos];
  const bbOf = (p) => M.blackboards.find(b => b.id === p.bbId) || {};
  const siteOf = (p) => bbOf(p).site || "湾岸ロジ新築";
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const wtOpts = uniq(allPhotos.map(p => bbOf(p).workType));
  const catOpts = uniq(allPhotos.map(p => bbOf(p).category));
  const siteOpts = uniq(allPhotos.map(siteOf));
  const filActive = fil.workType !== "all" || fil.category !== "all" || fil.site !== "all";
  const clearFil = () => setFil({ workType: "all", category: "all", site: "all" });
  const filters = [["all", "すべて"], ["none", "未撮影"], ["shot", "撮影済み"]];
  const list = allPhotos.filter(p => {
    const b = bbOf(p);
    return (filter === "all" || boardStatus(p.status) === filter)
      && (fil.workType === "all" || b.workType === fil.workType)
      && (fil.category === "all" || b.category === fil.category)
      && (fil.site === "all" || siteOf(p) === fil.site);
  });
  const counts = (k) => allPhotos.filter(p => boardStatus(p.status) === k).length;

  function reject(p, reason, comment) { setPhotos(ps => ps.map(x => x.id === p.id ? { ...x, status: "redo", reason, comment } : x)); setActive(null); }

  const visibleIds = list.map(p => p.id);
  const toggleSel = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => sel.includes(id));
  function delSelected() { setPhotos(ps => ps.filter(p => !sel.includes(p.id))); pushToast(`${sel.length} 件の写真を削除しました。`, "redo"); setSel([]); }

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: "18px 26px 12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>工事写真管理</h1>
          <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>黒板ごとに自動整理された写真を確認・整理します。</div>
        </div>
        <div className="row gap-8">
          {sel.length > 0 && <button className="btn danger sm" onClick={delSelected}><Icon name="x" size={14} color="var(--st-redo)" />選択を削除（{sel.length}）</button>}
          <button className="btn sm" disabled={sel.length === 0} style={sel.length === 0 ? { opacity: .5 } : {}}><Icon name="download" size={14} />一括ダウンロード{sel.length > 0 && `（${sel.length}）`}</button>
          {sel.length > 0 && <>
            <span style={{ width: 1, background: "var(--line)", margin: "4px 2px" }}></span>
            <button className="btn sm" onClick={() => pushToast(`${sel.length} 枚で写真台帳を作成し、Excelで出力しました。`, "approved")}><Icon name="table" size={14} />台帳Excel</button>
            <button className="btn primary sm" onClick={() => pushToast(`${sel.length} 枚で写真台帳を作成し、PDFで出力しました。`, "approved")}><Icon name="table" size={14} />台帳PDF作成</button>
          </>}
        </div>
      </div>
      <div className="row gap-8" style={{ padding: "0 26px 12px", flexWrap: "wrap", alignItems: "center" }}>
        <Icon name="filter" size={15} color="var(--ink-4)" />
        <label className="row gap-6" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>工種<select className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 12.5 }} value={fil.workType} onChange={e => setF("workType", e.target.value)}><option value="all">すべて</option>{wtOpts.map(w => <option key={w}>{w}</option>)}</select></label>
        <label className="row gap-6" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>種別<select className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 12.5 }} value={fil.category} onChange={e => setF("category", e.target.value)}><option value="all">すべて</option>{catOpts.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="row gap-6" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>現場<select className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 12.5 }} value={fil.site} onChange={e => setF("site", e.target.value)}><option value="all">すべて</option>{siteOpts.map(s => <option key={s}>{s}</option>)}</select></label>
        {filActive && <button className="btn ghost sm" onClick={clearFil}><Icon name="x" size={13} />クリア</button>}
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{list.length} 件</span>
        <div className="row gap-8" style={{ marginLeft: "auto", alignItems: "center" }}>
          <button className="btn sm" onClick={() => setSel(allSelected ? [] : visibleIds)}>{allSelected ? "選択解除" : "表示中を全選択"}</button>
          {sel.length > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-ink)" }}>{sel.length} 件選択中</span>}
          <div className="row gap-4">
            <button className="btn ghost sm" onClick={() => setView("grid")} style={{ background: view === "grid" ? "var(--bg-2)" : undefined }}><Icon name="grid" size={16} /></button>
            <button className="btn ghost sm" onClick={() => setView("list")} style={{ background: view === "list" ? "var(--bg-2)" : undefined }}><Icon name="list" size={16} /></button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px" }}>
        {list.length === 0 ? (
          <div className="muted" style={{ padding: 40, textAlign: "center", fontSize: 13 }}>該当する写真はありません。{filActive && <> <button className="btn ghost sm" onClick={clearFil} style={{ marginLeft: 6 }}><Icon name="x" size={13} />フィルターをクリア</button></>}</div>
        ) : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
            {list.map(p => <PhotoCard key={p.id} p={p} b={M.blackboards.find(b => b.id === p.bbId)} selectable sel={sel.includes(p.id)} onSel={() => toggleSel(p.id)} onClick={() => setActive(p)} />)}
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data">
              <thead><tr><th style={{ width: 36 }}></th><th>写真</th><th>黒板</th><th>工種</th><th>施工箇所</th><th>撮影者</th><th>撮影日時</th></tr></thead>
              <tbody>
                {list.map(p => { const b = M.blackboards.find(x => x.id === p.bbId); return (
                  <tr key={p.id} onClick={() => setActive(p)} style={{ cursor: "pointer" }} className={sel.includes(p.id) ? "sel" : ""}>
                    <td onClick={e => { e.stopPropagation(); toggleSel(p.id); }}><div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid " + (sel.includes(p.id) ? "var(--accent)" : "var(--line)"), background: sel.includes(p.id) ? "var(--accent)" : "#fff", display: "grid", placeItems: "center" }}>{sel.includes(p.id) && <Icon name="check" size={12} color="#fff" />}</div></td>
                    <td><PhotoFrame hue={p.hue} style={{ width: 56, height: 42 }} /></td>
                    <td style={{ fontWeight: 600 }}>{b && b.name}</td><td>{b && b.workType}</td><td>{b && b.location}</td><td>{p.shooter}</td><td className="num">{p.takenAt}</td>
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {active && <ReviewDrawer photo={photos.find(p => p.id === active.id) || active} onClose={() => setActive(null)} />}
    </div>
  );
}

/* ---------- 写真台帳作成 ---------- */
function LedgerWizard({ onBack }) {
  const M = window.MOCK;
  const [step, setStep] = useStateP(0);
  const [type, setType] = useStateP(M.ledgerTypes[0]);
  const approved = M.photos.filter(p => p.status === "approved");
  const [sel, setSel] = useStateP(approved.map(p => p.id));
  const steps = ["対象を選択", "写真を選択", "台帳プレビュー"];
  const chosen = approved.filter(p => sel.includes(p.id));

  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)" }}>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div>
          <button className="btn ghost sm" onClick={onBack} style={{ marginBottom: 6, paddingLeft: 4 }}><Icon name="chevL" size={16} />工事写真管理に戻る</button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>写真台帳作成</h1>
          <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>確認済み写真を選ぶと黒板情報がコメント欄へ自動反映され、台帳を一括生成します。</div>
        </div>
        {step === 2 && <div className="row gap-8">
          <button className="btn"><Icon name="table" size={15} />Excel 出力</button>
          <button className="btn primary"><Icon name="file" size={15} />PDF 出力</button>
        </div>}
      </div>
      <div className="card" style={{ padding: 24 }}>
        <Stepper steps={steps} cur={step} />
        {step === 0 && (
          <div className="fade-up">
            <label className="fld" style={{ maxWidth: 360, marginBottom: 18 }}>台帳種別
              <select className="inp" value={type} onChange={e => setType(e.target.value)}>{M.ledgerTypes.map(t => <option key={t}>{t}</option>)}</select>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 640 }}>
              {[["案件", M.project.name.slice(0, 12) + "…"], ["工種", "配筋検査"], ["階", "2F"], ["期間", "2026/06/01〜06/09"], ["対象写真", `確認済み ${approved.length} 枚`], ["並び順", "測点 昇順（自動）"]].map(([k, v]) => (
                <div key={k} className="card" style={{ padding: 12, boxShadow: "none", background: "var(--bg)" }}><div style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700 }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{v}</div></div>
              ))}
            </div>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 22 }}><button className="btn primary" onClick={() => setStep(1)}>次へ：写真を選択<Icon name="chevR" size={15} /></button></div>
          </div>
        )}
        {step === 1 && (
          <div className="fade-up">
            <div className="row spread" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>確認済み写真 {approved.length} 枚 / 選択 {sel.length} 枚</span>
              <button className="btn sm" onClick={() => setSel(sel.length === approved.length ? [] : approved.map(p => p.id))}>{sel.length === approved.length ? "全解除" : "全選択"}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
              {approved.map(p => <PhotoCard key={p.id} p={p} b={M.blackboards.find(b => b.id === p.bbId)} selectable sel={sel.includes(p.id)} onClick={() => {}} onSel={() => setSel(s => s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id])} />)}
            </div>
            <div className="row spread" style={{ marginTop: 22 }}><button className="btn" onClick={() => setStep(0)}><Icon name="chevL" size={15} />戻る</button><button className="btn primary" onClick={() => setStep(2)}>黒板情報を反映してプレビュー<Icon name="chevR" size={15} /></button></div>
          </div>
        )}
        {step === 2 && (
          <div className="fade-up">
            <div className="row gap-8" style={{ marginBottom: 12, fontSize: 12.5, color: "var(--st-approved)", fontWeight: 600 }}><Icon name="check" size={15} color="var(--st-approved)" />黒板情報をコメント欄へ一括反映しました（{chosen.length}件）</div>
            {/* A4-ish ledger sheet preview */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: 24, maxWidth: 740, margin: "0 auto", boxShadow: "var(--sh-2)" }}>
              <div className="row spread" style={{ borderBottom: "2px solid var(--ink)", paddingBottom: 10 }}>
                <div><div style={{ fontWeight: 800, fontSize: 17 }}>{type}</div><div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{M.project.name}</div></div>
                <div className="num" style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "right" }}>施工会社: {M.project.contractor}<br />作成日: 2026/06/09</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                {chosen.slice(0, 4).map(p => { const b = M.blackboards.find(x => x.id === p.bbId); return (
                  <div key={p.id} style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ position: "relative", aspectRatio: "4/3" }}>
                      <PhotoFrame hue={p.hue} rounded={0} style={{ position: "absolute", inset: 0 }} />
                      <div style={{ position: "absolute", right: 6, bottom: 6, width: "44%" }}><Blackboard data={b} scale={0.6} variant="compact" /></div>
                    </div>
                    <div style={{ padding: "8px 10px", fontSize: 11 }}>
                      <div style={{ fontWeight: 700 }}>{b.location}</div>
                      <div className="row spread mono" style={{ color: "var(--ink-3)", marginTop: 3 }}><span>測点 {b.point}</span><span>{p.takenAt.slice(0, 10)}</span></div>
                      <div className="mono" style={{ color: "var(--ink-3)" }}>設計 {b.design} / 実測 {b.actual}</div>
                      <div style={{ marginTop: 4, color: "var(--ink-2)" }}>コメント: {b.subcategory} 検査 OK</div>
                    </div>
                  </div>
                ); })}
              </div>
              <div className="num" style={{ textAlign: "right", fontSize: 11, color: "var(--ink-4)", marginTop: 14 }}>— 1 / {Math.ceil(chosen.length / 4)} ページ ・ 全 {chosen.length} 枚 —</div>
            </div>
            <div className="row spread" style={{ marginTop: 22 }}>
              <button className="btn" onClick={() => setStep(1)}><Icon name="chevL" size={15} />戻る</button>
              <div className="row gap-10"><button className="btn"><Icon name="table" size={15} />Excel 出力</button><button className="btn primary"><Icon name="file" size={15} />PDF 出力</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PhotoManager, LedgerWizard, Stepper });
