/* ============================================================
   Mock data — window.MOCK
   電子黒板付き工事写真管理機能
   ============================================================ */
(function () {
  // ---- Status definitions ----
  const STATUS = {
    none:     { key: "none",     label: "未撮影",   color: "var(--st-none)",     soft: "var(--st-none-soft)" },
    shot:     { key: "shot",     label: "撮影済み", color: "var(--st-approved)", soft: "var(--st-approved-soft)" },
    shooting: { key: "shooting", label: "撮影中",   color: "var(--st-shooting)", soft: "var(--st-shooting-soft)" },
    pending:  { key: "pending",  label: "確認待ち", color: "var(--st-pending)",  soft: "var(--st-pending-soft)" },
    approved: { key: "approved", label: "確認済み", color: "var(--st-approved)", soft: "var(--st-approved-soft)" },
    redo:     { key: "redo",     label: "再撮影",   color: "var(--st-redo)",     soft: "var(--st-redo-soft)" },
    void:     { key: "void",     label: "無効",     color: "var(--st-void)",     soft: "var(--st-void-soft)" },
    unsync:   { key: "unsync",   label: "未同期",   color: "var(--st-unsync)",   soft: "var(--st-unsync-soft)" },
  };

  const WORK_TYPES = ["土工事", "基礎工事", "配筋検査", "コンクリート打設", "型枠工事", "鉄骨工事", "設備工事", "電気工事", "内装工事", "防水工事"];

  // ---- Project ----
  const project = {
    id: "PJ-2041",
    name: "（仮称）湾岸ロジスティクスセンター新築工事",
    construction: "建築一式工事",
    client: "東京港湾流通株式会社",
    prime: "大和建設株式会社",
    contractor: "大和建設株式会社 東京支店",
    address: "東京都江東区青海2丁目4-32",
    period: "2025/04/01 — 2026/09/30",
    agent: "佐藤 健一",
    manager: "田中 美咲",
    status: "施工中",
    progress: 58,
  };

  const projects = [
    { ...project, tasksToday: 12, unuploaded: 4, redo: 2, sync: "unsync" },
    { id: "PJ-2038", name: "城南第一マンション 大規模修繕工事", construction: "建築一式工事", client: "城南管理組合", prime: "大和建設株式会社", contractor: "大和建設 城南出張所", address: "東京都品川区西大井3-1-8", period: "2025/06/01 — 2026/02/28", agent: "鈴木 大輔", manager: "高橋 由紀", status: "施工中", progress: 41, tasksToday: 6, unuploaded: 0, redo: 0, sync: "synced" },
    { id: "PJ-2052", name: "中央区庁舎 耐震補強及び改修工事", construction: "建築一式工事（公共）", client: "中央区役所", prime: "大和建設株式会社", contractor: "大和建設 公共事業部", address: "東京都中央区築地1-1-1", period: "2025/08/01 — 2027/03/31", agent: "渡辺 翔", manager: "田中 美咲", status: "施工中", progress: 23, tasksToday: 9, unuploaded: 7, redo: 1, sync: "synced", isPublic: true },
  ];

  // ---- Drawings ----
  const drawings = [
    { id: "DWG-201", name: "2F 伏図（配筋）", number: "S-201", floor: "2F", workType: "配筋検査", version: "Rev.3", by: "田中 美咲", at: "2026/06/05 14:20", published: true, current: true },
    { id: "DWG-101", name: "1F 平面図", number: "A-101", floor: "1F", workType: "基礎工事", version: "Rev.2", by: "田中 美咲", at: "2026/05/28 10:05", published: true, current: true },
    { id: "DWG-301", name: "基礎伏図", number: "S-101", floor: "B1F", workType: "基礎工事", version: "Rev.4", by: "佐藤 健一", at: "2026/05/20 09:40", published: true, current: true },
    { id: "DWG-110", name: "1F 設備配管図", number: "M-110", floor: "1F", workType: "設備工事", version: "Rev.1", by: "高橋 由紀", at: "2026/06/01 16:12", published: false, current: true },
  ];

  // ---- Drawing pins (positions are % of drawing image) ----
  const pins = [
    { id: "P-01", drawingId: "DWG-201", x: 22, y: 30, location: "2F 東側 大梁 G2", floor: "2F", area: "東エリア", workType: "配筋検査", item: "主筋本数・径", status: "approved", assignee: "山本 涼", due: "06/09", bbId: "BB-1041", taskId: "T-1001" },
    { id: "P-02", drawingId: "DWG-201", x: 47, y: 38, location: "2F 中央 柱 C3", floor: "2F", area: "中央エリア", workType: "配筋検査", item: "帯筋ピッチ", status: "pending", assignee: "山本 涼", due: "06/09", bbId: "BB-1042", taskId: "T-1002" },
    { id: "P-03", drawingId: "DWG-201", x: 68, y: 33, location: "2F 西側 スラブ S2", floor: "2F", area: "西エリア", workType: "配筋検査", item: "配力筋ピッチ", status: "shooting", assignee: "中村 拓也", due: "06/09", bbId: "BB-1043", taskId: "T-1003" },
    { id: "P-04", drawingId: "DWG-201", x: 35, y: 62, location: "2F 東側 小梁 B5", floor: "2F", area: "東エリア", workType: "配筋検査", item: "あばら筋", status: "none", assignee: "中村 拓也", due: "06/10", bbId: "BB-1044", taskId: "T-1004" },
    { id: "P-05", drawingId: "DWG-201", x: 58, y: 68, location: "2F 中央 開口補強 O1", floor: "2F", area: "中央エリア", workType: "配筋検査", item: "開口補強筋", status: "redo", assignee: "山本 涼", due: "06/08", bbId: "BB-1045", taskId: "T-1005" },
    { id: "P-06", drawingId: "DWG-201", x: 80, y: 58, location: "2F 西側 柱 C7", floor: "2F", area: "西エリア", workType: "配筋検査", item: "主筋定着長", status: "none", assignee: "中村 拓也", due: "06/10", bbId: "BB-1046", taskId: "T-1006" },
  ];

  // ---- Blackboard templates ----
  const templates = [
    { id: "TPL-1", name: "配筋検査 標準黒板", workType: "配筋検査", fields: 9, active: true, reusable: true, by: "田中 美咲", uses: 142, layout: "rebar" },
    { id: "TPL-2", name: "出来形管理 黒板", workType: "出来形管理", fields: 8, active: true, reusable: true, by: "佐藤 健一", uses: 88, layout: "dimension" },
    { id: "TPL-3", name: "コンクリート打設 黒板", workType: "コンクリート打設", fields: 7, active: true, reusable: true, by: "田中 美咲", uses: 64, layout: "general" },
    { id: "TPL-4", name: "汎用黒板（基本）", workType: "汎用", fields: 6, active: true, reusable: true, by: "田中 美咲", uses: 311, layout: "general" },
    { id: "TPL-5", name: "設備工事 黒板", workType: "設備工事", fields: 7, active: false, reusable: false, by: "高橋 由紀", uses: 23, layout: "general" },
    { id: "TPL-6", name: "安全確認 黒板", workType: "安全確認", fields: 5, active: true, reusable: true, by: "佐藤 健一", uses: 47, layout: "general" },
  ];

  // ---- Blackboards (instances) ----
  function bb(id, name, item, point, design, actual, status, photos, pinId) {
    return {
      id, name,
      project: project.name, contractor: project.contractor,
      workType: "配筋検査", category: "鉄筋", subcategory: item,
      location: (pins.find(p => p.bbId === id) || {}).location || "2F",
      floor: "2F", point, design, actual,
      drawingNumber: "S-201", taskNumber: (pins.find(p => p.bbId === id) || {}).taskId || "T-",
      status, photos, pinId, template: "配筋検査 標準黒板",
      date: "2026/06/09", shooter: "山本 涼",
    };
  }
  const blackboards = [
    bb("BB-1041", "2F-G2 主筋検査", "主筋 D25", "No.1", "D25 上端5-下端5", "上端5-下端5 OK", "approved", 3, "P-01"),
    bb("BB-1042", "2F-C3 帯筋検査", "帯筋 D13", "No.2", "D13@100", "D13@98", "pending", 2, "P-02"),
    bb("BB-1043", "2F-S2 配力筋", "配力筋 D10", "No.3", "D10@200", "—", "shooting", 1, "P-03"),
    bb("BB-1044", "2F-B5 あばら筋", "あばら筋 D10", "No.4", "D10@150", "—", "none", 0, "P-04"),
    bb("BB-1045", "2F-O1 開口補強", "補強筋 D16", "No.5", "D16 4本", "D16 4本", "redo", 1, "P-05"),
    bb("BB-1046", "2F-C7 定着長", "主筋 D25", "No.6", "L=40d", "—", "none", 0, "P-06"),
  ];

  // ---- Photo tasks ----
  const tasks = pins.map((p, i) => {
    const b = blackboards.find(x => x.id === p.bbId);
    return {
      id: p.taskId, name: `${p.location} ${p.item}`, project: project.name,
      drawingId: p.drawingId, pinId: p.id, bbId: p.bbId,
      floor: p.floor, area: p.area, workType: p.workType, item: p.item,
      requirement: i % 2 === 0 ? "全景・近景の2枚以上、黒板の測点が読めること" : "黒板・スケール・対象が1枚に収まること",
      assignee: p.assignee, due: p.due, status: p.status,
    };
  });

  // ---- Construction photos ----
  function photo(id, taskId, bbId, status, comment, reason, tamper) {
    const b = blackboards.find(x => x.id === bbId) || {};
    const t = tasks.find(x => x.id === taskId) || {};
    return {
      id, taskId, bbId, drawingId: t.drawingId, pinId: t.pinId,
      location: b.location, floor: b.floor, workType: b.workType, item: b.subcategory,
      design: b.design, actual: b.actual, point: b.point,
      shooter: "山本 涼", takenAt: "2026/06/09 09:" + (10 + parseInt(id.slice(-2)) % 40),
      uploadedAt: "2026/06/09 09:" + (12 + parseInt(id.slice(-2)) % 40),
      status, comment, reason, tamper: tamper || "ok",
      gps: "35.6197, 139.7798",
      hue: 150 + (parseInt(id.slice(-2)) * 23) % 80,
    };
  }
  const photos = [
    photo("PH-2201", "T-1001", "BB-1041", "approved", null, null, "ok"),
    photo("PH-2202", "T-1001", "BB-1041", "approved", null, null, "ok"),
    photo("PH-2203", "T-1001", "BB-1041", "approved", null, null, "ok"),
    photo("PH-2204", "T-1002", "BB-1042", "pending", null, null, "ok"),
    photo("PH-2205", "T-1002", "BB-1042", "pending", null, null, "ok"),
    photo("PH-2206", "T-1003", "BB-1043", "shooting", null, null, "uncheck"),
    photo("PH-2207", "T-1005", "BB-1045", "redo", "黒板が鉄筋を隠しています。黒板を右下へ移動し、帯筋ピッチが見える角度で再撮影してください。", "黒板が対象物を隠している", "ok"),
    photo("PH-2208", "T-1002", "BB-1042", "pending", null, null, "uncheck"),
  ];

  // ---- Review history ----
  const reviewHistory = [
    { photoId: "PH-2207", reviewer: "田中 美咲", action: "差戻し", reason: "黒板が対象物を隠している", comment: "黒板を右下へ移動して再撮影", at: "2026/06/09 10:24" },
    { photoId: "PH-2201", reviewer: "田中 美咲", action: "承認", reason: null, comment: "OK", at: "2026/06/09 10:12" },
  ];

  // ---- Dashboard KPIs ----
  const kpi = {
    tasksTotal: 248, none: 41, pending: 23, approved: 168, redo: 9, unuploaded: 7,
    todayUploaded: 34, ledgers: 12, tamperPending: 18, redoRate: 0.036, leadTimeHrs: 2.4,
  };
  const progressByWork = [
    { name: "配筋検査", done: 82, total: 96 },
    { name: "基礎工事", done: 64, total: 64 },
    { name: "コンクリート打設", done: 38, total: 52 },
    { name: "型枠工事", done: 21, total: 44 },
    { name: "設備工事", done: 9, total: 30 },
  ];
  const uploadTrend = [12, 18, 9, 24, 31, 22, 34];

  // ---- CSV import sample rows ----
  const csvRows = [
    { 黒板名: "3F-G1 主筋検査", 工種: "配筋検査", 種別: "鉄筋", 細別: "主筋 D25", 施工箇所: "3F 東 大梁 G1", 階: "3F", 測点: "No.7", 設計値: "上端5-下端5", 図面番号: "S-301", err: null },
    { 黒板名: "3F-C1 帯筋検査", 工種: "配筋検査", 種別: "鉄筋", 細別: "帯筋 D13", 施工箇所: "3F 中央 柱 C1", 階: "3F", 測点: "No.8", 設計値: "D13@100", 図面番号: "S-301", err: null },
    { 黒板名: "3F-S1 配力筋", 工種: "配筋検査", 種別: "鉄筋", 細別: "配力筋 D10", 施工箇所: "3F 西 スラブ S1", 階: "3F", 測点: "No.9", 設計値: "D10@200", 図面番号: "S-301", err: null },
    { 黒板名: "3F-G1 主筋検査", 工種: "配筋検査", 種別: "鉄筋", 細別: "主筋 D25", 施工箇所: "3F 東 大梁 G1", 階: "3F", 測点: "No.10", 設計値: "上端5-下端5", 図面番号: "S-301", err: "黒板名が重複しています" },
    { 黒板名: "3F-B2 あばら筋", 工種: "ハイキン", 種別: "鉄筋", 細別: "あばら筋 D10", 施工箇所: "3F 東 小梁 B2", 階: "3F", 測点: "No.11", 設計値: "D10@150", 図面番号: "S-301", err: "工種「ハイキン」が存在しません" },
    { 黒板名: "3F-O1 開口補強", 工種: "配筋検査", 種別: "鉄筋", 細別: "補強筋 D16", 施工箇所: "3F 中央 開口 O1", 階: "3F", 測点: "", 設計値: "D16 4本", 図面番号: "S-999", err: "図面番号「S-999」が存在しません" },
  ];

  // ---- Ledger ----
  const ledgerTypes = ["黒板別写真台帳", "工種別写真台帳", "階別写真台帳", "月次写真台帳", "出来形写真台帳", "竣工写真台帳"];

  // ---- Users / roles ----
  const roles = ["システム管理者", "案件管理者", "事務所管理者", "現場責任者", "現場作業者", "協力会社ユーザー", "発注者/監理者"];
  const users = [
    { name: "田中 美咲", email: "tanaka@daiwa-const.co.jp", role: "案件管理者", company: "大和建設", status: "有効" },
    { name: "佐藤 健一", email: "sato@daiwa-const.co.jp", role: "事務所管理者", company: "大和建設", status: "有効" },
    { name: "山本 涼", email: "yamamoto@daiwa-const.co.jp", role: "現場作業者", company: "大和建設", status: "有効" },
    { name: "中村 拓也", email: "nakamura@kyoryoku.co.jp", role: "協力会社ユーザー", company: "中村鉄筋工業", status: "有効" },
    { name: "高橋 由紀", email: "takahashi@daiwa-const.co.jp", role: "現場責任者", company: "大和建設", status: "有効" },
    { name: "監理 太郎", email: "kanri@kowan-ryutsu.co.jp", role: "発注者/監理者", company: "東京港湾流通", status: "閲覧のみ" },
  ];

  // ---- Audit log ----
  const auditLog = [
    { user: "田中 美咲", action: "写真を差戻し", target: "PH-2207", at: "2026/06/09 10:24" },
    { user: "山本 涼", action: "黒板付き写真をアップロード", target: "PH-2206", at: "2026/06/09 09:48" },
    { user: "田中 美咲", action: "黒板を一括作成（CSV 6件）", target: "BB-1041〜", at: "2026/06/09 08:30" },
    { user: "佐藤 健一", action: "図面を公開", target: "DWG-201 Rev.3", at: "2026/06/05 14:21" },
    { user: "田中 美咲", action: "撮影タスクを発行（6件）", target: "T-1001〜", at: "2026/06/05 14:25" },
  ];

  window.MOCK = {
    STATUS, WORK_TYPES, project, projects, drawings, pins, templates, blackboards,
    tasks, photos, reviewHistory, kpi, progressByWork, uploadTrend, csvRows,
    ledgerTypes, roles, users, auditLog,
  };
})();
