/* ============================================================
   Web admin — 指摘・是正報告 + 帳票出力・保管・検索
   Exports → window: Issues, FormExport
   ============================================================ */
const { useState: useStateFm2 } = React;

/* ---------- 指摘・是正 ---------- */
function IssueDrawer({ issue, onClose, onApproveDone, onComment }) {
  const M = window.MOCK;
  const st = M.ISSUE_STATUS[issue.status];
  const sev = M.SEVERITY[issue.severity];
  const [txt, setTxt] = useStateFm2("");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,24,32,.4)", zIndex: 40, display: "flex", justifyContent: "flex-end", animation: "fadeIn .15s" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 580, maxWidth: "94vw", background: "var(--surface)", height: "100%", overflow: "auto", boxShadow: "var(--sh-4)", animation: "slideL .25s cubic-bezier(.2,.7,.3,1)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
          <div className="row gap-10"><Pill def={st} size="lg" /><span className="mono muted" style={{ fontSize: 12 }}>{issue.id}</span></div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div className="row gap-8" style={{ marginBottom: 10 }}>
            <span className="chip" style={{ background: sev.soft, color: sev.color }}>重要度: {sev.label}</span>
            {issue.pinId && <span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}><Icon name="pin" size={12} color="var(--accent-ink)" />{issue.pinId}</span>}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.5 }}>{issue.content}</div>
          <div className="row gap-16 wrap" style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "12px 0 16px" }}>
            <span className="row gap-6"><Icon name="pin" size={14} />{issue.location}</span>
            <span className="row gap-6"><Icon name="building" size={14} />{issue.company} / {issue.assignee}</span>
            <span className="row gap-6 num"><Icon name="clock" size={14} />期限 {issue.due}</span>
          </div>
          {/* before / after photos */}
          <div className="row gap-12" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>是正前写真</div>
              <PhotoFrame hue={issue.hueBefore} style={{ width: "100%", aspectRatio: "4/3" }} label="BEFORE" rounded={8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>是正後写真</div>
              {issue.hueAfter != null
                ? <PhotoFrame hue={issue.hueAfter} style={{ width: "100%", aspectRatio: "4/3" }} label="AFTER" rounded={8} />
                : <div className="center" style={{ width: "100%", aspectRatio: "4/3", borderRadius: 8, border: "2px dashed var(--line)", color: "var(--ink-4)", fontSize: 12 }}>未提出</div>}
            </div>
          </div>
          {/* comment history */}
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>コメント履歴</div>
          <div className="col gap-8" style={{ marginBottom: 14 }}>
            {issue.comments.length === 0 && <div className="muted" style={{ fontSize: 12.5 }}>コメントはまだありません。</div>}
            {issue.comments.map((c, i) => (
              <div key={i} className="card" style={{ padding: "9px 12px", boxShadow: "none", background: "var(--bg)" }}>
                <div className="row spread"><b style={{ fontSize: 12.5 }}>{c.by}</b><span className="num muted" style={{ fontSize: 11 }}>{c.at}</span></div>
                <div style={{ fontSize: 13, marginTop: 3 }}>{c.text}</div>
              </div>
            ))}
          </div>
          <div className="row gap-8" style={{ marginBottom: 16 }}>
            <input className="inp" placeholder="コメントを追加" value={txt} onChange={e => setTxt(e.target.value)} />
            <button className="btn" disabled={!txt.trim()} onClick={() => { onComment(issue, txt); setTxt(""); }}>送信</button>
          </div>
          {issue.status === "checking" && (
            <div className="row gap-10">
              <button className="btn danger" style={{ flex: 1 }} onClick={() => onApproveDone(issue, "returned")}><Icon name="redo" size={16} color="var(--st-redo)" />差戻し</button>
              <button className="btn primary" style={{ flex: 2, background: "var(--st-approved)", borderColor: "var(--st-approved)" }} onClick={() => onApproveDone(issue, "done")}><Icon name="check" size={17} />確認して完了 / 是正報告書を作成</button>
            </div>
          )}
          {issue.status === "done" && <div className="card" style={{ padding: 12, background: "var(--st-approved-soft)", boxShadow: "none", fontSize: 12.5, color: "var(--st-approved)", fontWeight: 600 }}><Icon name="checkCircle" size={15} color="var(--st-approved)" /> 完了。是正報告書を出力できます。</div>}
        </div>
      </div>
    </div>
  );
}

function Issues({ pushToast }) {
  const M = window.MOCK;
  const [issues, setIssues] = useStateFm2(M.issues.map(i => ({ ...i, comments: [...i.comments] })));
  const [status, setStatus] = useStateFm2("all");
  const [company, setCompany] = useStateFm2("all");
  const [active, setActive] = useStateFm2(null);
  const companies = [...new Set(issues.map(i => i.company))];
  const list = issues.filter(i => (status === "all" || i.status === status) && (company === "all" || i.company === company));
  const liveActive = active ? issues.find(i => i.id === active.id) : null;
  const setDone = (issue, to) => { setIssues(is => is.map(x => x.id === issue.id ? { ...x, status: to } : x)); setActive(null); pushToast(to === "done" ? "完了にしました。是正報告書を作成しました。" : "差戻しました。協力会社へ通知しました。", to === "done" ? "approved" : "redo"); };
  const addComment = (issue, text) => setIssues(is => is.map(x => x.id === issue.id ? { ...x, comments: [...x.comments, { by: "田中 美咲", at: "06/09 now", text }] } : x));
  const cnt = (k) => issues.filter(i => i.status === k).length;
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: "18px 26px 12px" }}>
        <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>指摘・是正</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>発見 → 指示 → 是正 → 確認 → 是正報告書を一元管理します。</div></div>
        <button className="btn primary"><Icon name="plus" size={15} />指摘を登録</button>
      </div>
      <div className="row gap-12" style={{ padding: "0 26px 12px", flexWrap: "wrap", alignItems: "center" }}>
        {[["all", "すべて", cnt("open") + cnt("doing") + cnt("checking") + cnt("done")], ["open", "未対応", cnt("open")], ["doing", "対応中", cnt("doing")], ["checking", "確認待ち", cnt("checking")], ["done", "完了", cnt("done")]].map(([k, label, c]) => (
          <button key={k} className={"btn sm" + (status === k ? " primary" : "")} onClick={() => setStatus(k)}>{label}<span className="num" style={{ marginLeft: 4, opacity: .7 }}>{c}</span></button>
        ))}
        <label className="row gap-6" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", marginLeft: 8 }}>協力会社<select className="inp" style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }} value={company} onChange={e => setCompany(e.target.value)}><option value="all">すべて</option>{companies.map(c => <option key={c}>{c}</option>)}</select></label>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data">
            <thead><tr><th>ID</th><th>指摘内容</th><th>重要度</th><th>場所</th><th>担当会社</th><th>期限</th><th>状態</th></tr></thead>
            <tbody>{list.map(i => { const sev = M.SEVERITY[i.severity]; return (
              <tr key={i.id} onClick={() => setActive(i)} style={{ cursor: "pointer" }}>
                <td className="mono">{i.id}</td>
                <td style={{ fontWeight: 600, maxWidth: 320 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.content}</div></td>
                <td><span className="chip" style={{ background: sev.soft, color: sev.color }}>{sev.label}</span></td>
                <td className="muted">{i.location}</td><td>{i.company}</td><td className="num">{i.due}</td>
                <td><Pill def={M.ISSUE_STATUS[i.status]} /></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </div>
      {liveActive && <IssueDrawer issue={liveActive} onClose={() => setActive(null)} onApproveDone={setDone} onComment={addComment} />}
    </div>
  );
}

/* ---------- 帳票出力・保管・検索 ---------- */
function FormExport({ pushToast, embedded }) {
  const M = window.MOCK;
  const [files, setFiles] = useStateFm2(M.exportFiles.map(f => ({ ...f })));
  const [q, setQ] = useStateFm2("");
  const [type, setType] = useStateFm2("all");
  const [fmt, setFmt] = useStateFm2("all");
  const [sel, setSel] = useStateFm2([]);
  const list = files.filter(f => (type === "all" || f.type === type) && (fmt === "all" || f.format === fmt) && (q === "" || f.name.includes(q)));
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const allSel = list.length > 0 && list.every(f => sel.includes(f.id));
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: "var(--bg)" }}>
      <div className="row spread" style={{ padding: embedded ? "0 26px 12px" : "18px 26px 12px" }}>
        {!embedded ? <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>帳票出力・保管</h1><div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>承認済帳票をPDF / Excelで出力・保管し、工事別・種類別に検索できます。</div></div> : <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-3)" }}>出力済み帳票</span>}
        <div className="row gap-8">
          {sel.length > 0 && <button className="btn primary" onClick={() => { pushToast(`${sel.length} 件をZIPで一括ダウンロードしました。`, "approved"); setSel([]); }}><Icon name="download" size={15} />一括ダウンロード（{sel.length}）</button>}
          <button className="btn" onClick={() => pushToast("選択した帳票をPDFで出力しました。", "approved")}><Icon name="file" size={15} />PDF出力</button>
          <button className="btn" onClick={() => pushToast("選択した帳票をExcelで出力しました。", "approved")}><Icon name="table" size={15} />Excel出力</button>
        </div>
      </div>
      <div className="row gap-12" style={{ padding: "0 26px 12px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="row gap-8" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 9, padding: "6px 11px", minWidth: 240 }}>
          <Icon name="search" size={16} color="var(--ink-4)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ファイル名で検索" style={{ border: "none", background: "none", outline: "none", flex: 1, fontSize: 13 }} />
        </div>
        <label className="row gap-6" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>種類<select className="inp" style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }} value={type} onChange={e => setType(e.target.value)}><option value="all">すべて</option>{M.FORM_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
        <label className="row gap-6" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>形式<select className="inp" style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }} value={fmt} onChange={e => setFmt(e.target.value)}><option value="all">すべて</option><option>PDF</option><option>Excel</option></select></label>
        <span className="muted" style={{ fontSize: 12, fontWeight: 600, marginLeft: "auto" }}>{list.length} 件</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 26px 26px" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data">
            <thead><tr><th style={{ width: 36 }} onClick={() => setSel(allSel ? [] : list.map(f => f.id))}><div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid " + (allSel ? "var(--accent)" : "var(--line)"), background: allSel ? "var(--accent)" : "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>{allSel && <Icon name="check" size={12} color="#fff" />}</div></th><th>ファイル名</th><th>種類</th><th>形式</th><th>件数</th><th>作成日時</th><th>作成者</th><th>サイズ</th><th></th></tr></thead>
            <tbody>{list.map(f => (
              <tr key={f.id} className={sel.includes(f.id) ? "sel" : ""}>
                <td onClick={() => toggle(f.id)}><div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid " + (sel.includes(f.id) ? "var(--accent)" : "var(--line)"), background: sel.includes(f.id) ? "var(--accent)" : "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>{sel.includes(f.id) && <Icon name="check" size={12} color="#fff" />}</div></td>
                <td style={{ fontWeight: 600 }}><span className="row gap-8"><Icon name="file" size={15} color={f.format === "PDF" ? "var(--st-redo)" : "var(--st-approved)"} />{f.name}</span></td>
                <td><span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>{f.type}</span></td>
                <td><span className="chip" style={{ background: f.format === "PDF" ? "var(--st-redo-soft)" : "var(--st-approved-soft)", color: f.format === "PDF" ? "var(--st-redo)" : "var(--st-approved)" }}>{f.format}</span></td>
                <td className="num">{f.count}</td><td className="num muted">{f.date}</td><td>{f.by}</td><td className="num muted">{f.size}</td>
                <td><button className="btn ghost sm" title="再ダウンロード" onClick={() => pushToast(`${f.name} をダウンロードしました。`, "approved")}><Icon name="download" size={15} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Issues, FormExport });
