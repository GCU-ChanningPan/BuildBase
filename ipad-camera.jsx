/* ============================================================
   iPad field — hero screens (camera / board edit / preview / redo / sync)
   Exports → window: BoardEditScreen, CameraScreen, PreviewScreen,
   RedoScreen, SyncScreen, UnuploadedScreen, FieldTopBar
   ============================================================ */
const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

/* ---------- Field top status bar ---------- */
function FieldTopBar({ title, online, setOnline, queue, onBack, right }) {
  return (
    <div className="row spread" style={{ padding: "0 18px", height: 52, borderBottom: "1px solid var(--line)", background: "var(--surface)", flex: "none" }}>
      <div className="row gap-10" style={{ minWidth: 0 }}>
        {onBack && <button className="btn ghost sm" onClick={onBack} style={{ padding: "6px 8px" }}><Icon name="chevL" size={18} /></button>}
        <div style={{ fontWeight: 700, fontSize: "calc(16px * var(--field-scale))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      </div>
      <div className="row gap-10">
        {right}
        <button onClick={() => setOnline(!online)} title="オンライン状態を切替（デモ）"
          className="chip" style={{ cursor: "pointer", border: "1px solid var(--line)", background: online ? "var(--st-approved-soft)" : "var(--st-unsync-soft)", color: online ? "var(--st-approved)" : "var(--st-unsync)" }}>
          <Icon name={online ? "cloud" : "wifi_off"} size={15} />{online ? "オンライン" : "オフライン"}
        </button>
        {queue > 0 && <span className="chip" style={{ background: "var(--st-unsync-soft)", color: "var(--st-unsync)" }}><Icon name="upload" size={14} />未送信 {queue}</span>}
      </div>
    </div>
  );
}

/* ---------- 電子黒板編集 ---------- */
function BoardEditScreen({ board, tweaks, onNext, onBack }) {
  const [d, setD] = useStateC({ ...board });
  const f = (k, v) => setD(p => ({ ...p, [k]: v }));
  const editable = [
    ["設計値", "design"], ["実測値", "actual"], ["施工内容", "content"],
    ["立会者", "witness"], ["備考", "note"],
  ];
  const auto = [["工事名", d.project], ["工種", d.workType], ["種別", d.category], ["細別", d.subcategory], ["施工箇所", d.location], ["測点", d.point], ["図面番号", d.drawingNumber], ["撮影者", d.shooter]];
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title="電子黒板編集" onBack={onBack} online={true} setOnline={() => {}} queue={0} />
      <div className="row" style={{ flex: 1, minHeight: 0 }}>
        {/* left: preview — 撮影時の配置（写真の右下に横向き黒板を固定） */}
        <div className="col center" style={{ flex: 1, background: "var(--bg-2)", padding: 22, gap: 14 }}>
          <div style={{ fontSize: "calc(12px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}>プレビュー（撮影時の配置）</div>
          <div style={{ position: "relative", width: 460, aspectRatio: "4 / 3", borderRadius: 12, overflow: "hidden", boxShadow: "var(--sh-2)" }}>
            <PhotoFrame hue={155} rounded={12} style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", right: 12, bottom: 12, width: "46%" }}>
              <Blackboard data={d} scale={0.82} />
            </div>
          </div>
          <div className="muted" style={{ fontSize: "calc(11.5px * var(--field-scale))" }}>横向き黒板を写真の右下に固定（面積 約20%）</div>
        </div>
        {/* right: fields */}
        <div className="col" style={{ width: 360, borderLeft: "1px solid var(--line)", background: "var(--surface)", overflow: "auto" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-2)" }}>
            <div className="row gap-6" style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}><Icon name="cpu" size={15} />自動入力（タスク連携）</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              {auto.map(([k, v]) => (
                <div key={k} style={{ background: "var(--bg)", borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontWeight: 700 }}>{k}</div>
                  <div style={{ fontSize: "calc(12px * var(--field-scale))", fontWeight: 600, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="col gap-12" style={{ padding: "16px 18px" }}>
            <div className="row gap-6" style={{ fontSize: "calc(13px * var(--field-scale))", fontWeight: 700, color: "var(--ink-3)" }}><Icon name="edit" size={15} />入力項目</div>
            {editable.map(([label, key]) => (
              <label className="fld" key={key} style={{ fontSize: "calc(12px * var(--field-scale))" }}>
                {label}{(key === "actual") && <span style={{ color: "var(--st-redo)" }}> ＊必須</span>}
                {key === "note" || key === "content"
                  ? <textarea className="inp" rows={2} value={d[key] || ""} onChange={e => f(key, e.target.value)} style={{ fontSize: "calc(13px * var(--field-scale))" }} />
                  : <input className="inp" value={d[key] || ""} onChange={e => f(key, e.target.value)} placeholder={key === "actual" ? "実測値を入力" : ""} style={{ fontSize: "calc(13px * var(--field-scale))", fontFamily: key === "design" || key === "actual" ? "var(--font-mono)" : "inherit" }} />}
              </label>
            ))}
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{ padding: 16, borderTop: "1px solid var(--line-2)" }}>
            <button className="btn primary lg" style={{ width: "100%" }} onClick={() => onNext(d)}>
              <Icon name="camera" size={18} />この黒板で撮影する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 黒板付き写真撮影 (camera, hero) ---------- */
function CameraScreen({ board, tweaks, onShot, onBack, online }) {
  const [pos, setPos] = useStateC({ x: tweaks.boardX, y: tweaks.boardY });
  const [scale, setScale] = useStateC(tweaks.boardSize);
  const [opacity, setOpacity] = useStateC(tweaks.boardOpacity);
  const [shots, setShots] = useStateC(0);
  const [flash, setFlash] = useStateC(false);
  const dragRef = useRefC(null);
  const drag = useRefC(null);
  useEffectC(() => { setPos({ x: tweaks.boardX, y: tweaks.boardY }); setScale(tweaks.boardSize); setOpacity(tweaks.boardOpacity); }, [tweaks.boardX, tweaks.boardY, tweaks.boardSize, tweaks.boardOpacity]);

  const dark = tweaks.cameraDark;
  function onDown(e) {
    const p = e.touches ? e.touches[0] : e;
    drag.current = { sx: p.clientX, sy: p.clientY, ox: pos.x, oy: pos.y, w: dragRef.current.offsetWidth, h: dragRef.current.offsetHeight };
  }
  function onMove(e) {
    if (!drag.current) return;
    const p = e.touches ? e.touches[0] : e;
    const r = dragRef.current.parentElement.getBoundingClientRect();
    const nx = drag.current.ox + (p.clientX - drag.current.sx) / r.width * 100;
    const ny = drag.current.oy + (p.clientY - drag.current.sy) / r.height * 100;
    setPos({ x: Math.max(2, Math.min(98, nx)), y: Math.max(2, Math.min(98, ny)) });
  }
  function onUp() { drag.current = null; }
  function shoot() {
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    setShots(s => s + 1);
    onShot({ board, pos, scale, opacity, online });
  }
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, background: dark ? "#0c0e10" : "#1a1d22" }}
      onMouseMove={onMove} onMouseUp={onUp} onTouchMove={onMove} onTouchEnd={onUp}>
      {/* top bar */}
      <div className="row spread" style={{ padding: "0 16px", height: 48, color: "#fff", flex: "none" }}>
        <button className="btn ghost sm" style={{ color: "#fff" }} onClick={onBack}><Icon name="chevL" size={18} color="#fff" />戻る</button>
        <div className="row gap-8" style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>
          <Icon name="board" size={15} color="#9fe0c4" />{board.name}
        </div>
        <div className="chip" style={{ background: online ? "rgba(22,163,74,.22)" : "rgba(139,92,246,.25)", color: online ? "#86efac" : "#c4b5fd" }}>
          <Icon name={online ? "cloud" : "wifi_off"} size={14} color={online ? "#86efac" : "#c4b5fd"} />{online ? "アップロード" : "オフライン保存"}
        </div>
      </div>
      {/* viewfinder */}
      <div style={{ flex: 1, position: "relative", margin: "0 16px 8px", borderRadius: 14, overflow: "hidden", minHeight: 0 }}>
        <PhotoFrame hue={155} rounded={14} style={{ position: "absolute", inset: 0 }} />
        {/* framing guides */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <rect x="6%" y="8%" width="88%" height="84%" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeDasharray="6 6" rx="6" />
          {[["6%", "8%", 1, 1], ["94%", "8%", -1, 1], ["6%", "92%", 1, -1], ["94%", "92%", -1, -1]].map((c, i) => (
            <g key={i} stroke="#fff" strokeWidth="2.5"><line x1={c[0]} y1={c[1]} x2={`calc(${c[0]} + ${c[2] * 18}px)`} y2={c[1]} /><line x1={c[0]} y1={c[1]} x2={c[0]} y2={`calc(${c[1]} + ${c[3] * 18}px)`} /></g>
          ))}
        </svg>
        {/* draggable board overlay */}
        <div ref={dragRef} onMouseDown={onDown} onTouchStart={onDown}
          style={{ position: "absolute", left: pos.x + "%", top: pos.y + "%", transform: "translate(-50%,-50%)", width: 200 * scale, opacity, cursor: "grab", touchAction: "none" }}>
          <Blackboard data={board} scale={scale * 1.1} />
          <div className="row gap-4 center" style={{ position: "absolute", top: -10, right: -10, background: "var(--accent)", color: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 10, fontWeight: 700, boxShadow: "var(--sh-2)" }}><Icon name="move" size={11} color="#fff" />ドラッグ可</div>
        </div>
        {flash && <div style={{ position: "absolute", inset: 0, background: "#fff", animation: "fadeIn .08s" }}></div>}
        {shots > 0 && <div className="chip pop-in" style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,.55)", color: "#fff" }}><Icon name="check" size={14} color="#86efac" />{shots} 枚 撮影済み</div>}
      </div>
      {/* size quick control */}
      <div className="row center gap-16" style={{ padding: "2px 16px 6px", color: "rgba(255,255,255,.8)", flex: "none" }}>
        <div className="row gap-6" style={{ fontSize: 11 }}><Icon name="zoomIn" size={14} color="rgba(255,255,255,.7)" />サイズ
          <input type="range" min="0.6" max="1.6" step="0.05" value={scale} onChange={e => setScale(+e.target.value)} style={{ width: 90 }} /></div>
      </div>
      {/* shutter row */}
      <div className="row spread center" style={{ padding: "10px 28px 18px", flex: "none" }}>
        <div style={{ width: 64, color: "rgba(255,255,255,.6)", fontSize: 11, textAlign: "center" }}>{board.point}</div>
        <button onClick={shoot} aria-label="撮影"
          style={{ width: 74, height: 74, borderRadius: "50%", background: "#fff", border: "5px solid rgba(255,255,255,.45)", boxShadow: "0 4px 16px rgba(0,0,0,.4)", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <span style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", border: "2px solid #c9ccd2" }}></span>
        </button>
        <button onClick={() => onShot(null, "done")} disabled={shots === 0}
          style={{ width: 64, textAlign: "center", color: shots ? "#fff" : "rgba(255,255,255,.35)", background: "none", border: "none", fontSize: 12, fontWeight: 700 }}>
          完了<br /><Icon name="chevR" size={16} color={shots ? "#fff" : "rgba(255,255,255,.35)"} />
        </button>
      </div>
    </div>
  );
}

/* ---------- 写真プレビュー / 保存 ---------- */
function PreviewScreen({ shot, online, onSave, onRetake, onBack }) {
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title="写真プレビュー" onBack={onBack} online={online} setOnline={() => {}} queue={0} />
      <div className="col center" style={{ flex: 1, background: "var(--bg-2)", padding: 18, minHeight: 0, overflow: "auto" }}>
        <div style={{ position: "relative", width: "min(560px, 92%)", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", boxShadow: "var(--sh-3)" }}>
          <PhotoFrame hue={155} rounded={12} style={{ position: "absolute", inset: 0 }} label="原図 4032×3024" />
          {shot && (
            <div style={{ position: "absolute", left: shot.pos.x + "%", top: shot.pos.y + "%", transform: "translate(-50%,-50%)", width: 200 * shot.scale }}>
              <Blackboard data={shot.board} scale={shot.scale * 1.1} />
            </div>
          )}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)", textAlign: "center" }} className="num">撮影 09:42 ・ GPS 35.6197,139.7798 ・ {shot && shot.board.name}</div>
        {/* アップロード（写真の下） */}
        <button className="btn primary lg" style={{ width: "min(560px, 92%)", marginTop: 16 }} onClick={onSave}>
          <Icon name={online ? "upload" : "download"} size={18} />{online ? "アップロード" : "オフライン保存（後で同期）"}
        </button>
        {/* 撮り直す（アップロードの下・高さ拡大・間隔を広く） */}
        <button className="btn lg" style={{ marginTop: 30, padding: "16px 28px", fontSize: "calc(16px * var(--field-scale))" }} onClick={onRetake}><Icon name="redo" size={18} />撮り直す</button>
      </div>
    </div>
  );
}

/* ---------- 再撮影指示 ---------- */
function RedoScreen({ onBack, onReshoot }) {
  const M = window.MOCK;
  const redoPhotos = M.photos.filter(p => p.status === "redo");
  const [sel, setSel] = useStateC(redoPhotos[0]);
  const hist = M.reviewHistory.find(h => h.photoId === (sel && sel.id));
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title="再撮影指示" onBack={onBack} online={true} setOnline={() => {}} queue={0}
        right={<span className="chip" style={{ background: "var(--st-redo-soft)", color: "var(--st-redo)" }}>{redoPhotos.length} 件</span>} />
      <div className="row" style={{ flex: 1, minHeight: 0 }}>
        <div className="col" style={{ width: 280, borderRight: "1px solid var(--line)", overflow: "auto", background: "var(--surface)" }}>
          {redoPhotos.map(p => {
            const b = M.blackboards.find(x => x.id === p.bbId);
            return (
              <button key={p.id} onClick={() => setSel(p)} style={{ display: "flex", gap: 10, padding: 12, border: "none", borderBottom: "1px solid var(--line-2)", background: sel.id === p.id ? "var(--st-redo-soft)" : "transparent", textAlign: "left", cursor: "pointer", width: "100%" }}>
                <PhotoFrame hue={p.hue} style={{ width: 64, height: 48, flex: "none" }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "calc(13px * var(--field-scale))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b && b.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--st-redo)", fontWeight: 600, marginTop: 3 }}>{p.reason}</div>
                </div>
              </button>
            );
          })}
        </div>
        {sel && <div className="col" style={{ flex: 1, padding: 22, overflow: "auto", gap: 16 }}>
          <div className="row gap-16" style={{ alignItems: "flex-start" }}>
            <div style={{ position: "relative", width: 280, aspectRatio: "4/3", borderRadius: 10, overflow: "hidden", boxShadow: "var(--sh-2)" }}>
              <PhotoFrame hue={sel.hue} rounded={10} style={{ position: "absolute", inset: 0 }} label="差戻し対象" />
            </div>
            <div className="col gap-10" style={{ flex: 1 }}>
              <div className="card" style={{ padding: 14, background: "var(--st-redo-soft)", borderColor: "#f3cfcf" }}>
                <div className="row gap-6" style={{ fontWeight: 700, color: "var(--st-redo)", fontSize: "calc(13px * var(--field-scale))" }}><Icon name="redo" size={16} color="var(--st-redo)" />差戻し理由</div>
                <div style={{ marginTop: 6, fontWeight: 700, fontSize: "calc(14px * var(--field-scale))" }}>{sel.reason}</div>
                <div style={{ marginTop: 8, fontSize: "calc(13px * var(--field-scale))", lineHeight: 1.6 }}>{sel.comment}</div>
              </div>
              {hist && <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="num">指示: {hist.reviewer} ・ {hist.at}</div>}
            </div>
          </div>
          <button className="btn primary lg" style={{ alignSelf: "flex-start" }} onClick={() => onReshoot(sel)}><Icon name="camera" size={18} />この黒板で再撮影する</button>
        </div>}
      </div>
    </div>
  );
}

/* ---------- 同期状況 / 未アップロード ---------- */
function SyncScreen({ queue, online, onSync, onBack }) {
  const states = [
    { label: "BB-1043 2F-S2 配力筋", st: queue > 0 ? "unsync" : "approved", size: "2.4 MB" },
    { label: "BB-1042 2F-C3 帯筋検査", st: queue > 1 ? "unsync" : "approved", size: "2.1 MB" },
  ];
  return (
    <div className="col" style={{ flex: 1, minHeight: 0 }}>
      <FieldTopBar title="同期状況" onBack={onBack} online={online} setOnline={() => {}} queue={queue} />
      <div className="col" style={{ flex: 1, padding: 22, gap: 16, overflow: "auto" }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="row spread">
            <div className="row gap-10">
              <div className="center" style={{ width: 44, height: 44, borderRadius: 12, background: online ? "var(--st-approved-soft)" : "var(--st-unsync-soft)" }}>
                <Icon name={online ? "cloud" : "wifi_off"} size={22} color={online ? "var(--st-approved)" : "var(--st-unsync)"} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "calc(15px * var(--field-scale))" }}>{online ? "オンライン" : "オフライン"}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{queue > 0 ? `未送信 ${queue} 件 / クラウド未保存` : "すべて同期済み"}</div>
              </div>
            </div>
            <button className="btn primary" disabled={!online || queue === 0} onClick={onSync}><Icon name="sync" size={16} />今すぐ同期</button>
          </div>
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          {states.map((s, i) => (
            <div key={i} className="row spread" style={{ padding: "13px 16px", borderBottom: i < states.length - 1 ? "1px solid var(--line-2)" : "none" }}>
              <div className="row gap-10"><PhotoFrame hue={150 + i * 30} style={{ width: 52, height: 40 }} />
                <div><div style={{ fontWeight: 600, fontSize: "calc(13px * var(--field-scale))" }}>{s.label}</div><div className="num" style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{s.size}</div></div>
              </div>
              <StatusBadge status={s.st} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-4)", lineHeight: 1.6 }}>オフラインで撮影した黒板付き写真は端末に保存され、オンライン復帰時に自動アップロードされます。失敗時は再試行できます。</div>
      </div>
    </div>
  );
}

Object.assign(window, { FieldTopBar, BoardEditScreen, CameraScreen, PreviewScreen, RedoScreen, SyncScreen });
