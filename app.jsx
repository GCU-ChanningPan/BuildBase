/* ============================================================
   Top-level App → mounts to #root
   Mode toggle (現場 iPad / Web 管理) · device frames · Tweaks
   ============================================================ */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const ACCENTS = {
  "#2f57e6": { ink: "#1c3bb0", soft: "#eaeefe", soft2: "#d8e0fd" },
  "#4f46e5": { ink: "#3730a3", soft: "#eef0fe", soft2: "#ddd9fb" },
  "#0d9488": { ink: "#0f6e66", soft: "#e2f5f2", soft2: "#c5ebe5" },
  "#e2682b": { ink: "#b34d18", soft: "#fdeee4", soft2: "#fad9c4" },
  "#475569": { ink: "#334155", soft: "#eef1f5", soft2: "#dde3ec" },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2f57e6",
  "fieldScale": 1,
  "cameraDark": true,
  "boardX": 84,
  "boardY": 80,
  "boardSize": 0.65,
  "boardOpacity": 0.95
}/*EDITMODE-END*/;

/* Fit-to-viewport scaler for fixed-size device frames */
function Stage({ w, h, children }) {
  const [scale, setScale] = useStateA(1);
  useEffectA(() => {
    function fit() {
      const availW = window.innerWidth - 48;
      const availH = window.innerHeight - 120;
      setScale(Math.min(1, availW / w, availH / h));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [w, h]);
  return (
    <div style={{ width: w * scale, height: h * scale, flex: "none" }}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}

/* iPad landscape bezel */
function IPad({ children }) {
  return (
    <div style={{ background: "#1c1f26", borderRadius: 38, padding: 16, boxShadow: "0 30px 80px rgba(0,0,0,.45), inset 0 0 0 2px #34384200", border: "1px solid #2a2e38" }}>
      <div style={{ position: "relative", width: 1140, height: 800, borderRadius: 22, overflow: "hidden", background: "#fff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)" }}>
        {/* front camera */}
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 7, height: 7, borderRadius: "50%", background: "#2a2e38", zIndex: 100, boxShadow: "0 0 0 2px rgba(0,0,0,.25)" }}></div>
        <div style={{ position: "absolute", inset: 0, paddingTop: 0 }}>{children}</div>
      </div>
    </div>
  );
}

/* iPhone portrait bezel */
function IPhone({ children }) {
  return (
    <div style={{ background: "#1c1f26", borderRadius: 52, padding: 12, boxShadow: "0 30px 80px rgba(0,0,0,.45)", border: "1px solid #2a2e38" }}>
      <div style={{ position: "relative", width: 390, height: 800, borderRadius: 42, overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* dynamic island */}
        <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)", width: 108, height: 30, borderRadius: 16, background: "#0c0e10", zIndex: 100 }}></div>
        {/* status bar (below dynamic island) */}
        <div className="row spread" style={{ flex: "none", height: 48, padding: "0 26px", alignItems: "center", background: "var(--surface)", zIndex: 90 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-en)" }}>9:41</span>
          <div className="row gap-6" style={{ alignItems: "center" }}>
            {/* signal */}
            <svg width="17" height="12" viewBox="0 0 17 12"><g fill="var(--ink)">
              <rect x="0" y="8" width="3" height="4" rx="1" /><rect x="4.5" y="5.5" width="3" height="6.5" rx="1" /><rect x="9" y="3" width="3" height="9" rx="1" /><rect x="13.5" y="0.5" width="3" height="11.5" rx="1" />
            </g></svg>
            {/* wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12"><g fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round"><path d="M1.5 4.2a10 10 0 0 1 13 0" /><path d="M4 6.8a6.2 6.2 0 0 1 8 0" /></g><circle cx="8" cy="10" r="1.3" fill="var(--ink)" /></svg>
            {/* battery */}
            <span className="row" style={{ alignItems: "center", gap: 2 }}>
              <span style={{ position: "relative", width: 24, height: 12, border: "1.4px solid var(--ink)", borderRadius: 3, opacity: .9 }}>
                <span style={{ position: "absolute", inset: 1.5, width: "78%", background: "var(--ink)", borderRadius: 1 }}></span>
              </span>
              <span style={{ width: 1.6, height: 4, background: "var(--ink)", borderRadius: 1, opacity: .9 }}></span>
            </span>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </div>
    </div>
  );
}

function ModeToggle({ mode, setMode, onTweaks }) {
  return (
    <div className="row spread" style={{ width: "100%", padding: "14px 22px", flex: "none" }}>
      <div className="row gap-10">
        <div className="center" style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", overflow: "hidden", flex: "none" }}><img src="assets/buildbase-mark.png" alt="BuildBase" style={{ width: 26, height: 26, objectFit: "contain" }} /></div>
        <div style={{ color: "#fff" }}><div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1 }}>BuildBase</div><div style={{ fontSize: 10.5, color: "#8b93a4", marginTop: 2 }}>電子黒板付き工事写真管理</div></div>
      </div>
      <div className="row" style={{ background: "rgba(255,255,255,.08)", borderRadius: 11, padding: 4, gap: 4 }}>
        {[["ipad", "現場 iPad", "board"], ["iphone", "現場 iPhone", "camera"], ["web", "Web 管理", "dash"]].map(([k, label, icon]) => (
          <button key={k} onClick={() => setMode(k)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: mode === k ? "#fff" : "transparent", color: mode === k ? "#11161f" : "#c2c8d4", transition: "background .15s" }}>
            <Icon name={icon} size={16} color={mode === k ? "var(--accent)" : "#c2c8d4"} />{label}
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [mode, setMode] = useStateA("web");

  useEffectA(() => {
    const a = ACCENTS[t.accent] || ACCENTS["#2f57e6"];
    const r = document.documentElement.style;
    r.setProperty("--accent", t.accent);
    r.setProperty("--accent-ink", a.ink);
    r.setProperty("--accent-soft", a.soft);
    r.setProperty("--accent-soft-2", a.soft2);
  }, [t.accent]);

  const tweaks = { fieldScale: t.fieldScale, cameraDark: t.cameraDark, boardX: t.boardX, boardY: t.boardY, boardSize: t.boardSize, boardOpacity: t.boardOpacity };

  return (
    <div className="col" style={{ minHeight: "100vh" }}>
      <ModeToggle mode={mode} setMode={setMode} />
      <div className="col center" style={{ flex: 1, padding: "0 24px 28px", minHeight: 0 }}>
        {mode === "ipad" ? (
          <Stage w={1172} h={832}>
            <IPad>
              <div style={{ "--field-scale": t.fieldScale, height: "100%" }} className="col">
                <FieldApp tweaks={tweaks} />
              </div>
            </IPad>
          </Stage>
        ) : mode === "iphone" ? (
          <Stage w={414} h={824}>
            <IPhone>
              <div style={{ "--field-scale": t.fieldScale, height: "100%" }} className="col">
                <PhoneApp tweaks={tweaks} />
              </div>
            </IPhone>
          </Stage>
        ) : (
          <Stage w={1320} h={812}>
            <ChromeWindow width={1320} height={812} url="genkaku-dx.app/projects/PJ-2041">
              <WebApp />
            </ChromeWindow>
          </Stage>
        )}
      </div>

      <TweaksPanel>
        <TweakSection label="ブランド" />
        <TweakColor label="アクセントカラー" value={t.accent} options={Object.keys(ACCENTS)} onChange={v => setTweak("accent", v)} />
        <TweakSection label="現場 iPad" />
        <TweakSlider label="文字サイズ（現場視認性）" value={t.fieldScale} min={0.9} max={1.3} step={0.05} unit="×" onChange={v => setTweak("fieldScale", v)} />
        <TweakToggle label="カメラUI：ダーク" value={t.cameraDark} onChange={v => setTweak("cameraDark", v)} />
        <TweakSection label="黒板オーバーレイ" />
        <TweakSlider label="位置 X" value={t.boardX} min={20} max={88} step={1} unit="%" onChange={v => setTweak("boardX", v)} />
        <TweakSlider label="位置 Y" value={t.boardY} min={20} max={88} step={1} unit="%" onChange={v => setTweak("boardY", v)} />
        <TweakSlider label="大きさ" value={t.boardSize} min={0.6} max={1.5} step={0.05} unit="×" onChange={v => setTweak("boardSize", v)} />
        <TweakSlider label="透明度" value={t.boardOpacity} min={0.5} max={1} step={0.05} unit="" onChange={v => setTweak("boardOpacity", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
