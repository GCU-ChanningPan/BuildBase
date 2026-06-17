/* ============================================================
   帳票機能 — mock data (extends window.MOCK)
   FormTemplate · FormSubmission · Issue · CorrectionReport · ApprovalHistory
   ============================================================ */
(function () {
  const M = window.MOCK;

  // 帳票ステータス（下書き / 提出済 / 差戻し / 承認済）
  const FORM_STATUS = {
    draft:     { key: "draft",     label: "下書き",  color: "var(--st-none)",     soft: "var(--st-none-soft)" },
    submitted: { key: "submitted", label: "提出済",  color: "var(--st-shooting)", soft: "var(--st-shooting-soft)" },
    returned:  { key: "returned",  label: "差戻し",  color: "var(--st-redo)",     soft: "var(--st-redo-soft)" },
    approved:  { key: "approved",  label: "承認済",  color: "var(--st-approved)", soft: "var(--st-approved-soft)" },
  };
  // 指摘ステータス（未対応 / 対応中 / 確認待ち / 完了 / 差戻し）
  const ISSUE_STATUS = {
    open:     { key: "open",     label: "未対応",   color: "var(--st-none)",     soft: "var(--st-none-soft)" },
    doing:    { key: "doing",    label: "対応中",   color: "var(--st-shooting)", soft: "var(--st-shooting-soft)" },
    checking: { key: "checking", label: "確認待ち", color: "var(--st-pending)",  soft: "var(--st-pending-soft)" },
    done:     { key: "done",     label: "完了",     color: "var(--st-approved)", soft: "var(--st-approved-soft)" },
    returned: { key: "returned", label: "差戻し",   color: "var(--st-redo)",     soft: "var(--st-redo-soft)" },
  };

  const SEVERITY = {
    high: { label: "重大", color: "var(--st-redo)", soft: "var(--st-redo-soft)" },
    mid:  { label: "中",   color: "var(--st-pending)", soft: "var(--st-pending-soft)" },
    low:  { label: "軽微", color: "var(--st-shooting)", soft: "var(--st-shooting-soft)" },
  };

  // ---- 帳票テンプレート ----
  const formTemplates = [
    { id: "FT-1", name: "作業日報", type: "作業日報", icon: "log", fields: 9, active: true, scope: "全工事共通", by: "田中 美咲", uses: 412,
      fieldList: ["作業内容", "作業時間", "作業人員", "使用機械", "天候", "気温", "安全事項", "翌日予定", "備考"] },
    { id: "FT-2", name: "鉄筋検査チェックシート", type: "検査チェックシート", icon: "list", fields: 8, active: true, scope: "配筋検査", by: "佐藤 健一", uses: 168,
      fieldList: ["主筋 径・本数", "帯筋 ピッチ", "あばら筋 ピッチ", "かぶり厚", "継手長さ", "定着長さ", "結束状態", "清掃状態"] },
    { id: "FT-3", name: "コンクリート打設検査", type: "検査チェックシート", icon: "list", fields: 7, active: true, scope: "コンクリート打設", by: "佐藤 健一", uses: 94,
      fieldList: ["スランプ", "空気量", "コンクリート温度", "塩化物量", "打設順序", "締固め", "養生方法"] },
    { id: "FT-4", name: "是正報告書", type: "是正報告書", icon: "redo", fields: 7, active: true, scope: "全工事共通", by: "田中 美咲", uses: 53,
      fieldList: ["指摘内容", "発生場所", "原因", "是正内容", "是正前写真", "是正後写真", "再発防止策"] },
    { id: "FT-5", name: "安全巡視表（簡易）", type: "安全巡視表", icon: "shield", fields: 6, active: true, scope: "全工事共通", by: "高橋 由紀", uses: 121,
      fieldList: ["保護具着用", "開口部養生", "電気設備", "整理整頓", "重機作業", "特記事項"] },
    { id: "FT-6", name: "写真台帳", type: "写真台帳", icon: "grid", fields: 5, active: true, scope: "全工事共通", by: "田中 美咲", uses: 230,
      fieldList: ["工種", "施工箇所", "写真区分", "コメント", "電子黒板連携"] },
    { id: "FT-7", name: "出来形管理表", type: "検査チェックシート", icon: "ruler", fields: 6, active: false, scope: "出来形管理", by: "佐藤 健一", uses: 12,
      fieldList: ["設計値", "実測値", "規格値", "測点", "判定", "備考"] },
  ];

  // ---- 検査項目（チェックシート用サンプル） ----
  const inspectionItems = [
    { name: "主筋 径・本数", spec: "D25 上端5-下端5", result: "ok" },
    { name: "帯筋 ピッチ", spec: "D13@100", result: "ok" },
    { name: "あばら筋 ピッチ", spec: "D10@150", result: "ng" },
    { name: "かぶり厚", spec: "40mm 以上", result: "ok" },
    { name: "継手長さ", spec: "40d 以上", result: "ok" },
    { name: "定着長さ", spec: "L=40d", result: "unset" },
    { name: "結束状態", spec: "全数結束", result: "ok" },
    { name: "清掃状態", spec: "ゴミ・浮き錆なし", result: "ok" },
  ];

  // ---- 帳票提出（submissions） ----
  function sub(id, tplId, type, title, author, date, status, extra) {
    return { id, templateId: tplId, type, title, project: M.project.name, author, company: "大和建設", date, status, version: 1, photos: extra && extra.photos || 0, location: extra && extra.location || "—", returnComment: extra && extra.returnComment || null, approver: status === "approved" ? "田中 美咲" : null, approvedAt: status === "approved" ? date + " 17:20" : null };
  }
  const submissions = [
    { id: "SB-3306", templateId: "FT-4", type: "是正報告書", title: "2F-O1 開口補強 是正報告書", project: M.project.name, author: "田中 美咲", company: "大和建設", date: "2026/06/09", photos: 3, location: "2F 中央 開口 O1", drawingId: "DWG-201",
      overall: "打設前までに全件是正のこと。",
      pins: [
        { x: 38, y: 40, st: "open", comment: "あばら筋ピッチが設計値（@150）を超過。@180 の箇所あり。是正願います。", worker: "中村 拓也", photos: [18, 52] },
        { x: 62, y: 55, st: "checking", comment: "開口補強筋 D16 4本が未設置。打設前に設置のこと。", worker: "中村 拓也", photos: [140] },
        { x: 50, y: 70, st: "done", comment: "手すり養生の一部外れ。是正完了を確認。", worker: "高橋 由紀", photos: [120, 160] },
      ] },
    { id: "SB-3308", templateId: "FT-4", type: "是正報告書", title: "1F-W2 防水立上り 是正報告書", project: M.project.name, author: "田中 美咲", company: "大和建設", date: "2026/06/07", photos: 2, location: "1F 外周 W2", drawingId: "DWG-101",
      overall: "立上り高さの是正を確認。",
      pins: [
        { x: 30, y: 50, st: "done", comment: "防水立上り高さ不足（設計150→実測120）。是正済を確認。", worker: "山本 涼", photos: [30] },
        { x: 70, y: 45, st: "open", comment: "ドレン周り増し張り未施工。", worker: "山本 涼", photos: [200] },
      ] },
    { id: "SB-3401", templateId: "FT-6", type: "工事写真台帳", title: "配筋検査 写真台帳（2F 東）", project: M.project.name, author: "田中 美咲", company: "大和建設", date: "2026/06/09", photos: 6, location: "2F 東エリア", ledgerType: "工種別写真台帳",
      rows: [
        { hue: 150, comment: "2F-G2 主筋 D25 上端5-下端5 本数・径 確認" },
        { hue: 168, comment: "2F-G2 帯筋 D13@100 ピッチ確認" },
        { hue: 186, comment: "2F-C3 柱 主筋 D25 かぶり厚 40mm 確認" },
        { hue: 204, comment: "2F-C3 帯筋 D13@100 結束状態 確認" },
        { hue: 222, comment: "2F-S2 スラブ 配力筋 D10@200 確認" },
        { hue: 240, comment: "2F 開口 O1 補強筋 D16 設置確認" },
      ] },
    { id: "SB-3402", templateId: "FT-6", type: "工事写真台帳", title: "コンクリート打設 写真台帳（2F）", project: M.project.name, author: "佐藤 健一", company: "大和建設", date: "2026/06/08", photos: 4, location: "2F", ledgerType: "工種別写真台帳",
      rows: [
        { hue: 24, comment: "スランプ試験 18.0cm 確認" },
        { hue: 40, comment: "空気量試験 4.5% 確認" },
        { hue: 56, comment: "打設状況 2F 東スパン" },
        { hue: 72, comment: "締固め・養生状況 確認" },
      ] },
    { id: "SB-3403", templateId: "FT-6", type: "工事写真台帳", title: "出来形 写真台帳（基礎）", project: M.project.name, author: "高橋 由紀", company: "大和建設", date: "2026/06/05", photos: 3, location: "B1F", ledgerType: "出来形写真台帳",
      rows: [
        { hue: 96, comment: "基礎幅 実測 600mm（設計600）確認" },
        { hue: 112, comment: "かぶり厚 実測 62mm（設計60以上）確認" },
        { hue: 128, comment: "アンカーボルト位置 確認" },
      ] },
  ];

  // ---- 指摘・是正（Issues） ----
  const issues = [
    { id: "IS-501", project: M.project.name, content: "2F 小梁 B5 のあばら筋ピッチが設計値（@150）を超過。@180 で配筋されている箇所あり。", severity: "high", location: "2F 東 小梁 B5", pinId: "P-04", company: "中村鉄筋工業", assignee: "中村 拓也", reporter: "田中 美咲", due: "06/10", status: "doing", createdAt: "2026/06/09 10:40", hueBefore: 18, hueAfter: 140,
      comments: [{ by: "田中 美咲", at: "06/09 10:40", text: "あばら筋の是正をお願いします。" }, { by: "中村 拓也", at: "06/09 13:10", text: "本日中に是正し、写真を提出します。" }] },
    { id: "IS-502", project: M.project.name, content: "開口部 O1 の補強筋（D16 4本）が未設置。打設前に必ず設置のこと。", severity: "high", location: "2F 中央 開口 O1", pinId: "P-05", company: "中村鉄筋工業", assignee: "中村 拓也", reporter: "田中 美咲", due: "06/09", status: "checking", createdAt: "2026/06/09 09:20", hueBefore: 30, hueAfter: 150,
      comments: [{ by: "田中 美咲", at: "06/09 09:20", text: "補強筋を設置してください。" }, { by: "中村 拓也", at: "06/09 15:00", text: "設置完了。是正後写真を添付しました。確認お願いします。" }] },
    { id: "IS-503", project: M.project.name, content: "2F 東エリア 開口部の手すり養生が一部外れている。安全対策を実施のこと。", severity: "mid", location: "2F 東エリア", pinId: null, company: "大和建設", assignee: "高橋 由紀", reporter: "佐藤 健一", due: "06/10", status: "open", createdAt: "2026/06/09 11:05", hueBefore: 40, hueAfter: null, comments: [] },
    { id: "IS-504", project: M.project.name, content: "材料置き場の整理整頓不足。通路確保のこと。", severity: "low", location: "1F 資材置場", pinId: null, company: "大和建設", assignee: "山本 涼", reporter: "佐藤 健一", due: "06/08", status: "done", createdAt: "2026/06/08 14:00", hueBefore: 55, hueAfter: 120, comments: [{ by: "佐藤 健一", at: "06/08 14:00", text: "整理整頓をお願いします。" }, { by: "山本 涼", at: "06/08 16:30", text: "完了しました。" }, { by: "佐藤 健一", at: "06/08 17:00", text: "確認しました。完了とします。" }] },
  ];

  // ---- 出力ファイル（帳票出力・保管） ----
  const exportFiles = [
    { id: "EX-901", name: "写真台帳_PJ-2041_配筋検査_2026-06.pdf", type: "写真台帳", format: "PDF", project: "PJ-2041", date: "2026/06/09 17:30", by: "田中 美咲", size: "4.2 MB", count: 24 },
    { id: "EX-902", name: "作業日報_PJ-2041_2026-06-08.pdf", type: "作業日報", format: "PDF", project: "PJ-2041", date: "2026/06/08 18:10", by: "田中 美咲", size: "1.1 MB", count: 1 },
    { id: "EX-903", name: "鉄筋検査チェックシート_PJ-2041_2F-G2.xlsx", type: "検査チェックシート", format: "Excel", project: "PJ-2041", date: "2026/06/09 17:45", by: "佐藤 健一", size: "0.3 MB", count: 1 },
    { id: "EX-904", name: "是正報告書_PJ-2041_2F-O1.pdf", type: "是正報告書", format: "PDF", project: "PJ-2041", date: "2026/06/09 16:00", by: "田中 美咲", size: "0.8 MB", count: 1 },
    { id: "EX-905", name: "安全巡視表_PJ-2041_2026-06-08.pdf", type: "安全巡視表", format: "PDF", project: "PJ-2041", date: "2026/06/08 18:20", by: "佐藤 健一", size: "0.5 MB", count: 1 },
  ];

  const FORM_TYPES = ["是正報告書", "工事写真台帳"];

  Object.assign(M, { FORM_STATUS, ISSUE_STATUS, SEVERITY, formTemplates, inspectionItems, submissions, issues, exportFiles, FORM_TYPES });
})();
