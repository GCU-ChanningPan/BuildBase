/* ============================================================
   iPad 現場 — 共有ビュー（ブロードキャスト）
   人員を選んで図面/モデルを一緒に閲覧 + チャット + 通話
   Exports → window: BroadcastScreen
   ============================================================ */
const { useState: useStateBc, useRef: useRefBc, useEffect: useEffectBc } = React;

const BC_MEMBERS = [
  { id: "u1", name: "田中 美咲", role: "案件管理者", hue: 210 },
  { id: "u2", name: "佐藤 健一", role: "現場責任者", hue: 150 },
  { id: "u3", name: "山本 涼", role: "現場作業者", hue: 30 },
  { id: "u4", name: "高橋 由紀", role: "現場作業者", hue: 280 },
  { id: "u5", name: "中村 拓也", role: "協力会社", hue: 0 },
  { id: "u6", name: "渡辺 翔", role: "監理者", hue: 100 },
];

function Avatar({ m, size }) {
  const s = size || 32;
  return <span className="center" style={{ width: s, height: s, borderRadius: "50%", background: `hsl(${m.hue} 70% 92%)`, color: `hsl(${m.hue} 55% 38%)`, fontWeight: 800, fontSize: s * 0.42, flex: "none" }}>{m.name[0]}</span>;
}

/* ロビー：参加者を選択 */
function BroadcastLobby({ onStart }) {
  const [sel, setSel] = useStateBc(["u2", "u3"]);
  const [src, setSrc] = useStateBc("DWG-201");
  const M = window.MOCK;
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <div className="col fieldbig" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 22, gap: 18, background: "var(--bg)" }}>
      <div className="card" style={{ padding: 18, background: "linear-gradient(120deg, var(--accent), var(--accent-ink))", border: "none", color: "#fff" }}>
        <div style={{ fontSize: 12.5, opacity: .85, fontWeight: 600 }}>共有ビュー（ブロードキャスト）</div>
        <div style={{ fontWeight: 800, fontSize: "calc(20px * var(--field-scale))", marginTop: 4 }}>図面・モデルを一緒に確認</div>
        <div style={{ fontSize: 12.5, opacity: .85, marginTop: 4 }}>参加者を選んで開始。チャット・通話で同じ画面を見ながら打合せできます。</div>
      </div>

      <div>
        <div className="row spread" style={{ marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: "calc(14px * var(--field-scale))" }}>参加者を選択</span>
          <span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>{sel.length} 名</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          {BC_MEMBERS.map(m => { const on = sel.includes(m.id); return (
            <button key={m.id} onClick={() => toggle(m.id)} className="card" style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left", outline: on ? "2px solid var(--accent)" : "none", background: on ? "var(--accent-soft)" : "var(--surface)" }}>
              <Avatar m={m} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: "calc(13.5px * var(--field-scale))" }}>{m.name}</div><div className="muted" style={{ fontSize: 11.5 }}>{m.role}</div></div>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (on ? "var(--accent)" : "var(--line)"), background: on ? "var(--accent)" : "#fff", display: "grid", placeItems: "center" }}>{on && <Icon name="check" size={13} color="#fff" />}</div>
            </button>
          ); })}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: "calc(14px * var(--field-scale))", marginBottom: 10 }}>共有する資料</div>
        <div className="row gap-10 wrap">
          {M.drawings.map(d => <button key={d.id} onClick={() => setSrc(d.id)} className={"btn" + (src === d.id ? " primary" : "")}><Icon name="map" size={16} color={src === d.id ? "#fff" : undefined} />{d.name}</button>)}
          <button onClick={() => setSrc("model")} className={"btn" + (src === "model" ? " primary" : "")}><Icon name="layers" size={16} color={src === "model" ? "#fff" : undefined} />3Dモデル</button>
        </div>
      </div>

      <button className="btn primary lg" style={{ alignSelf: "flex-start" }} disabled={sel.length === 0} onClick={() => onStart(sel, src)}>
        <Icon name="video" size={19} color="#fff" />共有ビューを開始（{sel.length}名）
      </button>
    </div>
  );
}

/* セッション：共有画面 + チャット + 通話 */
function BroadcastSession({ members, src, onEnd }) {
  const M = window.MOCK;
  const dwg = M.drawings.find(d => d.id === src);
  const is3D = src === "model";
  const [muted, setMuted] = useStateBc(false);
  const [tab, setTab] = useStateBc("chat");
  const [msgs, setMsgs] = useStateBc([
    { by: "佐藤 健一", hue: 150, text: "2F-G2 の主筋本数、図面と合っていますか？", at: "10:31" },
    { by: "山本 涼", hue: 30, text: "上端5・下端5でOKです。今から近景を撮ります。", at: "10:32" },
  ]);
  const [txt, setTxt] = useStateBc("");
  const [pin, setPin] = useStateBc(null);
  const endRef = useRefBc(null);
  useEffectBc(() => { endRef.current && endRef.current.scrollIntoView && endRef.current.scrollTo(0, 999999); }, [msgs]);
  const send = () => { if (!txt.trim()) return; setMsgs(m => [...m, { by: "田中 美咲", hue: 210, text: txt, at: "10:33", me: true }]); setTxt(""); };
  const joined = BC_MEMBERS.filter(m => members.includes(m.id));

  return (
    <div className="row" style={{ flex: 1, minHeight: 0, height: "100%" }}>
      {/* 共有ビュー本体 */}
      <div className="col" style={{ flex: 1, minHeight: 0, height: "100%", background: "#0c0e10" }}>
        <div className="row spread" style={{ padding: "10px 16px", background: "#11161f", color: "#fff", flex: "none" }}>
          <div className="row gap-10">
            <span className="chip" style={{ background: "rgba(225,68,68,.2)", color: "#ff9b9b" }}><span className="dot" style={{ background: "#ff5d5d" }}></span>LIVE</span>
            <span style={{ fontWeight: 700, fontSize: "calc(14px * var(--field-scale))" }}>{is3D ? "3Dモデル 共有中" : dwg.name + " 共有中"}</span>
          </div>
          <div className="row gap-6">
            {joined.slice(0, 5).map(m => <Avatar key={m.id} m={m} size={28} />)}
            {joined.length > 5 && <span className="chip" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>+{joined.length - 5}</span>}
          </div>
        </div>
        <div onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setPin({ x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }); }}
          style={{ flex: 1, minHeight: 0, position: "relative", cursor: "crosshair" }}>
          {is3D ? (
            <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <g stroke="#5b7fc4" strokeWidth="1.6" fill="none">
                <path d="M120 280 L300 200 L480 280 L300 360 Z" fill="#1a2740" stroke="#3a557f" />
                <path d="M210 250 L300 210 L390 250 L390 150 L300 110 L210 150 Z" fill="#23375e" /><path d="M210 150 L300 110 L300 210 L210 250 Z" fill="#2c4470" /><path d="M390 150 L300 110 L300 210 L390 250 Z" fill="#1c2d4e" />
              </g>
              <text x="20" y="28" fill="#7e9bd6" fontSize="13" fontFamily="monospace">全体構造 3Dモデル（IFC）</text>
            </svg>
          ) : (
            <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#f7f5ee" }}>
              <rect x="40" y="36" width="520" height="320" fill="none" stroke="#2b4a8a" strokeWidth="2.5" />
              {[160, 280, 400, 520].map(x => <line key={x} x1={x} y1="36" x2={x} y2="356" stroke="#9bb0d6" strokeWidth="1" />)}
              {[130, 230].map(y => <line key={y} x1="40" y1={y} x2="560" y2={y} stroke="#9bb0d6" strokeWidth="1" />)}
              <g stroke="#2b4a8a" strokeWidth="1.5" fill="none"><rect x="160" y="130" width="120" height="100" /><rect x="400" y="130" width="120" height="100" /></g>
              <text x="48" y="28" fill="#2b4a8a" fontSize="13" fontFamily="monospace">{dwg.name} {dwg.number}</text>
            </svg>
          )}
          {pin && <svg style={{ position: "absolute", left: pin.x + "%", top: pin.y + "%", width: 30, height: 30, transform: "translate(-50%,-100%)", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.4))" }} viewBox="0 0 24 24"><path d="M12 23s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" fill="var(--st-redo)" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="10" r="3" fill="#fff" /></svg>}
          <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 11.5, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.45)", padding: "4px 9px", borderRadius: 6 }}><Icon name="pin" size={12} color="#fff" /> タップで全員にポインタを共有</div>
        </div>
        {/* 通話バー */}
        <div className="row spread" style={{ padding: "10px 16px", background: "#11161f", flex: "none" }}>
          <div className="row gap-8" style={{ color: "#9aa6ba", fontSize: 12.5 }}><Icon name="phone" size={16} color="#86efac" />通話中 ・ {joined.length + 1}名接続</div>
          <div className="row gap-8">
            <button className="btn" onClick={() => setMuted(!muted)} style={{ background: muted ? "var(--st-redo-soft)" : "rgba(255,255,255,.1)", border: "none", color: muted ? "var(--st-redo)" : "#fff" }}><Icon name="mic" size={17} color={muted ? "var(--st-redo)" : "#fff"} />{muted ? "ミュート中" : "ミュート"}</button>
            <button className="btn danger" onClick={onEnd}><Icon name="phone" size={17} color="var(--st-redo)" />退出</button>
          </div>
        </div>
      </div>
      {/* 右：チャット / 参加者 */}
      <div className="col" style={{ width: 320, borderLeft: "1px solid var(--line)", background: "var(--surface)", flex: "none", minHeight: 0 }}>
        <div className="row" style={{ flex: "none", borderBottom: "1px solid var(--line)" }}>
          {[["chat", "チャット", "message"], ["people", "参加者", "users"]].map(([k, label, icon]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex: 1, border: "none", background: "none", padding: "12px 0", cursor: "pointer", fontWeight: 700, fontSize: 13, color: tab === k ? "var(--accent)" : "var(--ink-4)", borderBottom: "2px solid " + (tab === k ? "var(--accent)" : "transparent") }}><Icon name={icon} size={15} color={tab === k ? "var(--accent)" : "var(--ink-4)"} /> {label}</button>
          ))}
        </div>
        {tab === "chat" ? (
          <React.Fragment>
            <div ref={endRef} className="col gap-12" style={{ flex: 1, overflow: "auto", padding: 14 }}>
              {msgs.map((m, i) => (
                <div key={i} className="row gap-8" style={{ alignItems: "flex-start", flexDirection: m.me ? "row-reverse" : "row" }}>
                  {!m.me && <Avatar m={{ name: m.by, hue: m.hue }} size={28} />}
                  <div style={{ maxWidth: "78%" }}>
                    {!m.me && <div className="muted" style={{ fontSize: 10.5, marginBottom: 2 }}>{m.by}</div>}
                    <div style={{ background: m.me ? "var(--accent)" : "var(--bg-2)", color: m.me ? "#fff" : "var(--ink)", padding: "8px 11px", borderRadius: 12, fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                    <div className="num muted" style={{ fontSize: 10, marginTop: 2, textAlign: m.me ? "right" : "left" }}>{m.at}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row gap-8" style={{ padding: 12, borderTop: "1px solid var(--line)", flex: "none" }}>
              <input className="inp" value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder="メッセージを入力" style={{ flex: 1 }} />
              <button className="btn primary" onClick={send} disabled={!txt.trim()} style={{ padding: "0 14px" }}><Icon name="send" size={17} color="#fff" /></button>
            </div>
          </React.Fragment>
        ) : (
          <div className="col" style={{ flex: 1, overflow: "auto", padding: 12, gap: 4 }}>
            <div className="row gap-10" style={{ padding: "10px 8px", borderRadius: 8, background: "var(--accent-soft)" }}>
              <Avatar m={{ name: "田中 美咲", hue: 210 }} size={34} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>田中 美咲（あなた）</div><div className="muted" style={{ fontSize: 11 }}>ホスト</div></div>
              <Icon name="mic" size={16} color="var(--st-approved)" />
            </div>
            {joined.map(m => (
              <div key={m.id} className="row gap-10" style={{ padding: "10px 8px", borderRadius: 8 }}>
                <Avatar m={m} size={34} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div><div className="muted" style={{ fontSize: 11 }}>{m.role}</div></div>
                <span className="dot" style={{ background: "var(--st-approved)" }}></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BroadcastScreen() {
  const [session, setSession] = useStateBc(null);
  if (session) return <BroadcastSession members={session.members} src={session.src} onEnd={() => setSession(null)} />;
  return <BroadcastLobby onStart={(members, src) => setSession({ members, src })} />;
}

window.BroadcastScreen = BroadcastScreen;
