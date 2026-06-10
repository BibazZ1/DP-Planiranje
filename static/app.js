/* DP Planiranje - timeline frontend */
"use strict";

const ODJELI = ["Dozvole", "POP / Provajder", "Planiranje", "Tiefbau",
                "Spülbohrung", "Montaža", "Aktivacija"];
const MJESECI = ["Januar","Februar","Mart","April","Maj","Juni",
                 "Juli","August","Septembar","Oktobar","Novembar","Decembar"];
const DANI = ["Po","Ut","Sr","Če","Pe","Su","Ne"];
const LABELW = 250;

let DATA = { dps: [], tasks: [], segments: [] };
let YEAR = 2026;
let PX = 3.8;                     // pixels per day
const PXMIN = 1.2, PXMAX = 36;
let charts = {};
let drag = null;                  // {taskId, trackEl, d0, d1, moved}
let popCtx = null;                // {mode:'new'|'edit', taskId, segId, status}
const F = { dp: new Set(), st: new Set(), odj: new Set(), esk: false };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

if (new URLSearchParams(location.search).has("static"))
  document.documentElement.classList.add("noanim");

/* ---------- date helpers (local, no TZ surprises) ---------- */
function pd(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function iso(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
         "-" + String(d.getDate()).padStart(2, "0");
}
function fmt(s) { if (!s) return ""; const [y, m, d] = s.split("-"); return `${d}.${m}.${y}`; }
function yearStart() { return new Date(YEAR, 0, 1); }
function daysInYear() { return Math.round((new Date(YEAR + 1, 0, 1) - yearStart()) / 864e5); }
function dayIdx(s) { return Math.round((pd(s) - yearStart()) / 864e5); }
function dateOfIdx(i) { const d = new Date(YEAR, 0, 1); d.setDate(d.getDate() + i); return d; }
function isoWeekOf(d) {
  const t = new Date(d);
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const w1 = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round(((t - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}
function todayIso() { const d = new Date(); return iso(d); }

async function api(url, method = "GET", body = null) {
  const r = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : null,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.status === 204 ? null : r.json();
}

/* ---------- filtering ---------- */
function segMatch(s) {
  if (F.st.size && !F.st.has(s.status)) return false;
  if (F.esk && !s.eskalacija) return false;
  return true;
}
function visibleSegs() {
  return DATA.segments.filter(s => {
    const t = DATA.tasks.find(t => t.id === s.task_id);
    if (!t) return false;
    if (F.dp.size && !F.dp.has(t.dp_id)) return false;
    if (F.odj.size && !F.odj.has(t.odjel)) return false;
    return segMatch(s);
  });
}

/* ---------- render all ---------- */
function renderAll() {
  renderKpis();
  renderSlicers();
  renderTimeline(true);
  renderStats();
}

/* ---------- KPIs ---------- */
function countUp(el, target) {
  const t0 = performance.now(), dur = 500, from = 0;
  function tick(t) {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * e);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function renderKpis() {
  const segs = visibleSegs();
  const c = st => segs.filter(s => s.status === st).length;
  const esk = segs.filter(s => s.eskalacija).length;
  const dps = F.dp.size ? DATA.dps.filter(d => F.dp.has(d.id)) : DATA.dps;
  const hp = dps.reduce((a, d) => a + (d.hp || 0), 0);
  const ha = dps.reduce((a, d) => a + (d.ha || 0), 0);
  $("#kpis").innerHTML = `
    <div class="kpi blue"><div class="num" data-n="${segs.length}">0</div><div class="lbl">Termina</div></div>
    <div class="kpi teal"><div class="num" data-n="${c("završeno")}">0</div><div class="lbl">Završeno</div></div>
    <div class="kpi amber"><div class="num" data-n="${c("u toku")}">0</div><div class="lbl">U toku</div></div>
    <div class="kpi red"><div class="num" data-n="${c("otvoreno")}">0</div><div class="lbl">Otvoreno</div></div>
    <div class="kpi red"><div class="num" data-n="${esk}">0</div><div class="lbl">⚠ Eskalacije</div></div>
    <div class="kpi purple"><div class="num" data-n="${hp}">0</div><div class="lbl">HP</div></div>
    <div class="kpi purple"><div class="num" data-n="${ha}">0</div><div class="lbl">HA</div></div>`;
  $$("#kpis .num").forEach(el => countUp(el, +el.dataset.n));
}

/* ---------- slicers ---------- */
function chip(label, cls, on, attrs = "") {
  return `<button class="chip ${cls}${on ? " on" : ""}" ${attrs}>${label}</button>`;
}
function renderSlicers() {
  const odj = [...new Set([...ODJELI, ...DATA.tasks.map(t => t.odjel).filter(Boolean)])];
  let html = `<div class="sl-row"><span class="sl-lbl">DP</span>` +
    DATA.dps.map(d => chip(`${d.pop} · ${d.naziv}`, "dp", F.dp.has(d.id), `data-dp="${d.id}"`)).join("") +
    `</div>
    <div class="sl-row"><span class="sl-lbl">Status</span>` +
    chip("otvoreno", "st-otvoreno", F.st.has("otvoreno"), `data-st="otvoreno"`) +
    chip("u toku", "st-utoku", F.st.has("u toku"), `data-st="u toku"`) +
    chip("završeno", "st-zavrseno", F.st.has("završeno"), `data-st="završeno"`) +
    chip("⚠ eskalacije", "esk", F.esk, `data-esk="1"`) +
    `</div>
    <div class="sl-row"><span class="sl-lbl">Odjel</span>` +
    odj.map(o => chip(o, "odj", F.odj.has(o), `data-odj="${o}"`)).join("") +
    chip("✕ očisti sve", "clear", false, `data-clear="1"`) +
    `</div>`;
  $("#slicers").innerHTML = html;
  $$("#slicers .chip").forEach(ch => ch.addEventListener("click", () => {
    if (ch.dataset.clear) { F.dp.clear(); F.st.clear(); F.odj.clear(); F.esk = false; }
    else if (ch.dataset.dp) { const v = +ch.dataset.dp; F.dp.has(v) ? F.dp.delete(v) : F.dp.add(v); }
    else if (ch.dataset.st) { const v = ch.dataset.st; F.st.has(v) ? F.st.delete(v) : F.st.add(v); }
    else if (ch.dataset.odj) { const v = ch.dataset.odj; F.odj.has(v) ? F.odj.delete(v) : F.odj.add(v); }
    else if (ch.dataset.esk) F.esk = !F.esk;
    renderAll();
  }));
}

/* ---------- timeline ---------- */
function dayMode() { return PX >= 7; }
function zoomLabel() { return PX >= 7 ? "dani" : PX >= 2.6 ? "sedmice" : "mjeseci"; }

function headerBands(totalW) {
  const n = daysInYear();
  /* months */
  let months = "";
  for (let m = 0; m < 12; m++) {
    const a = Math.round((new Date(YEAR, m, 1) - yearStart()) / 864e5);
    const b = Math.round((new Date(YEAR, m + 1, 1) - yearStart()) / 864e5);
    const w = (b - a) * PX;
    months += `<div class="hb" style="left:${a * PX}px;width:${w}px">${w > 46 ? MJESECI[m] : MJESECI[m].slice(0, 3)}</div>`;
  }
  /* weeks */
  let weeks = "";
  const wpx = 7 * PX;
  const skip = wpx >= 26 ? 1 : wpx >= 13 ? 2 : 4;
  let d = new Date(yearStart());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));   // monday on/before Jan 1
  const todayI = dayIdx(todayIso());
  while (d < new Date(YEAR + 1, 0, 1)) {
    const a = Math.round((d - yearStart()) / 864e5);
    const kw = isoWeekOf(d);
    const isNow = todayI >= a && todayI < a + 7;
    weeks += `<div class="hb${isNow ? " todayw" : ""}" style="left:${Math.max(0, a * PX)}px;width:${wpx - Math.max(0, -a * PX)}px">` +
      `${kw % skip === 0 || skip === 1 ? "KW" + kw : ""}</div>`;
    d.setDate(d.getDate() + 7);
  }
  /* days / monday dates */
  let days = "";
  if (dayMode()) {
    for (let i = 0; i < n; i++) {
      const dt = dateOfIdx(i);
      const we = dt.getDay() === 0 || dt.getDay() === 6;
      const lbl = PX >= 15 ? `${DANI[(dt.getDay() + 6) % 7]} ${dt.getDate()}` : `${dt.getDate()}`;
      days += `<div class="hb${we ? " we" : ""}${i === todayI ? " today" : ""}" style="left:${i * PX}px;width:${PX}px">${PX >= 9 ? lbl : ""}</div>`;
    }
  } else if (PX >= 2.6) {
    let d2 = new Date(yearStart());
    d2.setDate(d2.getDate() + (8 - (d2.getDay() || 7)) % 7);  // first monday
    while (d2 < new Date(YEAR + 1, 0, 1)) {
      const a = Math.round((d2 - yearStart()) / 864e5);
      days += `<div class="hb" style="left:${a * PX}px;width:${wpx}px">${wpx >= 30 ? String(d2.getDate()).padStart(2, "0") + "." + String(d2.getMonth() + 1).padStart(2, "0") + "." : ""}</div>`;
      d2.setDate(d2.getDate() + 7);
    }
  }
  return `<div class="tl-row head">
    <div class="tl-label"><b style="font:700 12px var(--mono);color:var(--teal)">${YEAR}</b>
      <span class="meta" style="font-size:10px;color:var(--mut2)">· ${zoomLabel()}</span></div>
    <div class="tl-track" style="width:${totalW}px">
      <div class="tl-head-band months" style="width:${totalW}px">${months}</div>
      <div class="tl-head-band kw" style="width:${totalW}px">${weeks}</div>
      ${days ? `<div class="tl-head-band days" style="width:${totalW}px">${days}</div>` : ""}
    </div></div>`;
}

function trackBg() {
  const imgs = [`linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)`];
  const sizes = [`${7 * PX}px 100%`];
  if (dayMode()) {
    imgs.push(`linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)`);
    sizes.push(`${PX}px 100%`);
  }
  return `background-image:${imgs.join(",")};background-size:${sizes.join(",")}`;
}

function renderTimeline(keepScroll) {
  const sc = $("#tlScroll");
  const sl = keepScroll ? sc.scrollLeft : 0, st = keepScroll ? sc.scrollTop : 0;
  const n = daysInYear(), totalW = n * PX;
  const todayI = dayIdx(todayIso());
  const segsByTask = {};
  for (const s of DATA.segments) (segsByTask[s.task_id] ||= []).push(s);

  let html = headerBands(totalW);

  for (const dp of DATA.dps) {
    if (F.dp.size && !F.dp.has(dp.id)) continue;
    const tasks = DATA.tasks.filter(t => t.dp_id === dp.id)
      .filter(t => !F.odj.size || F.odj.has(t.odjel));
    const rows = tasks.filter(t => {
      if (!F.st.size && !F.esk) return true;
      return (segsByTask[t.id] || []).some(segMatch);
    });
    if (!rows.length && (F.st.size || F.esk || F.odj.size)) continue;

    const allSegs = DATA.tasks.filter(t => t.dp_id === dp.id)
      .flatMap(t => segsByTask[t.id] || []);
    const pct = allSegs.length
      ? Math.round(allSegs.filter(s => s.status === "završeno").length / allSegs.length * 100) : 0;

    html += `<div class="tl-row group" data-dp="${dp.id}">
      <div class="tl-label">
        <div class="gr-info"><b>${dp.pop} · ${dp.naziv}</b>
          <span class="meta">${dp.lokacija ? dp.lokacija + " · " : ""}HP ${dp.hp} · HA ${dp.ha}</span></div>
        <div class="gr-side"><span class="pbar"><i style="width:${pct}%"></i></span>
          <span class="pct">${pct}%</span>
          <button class="gbtn addTask" title="Dodaj aktivnost">＋</button>
          <button class="gbtn delDp" title="Obriši DP">🗑</button></div>
      </div>
      <div class="tl-track" style="width:${totalW}px"></div></div>`;

    for (const t of rows) {
      let segs = "";
      for (const s of (segsByTask[t.id] || [])) {
        const a = Math.max(0, dayIdx(s.datum_od)), b = Math.min(n - 1, dayIdx(s.datum_do));
        if (b < 0 || a > n - 1) continue;
        const x = a * PX, w = Math.max(PX, (b - a + 1) * PX);
        const dim = !segMatch(s);
        const cls = s.status === "završeno" ? "st-zavrseno" : s.status === "u toku" ? "st-utoku" : "st-otvoreno";
        const tip = `${t.aktivnost}: ${fmt(s.datum_od)} – ${fmt(s.datum_do)} · ${s.status}` +
          (s.eskalacija ? ` · ⚠ ${s.esk_razlog || "eskalacija"}` : "") +
          (s.komentar ? ` · ${s.komentar}` : "") + `  (dupli klik = uredi)`;
        segs += `<div class="seg ${cls}${s.eskalacija ? " esk" : ""}" data-seg="${s.id}"
          style="left:${x}px;width:${w}px;${dim ? "opacity:.13;filter:saturate(.3)" : ""}" title="${esc(tip)}">` +
          (s.eskalacija ? `<span class="warn">⚠</span>` : "") +
          (w > 60 ? `<span>${fmt(s.datum_od).slice(0, 5)}–${fmt(s.datum_do).slice(0, 5)}</span>` : "") +
          (s.komentar && w > 150 ? `<span class="kom">· ${esc(s.komentar)}</span>` : "") +
          `</div>`;
      }
      html += `<div class="tl-row" data-task="${t.id}">
        <div class="tl-label">
          <span class="act-name" title="dupli klik = preimenuj">${esc(t.aktivnost)}</span>
          <span class="odj-tag" title="klik = promijeni odjel">${esc(t.odjel || "—")}</span>
          <button class="rowdel" title="Obriši">✕</button>
        </div>
        <div class="tl-track" style="width:${totalW}px;${trackBg()}">${segs}</div></div>`;
    }
  }

  html = `<div class="tl-inner" style="position:relative;min-width:max-content">${html}
    ${todayI >= 0 && todayI < n ? `<i class="today-line" style="left:${LABELW + todayI * PX + PX / 2}px"></i>` : ""}</div>`;
  sc.innerHTML = html;
  sc.scrollLeft = sl; sc.scrollTop = st;
  $("#zLabel").textContent = zoomLabel();
  bindTimeline();
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/* ---------- timeline interactions ---------- */
function snapRange(i0, i1) {
  let a = Math.min(i0, i1), b = Math.max(i0, i1);
  if (!dayMode()) {                       // snap to full ISO weeks
    const da = dateOfIdx(a), db = dateOfIdx(b);
    da.setDate(da.getDate() - ((da.getDay() + 6) % 7));
    db.setDate(db.getDate() + (7 - (db.getDay() || 7)));
    a = Math.max(0, Math.round((da - yearStart()) / 864e5));
    b = Math.min(daysInYear() - 1, Math.round((db - yearStart()) / 864e5));
  }
  return [a, b];
}
function trackDay(e, track) {
  const r = track.getBoundingClientRect();
  return Math.max(0, Math.min(daysInYear() - 1, Math.floor((e.clientX - r.left) / PX)));
}

function bindTimeline() {
  $$("#tlScroll .tl-row[data-task] .tl-track").forEach(track => {
    track.addEventListener("mousedown", e => {
      if (e.button !== 0 || e.target.closest(".seg")) return;
      e.preventDefault();
      const taskId = +track.closest(".tl-row").dataset.task;
      drag = { taskId, track, d0: trackDay(e, track), d1: trackDay(e, track), moved: false };
      ghost();
    });
    track.addEventListener("mousemove", e => {
      if (!drag || drag.track !== track) return;
      drag.d1 = trackDay(e, track);
      drag.moved = true;
      ghost();
    });
  });
  $$("#tlScroll .seg").forEach(sg => {
    sg.addEventListener("dblclick", e => {
      e.stopPropagation();
      openPop("edit", +sg.dataset.seg, e.clientX, e.clientY);
    });
  });
  $$("#tlScroll .addTask").forEach(b => b.addEventListener("click", async () => {
    const dpId = +b.closest(".tl-row").dataset.dp;
    const naziv = prompt("Naziv nove aktivnosti:");
    if (!naziv) return;
    await api("/api/tasks", "POST", { dp_id: dpId, aktivnost: naziv, odjel: "" });
    await load();
  }));
  $$("#tlScroll .delDp").forEach(b => b.addEventListener("click", async () => {
    const dpId = +b.closest(".tl-row").dataset.dp;
    const dp = DATA.dps.find(d => d.id === dpId);
    if (!confirm(`Obrisati ${dp.pop} · ${dp.naziv} i sve aktivnosti?`)) return;
    await api(`/api/dps/${dpId}`, "DELETE");
    await load();
  }));
  $$("#tlScroll .rowdel").forEach(b => b.addEventListener("click", async () => {
    const id = +b.closest(".tl-row").dataset.task;
    const t = DATA.tasks.find(x => x.id === id);
    if (!confirm(`Obrisati aktivnost "${t.aktivnost}"?`)) return;
    await api(`/api/tasks/${id}`, "DELETE");
    await load();
  }));
  $$("#tlScroll .act-name").forEach(el => el.addEventListener("dblclick", async () => {
    const id = +el.closest(".tl-row").dataset.task;
    const t = DATA.tasks.find(x => x.id === id);
    const v = prompt("Naziv aktivnosti:", t.aktivnost);
    if (!v || v === t.aktivnost) return;
    t.aktivnost = v;
    await api(`/api/tasks/${id}`, "PATCH", { aktivnost: v });
    renderTimeline(true);
  }));
  $$("#tlScroll .odj-tag").forEach(el => el.addEventListener("click", async () => {
    const id = +el.closest(".tl-row").dataset.task;
    const t = DATA.tasks.find(x => x.id === id);
    const i = (ODJELI.indexOf(t.odjel) + 1) % ODJELI.length;
    t.odjel = ODJELI[i];
    await api(`/api/tasks/${id}`, "PATCH", { odjel: t.odjel });
    renderTimeline(true); renderSlicers();
  }));
}

function ghost() {
  $$(".ghost").forEach(g => g.remove());
  if (!drag) return;
  const [a, b] = snapRange(drag.d0, drag.d1);
  const g = document.createElement("div");
  g.className = "ghost";
  g.style.left = a * PX + "px";
  g.style.width = (b - a + 1) * PX + "px";
  drag.track.appendChild(g);
}

document.addEventListener("mouseup", e => {
  if (!drag) return;
  const { taskId } = drag;
  const [a, b] = snapRange(drag.d0, drag.d1);
  drag = null;
  $$(".ghost").forEach(g => g.remove());
  openPop("new", null, e.clientX, e.clientY, {
    taskId, od: iso(dateOfIdx(a)), do_: iso(dateOfIdx(b)),
  });
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (drag) { drag = null; $$(".ghost").forEach(g => g.remove()); }
    closePop();
  }
});

/* ---------- popover ---------- */
function openPop(mode, segId, cx, cy, init = {}) {
  const pop = $("#pop");
  let s = { status: "otvoreno", komentar: "", eskalacija: 0, esk_razlog: "" };
  if (mode === "edit") {
    s = DATA.segments.find(x => x.id === segId);
    popCtx = { mode, segId, status: s.status };
    $("#popTitle").textContent = "Uredi termin";
    $("#popOd").value = s.datum_od; $("#popDo").value = s.datum_do;
    $("#popDel").classList.remove("hidden");
  } else {
    popCtx = { mode, taskId: init.taskId, status: "otvoreno" };
    $("#popTitle").textContent = "Novi termin";
    $("#popOd").value = init.od; $("#popDo").value = init.do_;
    $("#popDel").classList.add("hidden");
  }
  $("#popKom").value = s.komentar || "";
  $("#popEsk").checked = !!s.eskalacija;
  $("#popRazlog").value = s.esk_razlog || "";
  $("#popRazlogWrap").classList.toggle("hidden", !s.eskalacija);
  $$("#popStatus .stpill").forEach(p =>
    p.classList.toggle("on", p.dataset.st === (popCtx.status)));
  pop.classList.remove("hidden");
  const W = 300, H = pop.offsetHeight || 330;
  pop.style.left = Math.min(cx, innerWidth - W - 16) + "px";
  pop.style.top = Math.min(cy + 10, innerHeight - H - 16) + "px";
  $("#popKom").focus();
}
function closePop() { $("#pop").classList.add("hidden"); popCtx = null; }

$$("#popStatus .stpill").forEach(p => p.addEventListener("click", () => {
  popCtx.status = p.dataset.st;
  $$("#popStatus .stpill").forEach(x => x.classList.toggle("on", x === p));
}));
$("#popEsk").addEventListener("change", () =>
  $("#popRazlogWrap").classList.toggle("hidden", !$("#popEsk").checked));
$("#popCancel").addEventListener("click", closePop);
$("#popDel").addEventListener("click", async () => {
  if (popCtx?.mode !== "edit") return;
  await api(`/api/segments/${popCtx.segId}`, "DELETE");
  DATA.segments = DATA.segments.filter(s => s.id !== popCtx.segId);
  closePop(); renderAll();
});
$("#popSave").addEventListener("click", async () => {
  if (!popCtx) return;
  const body = {
    datum_od: $("#popOd").value, datum_do: $("#popDo").value,
    status: popCtx.status, komentar: $("#popKom").value,
    eskalacija: $("#popEsk").checked ? 1 : 0,
    esk_razlog: $("#popEsk").checked ? $("#popRazlog").value : "",
  };
  if (!body.datum_od || !body.datum_do || body.datum_do < body.datum_od) return;
  if (popCtx.mode === "new") {
    body.task_id = popCtx.taskId;
    const r = await api("/api/segments", "POST", body);
    DATA.segments.push({ id: r.id, ...body });
  } else {
    await api(`/api/segments/${popCtx.segId}`, "PATCH", body);
    Object.assign(DATA.segments.find(s => s.id === popCtx.segId), body);
  }
  closePop(); renderAll();
});
document.addEventListener("mousedown", e => {
  if (popCtx && !e.target.closest("#pop") && !e.target.closest(".seg")) closePop();
});

/* ---------- zoom ---------- */
function setPx(newPx, anchorX) {
  newPx = Math.max(PXMIN, Math.min(PXMAX, newPx));
  if (newPx === PX) return;
  const sc = $("#tlScroll"), r = sc.getBoundingClientRect();
  const ax = (anchorX ?? (r.left + r.width / 2)) - r.left - LABELW;
  const day = (sc.scrollLeft + ax) / PX;
  PX = newPx;
  renderTimeline(false);
  sc.scrollLeft = Math.max(0, day * PX - ax);
}
$("#zIn").addEventListener("click", () => setPx(PX * 1.5));
$("#zOut").addEventListener("click", () => setPx(PX / 1.5));
$("#zFit").addEventListener("click", () => {
  const sc = $("#tlScroll");
  setPx((sc.clientWidth - LABELW - 12) / daysInYear());
});
$("#tlScroll").addEventListener("wheel", e => {
  const inHead = e.target.closest(".tl-row.head");
  if (!e.ctrlKey && !inHead) return;
  e.preventDefault();
  setPx(PX * (e.deltaY < 0 ? 1.3 : 0.77), e.clientX);
}, { passive: false });

/* ---------- stats (ista stranica, reaguje na slicere) ---------- */
function chartDefaults() {
  Chart.defaults.color = "#76859b";
  Chart.defaults.borderColor = "rgba(255,255,255,.06)";
  Chart.defaults.font.family = "'Segoe UI',system-ui,sans-serif";
  Chart.defaults.animation.duration = 600;
}
function renderStats() {
  chartDefaults();
  const segs = visibleSegs();
  const c = st => segs.filter(s => s.status === st).length;
  for (const k in charts) { charts[k].destroy(); delete charts[k]; }
  const C = (id, cfg) => charts[id] = new Chart($(id), cfg);

  C("#chStatus", { type: "doughnut", data: {
      labels: ["završeno", "u toku", "otvoreno"],
      datasets: [{ data: [c("završeno"), c("u toku"), c("otvoreno")],
        backgroundColor: ["#19e3a2", "#ffb224", "#ff4d6a"],
        borderColor: "rgba(10,16,26,.9)", borderWidth: 3, hoverOffset: 8 }] },
    options: { maintainAspectRatio: false, cutout: "70%",
      plugins: { legend: { position: "bottom" } } } });

  const odj = [...new Set(DATA.tasks.map(t => t.odjel).filter(Boolean))];
  const byOdj = st => odj.map(o => segs.filter(s => {
    const t = DATA.tasks.find(t => t.id === s.task_id);
    return t && t.odjel === o && s.status === st;
  }).length);
  C("#chOdjel", { type: "bar", data: {
      labels: odj,
      datasets: [
        { label: "završeno", data: byOdj("završeno"), backgroundColor: "#19e3a2", borderRadius: 5 },
        { label: "u toku", data: byOdj("u toku"), backgroundColor: "#ffb224", borderRadius: 5 },
        { label: "otvoreno", data: byOdj("otvoreno"), backgroundColor: "#ff4d6a", borderRadius: 5 }] },
    options: { maintainAspectRatio: false,
      scales: { x: { stacked: true, grid: { display: false } },
                y: { stacked: true, ticks: { precision: 0 } } },
      plugins: { legend: { position: "bottom" } } } });

  const dps = F.dp.size ? DATA.dps.filter(d => F.dp.has(d.id)) : DATA.dps;
  const pctDp = dps.map(d => {
    const ss = segs.filter(s => {
      const t = DATA.tasks.find(t => t.id === s.task_id);
      return t && t.dp_id === d.id;
    });
    return ss.length ? Math.round(ss.filter(s => s.status === "završeno").length / ss.length * 100) : 0;
  });
  C("#chDp", { type: "bar", data: {
      labels: dps.map(d => `${d.pop} · ${d.naziv}`),
      datasets: [{ data: pctDp,
        backgroundColor: pctDp.map(p => p >= 100 ? "#19e3a2" : "#39a7ff"),
        borderRadius: 7, barThickness: 18 }] },
    options: { maintainAspectRatio: false, indexAxis: "y",
      scales: { x: { max: 100, ticks: { callback: v => v + "%" } },
                y: { grid: { display: false } } },
      plugins: { legend: { display: false } } } });

  const eskSegs = DATA.segments.filter(s => s.eskalacija);
  const rows = eskSegs.map(s => {
    const t = DATA.tasks.find(t => t.id === s.task_id) || {};
    const d = DATA.dps.find(d => d.id === t.dp_id) || {};
    return `<tr><td>${d.pop || ""} · ${d.naziv || ""}</td><td>${esc(t.aktivnost || "")}</td>
      <td>${fmt(s.datum_od)} – ${fmt(s.datum_do)}</td><td>${s.status}</td>
      <td class="tag-esk">${esc(s.esk_razlog || "—")}</td><td>${esc(s.komentar || "")}</td></tr>`;
  }).join("");
  $("#eskPanel").innerHTML = `<h3>⚠ Eskalacije — šta je zapelo</h3>
    <table class="mini"><tr><th>DP</th><th>Aktivnost</th><th>Termin</th><th>Status</th>
    <th>Razlog</th><th>Komentar</th></tr>` +
    (rows || `<tr><td colspan="6" class="empty">Nema aktivnih eskalacija ✨</td></tr>`) + `</table>`;
}

/* ---------- shell ---------- */
const yearSel = $("#year");
for (let y = 2025; y <= 2032; y++) yearSel.add(new Option(y, y));
yearSel.value = YEAR;
yearSel.addEventListener("change", () => { YEAR = +yearSel.value; renderTimeline(false); });

$("#btnAddDp").addEventListener("click", () => $("#dlgDp").showModal());
$("#frmDp").addEventListener("submit", async e => {
  if (e.submitter && e.submitter.value === "cancel") return;
  const fd = new FormData(e.target);
  await api("/api/dps", "POST", Object.fromEntries(fd.entries()));
  e.target.reset();
  await load();
});

async function load() {
  DATA = await api("/api/data");
  renderAll();
}
load();
