/* ============================================================
   Web admin — CSV 一括作成 wizard → window.CsvWizard
   ============================================================ */
const { useState: useStateCsv } = React;

function Stepper({ steps, cur }) {
  return (
    <div className="row gap-8" style={{ marginBottom: 22 }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="row gap-8" style={{ opacity: i <= cur ? 1 : .45 }}>
            <div className="center num" style={{ width: 26, height: 26, borderRadius: "50%", background: i < cur ? "var(--st-approved)" : i === cur ? "var(--accent)" : "var(--bg-2)", color: i <= cur ? "#fff" : "var(--ink-4)", fontSize: 13, fontWeight: 800, flex: "none" }}>{i < cur ? "✓" : i + 1}</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: i === cur ? "var(--ink)" : "var(--ink-3)" }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < cur ? "var(--st-approved)" : "var(--line)", maxWidth: 60 }}></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

function CsvWizard({ template, onBack }) {
  const M = window.MOCK;
  const [step, setStep] = useStateCsv(0);
  const [uploaded, setUploaded] = useStateCsv(false);
  const steps = ["CSVアップロード", "項目マッピング", "エラー確認", "一括作成完了"];
  const errs = M.csvRows.filter(r => r.err);
  const ok = M.csvRows.filter(r => !r.err);
  const cols = ["黒板名", "工種", "種別", "細別", "施工箇所", "階", "測点", "設計値", "図面番号"];

  return (
    <div className="col" style={{ flex: 1, overflow: "auto", padding: 26, background: "var(--bg)" }}>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div>
          <button className="btn ghost sm" onClick={onBack} style={{ marginBottom: 6, paddingLeft: 4 }}><Icon name="chevL" size={16} />黒板管理に戻る</button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>黒板一括作成 / CSV インポート</h1>
          <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>CSVで数十〜数千件の黒板をまとめて作成し、撮影タスクに紐付けます。</div>
        </div>
        {template && <div className="card" style={{ padding: "10px 14px", boxShadow: "none", background: "var(--accent-soft)", border: "1px solid var(--accent-soft-2)", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="board" size={18} color="var(--accent-ink)" />
          <div><div style={{ fontSize: 10.5, color: "var(--accent-ink)", fontWeight: 700 }}>使用テンプレート</div><div style={{ fontSize: 13, fontWeight: 700 }}>{template.name}</div></div>
        </div>}
      </div>
      <div className="card" style={{ padding: 24, maxWidth: 1000 }}>
        <Stepper steps={steps} cur={step} />

        {step === 0 && (
          <div className="fade-up">
            <div className="row gap-16" style={{ alignItems: "stretch" }}>
              <div className="card" style={{ flex: 1, padding: 20, background: "var(--bg)", boxShadow: "none" }}>
                <div className="row gap-8" style={{ fontWeight: 700 }}><Icon name="download" size={18} color="var(--accent)" />1. テンプレートをダウンロード</div>
                <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>項目が定義済みのCSVテンプレートをダウンロードし、Excelで黒板情報を入力します。</p>
                <button className="btn"><Icon name="file" size={15} />blackboard_template.csv</button>
              </div>
              <div className="card" style={{ flex: 1, padding: 20, border: uploaded ? "1px solid var(--st-approved)" : "2px dashed var(--line)", boxShadow: "none", background: uploaded ? "var(--st-approved-soft)" : "var(--surface)" }}>
                <div className="row gap-8" style={{ fontWeight: 700 }}><Icon name="upload" size={18} color="var(--accent)" />2. CSVをアップロード</div>
                {!uploaded ? <>
                  <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>入力済みのCSVファイルをここにドラッグ＆ドロップ、または選択します。</p>
                  <button className="btn primary" onClick={() => setUploaded(true)}><Icon name="upload" size={15} />ファイルを選択</button>
                </> : <>
                  <div className="row gap-8" style={{ marginTop: 8 }}><Icon name="checkCircle" size={18} color="var(--st-approved)" /><span style={{ fontWeight: 600, fontSize: 13 }}>blackboards_3F.csv（6行）</span></div>
                </>}
              </div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 22 }}>
              <button className="btn primary" disabled={!uploaded} onClick={() => setStep(1)}>次へ：項目マッピング<Icon name="chevR" size={15} /></button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="fade-up">
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 0 }}>CSVの列と黒板項目の対応を確認します。自動マッピング済みです。</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", gap: "10px 12px", alignItems: "center", maxWidth: 560 }}>
              {cols.map(c => (
                <React.Fragment key={c}>
                  <div className="card" style={{ padding: "8px 12px", boxShadow: "none", background: "var(--bg)", fontSize: 13, fontFamily: "var(--font-mono)" }}>{c}</div>
                  <Icon name="chevR" size={16} color="var(--ink-4)" />
                  <div className="card" style={{ padding: "8px 12px", boxShadow: "none", fontSize: 13, fontWeight: 600 }}>{c} <span className="chip" style={{ marginLeft: 6, background: "var(--st-approved-soft)", color: "var(--st-approved)", fontSize: 10 }}>自動</span></div>
                </React.Fragment>
              ))}
            </div>
            <div className="row spread" style={{ marginTop: 22 }}>
              <button className="btn" onClick={() => setStep(0)}><Icon name="chevL" size={15} />戻る</button>
              <button className="btn primary" onClick={() => setStep(2)}>次へ：エラー確認<Icon name="chevR" size={15} /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <div className="row gap-12" style={{ marginBottom: 14 }}>
              <span className="chip" style={{ background: "var(--st-approved-soft)", color: "var(--st-approved)" }}><Icon name="check" size={14} color="var(--st-approved)" />作成可能 {ok.length} 件</span>
              <span className="chip" style={{ background: "var(--st-redo-soft)", color: "var(--st-redo)" }}><Icon name="xCircle" size={14} color="var(--st-redo)" />エラー {errs.length} 件</span>
              <button className="btn sm" style={{ marginLeft: "auto" }}><Icon name="download" size={14} />エラー行をダウンロード</button>
            </div>
            <div className="card" style={{ overflow: "hidden", boxShadow: "none" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="data">
                  <thead><tr><th>行</th><th>黒板名</th><th>工種</th><th>細別</th><th>施工箇所</th><th>設計値</th><th>図面番号</th><th>判定</th></tr></thead>
                  <tbody>
                    {M.csvRows.map((r, i) => (
                      <tr key={i} style={{ background: r.err ? "var(--st-redo-soft)" : undefined }}>
                        <td className="num">{i + 2}</td><td style={{ fontWeight: 600 }}>{r.黒板名}</td><td>{r.工種}</td><td className="mono">{r.細別}</td><td>{r.施工箇所}</td><td className="mono">{r.設計値}</td><td className="mono">{r.図面番号}</td>
                        <td>{r.err ? <span className="row gap-4" style={{ color: "var(--st-redo)", fontWeight: 600, fontSize: 12 }}><Icon name="xCircle" size={14} color="var(--st-redo)" />{r.err}</span> : <span className="row gap-4" style={{ color: "var(--st-approved)", fontWeight: 600, fontSize: 12 }}><Icon name="check" size={14} color="var(--st-approved)" />OK</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row spread" style={{ marginTop: 22 }}>
              <button className="btn" onClick={() => setStep(1)}><Icon name="chevL" size={15} />戻る</button>
              <div className="row gap-10">
                <span style={{ fontSize: 12, color: "var(--ink-3)", alignSelf: "center" }}>エラー行はスキップして作成します</span>
                <button className="btn primary" onClick={() => setStep(3)}><Icon name="plus" size={15} />{ok.length} 件の黒板を作成</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up col center" style={{ padding: "30px 0", gap: 14 }}>
            <div className="center pop-in" style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--st-approved-soft)" }}><Icon name="checkCircle" size={40} color="var(--st-approved)" /></div>
            <h2 style={{ margin: 0, fontSize: 22 }}>黒板を {ok.length} 件 作成しました</h2>
            <p style={{ color: "var(--ink-3)", fontSize: 13, textAlign: "center", maxWidth: 420, margin: 0, lineHeight: 1.6 }}>作成した黒板は撮影タスクへ自動で紐付けできます。図面Pinと連携すると、現場端で図面から直接撮影できるようになります。</p>
            <div className="row gap-10" style={{ marginTop: 6 }}>
              <button className="btn" onClick={() => { setStep(0); setUploaded(false); }}>続けてインポート</button>
              <button className="btn primary"><Icon name="list" size={15} />撮影タスクに紐付ける</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.CsvWizard = CsvWizard;
