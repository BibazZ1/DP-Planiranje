/* DP Planiranje - timeline frontend */
"use strict";

const ODJELI = ["Dozvole", "POP / Provajder", "Planiranje", "Tiefbau",
                "Spülbohrung", "Montaža", "Aktivacija"];
const LABELW = 400;

/* ---------- i18n: BS / EN / DE ---------- */
const I18N = {
  bs: {
    sub: "terminski plan gradnje", godina: "Godina", noviDp: "+ Novi DP",
    projekat: "Projekat", kunde: "Kunde", ocistiTip: "Poništi filtere",
    syncTip: "Povuci svježe podatke iz Azure SQL",
    chStatus: "Termini po statusu", chOdjel: "Termini po odjelu",
    chDp: "Napredak po DP — % završeno",
    tlHint: "prevuci po praznom = novi termin · povuci rub trake = skrati/produži · dupli klik = uredi · Ctrl+kolutić = zoom",
    zoomOut: "Umanji", zoomIn: "Uvećaj", zoomFit: "Cijela godina",
    zDani: "dani", zSedmice: "sedmice", zMjeseci: "mjeseci",
    stOtvoreno: "otvoreno", stUToku: "u toku", stZavrseno: "završeno",
    od: "od", do: "do", komentar: "komentar", komPh: "npr. čeka se dozvola…",
    kasniLbl: "⏰ razlog produženja — termin probio rok (obavezno)",
    kasniPh: "zašto još nije gotovo?", esk: "⚠ eskalacija",
    eskOd: "eskalacija od datuma", eskRazlog: "razlog eskalacije", eskPh: "šta je zapelo?",
    obrisi: "Obriši", otkazi: "Otkaži", sacuvaj: "Sačuvaj", odustani: "Odustani",
    noviDpH: "Novi DP", projDaily: "Projekat (Daily)", nazivDp: "Naziv DP",
    lokacija: "Lokacija / dionica", voditelj: "Voditelj projekta",
    brojHp: "Broj HP", brojHa: "Broj HA",
    dlgHint: "Automatski se kreira 8 standardnih aktivnosti.",
    noviTermin: "Novi termin", urediTermin: "Uredi termin",
    kTermina: "Termina", kEsk: "⚠ Eskalacije",
    slDp: "DP", slStatus: "Status", slOdjel: "Odjel",
    eskChip: "⚠ eskalacije", clearAll: "✕ očisti sve",
    sviKunde: "— svi kunde —", sviProj: "— svi projekti —", sviCode: "— svi code —",
    projekata: "projekata", sviProjekti: "svi projekti", filterLbl: "filter",
    syncUToku: "⟳ sync u toku…", syncGreska: "⚠ sync greška", syncLbl: "sync",
    trasa: "Trasa (m)", haM: "HA (m)", haKom: "HA kom", montaza: "Montaža",
    zadnjiRad: "Zadnji rad", dpUPlanu: "DP u planu",
    dpChipHint: "klik na DP = filtriraj timeline ispod",
    noDp: "nema DP-ova vezanih za ovaj izbor — kod \"+ Novi DP\" upiši projekat",
    eskTitle: "⚠ Eskalacije — šta je zapelo", thDp: "DP", thAkt: "Aktivnost",
    thTermin: "Termin", thStatus: "Status", thRazlog: "Razlog", thKomentar: "Komentar",
    noEsk: "Nema aktivnih eskalacija ✨",
    kasni: "KASNI", kasniDoDanas: "produženo do danas",
    razlogProd: "razlog produženja", razlogNijeUpisan: "⚠ nije upisan — dupli klik!",
    hist: "📜 Historija", noHist: "nema zabilježenih promjena", hcEdit: "dupli klik = uredi",
    hKreirano: "kreirano", hStatus: "status", hPocetak: "početak", hKraj: "kraj",
    hEskalacija: "eskalacija", hEskOd: "eskalacija od", obrisano: "(obrisano)",
    promptAkt: "Naziv nove aktivnosti:", promptNaziv: "Naziv aktivnosti:",
    confDelDp: "Obrisati {0} i sve aktivnosti?", confDelAkt: "Obrisati aktivnost \"{0}\"?",
    danas: "danas", sortPop: "sortiraj po POP", sortDp: "sortiraj po DP",
    sortAkt: "sortiraj po aktivnosti", aktivnost: "Aktivnost",
    userTip: "ko si ti? — ime se bilježi uz svaku izmjenu",
    userPrompt: "Upiši svoje ime (bilježi se u historiji izmjena):",
    nepoznat: "nepoznat",
    noviPop: "Novi POP", noviPopH: "Novi POP", popNaziv: "Naziv POP",
    foldFilteri: "Filteri", foldAnalitika: "Analitika", ocisti: "Očisti",
    aktivniFilteri: "aktivni filteri",
    aktivni: "Aktivni", ocistiSve: "Očisti sve", traziPh: "Pretraži…",
    statusLbl: "Status", odjelLbl: "Odjel",
    datumOd: "Datum od", datumDo: "Datum do", nemaRez: "nema rezultata", da: "Da",
    lockHint: "🔒 izaberi projekat gore da otključaš dodavanje POP-ova",
    popHint: "klik na karticu = historija + filter · ＋ DP = novi DP pod tim POP-om",
    noPops: "još nema POP-ova pod ovim projektom — dodaj prvi ↑",
    noPopsAny: "još nema nijednog POP-a — klikni ＋ Novi POP",
    noDpsPop: "još nema DP-ova",
    dodajDpTip: "Dodaj DP pod ovaj POP", popCardTip: "klik = historija ovog POP-a",
    drDpCount: "DP-ova", histTitle: "📜 Historija",
    histEmpty: "još nema zabilježenih aktivnosti", histLoad: "učitavam…",
    aKreirano: "kreirano", aObrisano: "obrisano", aTerminObrisan: "termin obrisan",
    aAktDodana: "aktivnost dodana", aAktObrisana: "aktivnost obrisana",
    fNaziv: "naziv", fOdjel: "odjel",
    confDelPop: "Obrisati POP {0} i {1} DP-ova (sa svim aktivnostima)?",
    renameTo: "Novi naziv:",
    popPostoji: "POP s tim nazivom već postoji pod ovim projektom.",
    dpHistTip: "klik = historija DP-a",
    drRenameTip: "preimenuj", drDelTip: "obriši",
  },
  en: {
    sub: "construction schedule", godina: "Year", noviDp: "+ New DP",
    projekat: "Project", kunde: "Client", ocistiTip: "Clear filters",
    syncTip: "Pull fresh data from Azure SQL",
    chStatus: "Slots by status", chOdjel: "Slots by department",
    chDp: "Progress per DP — % done",
    tlHint: "drag on empty = new slot · drag bar edge = shorten/extend · double-click = edit · Ctrl+wheel = zoom",
    zoomOut: "Zoom out", zoomIn: "Zoom in", zoomFit: "Whole year",
    zDani: "days", zSedmice: "weeks", zMjeseci: "months",
    stOtvoreno: "open", stUToku: "in progress", stZavrseno: "done",
    od: "from", do: "to", komentar: "comment", komPh: "e.g. waiting for permit…",
    kasniLbl: "⏰ extension reason — deadline passed (required)",
    kasniPh: "why is it not finished yet?", esk: "⚠ escalation",
    eskOd: "escalation from date", eskRazlog: "escalation reason", eskPh: "what is stuck?",
    obrisi: "Delete", otkazi: "Cancel", sacuvaj: "Save", odustani: "Cancel",
    noviDpH: "New DP", projDaily: "Project (Daily)", nazivDp: "DP name",
    lokacija: "Location / section", voditelj: "Project manager",
    brojHp: "HP count", brojHa: "HA count",
    dlgHint: "8 standard activities are created automatically.",
    noviTermin: "New slot", urediTermin: "Edit slot",
    kTermina: "Slots", kEsk: "⚠ Escalations",
    slDp: "DP", slStatus: "Status", slOdjel: "Dept.",
    eskChip: "⚠ escalations", clearAll: "✕ clear all",
    sviKunde: "— all clients —", sviProj: "— all projects —", sviCode: "— all codes —",
    projekata: "projects", sviProjekti: "all projects", filterLbl: "filter",
    syncUToku: "⟳ sync running…", syncGreska: "⚠ sync error", syncLbl: "sync",
    trasa: "Route (m)", haM: "HA (m)", haKom: "HA pcs", montaza: "Installation",
    zadnjiRad: "Last work", dpUPlanu: "DPs in plan",
    dpChipHint: "click a DP = filter timeline below",
    noDp: "no DPs linked to this selection — enter the project in \"+ New DP\"",
    eskTitle: "⚠ Escalations — what is stuck", thDp: "DP", thAkt: "Activity",
    thTermin: "Slot", thStatus: "Status", thRazlog: "Reason", thKomentar: "Comment",
    noEsk: "No active escalations ✨",
    kasni: "LATE", kasniDoDanas: "extended to today",
    razlogProd: "extension reason", razlogNijeUpisan: "⚠ not entered — double-click!",
    hist: "📜 History", noHist: "no recorded changes", hcEdit: "double-click = edit",
    hKreirano: "created", hStatus: "status", hPocetak: "start", hKraj: "end",
    hEskalacija: "escalation", hEskOd: "escalation from", obrisano: "(cleared)",
    promptAkt: "Name of the new activity:", promptNaziv: "Activity name:",
    confDelDp: "Delete {0} and all activities?", confDelAkt: "Delete activity \"{0}\"?",
    danas: "today", sortPop: "sort by POP", sortDp: "sort by DP",
    sortAkt: "sort by activity", aktivnost: "Activity",
    userTip: "who are you? — your name is recorded with every change",
    userPrompt: "Enter your name (recorded in the change history):",
    nepoznat: "unknown",
    noviPop: "New POP", noviPopH: "New POP", popNaziv: "POP name",
    foldFilteri: "Filters", foldAnalitika: "Analytics", ocisti: "Clear",
    aktivniFilteri: "active filters",
    aktivni: "Active", ocistiSve: "Clear all", traziPh: "Search…",
    statusLbl: "Status", odjelLbl: "Department",
    datumOd: "Date from", datumDo: "Date to", nemaRez: "no results", da: "Yes",
    lockHint: "🔒 select a project above to unlock adding POPs",
    popHint: "click a card = history + filter · ＋ DP = new DP under that POP",
    noPops: "no POPs under this project yet — add the first ↑",
    noPopsAny: "no POPs yet — click ＋ New POP",
    noDpsPop: "no DPs yet",
    dodajDpTip: "Add a DP under this POP", popCardTip: "click = this POP's history",
    drDpCount: "DPs", histTitle: "📜 History",
    histEmpty: "no recorded activity yet", histLoad: "loading…",
    aKreirano: "created", aObrisano: "deleted", aTerminObrisan: "slot deleted",
    aAktDodana: "activity added", aAktObrisana: "activity deleted",
    fNaziv: "name", fOdjel: "department",
    confDelPop: "Delete POP {0} and {1} DPs (with all activities)?",
    renameTo: "New name:",
    popPostoji: "A POP with that name already exists under this project.",
    dpHistTip: "click = DP history",
    drRenameTip: "rename", drDelTip: "delete",
  },
  de: {
    sub: "Bauzeitenplan", godina: "Jahr", noviDp: "+ Neuer DP",
    projekat: "Projekt", kunde: "Kunde", ocistiTip: "Filter zurücksetzen",
    syncTip: "Frische Daten aus Azure SQL laden",
    chStatus: "Termine nach Status", chOdjel: "Termine nach Abteilung",
    chDp: "Fortschritt je DP — % fertig",
    tlHint: "auf Fläche ziehen = neuer Termin · Balkenrand ziehen = kürzen/verlängern · Doppelklick = bearbeiten · Strg+Mausrad = Zoom",
    zoomOut: "Verkleinern", zoomIn: "Vergrößern", zoomFit: "Ganzes Jahr",
    zDani: "Tage", zSedmice: "Wochen", zMjeseci: "Monate",
    stOtvoreno: "offen", stUToku: "laufend", stZavrseno: "fertig",
    od: "von", do: "bis", komentar: "Kommentar", komPh: "z. B. warten auf Genehmigung…",
    kasniLbl: "⏰ Verlängerungsgrund — Termin überschritten (Pflicht)",
    kasniPh: "warum noch nicht fertig?", esk: "⚠ Eskalation",
    eskOd: "Eskalation ab Datum", eskRazlog: "Eskalationsgrund", eskPh: "was klemmt?",
    obrisi: "Löschen", otkazi: "Abbrechen", sacuvaj: "Speichern", odustani: "Abbrechen",
    noviDpH: "Neuer DP", projDaily: "Projekt (Daily)", nazivDp: "DP-Name",
    lokacija: "Lage / Abschnitt", voditelj: "Projektleiter",
    brojHp: "Anzahl HP", brojHa: "Anzahl HA",
    dlgHint: "8 Standardaktivitäten werden automatisch angelegt.",
    noviTermin: "Neuer Termin", urediTermin: "Termin bearbeiten",
    kTermina: "Termine", kEsk: "⚠ Eskalationen",
    slDp: "DP", slStatus: "Status", slOdjel: "Abteilung",
    eskChip: "⚠ Eskalationen", clearAll: "✕ alle löschen",
    sviKunde: "— alle Kunden —", sviProj: "— alle Projekte —", sviCode: "— alle Codes —",
    projekata: "Projekte", sviProjekti: "alle Projekte", filterLbl: "Filter",
    syncUToku: "⟳ Sync läuft…", syncGreska: "⚠ Sync-Fehler", syncLbl: "Sync",
    trasa: "Trasse (m)", haM: "HA (m)", haKom: "HA Stk.", montaza: "Montage",
    zadnjiRad: "Letzte Arbeit", dpUPlanu: "DPs im Plan",
    dpChipHint: "Klick auf DP = Timeline unten filtern",
    noDp: "keine DPs für diese Auswahl — Projekt bei \"+ Neuer DP\" eintragen",
    eskTitle: "⚠ Eskalationen — was klemmt", thDp: "DP", thAkt: "Aktivität",
    thTermin: "Termin", thStatus: "Status", thRazlog: "Grund", thKomentar: "Kommentar",
    noEsk: "Keine aktiven Eskalationen ✨",
    kasni: "VERSPÄTET", kasniDoDanas: "bis heute verlängert",
    razlogProd: "Verlängerungsgrund", razlogNijeUpisan: "⚠ nicht eingetragen — Doppelklick!",
    hist: "📜 Verlauf", noHist: "keine Änderungen erfasst", hcEdit: "Doppelklick = bearbeiten",
    hKreirano: "erstellt", hStatus: "Status", hPocetak: "Beginn", hKraj: "Ende",
    hEskalacija: "Eskalation", hEskOd: "Eskalation ab", obrisano: "(gelöscht)",
    promptAkt: "Name der neuen Aktivität:", promptNaziv: "Name der Aktivität:",
    confDelDp: "{0} und alle Aktivitäten löschen?", confDelAkt: "Aktivität \"{0}\" löschen?",
    danas: "heute", sortPop: "nach POP sortieren", sortDp: "nach DP sortieren",
    sortAkt: "nach Aktivität sortieren", aktivnost: "Aktivität",
    userTip: "wer bist du? — Name wird bei jeder Änderung erfasst",
    userPrompt: "Name eingeben (wird im Änderungsverlauf gespeichert):",
    nepoznat: "unbekannt",
    noviPop: "Neuer POP", noviPopH: "Neuer POP", popNaziv: "POP-Name",
    foldFilteri: "Filter", foldAnalitika: "Analyse", ocisti: "Leeren",
    aktivniFilteri: "aktive Filter",
    aktivni: "Aktiv", ocistiSve: "Alle leeren", traziPh: "Suchen…",
    statusLbl: "Status", odjelLbl: "Abteilung",
    datumOd: "Datum von", datumDo: "Datum bis", nemaRez: "keine Treffer", da: "Ja",
    lockHint: "🔒 oben ein Projekt wählen, um das Anlegen von POPs freizuschalten",
    popHint: "Klick auf Karte = Verlauf + Filter · ＋ DP = neuer DP unter dem POP",
    noPops: "noch keine POPs in diesem Projekt — ersten anlegen ↑",
    noPopsAny: "noch keine POPs — auf ＋ Neuer POP klicken",
    noDpsPop: "noch keine DPs",
    dodajDpTip: "DP unter diesem POP anlegen", popCardTip: "Klick = Verlauf dieses POP",
    drDpCount: "DPs", histTitle: "📜 Verlauf",
    histEmpty: "noch keine Aktivitäten erfasst", histLoad: "lädt…",
    aKreirano: "erstellt", aObrisano: "gelöscht", aTerminObrisan: "Termin gelöscht",
    aAktDodana: "Aktivität hinzugefügt", aAktObrisana: "Aktivität gelöscht",
    fNaziv: "Name", fOdjel: "Abteilung",
    confDelPop: "POP {0} und {1} DPs (mit allen Aktivitäten) löschen?",
    renameTo: "Neuer Name:",
    popPostoji: "Ein POP mit diesem Namen existiert bereits in diesem Projekt.",
    dpHistTip: "Klick = DP-Verlauf",
    drRenameTip: "umbenennen", drDelTip: "löschen",
  },
};
const MJESECI_ALL = {
  bs: ["Januar","Februar","Mart","April","Maj","Juni","Juli","August","Septembar","Oktobar","Novembar","Decembar"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  de: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
};
const DANI_ALL = {
  bs: ["Po","Ut","Sr","Če","Pe","Su","Ne"],
  en: ["Mo","Tu","We","Th","Fr","Sa","Su"],
  de: ["Mo","Di","Mi","Do","Fr","Sa","So"],
};
let LANG = localStorage.getItem("dp_lang") || "bs";
if (!I18N[LANG]) LANG = "bs";
let MJESECI = MJESECI_ALL[LANG];
let DANI = DANI_ALL[LANG];
const t = k => (I18N[LANG] && I18N[LANG][k]) ?? I18N.bs[k] ?? k;
const tf = (k, ...args) => args.reduce((s, a, i) => s.replaceAll(`{${i}}`, a), t(k));
/* prijevod statusa za prikaz (u bazi ostaje bs vrijednost) */
const stT = st => st === "otvoreno" ? t("stOtvoreno") : st === "u toku" ? t("stUToku")
  : st === "završeno" ? t("stZavrseno") : st;

let DATA = { dps: [], pops: [], tasks: [], segments: [], history: [] };
let YEAR = 2026;
let PX = 3.8;                     // pixels per day
const PXMAX = 24;                 // max zoom-in (dani); min is dynamic = fit whole year
let SORT = { key: "pop", dir: 1 };  // 'pop' | 'dp' | 'akt'

/* unique accent color per activity (standard 8 fixed, others hashed) */
const AKT_PALETTE = ["#3b82f6", "#818cf8", "#10b981", "#ff7849",
                     "#f5d90a", "#ff4da6", "#4dd9e8", "#a3e635"];
const AKT_COLORS = {
  "Dozvole": "#f5d90a", "Priključak na POP": "#3b82f6", "Pregled objekata": "#818cf8",
  "Iskopni radovi": "#ff7849", "Horizontalno bušenje": "#4dd9e8", "Asfaltiranje": "#a3e635",
  "Montaža": "#ff4da6", "Aktivacije": "#10b981",
};
function aktColor(name) {
  if (AKT_COLORS[name]) return AKT_COLORS[name];
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AKT_PALETTE[h % AKT_PALETTE.length];
}
let charts = {};
let drag = null;                  // {taskId, trackEl, d0, d1, moved}
let segResize = null;             // {id, side:'l'|'r', segEl, track, a, b, curA, curB}
let popCtx = null;                // {mode:'new'|'edit', taskId, segId, status}
const F = { dp: new Set(), pop: new Set(), st: new Set(), odj: new Set(), esk: false,
            dOd: "", dDo: "" };
let SEL = null;                   // {type:'pop'|'dp', id} — otvorena historija u draweru

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- korisnik: ko radi izmjene (ide u historiju) ---------- */
/* identitet dolazi iz Azure prijave (server ga upisuje u window.AUTH) */
let USER = ((window.AUTH && window.AUTH.name) || "").trim().slice(0, 60);
let askedUser = true; // nema više ručnog upisa imena
function renderUser() {
  const b = $("#userBadge");
  if (!b) return;
  $("#userName").textContent = USER || "?";
  b.classList.toggle("unset", !USER);
  if (window.AUTH) {
    b.title = window.AUTH.email || "";
    const m = $("#userMail");
    if (m) m.textContent = window.AUTH.email || "";
  }
  const adm = $("#btnAdmin");
  if (adm && window.AUTH && window.AUTH.is_admin) adm.hidden = false;
}
function askUser() {
  /* ime je vezano za Microsoft nalog — ne mijenja se ručno */
  if (window.AUTH && window.AUTH.email) {
    uiAlert(`${USER} (${window.AUTH.email})`, "info");
  }
}

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
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const r = await fetch(url, {
    method, headers,
    body: body ? JSON.stringify(body) : null,
  });
  /* sesija istekla -> nazad na Microsoft prijavu */
  if (r.status === 401) { location.href = "/login"; return null; }
  if (!r.ok) throw new Error(await r.text());
  return r.status === 204 ? null : r.json();
}

/* ---------- lijepi dijalozi (SweetAlert2, kao ULAZNE-FAKTURE) ---------- */
function swalBase(opts) {
  return Swal.fire({
    color: "#f1f5f9",
    background: "transparent",
    customClass: { container: "scifi-popup" },
    confirmButtonColor: "#10b981",
    cancelButtonColor: "#475569",
    ...opts,
  });
}
async function uiAlert(msg, icon = "info") {
  if (typeof Swal === "undefined") { alert(msg); return; }
  await swalBase({ icon, text: msg, confirmButtonText: "OK" });
}
async function uiConfirm(msg) {
  if (typeof Swal === "undefined") return confirm(msg);
  const r = await swalBase({
    icon: "warning", text: msg, showCancelButton: true,
    confirmButtonText: t("da"), cancelButtonText: t("otkazi"),
    confirmButtonColor: "#ef4444",
  });
  return r.isConfirmed;
}
async function uiPrompt(title, val = "") {
  if (typeof Swal === "undefined") return prompt(title, val);
  const r = await swalBase({
    title, input: "text", inputValue: val, showCancelButton: true,
    confirmButtonText: t("sacuvaj"), cancelButtonText: t("otkazi"),
  });
  return r.isConfirmed ? (r.value || "") : null;
}

/* ---------- filtering ---------- */
function segMatch(s) {
  if (F.st.size && !F.st.has(s.status)) return false;
  if (F.esk && !s.eskalacija) return false;
  /* datumski filter: termin se preklapa sa izabranim rasponom */
  if (F.dOd && s.datum_do < F.dOd) return false;
  if (F.dDo && s.datum_od > F.dDo) return false;
  return true;
}
/* kaskada: Kunde -> Projekat -> DP/POP. Kad je projekt-filter aktivan,
   svuda se vide samo DP-ovi koji pripadaju izabranim projektima. */
function projNameSet() {
  if (!(PROJ.kunde || PROJ.code || PROJ.name)) return null;
  return new Set(projFiltered().map(p => p.projektname));
}
function dpInProj(d, ns) { return !ns || (d && d.projekt && ns.has(d.projekt)); }
function scopedDps() {
  const ns = projNameSet();
  return ns ? DATA.dps.filter(d => dpInProj(d, ns)) : DATA.dps;
}
/* POP/DP filter (autocomplete pickeri) */
function dpFilterOk(d) {
  if (!d) return false;
  if (F.pop.size && !F.pop.has(d.pop)) return false;
  if (F.dp.size && !F.dp.has(d.id)) return false;
  return true;
}
function visibleSegs() {
  const ns = projNameSet();
  return DATA.segments.filter(s => {
    const t = DATA.tasks.find(t => t.id === s.task_id);
    if (!t) return false;
    const d = DATA.dps.find(d => d.id === t.dp_id);
    if (ns && !dpInProj(d, ns)) return false;
    if (!dpFilterOk(d)) return false;
    if (F.odj.size && !F.odj.has(t.odjel)) return false;
    return segMatch(s);
  });
}

/* ---------- render all ---------- */
function renderAll() {
  renderKpis();
  renderActiveFilters();   // pilule aktivnih filtera + brojač u Filteri zaglavlju
  renderSlicers();
  renderTimeline(true);
  renderStats();
  renderProj();   // DP čipovi u projekt-panelu prate iste filtere
}

/* ---------- aktivni filteri (pilule + brojač) — kao dashboard ULAZNE-FAKTURE ---------- */
function activeFilterList() {
  const out = [];
  if (PROJ.kunde) out.push({ k: "kunde", label: "🏢 " + PROJ.kunde });
  if (PROJ.name) out.push({ k: "name", label: "📁 " + PROJ.name });
  if (PROJ.code) out.push({ k: "code", label: "# " + PROJ.code });
  [...F.pop].forEach(p => out.push({ k: "pop", v: p, label: "POP " + p }));
  [...F.dp].forEach(id => {
    const d = DATA.dps.find(x => x.id === id);
    if (d) out.push({ k: "dp", v: id, label: `${d.pop} · ${d.naziv}` });
  });
  [...F.st].forEach(s => out.push({ k: "st", v: s, label: stT(s) }));
  [...F.odj].forEach(o => out.push({ k: "odj", v: o, label: o }));
  if (F.esk) out.push({ k: "esk", label: "⚠ " + t("eskChip") });
  return out;
}
function renderActiveFilters() {
  const list = activeFilterList();
  const badge = $("#fltBadge");
  if (badge) { badge.textContent = list.length; badge.classList.toggle("hidden", !list.length); }
  const bar = $("#activeBar");
  if (!bar) return;
  if (!list.length) { bar.innerHTML = ""; return; }   // .factive:empty -> sakriveno
  bar.innerHTML = `<span class="factive-lbl">${t("aktivniFilteri")}</span>` +
    list.map((f, i) => `<button class="fchip" data-i="${i}">${esc(f.label)} <i>✕</i></button>`).join("") +
    `<button class="fchip clearall" data-clear="1">✕ ${t("clearAll").replace(/^✕\s*/, "")}</button>`;
  $$("#activeBar .fchip").forEach(ch => ch.addEventListener("click", () => {
    if (ch.dataset.clear) return clearAllFilters();
    removeActiveFilter(list[+ch.dataset.i]);
  }));
}
function removeActiveFilter(f) {
  switch (f.k) {
    case "kunde": PROJ.kunde = ""; return projFilterChanged();
    case "name": PROJ.name = ""; return projFilterChanged();
    case "code": PROJ.code = ""; return projFilterChanged();
    case "pop": F.pop.delete(f.v); break;
    case "dp": F.dp.delete(f.v); break;
    case "st": F.st.delete(f.v); break;
    case "odj": F.odj.delete(f.v); break;
    case "esk": F.esk = false; break;
  }
  renderAll();
}
function clearAllFilters() {
  F.dp.clear(); F.pop.clear(); F.st.clear(); F.odj.clear(); F.esk = false;
  PROJ.kunde = PROJ.code = PROJ.name = "";
  projFilterChanged();
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
  const dps = scopedDps().filter(dpFilterOk);
  const hp = dps.reduce((a, d) => a + (d.hp || 0), 0);
  const ha = dps.reduce((a, d) => a + (d.ha || 0), 0);
  /* kartice = filteri: klik na status/eskalacije filtrira sve ispod */
  $("#kpis").innerHTML = `
    <div class="kpi blue click${F.st.size || F.esk ? "" : " on"}" data-all="1" title="${t("clearAll")}"><div class="num" data-n="${segs.length}">0</div><div class="lbl">${t("kTermina")}</div></div>
    <div class="kpi teal click${F.st.has("završeno") ? " on" : ""}" data-st="završeno"><div class="num" data-n="${c("završeno")}">0</div><div class="lbl">${stT("završeno")}</div></div>
    <div class="kpi amber click${F.st.has("u toku") ? " on" : ""}" data-st="u toku"><div class="num" data-n="${c("u toku")}">0</div><div class="lbl">${stT("u toku")}</div></div>
    <div class="kpi red click${F.st.has("otvoreno") ? " on" : ""}" data-st="otvoreno"><div class="num" data-n="${c("otvoreno")}">0</div><div class="lbl">${stT("otvoreno")}</div></div>
    <div class="kpi red click${F.esk ? " on" : ""}" data-esk="1"><div class="num" data-n="${esk}">0</div><div class="lbl">${t("kEsk")}</div></div>
    <div class="kpi purple"><div class="num" data-n="${hp}">0</div><div class="lbl">HP</div></div>
    <div class="kpi purple"><div class="num" data-n="${ha}">0</div><div class="lbl">HA</div></div>`;
  $$("#kpis .num").forEach(el => countUp(el, +el.dataset.n));
  $$("#kpis .kpi.click").forEach(k => k.addEventListener("click", () => {
    if (k.dataset.all) { F.st.clear(); F.esk = false; }
    else if (k.dataset.st) { const v = k.dataset.st; F.st.has(v) ? F.st.delete(v) : F.st.add(v); }
    else if (k.dataset.esk) F.esk = !F.esk;
    renderAll();
    if (k.dataset.st) flashSegs(s => s.status === k.dataset.st);
    if (k.dataset.esk && F.esk) flashSegs(s => !!s.eskalacija);
  }));
}

/* ---------- slicers ---------- */
function chip(label, cls, on, attrs = "") {
  return `<button class="chip ${cls}${on ? " on" : ""}" ${attrs}>${label}</button>`;
}
function renderSlicers() {
  const odj = [...new Set([...ODJELI, ...DATA.tasks.map(t => t.odjel).filter(Boolean)])];
  const nSt = st => DATA.segments.filter(s => s.status === st).length;
  const nEsk = DATA.segments.filter(s => s.eskalacija).length;
  const anyF = F.dp.size || F.pop.size || F.st.size || F.odj.size || F.esk;
  const cnt = n => `<b class="n">${n}</b>`;
  const dps = scopedDps();
  const pops = [...new Set(dps.map(d => d.pop).filter(Boolean))].sort(cmpStr);
  const dpLbl = d => `${d.pop} · ${d.naziv}`;

  /* broj aktivnih filtera -> crvena značka na "Filteri" dugmetu (kao ULAZNE-FAKTURE) */
  const nProj = (PROJ.kunde ? 1 : 0) + (PROJ.code ? 1 : 0) + (PROJ.name ? 1 : 0);
  const nAct = F.pop.size + F.dp.size + F.st.size + F.odj.size + (F.esk ? 1 : 0) + nProj
    + (F.dOd ? 1 : 0) + (F.dDo ? 1 : 0);
  const badge = $("#fltBadge");
  if (badge) { badge.textContent = nAct; badge.classList.toggle("hidden", !nAct); }
  /* ✕ na POP/DP combo poljima vidljiv samo kad ima izbora */
  const xPop = document.querySelector('.cmb-x[data-for="fPop"]');
  if (xPop) xPop.hidden = !F.pop.size;
  const xDp = document.querySelector('.cmb-x[data-for="fDp"]');
  if (xDp) xDp.hidden = !F.dp.size;

  /* AKTIVNI: red — svi aktivni filteri kao pilule sa ✕ (kao ULAZNE-FAKTURE) */
  const fchip = (lbl, attrs) => `<button class="fchip" ${attrs}>${lbl} <i>✕</i></button>`;
  const act = [];
  if (PROJ.kunde) act.push(fchip(`🏢 ${esc(PROJ.kunde)}`, `data-xkunde="1"`));
  if (PROJ.name) act.push(fchip(`📁 ${esc(PROJ.name)}`, `data-xproj="1"`));
  if (PROJ.code) act.push(fchip(`# ${esc(PROJ.code)}`, `data-xcode="1"`));
  [...F.pop].forEach(p => act.push(fchip(`🗼 ${esc(p)}`, `data-xpop="${esc(p)}"`)));
  [...F.dp].forEach(id => {
    const d = DATA.dps.find(x => x.id === id);
    if (d) act.push(fchip(`📍 ${esc(dpLbl(d))}`, `data-xdp="${id}"`));
  });
  [...F.st].forEach(s => act.push(fchip(esc(stT(s)), `data-xst="${esc(s)}"`)));
  [...F.odj].forEach(o => act.push(fchip(esc(o), `data-xodj="${esc(o)}"`)));
  if (F.esk) act.push(fchip(`⚠ ${t("kEsk")}`, `data-xesk="1"`));
  if (F.dOd) act.push(fchip(`📅 ≥ ${fmt(F.dOd)}`, `data-xdod="1"`));
  if (F.dDo) act.push(fchip(`📅 ≤ ${fmt(F.dDo)}`, `data-xddo="1"`));
  const ab = $("#activeBar");
  if (ab) {
    ab.innerHTML = act.length
      ? `<span class="factive-lbl">${t("aktivni")}:</span> ${act.join("")}
         <button class="fchip clearall" data-clearall="1">🗑 ${t("ocistiSve")}</button>` : "";
    $$("#activeBar .fchip").forEach(ch => ch.addEventListener("click", () => {
      const clearedProj = ch.dataset.clearall || ch.dataset.xkunde || ch.dataset.xproj || ch.dataset.xcode;
      if (ch.dataset.clearall) {
        F.dp.clear(); F.pop.clear(); F.st.clear(); F.odj.clear(); F.esk = false;
        F.dOd = F.dDo = ""; clearDate("fDateOd"); clearDate("fDateDo");
        PROJ.kunde = PROJ.code = PROJ.name = "";
      }
      else if (ch.dataset.xkunde) PROJ.kunde = "";
      else if (ch.dataset.xproj) PROJ.name = "";
      else if (ch.dataset.xcode) PROJ.code = "";
      else if (ch.dataset.xpop) F.pop.delete(ch.dataset.xpop);
      else if (ch.dataset.xdp) F.dp.delete(+ch.dataset.xdp);
      else if (ch.dataset.xst) F.st.delete(ch.dataset.xst);
      else if (ch.dataset.xodj) F.odj.delete(ch.dataset.xodj);
      else if (ch.dataset.xesk) F.esk = false;
      else if (ch.dataset.xdod) { F.dOd = ""; clearDate("fDateOd"); }
      else if (ch.dataset.xddo) { F.dDo = ""; clearDate("fDateDo"); }
      if (clearedProj) projFilterChanged(); else renderAll();
    }));
  }

  /* redovi čipova (kao "TIP FAKTURE" red u ULAZNE dashboardu) —
     POP/DP se filtriraju klikom na kartice/grafove, pa posebna polja nisu potrebna */
  $("#slicers").innerHTML = `
    <div class="sl-row">
      <span class="sl-lbl"><i class="ic">🚦</i> ${t("statusLbl")}</span>
      ${chip(`${stT("otvoreno")}${cnt(nSt("otvoreno"))}`, "mini st-otvoreno", F.st.has("otvoreno"), `data-st="otvoreno"`)}
      ${chip(`${stT("u toku")}${cnt(nSt("u toku"))}`, "mini st-utoku", F.st.has("u toku"), `data-st="u toku"`)}
      ${chip(`${stT("završeno")}${cnt(nSt("završeno"))}`, "mini st-zavrseno", F.st.has("završeno"), `data-st="završeno"`)}
      ${chip(`⚠${cnt(nEsk)}`, "mini esk", F.esk, `data-esk="1" title="${t("eskChip")}"`)}
    </div>
    <div class="sl-row">
      <span class="sl-lbl"><i class="ic">🏗</i> ${t("odjelLbl")}</span>
      ${odj.map(o => chip(esc(o), "mini odj", F.odj.has(o), `data-odj="${o}"`)).join("")}
    </div>`;

  $$("#slicers .chip").forEach(ch => ch.addEventListener("click", () => {
    if (ch.dataset.st) { const v = ch.dataset.st; F.st.has(v) ? F.st.delete(v) : F.st.add(v); }
    else if (ch.dataset.odj) { const v = ch.dataset.odj; F.odj.has(v) ? F.odj.delete(v) : F.odj.add(v); }
    else if (ch.dataset.esk) F.esk = !F.esk;
    renderAll();
  }));
}

/* ---------- sorting ---------- */
function cmpStr(a, b) { return String(a || "").localeCompare(String(b || ""), undefined, { numeric: true }); }
function sortedDps() {
  const dps = scopedDps().slice();
  if (SORT.key === "dp") dps.sort((a, b) => cmpStr(a.naziv, b.naziv) || cmpStr(a.pop, b.pop));
  else dps.sort((a, b) => cmpStr(a.pop, b.pop) || cmpStr(a.naziv, b.naziv));
  if (SORT.dir < 0) dps.reverse();
  return dps;
}
function sortTasks(tasks) {
  if (SORT.key !== "akt") return tasks;
  return [...tasks].sort((a, b) => SORT.dir * cmpStr(a.aktivnost, b.aktivnost));
}
function sortArrow(k) {
  return SORT.key === k ? (SORT.dir > 0 ? "▲" : "▼") : `<i class="dim">⇅</i>`;
}

/* ---------- timeline ---------- */
function dayMode() { return PX >= 7; }
function zoomLabel() { return PX >= 7 ? t("zDani") : PX >= 2.6 ? t("zSedmice") : t("zMjeseci"); }

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
  /* days / monday dates — rjeđe oznake da ne budu zbijene */
  let days = "";
  if (dayMode()) {
    for (let i = 0; i < n; i++) {
      const dt = dateOfIdx(i);
      const we = dt.getDay() === 0 || dt.getDay() === 6;
      /* PX>=15: dan+datum svaki dan · PX>=11: samo broj · ispod: broj samo ponedjeljkom */
      const lbl = PX >= 15 ? `${DANI[(dt.getDay() + 6) % 7]} ${dt.getDate()}`
        : PX >= 11 ? `${dt.getDate()}`
        : dt.getDay() === 1 ? `${dt.getDate()}` : "";
      days += `<div class="hb${we ? " we" : ""}${i === todayI ? " today" : ""}" style="left:${i * PX}px;width:${PX}px">${lbl}</div>`;
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
    <div class="tl-label cols heads">
      <span class="th c-pop" data-k="pop" title="${t("sortPop")}">POP ${sortArrow("pop")}</span>
      <span class="th c-dp" data-k="dp" title="${t("sortDp")}">DP ${sortArrow("dp")}</span>
      <span class="th c-act" data-k="akt" title="${t("sortAkt")}">${t("aktivnost")} ${sortArrow("akt")}</span>
    </div>
    <div class="tl-track" style="width:${totalW}px">
      <div class="tl-head-band months" style="width:${totalW}px">${months}</div>
      <div class="tl-head-band kw" style="width:${totalW}px">${weeks}</div>
      ${days ? `<div class="tl-head-band days" style="width:${totalW}px">${days}</div>` : ""}
    </div></div>`;
}

function trackBg() {
  const imgs = [`linear-gradient(90deg,rgba(255,255,255,.11) 1px,transparent 1px)`];
  const sizes = [`${7 * PX}px 100%`];
  if (dayMode()) {
    imgs.push(`linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)`);
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

  for (const dp of sortedDps()) {
    if (!dpFilterOk(dp)) continue;
    const tasks = sortTasks(DATA.tasks.filter(t => t.dp_id === dp.id)
      .filter(t => !F.odj.size || F.odj.has(t.odjel)));
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
        <div class="gr-info" title="${t("dpHistTip")}">
          <div class="gr-top"><span class="pop-badge" title="POP / FCP ID">${esc(dp.pop)}</span><b>${esc(dp.naziv)}</b></div>
          <span class="meta">${dp.lokacija ? esc(dp.lokacija) + " · " : ""}HP ${dp.hp} · HA ${dp.ha}</span></div>
        <div class="gr-side"><span class="pbar"><i style="width:${pct}%"></i></span>
          <span class="pct">${pct}%</span>
          <button class="gbtn delDp" title="Obriši DP">🗑</button></div>
      </div>
      <div class="tl-track" style="width:${totalW}px"></div></div>`;

    for (const t of rows) {
      let segs = "";
      const today = todayIso();
      for (const s of (segsByTask[t.id] || [])) {
        /* kašnjenje: otvoreno / u toku se automatski rasteže do danas; završeno ne */
        const late = s.status !== "završeno" && s.datum_do < today;
        const dispDo = late ? today : s.datum_do;
        const a = Math.max(0, dayIdx(s.datum_od)), b = Math.min(n - 1, dayIdx(dispDo));
        if (b < 0 || a > n - 1) continue;
        const x = a * PX, w = Math.max(PX, (b - a + 1) * PX);
        const dim = !segMatch(s);
        const cls = s.status === "završeno" ? "st-zavrseno" : s.status === "u toku" ? "st-utoku" : "st-otvoreno";
        /* zakašnjeli (auto-produženi) dio: od planiranog kraja do danas
           - s razlogom: ljubičasta šrafura · bez razloga: crveno-bijela, traži unos */
        let overlays = "";
        if (late) {
          const ea = Math.max(a, dayIdx(s.datum_do) + 1);
          overlays += `<i class="ext${s.kasni_razlog ? "" : " noreason"}"
            style="left:${(ea - a) * PX}px;width:${(b - ea + 1) * PX}px"></i>`;
        }
        /* eskalacija teče od esk_datum (ili od početka ako datum nije upisan) do kraja trake */
        if (s.eskalacija) {
          const ka = s.esk_datum ? Math.max(a, Math.min(b, dayIdx(s.esk_datum))) : a;
          overlays += `<i class="eskpart" style="left:${(ka - a) * PX}px;width:${(b - ka + 1) * PX}px"></i>`;
        }
        segs += `<div class="seg ${cls}${s.eskalacija ? " esk" : ""}${late ? " late" : ""}" data-seg="${s.id}"
          style="left:${x}px;width:${w}px;${dim ? "opacity:.13;filter:saturate(.3)" : ""}">` +
          overlays +
          `<i class="rs l" title="povuci rub = pomjeri početak"></i><i class="rs r" title="povuci rub = pomjeri kraj"></i>` +
          (s.eskalacija ? `<span class="warn">⚠</span>` : "") +
          (w > 60 ? `<span>${fmt(s.datum_od).slice(0, 5)}–${fmt(s.datum_do).slice(0, 5)}</span>` : "") +
          (s.komentar && w > 150 ? `<span class="kom">· ${esc(s.komentar)}</span>` : "") +
          `</div>`;
      }
      html += `<div class="tl-row" data-task="${t.id}" style="--ac:${aktColor(t.aktivnost)}">
        <div class="tl-label cols">
          <span class="c-pop cell" data-fpop="${esc(dp.pop)}" title="klik = filtriraj POP ${esc(dp.pop)}">${esc(dp.pop)}</span>
          <span class="c-dp cell" data-fdp="${dp.id}" title="klik = filtriraj ${esc(dp.naziv)}">${esc(dp.naziv)}</span>
          <span class="c-act">
            <span class="act-name" title="dupli klik = preimenuj">${esc(t.aktivnost)}</span>
            <span class="odj-tag" title="klik = promijeni odjel">${esc(t.odjel || "—")}</span>
            <button class="rowdel" title="Obriši">✕</button>
          </span>
        </div>
        <div class="tl-track" style="width:${totalW}px;${trackBg()}">${segs}</div></div>`;
    }
  }

  html = `<div class="tl-inner" style="position:relative;min-width:max-content">${html}
    ${todayI >= 0 && todayI < n ? `<i class="today-line" data-lbl="${t("danas")}" style="left:${LABELW + todayI * PX + PX / 2}px"></i>` : ""}</div>`;
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
function snapEdge(i, side) {                // snap a single edge to week bounds when zoomed out
  i = Math.max(0, Math.min(daysInYear() - 1, i));
  if (dayMode()) return i;
  const d = dateOfIdx(i);
  if (side === "l") d.setDate(d.getDate() - ((d.getDay() + 6) % 7));   // back to monday
  else d.setDate(d.getDate() + (7 - (d.getDay() || 7)));              // forward to sunday
  return Math.max(0, Math.min(daysInYear() - 1, Math.round((d - yearStart()) / 864e5)));
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
  $$("#tlScroll .seg .rs").forEach(h => {
    h.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();          // don't start a create-drag
      const segEl = h.closest(".seg");
      const s = DATA.segments.find(x => x.id === +segEl.dataset.seg);
      if (!s) return;
      segResize = { id: s.id, side: h.classList.contains("l") ? "l" : "r",
        segEl, track: segEl.closest(".tl-track"),
        a: dayIdx(s.datum_od), b: dayIdx(s.datum_do) };
      segEl.classList.add("resizing");
    });
  });
  $$("#tlScroll .delDp").forEach(b => b.addEventListener("click", async () => {
    const dpId = +b.closest(".tl-row").dataset.dp;
    const dp = DATA.dps.find(d => d.id === dpId);
    if (!await uiConfirm(tf("confDelDp", `${dp.pop} · ${dp.naziv}`))) return;
    await api(`/api/dps/${dpId}`, "DELETE");
    await load();
  }));
  $$("#tlScroll .rowdel").forEach(b => b.addEventListener("click", async () => {
    const id = +b.closest(".tl-row").dataset.task;
    const tk = DATA.tasks.find(x => x.id === id);
    if (!await uiConfirm(tf("confDelAkt", tk.aktivnost))) return;
    await api(`/api/tasks/${id}`, "DELETE");
    await load();
  }));
  $$("#tlScroll .gr-info").forEach(el => el.addEventListener("click", () => {
    selectDp(+el.closest(".tl-row").dataset.dp);
  }));
  $$("#tlScroll .act-name").forEach(el => el.addEventListener("dblclick", async () => {
    const id = +el.closest(".tl-row").dataset.task;
    const tk = DATA.tasks.find(x => x.id === id);
    const v = await uiPrompt(t("promptNaziv"), tk.aktivnost);
    if (!v || v === tk.aktivnost) return;
    tk.aktivnost = v;
    await api(`/api/tasks/${id}`, "PATCH", { aktivnost: v });
    renderTimeline(true);
    histDirty();
  }));
  $$("#tlScroll .th").forEach(th => th.addEventListener("click", () => {
    const k = th.dataset.k;
    if (SORT.key === k) SORT.dir = -SORT.dir;
    else SORT = { key: k, dir: 1 };
    renderTimeline(true);
  }));
  $$("#tlScroll .cell[data-fpop]").forEach(el => el.addEventListener("click", () => {
    const p = el.dataset.fpop;
    F.pop.has(p) ? F.pop.delete(p) : F.pop.add(p);
    renderAll();
  }));
  $$("#tlScroll .cell[data-fdp]").forEach(el => el.addEventListener("click", () => {
    const id = +el.dataset.fdp;
    F.dp.has(id) ? F.dp.delete(id) : F.dp.add(id);
    renderAll();
  }));
  $$("#tlScroll .odj-tag").forEach(el => el.addEventListener("click", async () => {
    const id = +el.closest(".tl-row").dataset.task;
    const t = DATA.tasks.find(x => x.id === id);
    const i = (ODJELI.indexOf(t.odjel) + 1) % ODJELI.length;
    t.odjel = ODJELI[i];
    await api(`/api/tasks/${id}`, "PATCH", { odjel: t.odjel });
    renderTimeline(true); renderSlicers();
    histDirty();
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

/* live resize of an existing termin by dragging its edge */
document.addEventListener("mousemove", e => {
  if (!segResize) return;
  const i = trackDay(e, segResize.track);
  let a = segResize.a, b = segResize.b;
  if (segResize.side === "l") a = snapEdge(Math.min(i, b), "l");
  else b = snapEdge(Math.max(i, a), "r");
  segResize.curA = a; segResize.curB = b;
  segResize.segEl.style.left = a * PX + "px";
  segResize.segEl.style.width = Math.max(PX, (b - a + 1) * PX) + "px";
});
document.addEventListener("mouseup", async () => {
  if (!segResize) return;
  const sr = segResize; segResize = null;
  sr.segEl.classList.remove("resizing");
  const a = sr.curA ?? sr.a, b = sr.curB ?? sr.b;
  const od = iso(dateOfIdx(a)), do_ = iso(dateOfIdx(b));
  const s = DATA.segments.find(x => x.id === sr.id);
  if (s && (s.datum_od !== od || s.datum_do !== do_)) {
    s.datum_od = od; s.datum_do = do_;
    await api(`/api/segments/${sr.id}`, "PATCH", { datum_od: od, datum_do: do_ });
    renderAll();
    histDirty();
  }
});

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
    if (popCtx) closePop();
    else if (SEL && !$("dialog[open]")) { SEL = null; closeDrawer(); renderAll(); }
  }
});

/* ---------- popover ---------- */
function openPop(mode, segId, cx, cy, init = {}) {
  const pop = $("#pop");
  let s = { status: "otvoreno", komentar: "", eskalacija: 0, esk_razlog: "" };
  if (mode === "edit") {
    s = DATA.segments.find(x => x.id === segId);
    popCtx = { mode, segId, status: s.status };
    $("#popTitle").textContent = t("urediTermin");
    $("#popOd").value = s.datum_od; $("#popDo").value = s.datum_do;
    $("#popDel").classList.remove("hidden");
  } else {
    popCtx = { mode, taskId: init.taskId, status: "otvoreno" };
    $("#popTitle").textContent = t("noviTermin");
    $("#popOd").value = init.od; $("#popDo").value = init.do_;
    $("#popDel").classList.add("hidden");
  }
  $("#popKom").value = s.komentar || "";
  $("#popEsk").checked = !!s.eskalacija;
  $("#popRazlog").value = s.esk_razlog || "";
  $("#popEskDat").value = s.esk_datum || todayIso();
  $("#popRazlogWrap").classList.toggle("hidden", !s.eskalacija);
  $("#popEskDatWrap").classList.toggle("hidden", !s.eskalacija);
  $("#popKasni").value = s.kasni_razlog || "";
  $("#popKasni").classList.remove("err");
  $$("#popStatus .stpill").forEach(p =>
    p.classList.toggle("on", p.dataset.st === (popCtx.status)));
  updateKasniVis();
  pop.classList.remove("hidden");
  const W = 300, H = pop.offsetHeight || 330;
  pop.style.left = Math.min(cx, innerWidth - W - 16) + "px";
  pop.style.top = Math.min(cy + 10, innerHeight - H - 16) + "px";
  $("#popKom").focus();
}
function closePop() { $("#pop").classList.add("hidden"); popCtx = null; }

/* termin probio rok? (otvoreno / u toku sa krajem u prošlosti) -> razlog obavezan */
function popLate() {
  return popCtx && popCtx.status !== "završeno" &&
         $("#popDo").value && $("#popDo").value < todayIso();
}
function updateKasniVis() { $("#popKasniWrap").classList.toggle("hidden", !popLate()); }

$$("#popStatus .stpill").forEach(p => p.addEventListener("click", () => {
  popCtx.status = p.dataset.st;
  $$("#popStatus .stpill").forEach(x => x.classList.toggle("on", x === p));
  updateKasniVis();
}));
$("#popDo").addEventListener("change", updateKasniVis);
$("#popKasni").addEventListener("input", () => $("#popKasni").classList.remove("err"));
$("#popEsk").addEventListener("change", () => {
  const on = $("#popEsk").checked;
  $("#popRazlogWrap").classList.toggle("hidden", !on);
  $("#popEskDatWrap").classList.toggle("hidden", !on);
  if (on && !$("#popEskDat").value) $("#popEskDat").value = todayIso();
});
$("#popCancel").addEventListener("click", closePop);
$("#popDel").addEventListener("click", async () => {
  if (popCtx?.mode !== "edit") return;
  await api(`/api/segments/${popCtx.segId}`, "DELETE");
  DATA.segments = DATA.segments.filter(s => s.id !== popCtx.segId);
  closePop(); renderAll();
  histDirty();
});
$("#popSave").addEventListener("click", async () => {
  if (!popCtx) return;
  const body = {
    datum_od: $("#popOd").value, datum_do: $("#popDo").value,
    status: popCtx.status, komentar: $("#popKom").value,
    eskalacija: $("#popEsk").checked ? 1 : 0,
    esk_razlog: $("#popEsk").checked ? $("#popRazlog").value : "",
    esk_datum: $("#popEsk").checked ? ($("#popEskDat").value || todayIso()) : "",
    kasni_razlog: $("#popKasni").value.trim(),
  };
  if (!body.datum_od || !body.datum_do || body.datum_do < body.datum_od) return;
  /* probijen rok -> razlog produženja je obavezan */
  if (popLate() && !body.kasni_razlog) {
    $("#popKasni").classList.add("err");
    $("#popKasni").focus();
    return;
  }
  if (popCtx.mode === "new") {
    body.task_id = popCtx.taskId;
    const r = await api("/api/segments", "POST", body);
    DATA.segments.push({ id: r.id, ...body });
  } else {
    await api(`/api/segments/${popCtx.segId}`, "PATCH", body);
    Object.assign(DATA.segments.find(s => s.id === popCtx.segId), body);
  }
  closePop(); renderAll();
  histDirty();
});
document.addEventListener("mousedown", e => {
  if (popCtx && !e.target.closest("#pop") && !e.target.closest(".seg")) closePop();
});

/* ---------- hover kartica: detalji + historija komentara ---------- */
const hcLbl = polje => ({ kreirano: t("hKreirano"), status: t("hStatus"),
  komentar: t("komentar"), esk_razlog: t("eskRazlog"), kasni_razlog: t("razlogProd"),
  eskalacija: t("hEskalacija"), esk_datum: t("hEskOd"),
  datum_od: t("hPocetak"), datum_do: t("hKraj") }[polje] || polje);
const hcEl = document.createElement("div");
hcEl.className = "hovercard hidden";
document.body.appendChild(hcEl);
function hcHide() { hcEl.classList.add("hidden"); }
function hcShow(el, ev) {
  const s = DATA.segments.find(x => x.id === +el.dataset.seg);
  if (!s) return hcHide();
  const tk = DATA.tasks.find(x => x.id === s.task_id) || {};
  const late = s.status !== "završeno" && s.datum_do < todayIso();
  const hist = (DATA.history || []).filter(h => h.seg_id === s.id);
  const stCls = s.status === "završeno" ? "teal" : s.status === "u toku" ? "amber" : "red";
  hcEl.innerHTML = `
    <div class="hc-head"><span class="hc-dot" style="background:${aktColor(tk.aktivnost)}"></span>
      <b>${esc(tk.aktivnost || "")}</b><span class="hc-st ${stCls}">${esc(stT(s.status))}</span></div>
    <div class="hc-dates">📅 ${fmt(s.datum_od)} – ${fmt(s.datum_do)}${late
      ? ` <span class="hc-late">${t("kasni")} → ${fmt(todayIso())}</span>` : ""}</div>
    ${s.komentar ? `<div class="hc-row"><span>${t("komentar")}</span>${esc(s.komentar)}</div>` : ""}
    ${late ? `<div class="hc-row purple"><span>${t("razlogProd")}</span>${s.kasni_razlog
      ? esc(s.kasni_razlog) : t("razlogNijeUpisan")}</div>` : ""}
    ${s.eskalacija ? `<div class="hc-row orange"><span>${t("hEskalacija")}${s.esk_datum
      ? " · " + fmt(s.esk_datum) : ""}</span>${esc(s.esk_razlog || "—")}</div>` : ""}
    <div class="hc-hist"><h4>${t("hist")}</h4>${hist.length
      ? hist.slice(0, 12).map(h => `<div class="hc-h"><i>${h.ts.replace("T", " ").slice(0, 16)}</i>
          <em>${hcLbl(h.polje)}</em><span>${esc(h.vrijednost)}</span>${h.user
            ? `<b class="hc-u">${esc(h.user)}</b>` : ""}</div>`).join("")
      : `<div class="hc-h empty">${t("noHist")}</div>`}</div>
    <div class="hc-tip">${t("hcEdit")}</div>`;
  hcEl.classList.remove("hidden");
  const W = 340, H = hcEl.offsetHeight || 220;
  hcEl.style.left = Math.min(ev.clientX + 14, innerWidth - W - 14) + "px";
  hcEl.style.top = (ev.clientY + 16 + H > innerHeight ? Math.max(8, ev.clientY - H - 12)
    : ev.clientY + 16) + "px";
}
$("#tlScroll").addEventListener("mousemove", e => {
  if (drag || segResize || popCtx) return hcHide();
  const el = e.target.closest(".seg");
  el ? hcShow(el, e) : hcHide();
});
$("#tlScroll").addEventListener("mouseleave", hcHide);
document.addEventListener("mousedown", hcHide);

/* ---------- zoom ---------- */
function minPx() {                 // zoom-out stops when the whole year exactly fills the view
  const sc = $("#tlScroll");
  return Math.max(0.6, (sc.clientWidth - LABELW - 12) / daysInYear());
}
function zoomBtns() {
  $("#zOut").disabled = PX <= minPx() + 0.01;
  $("#zIn").disabled = PX >= PXMAX - 0.01;
}
function setPx(newPx, anchorX) {
  newPx = Math.max(minPx(), Math.min(PXMAX, newPx));
  if (newPx === PX) { zoomBtns(); return; }
  const sc = $("#tlScroll"), r = sc.getBoundingClientRect();
  const ax = (anchorX ?? (r.left + r.width / 2)) - r.left - LABELW;
  const day = (sc.scrollLeft + ax) / PX;
  PX = newPx;
  renderTimeline(false);
  sc.scrollLeft = Math.max(0, day * PX - ax);
  zoomBtns();
}
$("#zIn").addEventListener("click", () => setPx(PX * 1.5));
$("#zOut").addEventListener("click", () => setPx(PX / 1.5));
$("#zFit").addEventListener("click", () => setPx(minPx()));
window.addEventListener("resize", () => setPx(PX));   // re-clamp when window changes
$("#tlScroll").addEventListener("wheel", e => {
  if (!e.ctrlKey) return;          // zoom only on Ctrl+wheel; plain scroll never zooms
  e.preventDefault();
  setPx(PX * (e.deltaY < 0 ? 1.3 : 0.77), e.clientX);
}, { passive: false });

/* ---------- stats (ista stranica, reaguje na slicere) ---------- */
function chartDefaults() {
  /* tipografija i boje grafova = ULAZNE-FAKTURE (Inter, slate, tamni tooltipovi) */
  Chart.defaults.color = "#94a3b8";
  Chart.defaults.borderColor = "rgba(51,65,85,.55)";
  Chart.defaults.font.family = "'Inter','Segoe UI',system-ui,sans-serif";
  Chart.defaults.font.size = 10.5;
  Chart.defaults.animation.duration = 500;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.boxHeight = 10;
  Chart.defaults.plugins.tooltip.backgroundColor = "#1e293b";
  Chart.defaults.plugins.tooltip.borderColor = "#334155";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = "#f1f5f9";
  Chart.defaults.plugins.tooltip.bodyColor = "#94a3b8";
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
}
/* kratko zasvijetli trake koje odgovaraju uslovu (poslije klika na graf) */
function flashSegs(pred) {
  $$("#tlScroll .seg").forEach(el => {
    const s = DATA.segments.find(x => x.id === +el.dataset.seg);
    if (!s || !pred(s)) return;
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1900);
  });
}
function chartCursor(e, els) {
  e.native.target.style.cursor = els.length ? "pointer" : "default";
}
function renderStats() {
  chartDefaults();
  const segs = visibleSegs();
  const c = st => segs.filter(s => s.status === st).length;
  for (const k in charts) { charts[k].destroy(); delete charts[k]; }
  const C = (id, cfg) => charts[id] = new Chart($(id), cfg);
  const taskOf = s => DATA.tasks.find(t => t.id === s.task_id);

  const STATUSI = ["završeno", "u toku", "otvoreno"];
  C("#chStatus", { type: "doughnut", data: {
      labels: STATUSI.map(stT),
      datasets: [{ data: STATUSI.map(c),
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: "#1e293b", borderWidth: 3, hoverOffset: 8 }] },
    options: { maintainAspectRatio: false, cutout: "70%",
      onHover: chartCursor,
      onClick: (e, els) => {
        if (!els.length) return;
        const st = STATUSI[els[0].index];
        F.st.has(st) ? F.st.delete(st) : F.st.add(st);
        renderAll();
        flashSegs(s => s.status === st);
      },
      plugins: { legend: { position: "bottom" } } } });

  const odj = [...new Set(DATA.tasks.map(t => t.odjel).filter(Boolean))];
  const byOdj = st => odj.map(o => segs.filter(s => {
    const t = taskOf(s);
    return t && t.odjel === o && s.status === st;
  }).length);
  C("#chOdjel", { type: "bar", data: {
      labels: odj,
      datasets: [
        { label: stT("završeno"), data: byOdj("završeno"), backgroundColor: "#10b981", borderRadius: 5 },
        { label: stT("u toku"), data: byOdj("u toku"), backgroundColor: "#f59e0b", borderRadius: 5 },
        { label: stT("otvoreno"), data: byOdj("otvoreno"), backgroundColor: "#ef4444", borderRadius: 5 }] },
    options: { maintainAspectRatio: false,
      onHover: chartCursor,
      onClick: (e, els) => {
        if (!els.length) return;
        const o = odj[els[0].index];
        F.odj.has(o) ? F.odj.delete(o) : F.odj.add(o);
        renderAll();
        flashSegs(s => { const t = taskOf(s); return t && t.odjel === o; });
      },
      scales: { x: { stacked: true, grid: { display: false } },
                y: { stacked: true, ticks: { precision: 0 } } },
      plugins: { legend: { position: "bottom" } } } });

  const dps = scopedDps().filter(dpFilterOk);
  const pctDp = dps.map(d => {
    const ss = segs.filter(s => {
      const t = taskOf(s);
      return t && t.dp_id === d.id;
    });
    return ss.length ? Math.round(ss.filter(s => s.status === "završeno").length / ss.length * 100) : 0;
  });
  /* kondenzovano + skrol: stotine DP-ova -> tanke trake, lista se skroluje unutar kartice */
  $("#chDpInner").style.height = Math.max(118, dps.length * 15) + "px";
  C("#chDp", { type: "bar", data: {
      labels: dps.map(d => `${d.pop} · ${d.naziv}`),
      datasets: [{ data: pctDp,
        backgroundColor: pctDp.map(p => p >= 100 ? "#10b981" : "#3b82f6"),
        borderRadius: 4, barThickness: 9 }] },
    options: { maintainAspectRatio: false, indexAxis: "y",
      onHover: chartCursor,
      onClick: (e, els) => {
        if (!els.length) return;
        const d = dps[els[0].index];
        if (!d) return;
        F.dp.has(d.id) ? F.dp.delete(d.id) : F.dp.add(d.id);
        renderAll();
        flashSegs(s => { const t = taskOf(s); return t && t.dp_id === d.id; });
      },
      scales: { x: { max: 100, ticks: { callback: v => v + "%" }, position: "top" },
                y: { grid: { display: false }, ticks: { autoSkip: false, font: { size: 9.5 } } } },
      plugins: { legend: { display: false } } } });

  const eskSegs = DATA.segments.filter(s => s.eskalacija);
  const rows = eskSegs.map(s => {
    const tk = DATA.tasks.find(x => x.id === s.task_id) || {};
    const d = DATA.dps.find(x => x.id === tk.dp_id) || {};
    return `<tr><td>${d.pop || ""} · ${d.naziv || ""}</td><td>${esc(tk.aktivnost || "")}</td>
      <td>${fmt(s.datum_od)} – ${fmt(s.datum_do)}</td><td>${stT(s.status)}</td>
      <td class="tag-esk">${esc(s.esk_razlog || "—")}</td><td>${esc(s.komentar || "")}</td></tr>`;
  }).join("");
  $("#eskPanel").innerHTML = `<h3>${t("eskTitle")}</h3>
    <table class="mini"><tr><th>${t("thDp")}</th><th>${t("thAkt")}</th><th>${t("thTermin")}</th>
    <th>${t("thStatus")}</th><th>${t("thRazlog")}</th><th>${t("thKomentar")}</th></tr>` +
    (rows || `<tr><td colspan="6" class="empty">${t("noEsk")}</td></tr>`) + `</table>`;
}

/* ---------- projekat (Daily, Azure) — filteri + statistika + DP-ovi ---------- */
const PROJ = { rows: [], sync: null, kunde: "", code: "", name: "" };
function fmtNum(v) {
  return (v || 0).toLocaleString("de-DE", { maximumFractionDigits: 1 });
}
async function loadProjects() {
  try {
    const d = await api("/api/projects");
    PROJ.rows = d.projects; PROJ.sync = d.sync;
  } catch (e) {
    PROJ.rows = []; PROJ.sync = { status: "greška", error: String(e) };
  }
  renderAll();
}
function projFiltered() {
  return PROJ.rows.filter(p =>
    (!PROJ.kunde || p.kunde === PROJ.kunde) &&
    (!PROJ.code || p.projectcode === PROJ.code) &&
    (!PROJ.name || p.projektname === PROJ.name));
}
function fillSelect(sel, values, current, allLabel) {
  sel.innerHTML = `<option value="">${allLabel}</option>` +
    values.map(v => `<option value="${esc(v)}"${v === current ? " selected" : ""}>${esc(v)}</option>`).join("");
}
function renderProj() {
  /* autocomplete poljima samo sinhronizuj prikazanu vrijednost (opcije se računaju uživo) */
  syncCombo("pfKunde", PROJ.kunde);
  syncCombo("pfCode", PROJ.code);
  syncCombo("pfProj", PROJ.name);
  /* datalist za dijalog "+ Novi DP" — uvijek svi projekti */
  $("#dlProj").innerHTML = PROJ.rows.map(p => `<option value="${esc(p.projektname)}">`).join("");

  const s = PROJ.sync || {};
  $("#projMeta").textContent =
    s.status === "u toku" ? t("syncUToku") :
    s.status === "greška" ? `${t("syncGreska")}: ${s.error || ""}` :
    s.time ? `${t("syncLbl")} ${s.time.replace("T", " ")}` : "";

  const f = projFiltered();
  const sum = k => f.reduce((a, p) => a + (p[k] || 0), 0);
  const lastWork = f.map(p => p.datum_do).filter(Boolean).sort().pop();
  const active = PROJ.kunde || PROJ.code || PROJ.name;
  const title = PROJ.name ? esc(PROJ.name)
    : active ? `${f.length} ${t("projekata")} (${t("filterLbl")})`
    : `${t("sviProjekti")} (${f.length})`;

  const card = (cls, val, lbl) =>
    `<div class="kpi ${cls}"><div class="num">${val}</div><div class="lbl">${lbl}</div></div>`;
  /* --- KPI kartice projekta -> idu u sekciju Analitika --- */
  $("#projKpis").innerHTML = `<div class="proj-title">${PROJ.name ? "📌 " : ""}${title}
      ${PROJ.name && f[0] ? `<span class="proj-sub">${esc(f[0].kunde)} · code ${esc(f[0].projectcode)}</span>` : ""}
    </div>
    <div class="kpis proj-kpis">
      ${card("purple", fmtNum(sum("hp")), "HP")}
      ${card("blue", fmtNum(sum("trasa_m")), t("trasa"))}
      ${card("teal", fmtNum(sum("ha_m")), t("haM"))}
      ${card("teal", fmtNum(sum("ha_stck")), t("haKom"))}
      ${card("amber", fmtNum(sum("montaza")), t("montaza"))}
      ${card("grey", lastWork ? fmt(lastWork) : "—", t("zadnjiRad"))}
    </div>`;

  /* POP▸DP kartice su uklonjene — POP/DP se sada filtriraju kroz filter panel
     (autocomplete polja), a kreiranje ide kroz "+ Novi POP" / "+ Novi DP" u headeru */
}
/* prijedlog projekta za dijaloge: izabrani, ili jedini u filteru */
function effProjName() {
  if (PROJ.name) return PROJ.name;
  const f = projFiltered();
  return (PROJ.kunde || PROJ.code) && f.length === 1 ? f[0].projektname : null;
}
/* "+ Novi POP" — projekat se bira u dijalogu (nema više zaključavanja) */
function openPopDialog(pname) {
  const sel = $("#popProjSel");
  const active = PROJ.kunde || PROJ.code || PROJ.name;
  const list = active ? projFiltered().map(p => p.projektname) : PROJ.rows.map(p => p.projektname);
  const names = [...new Set(list.filter(Boolean))].sort(cmpStr);
  if (pname && !names.includes(pname)) names.unshift(pname);
  sel.innerHTML = `<option value="" disabled${pname ? "" : " selected"}>${t("sviProj")}</option>` +
    names.map(n => `<option value="${esc(n)}"${n === pname ? " selected" : ""}>${esc(n)}</option>`).join("");
  $("#frmPop").reset();
  if (pname) sel.value = pname;
  $("#popProjBadge").classList.add("hidden");
  $("#dlgPop").showModal();
}
function popCard(p) {
  const dps = DATA.dps.filter(d => d.pop_id === p.id);
  const sel = SEL && SEL.type === "pop" && SEL.id === p.id;
  return `<div class="pop-card${sel ? " sel" : ""}" data-pop="${p.id}" title="${t("popCardTip")}">
    <div class="pc-head">
      <span class="pop-badge">${esc(p.naziv)}</span>
      <span class="pc-cnt">${dps.length} DP</span>
      <button class="pc-adddp" title="${t("dodajDpTip")}">＋ DP</button>
    </div>
    <div class="pc-nums">HP <b>${p.hp || 0}</b> · HA <b>${p.ha || 0}</b></div>
    <div class="pc-dps">${dps.length
      ? dps.map(d => chip(esc(d.naziv), "dp", F.dp.has(d.id), `data-cdp="${d.id}"`)).join("")
      : `<span class="hint">${t("noDpsPop")}</span>`}</div>
  </div>`;
}
/* promjena projekt-filtera mijenja i opseg DP/POP svuda -> renderAll */
function projFilterChanged() {
  if (PROJ.name && !projFiltered().length) PROJ.name = "";
  F.dp.clear();             // stari DP izbor možda više nije u opsegu
  SEL = null; closeDrawer();
  renderAll();
}

/* ---------- izbor POP/DP -> filter + drawer s historijom ---------- */
function selectPop(popId) {
  const p = DATA.pops.find(x => x.id === popId);
  if (!p) return;
  if (SEL && SEL.type === "pop" && SEL.id === popId) {
    SEL = null; F.pop.delete(p.naziv); closeDrawer();
  } else {
    SEL = { type: "pop", id: popId };
    F.pop.add(p.naziv);
    openDrawer();
  }
  renderAll();
}
function selectDp(dpId) {
  if (SEL && SEL.type === "dp" && SEL.id === dpId) {
    SEL = null; F.dp.delete(dpId); closeDrawer();
  } else {
    SEL = { type: "dp", id: dpId };
    F.dp.add(dpId);
    openDrawer();
  }
  renderAll();
}
function closeDrawer() { $("#drawer").classList.remove("open"); }
function openDrawer() {
  if (!SEL) return;
  let name, meta, hp, ha, typeLbl;
  if (SEL.type === "pop") {
    const p = DATA.pops.find(x => x.id === SEL.id);
    if (!p) { SEL = null; return closeDrawer(); }
    const n = DATA.dps.filter(d => d.pop_id === p.id).length;
    typeLbl = "POP"; name = p.naziv; hp = p.hp; ha = p.ha;
    meta = `${esc(p.projekt || "—")} <i>▸</i> <b>${esc(p.naziv)}</b> · ${n} ${t("drDpCount")}`;
  } else {
    const d = DATA.dps.find(x => x.id === SEL.id);
    if (!d) { SEL = null; return closeDrawer(); }
    typeLbl = "DP"; name = d.naziv; hp = d.hp; ha = d.ha;
    meta = `${esc(d.projekt || "—")} <i>▸</i> ${esc(d.pop || "—")} <i>▸</i> <b>${esc(d.naziv)}</b>` +
      (d.lokacija || d.voditelj
        ? `<br>${[d.lokacija, d.voditelj].filter(Boolean).map(esc).join(" · ")}` : "");
  }
  $("#drType").textContent = typeLbl;
  $("#drName").textContent = name;
  $("#drMeta").innerHTML = meta;
  $("#drHp").value = hp ?? 0;
  $("#drHa").value = ha ?? 0;
  $("#drawer").classList.add("open");
  loadDrawerHist();
}
/* drawer prati svježe podatke poslije load(); zatvara se ako je entitet obrisan */
function drawerSync() {
  if (!SEL) return;
  const ok = SEL.type === "pop" ? DATA.pops.some(p => p.id === SEL.id)
                                : DATA.dps.some(d => d.id === SEL.id);
  if (ok) openDrawer();
  else { SEL = null; closeDrawer(); }
}
function histDirty() { if (SEL) loadDrawerHist(); }
async function loadDrawerHist() {
  if (!SEL) return;
  const key = `${SEL.type}:${SEL.id}`;
  $("#drHist").innerHTML = `<div class="dr-h empty">${t("histLoad")}</div>`;
  try {
    const r = await api(`/api/history?entity=${SEL.type}&id=${SEL.id}`);
    if (!SEL || `${SEL.type}:${SEL.id}` !== key) return;   // izbor se promijenio
    $("#drHist").innerHTML = r.events.length
      ? r.events.map(evRow).join("")
      : `<div class="dr-h empty">${t("histEmpty")}</div>`;
  } catch {
    $("#drHist").innerHTML = `<div class="dr-h empty">⚠</div>`;
  }
}
function fmtTs(ts) {
  const [d, tm] = String(ts).split("T");
  return fmt(d).slice(0, 6) + " " + (tm || "").slice(0, 5);
}
function avatar(u) {
  u = (u || "").trim();
  if (!u) return `<span class="av unk">?</span>`;
  const ini = u.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  let h = 0;
  for (const c of u) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `<span class="av" style="--ah:${h % 360}">${esc(ini)}</span>`;
}
function evText(e) {
  if (e.kind === "seg")
    return `<em>${esc(e.aktivnost)}</em> · ${hcLbl(e.polje)}: ${esc(e.vrijednost)}`;
  const FL = { naziv: t("fNaziv"), lokacija: t("lokacija"), voditelj: t("voditelj"),
    hp: "HP", ha: "HA", pop: "POP", projekt: t("projekat"),
    aktivnost: t("aktivnost"), odjel: t("fOdjel") };
  switch (e.action) {
    case "kreirano": return `✚ ${t("aKreirano")}${e.novo ? ` · ${esc(e.novo)}` : ""}`;
    case "obrisano": return `🗑 ${t("aObrisano")}${e.staro ? ` · ${esc(e.staro)}` : ""}`;
    case "termin obrisan":
      return `🗑 ${t("aTerminObrisan")} · <em>${esc(e.polje)}</em> ${esc(e.staro)}`;
    case "aktivnost dodana": return `✚ ${t("aAktDodana")} · <em>${esc(e.novo)}</em>`;
    case "aktivnost obrisana": return `🗑 ${t("aAktObrisana")} · <em>${esc(e.staro)}</em>`;
    default:
      return `${FL[e.polje] || esc(e.polje)}: ${esc(e.staro ?? "")} <i class="arr">→</i> ${esc(e.novo ?? "")}`;
  }
}
function evRow(e) {
  /* u POP pogledu označi događaje koji pripadaju pojedinom DP-u */
  const child = SEL && SEL.type === "pop" && (e.kind === "seg" || e.entity === "dp");
  const chLbl = e.kind === "seg" ? e.dp_naziv : e.label;
  const pre = child && chLbl ? `<small class="ch">${esc(chLbl)}</small> ` : "";
  return `<div class="dr-h">${avatar(e.user)}<div class="bd">
    <div class="tx">${pre}${evText(e)}</div>
    <div class="sub">${e.user ? esc(e.user) : t("nepoznat")} · ${fmtTs(e.ts)}</div></div></div>`;
}
/* drawer akcije: HP/HA upis, preimenovanje, brisanje */
async function drNum(k) {
  if (!SEL) return;
  const v = Math.max(0, Math.round(+$(k === "hp" ? "#drHp" : "#drHa").value || 0));
  const url = SEL.type === "pop" ? `/api/pops/${SEL.id}` : `/api/dps/${SEL.id}`;
  await api(url, "PATCH", { [k]: v });
  const obj = SEL.type === "pop" ? DATA.pops.find(p => p.id === SEL.id)
                                 : DATA.dps.find(d => d.id === SEL.id);
  if (obj) obj[k] = v;
  renderAll();
  histDirty();
}
$("#drHp").addEventListener("change", () => drNum("hp"));
$("#drHa").addEventListener("change", () => drNum("ha"));
$("#drClose").addEventListener("click", () => { SEL = null; closeDrawer(); renderAll(); });
$("#drRename").addEventListener("click", async () => {
  if (!SEL) return;
  const obj = SEL.type === "pop" ? DATA.pops.find(p => p.id === SEL.id)
                                 : DATA.dps.find(d => d.id === SEL.id);
  if (!obj) return;
  const v = await uiPrompt(t("renameTo"), obj.naziv);
  if (!v || !v.trim() || v.trim() === obj.naziv) return;
  if (SEL.type === "pop" && F.pop.has(obj.naziv)) {
    F.pop.delete(obj.naziv); F.pop.add(v.trim());
  }
  await api(SEL.type === "pop" ? `/api/pops/${SEL.id}` : `/api/dps/${SEL.id}`,
    "PATCH", { naziv: v.trim() });
  await load();
});
$("#drDel").addEventListener("click", async () => {
  if (!SEL) return;
  if (SEL.type === "pop") {
    const p = DATA.pops.find(x => x.id === SEL.id);
    if (!p) return;
    const n = DATA.dps.filter(d => d.pop_id === p.id).length;
    if (!await uiConfirm(tf("confDelPop", p.naziv, n))) return;
    F.pop.delete(p.naziv);
    await api(`/api/pops/${SEL.id}`, "DELETE");
  } else {
    const d = DATA.dps.find(x => x.id === SEL.id);
    if (!d) return;
    if (!await uiConfirm(tf("confDelDp", `${d.pop} · ${d.naziv}`))) return;
    F.dp.delete(d.id);
    await api(`/api/dps/${SEL.id}`, "DELETE");
  }
  SEL = null; closeDrawer();
  await load();
});

/* ---------- dijalozi: novi POP / novi DP (pod POP-om ili slobodno) ---------- */
function fillPopList(projekt) {
  $("#dlPops").innerHTML = DATA.pops
    .filter(p => !projekt || p.projekt === projekt)
    .map(p => `<option value="${esc(p.naziv)}">`).join("");
}
function openDpDialog(popId) {
  const frm = $("#frmDp");
  frm.reset();
  const p = popId ? DATA.pops.find(x => x.id === popId) : null;
  $("#dpPopId").value = p ? p.id : "";
  $("#dpUnder").classList.toggle("hidden", !p);
  $("#dpProjRow").classList.toggle("hidden", !!p);
  $("#dpPopRow").classList.toggle("hidden", !!p);
  frm.elements.pop.required = !p;
  if (p) {
    $("#dpUnder").innerHTML =
      `${esc(p.projekt || "—")} <i>▸</i> <b>${esc(p.naziv)}</b> <i>▸</i> ${t("noviDpH")}`;
    frm.elements.projekt.value = p.projekt || "";
    frm.elements.pop.value = p.naziv;
  }
  fillPopList(frm.elements.projekt.value.trim());
  $("#dlgDp").showModal();
}
$("#frmPop").addEventListener("submit", async e => {
  if (e.submitter && e.submitter.value === "cancel") return;
  const body = Object.fromEntries(new FormData(e.target).entries());
  body.projekt = ($("#popProjSel").value || "").trim();
  if (!body.projekt) return;                 // projekat je obavezan (select required)
  e.target.reset();
  try {
    await api("/api/pops", "POST", body);
  } catch {
    uiAlert(t("popPostoji"), "warning");
    return;
  }
  await load();
});
/* ---------- ULAZNE-style autocomplete: kucaš -> padajuće sugestije ---------- */
function comboOpts(id) {
  if (id === "fPop")
    return [...new Set(scopedDps().map(d => d.pop).filter(Boolean))].sort(cmpStr);
  if (id === "fDp")
    return scopedDps().map(d => `${d.pop} · ${d.naziv}`).sort(cmpStr);
  if (id === "pfKunde") return [...new Set(PROJ.rows
    .filter(p => !PROJ.code || p.projectcode === PROJ.code)
    .map(p => p.kunde).filter(Boolean))].sort(cmpStr);
  if (id === "pfCode") return [...new Set(PROJ.rows
    .filter(p => !PROJ.kunde || p.kunde === PROJ.kunde)
    .map(p => p.projectcode).filter(Boolean))].sort(cmpStr);
  return [...new Set(PROJ.rows
    .filter(p => (!PROJ.kunde || p.kunde === PROJ.kunde) &&
                 (!PROJ.code || p.projectcode === PROJ.code))
    .map(p => p.projektname).filter(Boolean))].sort(cmpStr);
}
function comboGet(id) {
  if (id === "fPop" || id === "fDp") return ""; // multi-izbor: polje ostaje prazno
  return id === "pfKunde" ? PROJ.kunde : id === "pfCode" ? PROJ.code : PROJ.name;
}
function comboSet(id, v) {
  /* POP/DP: svaki odabir se DODAJE u filter (čip u AKTIVNI redu); ✕ briše sve */
  if (id === "fPop") { v ? F.pop.add(v) : F.pop.clear(); renderAll(); return; }
  if (id === "fDp") {
    if (!v) F.dp.clear();
    else {
      const d = scopedDps().find(x => `${x.pop} · ${x.naziv}` === v);
      if (d) F.dp.add(d.id);
    }
    renderAll(); return;
  }
  if (id === "pfKunde") PROJ.kunde = v;
  else if (id === "pfCode") PROJ.code = v;
  else PROJ.name = v;
  projFilterChanged();
}
function syncCombo(id, val) {
  const inp = $("#" + id);
  if (!inp) return;
  if (document.activeElement !== inp) inp.value = val || "";
  const x = inp.parentElement.querySelector(".cmb-x");
  if (x) x.hidden = !val;
}
function initCombo(id) {
  const inp = $("#" + id);
  if (!inp) return;
  const box = inp.parentElement;
  const list = box.querySelector(".combo-list");
  const x = box.querySelector(".cmb-x");
  const show = q => {
    const ql = (q || "").trim().toLowerCase();
    const opts = comboOpts(id);
    const hits = ql ? opts.filter(o => o.toLowerCase().includes(ql)) : opts;
    list.innerHTML = hits.slice(0, 60).map(o => {
      const i = ql ? o.toLowerCase().indexOf(ql) : -1;
      const lbl = i >= 0
        ? esc(o.slice(0, i)) + "<b>" + esc(o.slice(i, i + ql.length)) + "</b>" + esc(o.slice(i + ql.length))
        : esc(o);
      return `<div class="combo-opt" data-v="${esc(o)}">${lbl}</div>`;
    }).join("") || `<div class="combo-empty">${t("nemaRez")}</div>`;
    list.hidden = false;
  };
  inp.addEventListener("focus", () => show(inp.value));
  inp.addEventListener("input", () => show(inp.value));
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = list.querySelector(".combo-opt");
      if (first) { comboSet(id, first.dataset.v); list.hidden = true; inp.blur(); }
    } else if (e.key === "Escape") { list.hidden = true; inp.blur(); }
  });
  inp.addEventListener("blur", () => setTimeout(() => {
    list.hidden = true;
    inp.value = comboGet(id) || "";   // prikaz uvijek prati stvarno stanje filtera
  }, 150));
  list.addEventListener("pointerdown", e => {
    const opt = e.target.closest(".combo-opt");
    if (!opt) return;
    e.preventDefault();
    comboSet(id, opt.dataset.v);
    list.hidden = true;
  });
  if (x) x.addEventListener("click", () => comboSet(id, ""));
}
["pfKunde", "pfProj", "pfCode", "fPop", "fDp"].forEach(initCombo);

/* ---------- datumski filter — Flatpickr (isti picker kao ULAZNE-FAKTURE) ---------- */
const FP = {};
[["fDateOd", v => { F.dOd = v; }], ["fDateDo", v => { F.dDo = v; }]].forEach(([id, set]) => {
  if (window.flatpickr) {
    FP[id] = flatpickr("#" + id, {
      dateFormat: "Y-m-d",          // interno (poklapa se s datumima termina)
      altInput: true, altFormat: "d/m/Y",   // korisnik vidi dd/mm/gggg
      monthSelectorType: "static",
      disableMobile: true, allowInput: true,
      onChange: (_d, ds) => { set(ds || ""); renderAll(); },
    });
  } else {
    const el = $("#" + id); el.type = "date";
    el.addEventListener("change", e => { set(e.target.value || ""); renderAll(); });
  }
});
function clearDate(id) {
  if (FP[id]) FP[id].clear();      // clear() okida onChange -> F + renderAll
  else { const el = $("#" + id); if (el) el.value = ""; }
}

/* ✕ Očisti = poništi SVE filtere odjednom */
$("#pfClear").addEventListener("click", () => {
  PROJ.kunde = PROJ.code = PROJ.name = "";
  F.dp.clear(); F.pop.clear(); F.st.clear(); F.odj.clear(); F.esk = false;
  F.dOd = F.dDo = ""; clearDate("fDateOd"); clearDate("fDateDo");
  projFilterChanged();
});
$("#btnProjSync").addEventListener("click", async () => {
  const b = $("#btnProjSync");
  b.disabled = true; b.textContent = "⟳ sync…";
  try { await api("/api/projects/sync", "POST"); } catch (e) { /* greška se prikaže u meta */ }
  await loadProjects();
  b.disabled = false; b.textContent = "⟳ Sync";
});

/* ---------- jezik ---------- */
function applyLang() {
  MJESECI = MJESECI_ALL[LANG];
  DANI = DANI_ALL[LANG];
  document.documentElement.lang = LANG;
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $$("[data-i18n-title]").forEach(el => { el.title = t(el.dataset.i18nTitle); });
  $$("#langToggle button").forEach(b => b.classList.toggle("on", b.dataset.lang === LANG));
}
function setLang(l) {
  LANG = l;
  localStorage.setItem("dp_lang", l);
  applyLang();
  renderAll();
}
$$("#langToggle button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
applyLang();

/* ---------- sklopive sekcije (Filteri / Analitika), stanje se pamti ---------- */
function initFolds() {
  $$(".fold-head").forEach(h => {
    const fold = h.closest(".fold");
    const key = "dp_fold_" + h.dataset.fold;
    const stored = localStorage.getItem(key);
    if (stored === "1") fold.classList.add("collapsed");
    else if (stored === "0") fold.classList.remove("collapsed");
    h.addEventListener("click", () => {
      const collapsed = fold.classList.toggle("collapsed");
      localStorage.setItem(key, collapsed ? "1" : "0");
      /* grafovi kreirani dok je sekcija skrivena imaju 0 dimenzija —
         preračunaj ih kad se Analitika otvori */
      if (!collapsed) for (const k in charts) charts[k].resize();
    });
  });
}
initFolds();

/* ---------- shell ---------- */
const yearSel = $("#year");
for (let y = 2025; y <= 2032; y++) yearSel.add(new Option(y, y));
yearSel.value = YEAR;
yearSel.addEventListener("change", () => { YEAR = +yearSel.value; renderTimeline(false); });

$("#btnAddDp").addEventListener("click", () => openDpDialog(null));
$("#btnAddPopTop").addEventListener("click", () => openPopDialog(effProjName()));
$("#frmDp [name=projekt]").addEventListener("input", e => fillPopList(e.target.value.trim()));
$("#frmDp").addEventListener("submit", async e => {
  if (e.submitter && e.submitter.value === "cancel") return;
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  if (!body.pop_id) delete body.pop_id;
  await api("/api/dps", "POST", body);
  e.target.reset();
  await load();
});
$("#userBadge").addEventListener("click", askUser);
renderUser();

async function load() {
  DATA = await api("/api/data");
  renderAll();
  setPx(PX);                       // clamp initial zoom to the viewport (no dead space)
  drawerSync();                    // osvježi/zatvori drawer ako se izbor promijenio
}
load();
loadProjects();
