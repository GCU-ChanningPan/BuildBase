/* ============================================================
   Shared reactive store — photo tasks flow across devices
   iPad (タスク作成) → iPhone (撮影・送信) → iPad (検査確認) → Web 写真管理
   Statuses: none 未撮影 / pending 確認待ち / approved 確認済み
   ============================================================ */
(function () {
  const M = window.MOCK;
  let seq = 6000;

  function mkPhoto(task, extra) {
    const b = M.blackboards.find(x => x.id === task.bbId) || {};
    return {
      id: "PH-" + (++seq),
      taskId: task.id, bbId: task.bbId, taskName: task.name,
      location: task.floor ? (task.floor + " " + (task.area || "")).trim() : (b.location || "—"),
      workType: task.workType || b.workType,
      point: b.point, design: b.design, actual: b.actual,
      shooter: task.assignee || "山本 涼",
      device: "iPhone",
      takenAt: extra.takenAt || "2026/06/16 09:30",
      uploadedAt: extra.takenAt || "2026/06/16 09:30",
      hue: extra.hue != null ? extra.hue : 150,
      status: extra.status || "pending",
      gps: "35.6197, 139.7798",
      confirmedAt: null, confirmedBy: null,
    };
  }

  // normalize base tasks to 未撮影
  const tasks = M.tasks.map(t => ({ ...t, status: "none" }));

  // seed: two tasks already shot on iPhone, awaiting iPad confirmation
  const photos = [];
  [0, 1].forEach((idx, i) => {
    const t = tasks[idx];
    if (!t) return;
    t.status = "pending";
    photos.push(mkPhoto(t, { takenAt: "2026/06/16 08:4" + (i + 2), hue: 150 + i * 28, status: "pending" }));
  });

  const nowHM = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  let attSeq = 100;
  const attendance = [
    { id: "AT-1", user: "高橋 由紀", role: "現場作業者", date: "2026/06/16", clockIn: "07:55", clockOut: "17:10", status: "done" },
    { id: "AT-2", user: "佐藤 健一", role: "現場責任者", date: "2026/06/16", clockIn: "08:02", clockOut: null, status: "working" },
    { id: "AT-3", user: "中村 拓也", role: "協力会社", date: "2026/06/15", clockIn: "08:10", clockOut: "16:40", status: "done" },
  ];

  let state = { tasks, photos, attendance };
  const listeners = new Set();
  const emit = () => { state = { tasks: state.tasks, photos: state.photos, attendance: state.attendance }; listeners.forEach(l => l()); };

  window.PhotoStore = {
    get: () => state,
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
    addTask: (t) => { state.tasks = [{ ...t, status: "none" }, ...state.tasks]; emit(); },
    removeTasks: (ids) => { const set = new Set(ids); state.tasks = state.tasks.filter(t => !set.has(t.id)); state.photos = state.photos.filter(p => !set.has(p.taskId)); emit(); },
    // iPhone shoots a task → photo enters 確認待ち, task → pending
    shoot: (taskId, opts) => {
      opts = opts || {};
      const t = state.tasks.find(x => x.id === taskId);
      if (!t) return;
      const ph = mkPhoto(t, { takenAt: opts.takenAt || "2026/06/16 09:42", hue: opts.hue != null ? opts.hue : 152, status: "pending" });
      state.tasks = state.tasks.map(x => x.id === taskId ? { ...x, status: "pending" } : x);
      state.photos = [ph, ...state.photos];
      emit();
      return ph;
    },
    // iPad confirms photos → photo + task → approved (流入 Web 写真管理)
    confirm: (ids) => {
      const set = new Set(ids);
      state.photos = state.photos.map(p => set.has(p.id) ? { ...p, status: "approved", confirmedAt: "2026/06/16 10:20", confirmedBy: "田中 美咲" } : p);
      const approvedTasks = new Set(state.photos.filter(p => p.status === "approved").map(p => p.taskId));
      state.tasks = state.tasks.map(t => approvedTasks.has(t.id) ? { ...t, status: "approved" } : t);
      emit();
    },
    // iPad 差戻し → 写真を削除し、タスクを未撮影へ戻す（iPhoneで再撮影）
    reject: (photoId) => {
      const ph = state.photos.find(p => p.id === photoId);
      state.photos = state.photos.filter(p => p.id !== photoId);
      if (ph) {
        const stillHas = state.photos.some(p => p.taskId === ph.taskId);
        if (!stillHas) state.tasks = state.tasks.map(t => t.id === ph.taskId ? { ...t, status: "none" } : t);
      }
      emit();
    },
    // iPhone 出勤 → Web 勤怠履歴に記録
    clockIn: (user, role) => {
      if (state.attendance.some(a => a.user === user && a.status === "working")) return;
      state.attendance = [{ id: "AT-" + (++attSeq), user, role: role || "現場作業者", date: "2026/06/16", clockIn: nowHM(), clockOut: null, status: "working" }, ...state.attendance];
      emit();
    },
    // iPhone 退勤
    clockOut: (user) => {
      state.attendance = state.attendance.map(a => a.user === user && a.status === "working" ? { ...a, clockOut: nowHM(), status: "done" } : a);
      emit();
    },
  };
})();
