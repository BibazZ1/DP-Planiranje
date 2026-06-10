/* DP Planiranje frontend */
"use strict";

const STATUSI = ["", "otvoreno", "u toku", "završeno"];
const ODJELI = ["Dozvole", "POP / Provajder", "Planiranje", "Tiefbau",
                "Spülbohrung", "Montaža", "Aktivacija"];
const MJESECI = ["Januar","Februar","Mart","April","Maj","Juni",
                 "Juli","August","Septembar","Oktobar","Novembar","Decembar"];
const PAINT_COLORS = { "otvoreno": "#ff4d6a", "u toku": "#ffb224",
                       "završeno": "#19e3a2", "__erase__": "#8294ab" };

let DATA = { dps: [], tasks: [] };
let YEAR = 2026;
let charts = {};
let paintStatus = "otvoreno";
let drag = null;   // {taskId, start, end}

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

function isoWeek(dStr) {
  const d = new Date(dStr + "T00:00:00");
  if (isNaN(d)) return null;
  const t = new Date(d);
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const w1 = new Date(t.getFullYear(), 0, 4);
  const week = 1 + Math.round(((t - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  return { year: t.getFullYear(), week };
}
function mondayOf(y, w) {
  const jan4 = new Date(y, 0, 4);
  const mon = new Date(jan4);
  mon.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (w - 1) * 7);
  return mon;
}
function isoDate(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
         "-" + String(d.getDate()).padStart(2, "0");
}
function weeksInYear(y) { return isoWeek(`${y}-12-28`).week; }
function fmtD(d) {
  return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + ".";
}
function fmtFull(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}
function weekSpan(od, doo) {
  if (!od || !doo) return null;
  const a = isoWeek(od), b = isoWeek(doo);
  if (!a || !b) return null;
  const n = weeksInYear(YEAR);
  let s = a.year < YEAR ? 1 : a.year > YEAR ? null : a.week;
  let e = b.year > YEAR ? n : b.year < YEAR ? null : b.week;
  if (s === null || e === null || e < s) return null;
  return [s, e];
}
function stClass(status) {
  if (status === "završeno") return "st-zavrseno";
  if (status === "u toku") return "st-utoku";
  if (status === "otvoreno") return "st-otvoreno";
  return "";
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

async function api(url, method = "GET", body = null) {
  const r = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : null,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.status === 204 ? null : r.json();
}

async function load() {
  DATA = await api("/api/data");
  fillFilters();
  renderGrid();
}

/* ---------- KPI strip ---------- */
function renderKpis() {
  const t = DATA.tasks;
  const cnt = s => t.filter(x => x.status === s).length;
  const esk = t.filter(x => x.eskalacija === "da").length;
  const hp = DATA.dps.reduce((a, d) => a + (d.hp || 0), 0);
  const ha = DATA.dps.reduce((a, d) => a + (d.ha || 0), 0);
  $("#kpis").innerHTML = `
    <div class="kpi blue"><div class="num">${t.length}</div><div class="lbl">Zadataka</div></div>
    <div class="kpi teal"><div class="num">${cnt("završeno")}</div><div class="lbl">Završeno</div></div>
    <div class="kpi amber"><div class="num">${cnt("u toku")}</div><div class="lbl">U toku</div></div>
    <div class="kpi red"><div class="num">${cnt("otvoreno")}</div><div class="lbl">Otvoreno</div></div>
    <div class="kpi grey"><div class="num">${t.filter(x => !x.status).length}</div><div class="lbl">Nepopunjeno</div></div>
    <div class="kpi red"><div class="num">${esk}</div><div class="lbl">Eskalacije</div></div>
    <div class="kpi purple"><div class="num">${hp}</div><div class="lbl">Ukupno HP</div></div>
    <div class="kpi purple"><div class="num">${ha}</div><div class="lbl">Ukupno HA</div></div>`;
}

/* ---------- filters ---------- */
function fillFilters() {
  const fDp = $("#fDp"), cur = fDp.value;
  fDp.innerHTML = '<option value="">Svi DP</option>' +
    DATA.dps.map(d => `<option value="${d.id}">${d.pop} · ${d.naziv}</option>`).join("");
  fDp.value = cur;
  const fO = $("#fOdjel"), curO = fO.value;
  const odj = [...new Set([...ODJELI, ...DATA.tasks.map(t => t.odjel).filter(Boolean)])];
  fO.innerHTML = '<option value="">Svi odjeli</option>' +
    odj.map(o => `<option>${o}</option>`).join("");
  fO.value = curO;
}
function taskVisible(t) {
  const fDp = $("#fDp").value, fSt = $("#fStatus").value,
        fO = $("#fOdjel").value, fE = $("#fEsk").value,
        q = $("#fSearch").value.trim().toLowerCase();
  if (fDp && String(t.dp_id) !== fDp) return false;
  if (fSt === "__empty__") { if (t.status) return false; }
  else if (fSt && t.status !== fSt) return false;
  if (fO && t.odjel !== fO) return false;
  if (fE && t.eskalacija !== fE) return false;
  if (q) {
    const dp = DATA.dps.find(d => d.id === t.dp_id) || {};
    const hay = [t.aktivnost, t.odjel, t.status, t.komentar, dp.pop, dp.naziv, dp.lokacija]
      .join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

/* ---------- grid ---------- */
function renderGrid() {
  renderKpis();
  const n = weeksInYear(YEAR);
  const wrap = $("#gridWrap");
  const nowW = isoWeek(new Date().toISOString().slice(0, 10));
  const curWeek = nowW.year === YEAR ? nowW.week : -1;

  let monthCells = "", mStart = 1, mPrev = mondayOf(YEAR, 1).getMonth();
  for (let w = 2; w <= n + 1; w++) {
    const m = w <= n ? mondayOf(YEAR, w).getMonth() : -1;
    if (m !== mPrev) {
      monthCells += `<th colspan="${w - mStart}">${MJESECI[mPrev]}</th>`;
      mStart = w; mPrev = m;
    }
  }
  let kwCells = "", dateCells = "";
  for (let w = 1; w <= n; w++) {
    kwCells += `<th class="wk">KW${w}</th>`;
    dateCells += `<th class="wk">${fmtD(mondayOf(YEAR, w))}</th>`;
  }

  const LEFT = `<th class="c0">POP/FCP</th><th class="c1">DP</th><th class="c2">Aktivnost</th>
    <th>Odjel</th><th>Status</th><th>Plan od</th><th>Plan do</th>
    <th>Stvarno od</th><th>Stvarno do</th><th>Esk.</th><th>Komentar</th><th></th>`;
  const LEFTN = 12;

  let html = `<table class="grid"><thead>
    <tr class="r-months"><th class="c0" colspan="3" style="z-index:31">Godina ${YEAR}</th>
      <th colspan="${LEFTN - 3}"></th>${monthCells}</tr>
    <tr class="r-kw">${LEFT}${kwCells}</tr>
    <tr class="r-date"><th class="c0" colspan="3"></th><th colspan="${LEFTN - 3}"></th>${dateCells}</tr>
    </thead><tbody>`;

  for (const dp of DATA.dps) {
    const tasks = DATA.tasks.filter(t => t.dp_id === dp.id);
    const visible = tasks.filter(taskVisible);
    if (!visible.length) continue;
    const done = tasks.filter(t => t.status === "završeno").length;
    const withSt = tasks.filter(t => t.status).length;
    const pct = withSt ? Math.round(done / withSt * 100) : 0;
    html += `<tr class="dprow" data-dp="${dp.id}">
      <td class="c0" colspan="3"><div class="dpline"><b>${dp.pop} · ${dp.naziv}</b>
        <span class="meta">${dp.lokacija || ""}</span></div></td>
      <td colspan="${LEFTN - 3}"><div class="dpline">
        <span class="meta">HP ${dp.hp} · HA ${dp.ha} · ${dp.voditelj || "—"}</span>
        <span class="pbar"><i style="width:${pct}%"></i></span><span class="pct">${pct}%</span>
        <button class="addTask" title="Dodaj aktivnost">＋ aktivnost</button>
        <button class="delDp" title="Obriši DP">🗑</button></div></td>
      <td colspan="${n}"></td></tr>`;
    for (const t of visible) html += taskRow(t, dp, n, curWeek);
  }
  html += "</tbody></table>";
  wrap.innerHTML = html;
  bindGrid();
}

function taskRow(t, dp, n, curWeek) {
  const span = weekSpan(t.plan_od, t.plan_do);
  const act = weekSpan(t.stvarno_od, t.stvarno_do);
  const sc = stClass(t.status);
  let cells = "";
  for (let w = 1; w <= n; w++) {
    let inner = "";
    if (span && w >= span[0] && w <= span[1] && sc) {
      const cls = (w === span[0] ? " first" : "") + (w === span[1] ? " last" : "");
      inner += `<div class="bar ${sc}${cls}" title="${t.aktivnost}: ${fmtFull(t.plan_od)} – ${fmtFull(t.plan_do)} (${t.status})"></div>`;
    }
    if (act && w >= act[0] && w <= act[1]) {
      const cls = (w === act[0] ? " first" : "") + (w === act[1] ? " last" : "");
      inner += `<div class="act${cls}" title="stvarno: ${fmtFull(t.stvarno_od)} – ${fmtFull(t.stvarno_do)}"></div>`;
    }
    cells += `<td class="wk${w === curWeek ? " cur" : ""}" data-w="${w}">${inner}</td>`;
  }
  const stOpts = STATUSI.map(s =>
    `<option value="${s}"${s === (t.status || "") ? " selected" : ""}>${s || "—"}</option>`).join("");
  const odOpts = [...new Set([t.odjel, ...ODJELI])].filter(x => x !== undefined).map(o =>
    `<option value="${o}"${o === t.odjel ? " selected" : ""}>${o || "—"}</option>`).join("");
  return `<tr data-id="${t.id}">
    <td class="c0">${dp.pop}</td><td class="c1">${dp.naziv}</td>
    <td class="c2 cell-edit"><input data-f="aktivnost" value="${esc(t.aktivnost)}"></td>
    <td class="cell-edit"><select data-f="odjel">${odOpts}</select></td>
    <td class="cell-edit ${sc}"><select data-f="status">${stOpts}</select></td>
    <td class="cell-edit"><input type="date" data-f="plan_od" value="${t.plan_od || ""}"></td>
    <td class="cell-edit"><input type="date" data-f="plan_do" value="${t.plan_do || ""}"></td>
    <td class="cell-edit"><input type="date" data-f="stvarno_od" value="${t.stvarno_od || ""}"></td>
    <td class="cell-edit"><input type="date" data-f="stvarno_do" value="${t.stvarno_do || ""}"></td>
    <td class="cell-edit ${t.eskalacija === "da" ? "esk-da" : ""}">
      <select data-f="eskalacija"><option value="ne"${t.eskalacija !== "da" ? " selected" : ""}>ne</option>
      <option value="da"${t.eskalacija === "da" ? " selected" : ""}>da</option></select></td>
    <td class="cell-edit"><input class="cmt" data-f="komentar" value="${esc(t.komentar || "")}"
      placeholder="…"></td>
    <td><button class="rowdel" title="Obriši aktivnost">✕</button></td>
    ${cells}</tr>`;
}

function bindGrid() {
  $$("#gridWrap [data-f]").forEach(el => {
    el.addEventListener("change", async () => {
      const tr = el.closest("tr"), id = +tr.dataset.id, f = el.dataset.f;
      const val = el.value;
      const t = DATA.tasks.find(x => x.id === id);
      t[f] = val;
      const patch = { [f]: val };
      if (f === "stvarno_do" && val && t.status !== "završeno") {
        t.status = "završeno"; patch.status = "završeno";
      }
      await api(`/api/tasks/${id}`, "PATCH", patch);
      renderGrid();
    });
  });
  $$("#gridWrap .rowdel").forEach(b => b.addEventListener("click", async () => {
    const tr = b.closest("tr"), id = +tr.dataset.id;
    const t = DATA.tasks.find(x => x.id === id);
    if (!confirm(`Obrisati aktivnost "${t.aktivnost}"?`)) return;
    await api(`/api/tasks/${id}`, "DELETE");
    await load();
  }));
  $$("#gridWrap .delDp").forEach(b => b.addEventListener("click", async () => {
    const dpId = +b.closest("tr").dataset.dp;
    const dp = DATA.dps.find(d => d.id === dpId);
    if (!confirm(`Obrisati ${dp.pop} · ${dp.naziv} i sve njegove aktivnosti?`)) return;
    await api(`/api/dps/${dpId}`, "DELETE");
    await load();
  }));
  $$("#gridWrap .addTask").forEach(b => b.addEventListener("click", async () => {
    const dpId = +b.closest("tr").dataset.dp;
    const naziv = prompt("Naziv nove aktivnosti:");
    if (!naziv) return;
    await api("/api/tasks", "POST", { dp_id: dpId, aktivnost: naziv, odjel: "" });
    await load();
  }));

  /* --- crtanje mišem po mreži sedmica --- */
  $$("#gridWrap tr[data-id] td.wk").forEach(td => {
    td.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      e.preventDefault();
      const tr = td.closest("tr");
      drag = { taskId: +tr.dataset.id, start: +td.dataset.w, end: +td.dataset.w };
      paintPreview();
    });
    td.addEventListener("mouseover", () => {
      if (!drag) return;
      const tr = td.closest("tr");
      if (+tr.dataset.id !== drag.taskId) return;
      drag.end = +td.dataset.w;
      paintPreview();
    });
  });
}

function paintPreview() {
  $$("#gridWrap td.wk.sel").forEach(c => c.classList.remove("sel"));
  if (!drag) return;
  const lo = Math.min(drag.start, drag.end), hi = Math.max(drag.start, drag.end);
  const tr = $(`#gridWrap tr[data-id="${drag.taskId}"]`);
  if (!tr) return;
  const color = PAINT_COLORS[paintStatus] || "#fff";
  $$("td.wk", tr).forEach(c => {
    const w = +c.dataset.w;
    if (w >= lo && w <= hi) { c.classList.add("sel"); c.style.setProperty("--paintc", color); }
  });
}

async function commitPaint() {
  if (!drag) return;
  const { taskId, start, end } = drag;
  drag = null;
  paintPreview();
  const lo = Math.min(start, end), hi = Math.max(start, end);
  const t = DATA.tasks.find(x => x.id === taskId);
  if (!t) return;
  let patch;
  if (paintStatus === "__erase__") {
    patch = { plan_od: null, plan_do: null, status: "" };
  } else {
    const mon = mondayOf(YEAR, lo);
    const sun = mondayOf(YEAR, hi); sun.setDate(sun.getDate() + 6);
    patch = { plan_od: isoDate(mon), plan_do: isoDate(sun), status: paintStatus };
  }
  Object.assign(t, patch);
  await api(`/api/tasks/${taskId}`, "PATCH", patch);
  renderGrid();
}
document.addEventListener("mouseup", commitPaint);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && drag) { drag = null; paintPreview(); }
});
$$(".pill").forEach(p => p.addEventListener("click", () => {
  paintStatus = p.dataset.paint;
  $$(".pill").forEach(x => x.classList.toggle("active", x === p));
}));

/* ---------- stats ---------- */
function chartDefaults() {
  Chart.defaults.color = "#76859b";
  Chart.defaults.borderColor = "rgba(255,255,255,.06)";
  Chart.defaults.font.family = "'Segoe UI',system-ui,sans-serif";
}
async function renderStats() {
  chartDefaults();
  const s = await api("/api/stats");
  const bs = s.by_status;
  const total = Object.values(bs).reduce((a, b) => a + b, 0);
  $("#statCards").innerHTML = `
    <div class="card blue"><div class="num">${total}</div><div class="lbl">Ukupno zadataka</div></div>
    <div class="card green"><div class="num">${bs["završeno"] || 0}</div><div class="lbl">Završeno</div></div>
    <div class="card amber"><div class="num">${bs["u toku"] || 0}</div><div class="lbl">U toku</div></div>
    <div class="card red"><div class="num">${bs["otvoreno"] || 0}</div><div class="lbl">Otvoreno</div></div>
    <div class="card"><div class="num">${bs["nepopunjeno"] || 0}</div><div class="lbl">Nepopunjeno</div></div>
    <div class="card red"><div class="num">${s.eskalacije.length}</div><div class="lbl">Eskalacije</div></div>
    <div class="card blue"><div class="num">${s.totals.hp || 0}</div><div class="lbl">Ukupno HP</div></div>
    <div class="card blue"><div class="num">${s.totals.ha || 0}</div><div class="lbl">Ukupno HA</div></div>`;

  for (const k in charts) charts[k].destroy();
  const C = (id, cfg) => charts[id] = new Chart($(id), cfg);

  C("#chStatus", { type: "doughnut", data: {
      labels: ["završeno", "u toku", "otvoreno", "nepopunjeno"],
      datasets: [{ data: [bs["završeno"] || 0, bs["u toku"] || 0, bs["otvoreno"] || 0, bs["nepopunjeno"] || 0],
        backgroundColor: ["#19e3a2", "#ffb224", "#ff4d6a", "#36465c"],
        borderColor: "#0d141e", borderWidth: 3 }] },
    options: { maintainAspectRatio: false, cutout: "68%",
      plugins: { legend: { position: "bottom" } } } });

  C("#chOdjel", { type: "bar", data: {
      labels: s.by_odjel.map(o => o.odjel || "—"),
      datasets: [
        { label: "završeno", data: s.by_odjel.map(o => o.zavrseno), backgroundColor: "#19e3a2" },
        { label: "u toku", data: s.by_odjel.map(o => o.utoku), backgroundColor: "#ffb224" },
        { label: "otvoreno", data: s.by_odjel.map(o => o.otvoreno), backgroundColor: "#ff4d6a" },
        { label: "nepopunjeno", data: s.by_odjel.map(o => o.nepopunjeno), backgroundColor: "#36465c" }] },
    options: { maintainAspectRatio: false, responsive: true,
      scales: { x: { stacked: true, grid: { display: false } },
                y: { stacked: true, ticks: { precision: 0 } } },
      plugins: { legend: { position: "bottom" } } } });

  C("#chDp", { type: "bar", data: {
      labels: s.per_dp.map(d => `${d.pop} · ${d.naziv}`),
      datasets: [{ label: "% završeno",
        data: s.per_dp.map(d => d.ukupno ? Math.round(d.zavrseno / d.ukupno * 100) : 0),
        backgroundColor: "#39a7ff", borderRadius: 6 }] },
    options: { maintainAspectRatio: false, indexAxis: "y",
      scales: { x: { max: 100, ticks: { callback: v => v + "%" } },
                y: { grid: { display: false } } },
      plugins: { legend: { display: false } } } });

  const eskRows = s.eskalacije.map(e => `<tr><td>${e.pop} · ${e.dp_naziv}</td>
    <td>${e.aktivnost}</td><td>${e.status || "—"}</td>
    <td>${fmtFull(e.plan_od)} – ${fmtFull(e.plan_do)}</td><td>${esc(e.komentar || "")}</td></tr>`).join("");
  $("#tblEsk").innerHTML = `<tr><th>DP</th><th>Aktivnost</th><th>Status</th><th>Plan</th><th>Komentar</th></tr>` +
    (eskRows || `<tr><td colspan="5" class="empty">Nema aktivnih eskalacija</td></tr>`);

  const kRows = s.kasnjenja.map(e => `<tr><td>${e.pop} · ${e.dp_naziv}</td>
    <td>${e.aktivnost}</td><td>${e.status || "—"}</td><td>${fmtFull(e.plan_do)}</td></tr>`).join("");
  $("#tblKasni").innerHTML = `<tr><th>DP</th><th>Aktivnost</th><th>Status</th><th>Plan do</th></tr>` +
    (kRows || `<tr><td colspan="4" class="empty">Nema probijenih rokova</td></tr>`);
}

/* ---------- UI wiring ---------- */
$$(".tab").forEach(b => b.addEventListener("click", () => {
  $$(".tab").forEach(x => x.classList.toggle("active", x === b));
  $("#view-plan").classList.toggle("hidden", b.dataset.tab !== "plan");
  $("#view-stats").classList.toggle("hidden", b.dataset.tab !== "stats");
  if (b.dataset.tab === "stats") renderStats();
}));

["fDp", "fStatus", "fOdjel", "fEsk"].forEach(id =>
  $("#" + id).addEventListener("change", renderGrid));
$("#fSearch").addEventListener("input", renderGrid);
$("#fReset").addEventListener("click", () => {
  ["fDp", "fStatus", "fOdjel", "fEsk"].forEach(id => $("#" + id).value = "");
  $("#fSearch").value = "";
  renderGrid();
});

const yearSel = $("#year");
for (let y = 2025; y <= 2032; y++) yearSel.add(new Option(y, y));
yearSel.value = YEAR;
yearSel.addEventListener("change", () => { YEAR = +yearSel.value; renderGrid(); });

$("#btnAddDp").addEventListener("click", () => $("#dlgDp").showModal());
$("#frmDp").addEventListener("submit", async e => {
  if (e.submitter && e.submitter.value === "cancel") return;
  const fd = new FormData(e.target);
  await api("/api/dps", "POST", Object.fromEntries(fd.entries()));
  e.target.reset();
  await load();
});

load();
