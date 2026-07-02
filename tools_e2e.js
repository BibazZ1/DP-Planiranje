/* E2E test SVIH filtera i ključnih tokova — Playwright (chromium iz ULAZNE-FAKTURE).
   Cilja dev server na 127.0.0.1:5061 s TEST bazom (DP-PLANIRANJE-TEST). */
const { chromium } = require("playwright");

const BASE = "http://127.0.0.1:5070";
let pass = 0, fail = 0;
const failures = [];

function ok(name, cond, extra = "") {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; failures.push(name); console.log(`FAIL  ${name} ${extra}`); }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--proxy-server=direct://", "--proxy-bypass-list=*"],
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  const jsErrors = [];
  page.on("pageerror", e => jsErrors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") jsErrors.push(m.text()); });

  const list = id => page.locator(`#${id} ~ .combo-list, .combo:has(#${id}) .combo-list`).first();
  const chipX = sel => page.locator(`#activeBar .fchip[${sel}]`);
  const badge = () => page.locator("#fltBadge");
  // searchable dialog picker: kucaj pa klikni opciju (allowNew: samo upiši)
  const pickVal = id => page.locator(`#${id} .pick-in`).inputValue();
  async function pick(id, value, { typeOnly = false } = {}) {
    await page.click(`#${id} .pick-in`);
    await page.fill(`#${id} .pick-in`, value);
    await page.waitForTimeout(180);
    if (typeOnly) { await page.locator(`#${id} .pick-in`).blur(); return; }
    await page.locator(`#${id} .pick-list .pick-opt`).filter({ hasText: value }).first().click();
    await page.waitForTimeout(220);
  }

  // ---------- 1. učitavanje + auth ----------
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  await page.waitForURL(BASE + "/", { timeout: 15000 });
  await page.waitForSelector("#userName", { timeout: 15000 });
  ok("login + index load", true);
  ok("auth ime prikazano", (await page.textContent("#userName")).trim().length > 1);
  ok("admin dugme vidljivo (admin)", await page.locator("#btnAdmin").isVisible());

  // dugmad UVIJEK otključana — dijalog vodi kroz kaskadu Kunde→Projekat
  ok("Novi POP otključan i bez projekta", !(await page.locator("#btnAddPopTop").isDisabled()));
  ok("Novi DP otključan i bez projekta", !(await page.locator("#btnAddDp").isDisabled()));

  // ---------- 1b. kaskada u POP dijalogu (bez ijednog filtera) ----------
  // sačekaj da se Azure projekti učitaju (pune opcije kaskade)
  await page.waitForFunction(() =>
    (document.querySelector("#projMeta").textContent || "").trim().length > 0, null, { timeout: 10000 });
  await page.click("#btnAddPopTop");
  await page.waitForSelector("#dlgPop[open]", { timeout: 5000 });
  ok("kaskada: Kunde SVIJETLI (glow)", await page.locator("#popKunde.glow-req").isVisible());
  ok("kaskada: Projekat zaključan dok nema Kunde", await page.locator("#popProj.disabled").isVisible());
  ok("kaskada: koraci indikator vidljiv", (await page.locator("#popSteps .dstep").count()) === 2);
  await pick("popKunde", "mih Gmbh");
  ok("kaskada: poslije Kunde svijetli Projekat", await page.locator("#popProj.glow-req").isVisible());
  await page.click("#popProj .pick-in");
  await page.waitForSelector("#popProj .pick-list:not([hidden]) .pick-opt", { timeout: 5000 });
  const projCnt = await page.locator("#popProj .pick-list .pick-opt").count();
  ok("kaskada: projekti filtrirani po Kunde", projCnt === 2, `(${projCnt})`);
  await page.locator("#popProj .pick-in").blur();
  await page.waitForTimeout(150);
  await page.click('#frmPop button[value="cancel"]');
  await page.waitForTimeout(300);
  ok("kaskada: Odustani zatvara dijalog", !(await page.locator("#dlgPop[open]").isVisible().catch(() => false)));

  // ---------- 2. Kunde combo ----------
  await page.click("#pfKunde");
  await page.waitForSelector(".combo:has(#pfKunde) .combo-list:not([hidden]) .combo-opt", { timeout: 5000 });
  const kOpts = await page.locator(".combo:has(#pfKunde) .combo-list .combo-opt").count();
  ok("Kunde sugestije se otvore", kOpts >= 2, `(${kOpts})`);

  // KRITIČNO: lista mora biti NA VRHU (ništa je ne prekriva / ne siječe)
  const onTop = await page.evaluate(() => {
    const opt = document.querySelector(".combo:has(#pfKunde) .combo-list .combo-opt");
    const r = opt.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return el === opt || opt.contains(el);
  });
  ok("dropdown NIJE prekriven drugom sekcijom", onTop);

  await page.fill("#pfKunde", "construct");
  await page.waitForTimeout(250);
  const kFiltered = await page.locator(".combo:has(#pfKunde) .combo-list .combo-opt").count();
  ok("kucanje filtrira Kunde sugestije", kFiltered === 1, `(${kFiltered})`);
  await page.fill("#pfKunde", "mih Gmbh");
  await page.waitForTimeout(250);
  await page.locator(".combo:has(#pfKunde) .combo-list .combo-opt").first().click();
  await page.waitForTimeout(400);
  ok("Kunde izabran -> AKTIVNI čip", await chipX("data-xkunde").isVisible());
  ok("badge na Filteri pilu = 1", (await badge().textContent()).trim() === "1");

  // ---------- 3. Projekat combo (kaskada) ----------
  await page.click("#pfProj");
  await page.waitForSelector(".combo:has(#pfProj) .combo-list:not([hidden]) .combo-opt", { timeout: 5000 });
  const pOpts = await page.locator(".combo:has(#pfProj) .combo-list .combo-opt").allTextContents();
  ok("kaskada: samo projekti izabranog Kunde", pOpts.length === 2 && pOpts.every(o => o.includes("NORD")), `(${pOpts.join("|")})`);
  await page.fill("#pfProj", "WAND");
  await page.waitForTimeout(250);
  await page.locator(".combo:has(#pfProj) .combo-list .combo-opt").first().click();
  await page.waitForTimeout(400);
  ok("Projekat izabran -> AKTIVNI čip", await chipX("data-xproj").isVisible());

  // prazno stanje s objašnjenjem (nema DP-ova pod ovim projektom)
  ok("prazno stanje objašnjeno (tl-empty)", await page.locator(".tl-empty").isVisible());

  // ---------- 4. Novi POP (filteri pune kaskadu, ništa ne svijetli) ----------
  await page.click("#btnAddPopTop");
  await page.waitForSelector("#dlgPop[open]", { timeout: 5000 });
  ok("dijalog: Kunde predizabran iz filtera", (await pickVal("popKunde")) === "mih Gmbh");
  const preProj = await pickVal("popProj");
  ok("dijalog: Projekat predizabran iz filtera", preProj.includes("WANDLITZ"), `(${preProj})`);
  ok("dijalog: ništa ne svijetli (sve popunjeno)", (await page.locator("#dlgPop .glow-req").count()) === 0);
  await page.fill('#frmPop input[name="naziv"]', "POP TEST-1");
  ok("POP dijalog: nema HP/HA polja (vodi se na DP-u)",
    (await page.locator('#frmPop input[name="hp"], #frmPop input[name="ha"]').count()) === 0);
  // RFA datum je novo OBAVEZNO polje POP-a -> bez njega se POP ne kreira
  ok("POP dijalog: RFA datum polje obavezno", await page.locator('#frmPop input[name="rfa"]').evaluate(e => e.required));
  await page.fill('#frmPop input[name="rfa"]', "2026-08-01");
  await page.click('#frmPop button[value="ok"]');
  await page.waitForTimeout(800);
  ok("POP kreiran (bez greške)", !(await page.locator("#dlgPop[open]").isVisible().catch(() => false)));

  // ---------- 5. Novi DP pod POP-om (kaskada do POP koraka) ----------
  await page.click("#btnAddDp");
  await page.waitForSelector("#dlgDp[open]", { timeout: 5000 });
  ok("DP dijalog: Kunde+Projekat predizabrani", (await pickVal("dpProj")).includes("WANDLITZ"));
  // poslije kreiranja POP-a tabela se fokusira na njega -> DP dijalog ga predizabere
  ok("DP dijalog: POP predizabran (fokus na novi POP)", (await pickVal("dpPop")) === "POP TEST-1");
  await pick("dpPop", "POP TEST-1");
  await page.fill('#frmDp input[name="naziv"]', "DP T1");
  await page.fill('#frmDp input[name="hp"]', "10");
  await page.fill('#frmDp input[name="ha"]', "5");   // HP i HA su obavezni (> 0)
  await page.click('#frmDp button[value="ok"]');
  await page.waitForTimeout(1000);
  const rows = await page.locator(".tl-row[data-task]").count();
  ok("DP kreiran -> 8 aktivnosti u timelineu", rows === 8, `(${rows})`);
  ok("prazno stanje nestalo", !(await page.locator(".tl-empty").isVisible().catch(() => false)));
  ok("auto-fokus: tabela filtrirana na novi DP", (await page.locator('#activeBar .fchip[data-xdp]').count()) >= 1);

  // ---------- 5b. claim sistem (vlasništvo projekta + atribucija) ----------
  ok("claim: 'Preuzmi' kad slobodno", await page.locator("#btnClaim").isVisible());
  await page.click("#btnClaim");
  await page.waitForSelector(".swal2-confirm", { timeout: 5000 });
  await page.click(".swal2-confirm");
  await page.waitForTimeout(1200);
  const claims = (await (await page.request.get(BASE + "/api/data")).json()).claims;
  ok("claim: projekat preuzet (owner u /api/data)",
    claims && Object.keys(claims).some(k => /WANDLITZ/i.test(k)));
  ok("claim: vlasnik chip (moj)", await page.locator("#projClaim .claim-chip.mine").isVisible());
  ok("claim: vlasnik čip u traci DP reda", (await page.locator(".gr-strip .gs-owner").count()) >= 1);
  await page.click("#btnRelease");
  await page.waitForSelector(".swal2-confirm", { timeout: 5000 });
  await page.click(".swal2-confirm");
  await page.waitForTimeout(1200);
  ok("claim: otpušteno -> opet 'Preuzmi'", await page.locator("#btnClaim").isVisible());

  // ---------- 6. termini kroz API (prošli rok -> kasni; Aktivacije -> rok DP-a) ----------
  const dataRes = await page.request.get(BASE + "/api/data");
  const data = await dataRes.json();
  const dpT1 = data.dps.find(d => d.naziv === "DP T1");
  const tasks = data.tasks.filter(t => t.dp_id === dpT1.id);
  const tIskop = tasks.find(t => t.aktivnost.includes("Iskopni"));
  const tAkt = tasks.find(t => /aktivacij/i.test(t.aktivnost));
  // prošli rok + otvoreno -> server zahtijeva kasni_razlog (poslovno pravilo)
  await page.request.post(BASE + "/api/segments", { data: {
    task_id: tIskop.id, datum_od: "2026-03-02", datum_do: "2026-03-15", status: "otvoreno",
    kasni_razlog: "test kasni" } });
  await page.request.post(BASE + "/api/segments", { data: {
    task_id: tAkt.id, datum_od: "2026-05-04", datum_do: "2026-05-17", status: "otvoreno",
    kasni_razlog: "test kasni" } });
  await page.request.post(BASE + "/api/segments", { data: {
    task_id: tasks.find(t => t.aktivnost === "Dozvole").id,
    datum_od: "2026-07-06", datum_do: "2026-07-19", status: "završeno" } });
  // (više traka po aktivnosti je sada dozvoljeno — testira se zasebno u sekciji 16n)
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".seg", { timeout: 10000 });
  // refiltriranje nakon reload-a (filteri se ne pamte) — ponovo izaberi projekat
  ok("termini vidljivi nakon reload (bez filtera)", (await page.locator(".seg").count()) === 3);

  ok("kasni: crvena značka +Nd na traci", (await page.locator(".seg .latebadge").count()) >= 1);
  ok("rok DP-a (Aktivacije) prikazan", await page.locator(".rokb").first().isVisible());
  ok("rok DP-a CRVEN (prošao)", await page.locator(".rokb.late").first().isVisible());
  ok("brojač kasnih (čip) u traci DP reda", await page.locator(".gr-strip .gs-late").first().isVisible());

  // ---------- 7. status čipovi ----------
  const segVisible = async () => page.locator(".seg").evaluateAll(els =>
    els.filter(e => !e.classList.contains("dim")).length);
  ok("nema više 'u toku' čipa", (await page.locator('.chip[data-st="u toku"]').count()) === 0);
  // "u toku" je ukinut i na API nivou: pokušaj kreiranja se normalizuje u "otvoreno"
  const utRes = await page.request.post(BASE + "/api/segments", { data: {
    task_id: tIskop.id, datum_od: "2026-09-01", datum_do: "2026-09-10", status: "u toku" } });
  const utId = (await utRes.json()).id;
  const utData = await (await page.request.get(BASE + "/api/data")).json();
  const utSeg = utData.segments.find(s => s.id === utId);
  ok("API: status 'u toku' se normalizuje u 'otvoreno'", utSeg && utSeg.status === "otvoreno",
    `(${utSeg && utSeg.status})`);
  await page.request.delete(BASE + "/api/segments/" + utId);
  await page.click('.chip[data-st="završeno"]');
  await page.waitForTimeout(400);
  ok("status filter: samo 'završeno' istaknut", (await segVisible()) === 1);
  ok("status -> AKTIVNI čip", await chipX("data-xst").isVisible());
  await chipX("data-xst").click();
  await page.waitForTimeout(400);
  ok("uklanjanje status čipa vraća sve", (await segVisible()) === 3);

  // ---------- 8. kasni čip + KPI ----------
  await page.click('.chip[data-late="1"]');
  await page.waitForTimeout(400);
  ok("kasni filter: 2 kasna termina istaknuta", (await segVisible()) === 2);
  await page.click('.chip[data-late="1"]');
  await page.waitForTimeout(300);

  // ---------- 9. datumski filter (flatpickr) + HP/HA KPI prati raspon ----------
  const hpD = () => page.locator("#kpis .kpi.purple .num").first().getAttribute("data-n").then(v => +v);
  const hpAll = await hpD();
  await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.setDate("2026-07-01", true));
  await page.waitForTimeout(400);
  ok("datum od -> AKTIVNI čip", await chipX("data-xdod").isVisible());
  ok("datum od filtrira termine", (await segVisible()) === 1);
  await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.setDate("2031-01-01", true));
  await page.waitForTimeout(300);
  ok("KPI HP prati datumski filter (0 kad nema termina u rasponu)",
    hpAll > 0 && (await hpD()) === 0, `(all=${hpAll})`);
  await chipX("data-xdod").click();
  await page.waitForTimeout(400);
  ok("uklanjanje datuma vraća sve", (await segVisible()) === 3);

  // ---------- 9b. zelene projektne količine prate Datum von/bis (project_daily) ----------
  const greenHp = async () => +(((await page.locator("#projKpis .kpi .num").first().textContent()) || "0").replace(/[^\d]/g, ""));
  const gAll = await greenHp();                       // bez raspona = puni projektni HP (2500)
  await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.setDate("2026-06-01", true));
  await page.evaluate(() => document.querySelector("#fDateDo")._flatpickr.setDate("2026-07-01", true));
  await page.waitForTimeout(700);
  const gRange = await greenHp();
  ok("zelene količine (HP) prate Datum von/bis", gAll !== gRange && gRange === 180, `(all=${gAll} range=${gRange})`);
  await page.click("#pfClear");
  await page.waitForTimeout(400);

  // ---------- 10. POP / DP combo filteri ----------
  await page.click("#fPop");
  await page.waitForSelector(".combo:has(#fPop) .combo-list:not([hidden]) .combo-opt", { timeout: 5000 });
  await page.locator(".combo:has(#fPop) .combo-list .combo-opt").first().click();
  await page.waitForTimeout(400);
  ok("POP filter -> AKTIVNI čip", await chipX("data-xpop").isVisible());
  await page.click("#fDp");
  await page.waitForSelector(".combo:has(#fDp) .combo-list:not([hidden]) .combo-opt", { timeout: 5000 });
  await page.locator(".combo:has(#fDp) .combo-list .combo-opt").first().click();
  await page.waitForTimeout(400);
  ok("DP filter -> AKTIVNI čip", await chipX("data-xdp").isVisible());

  // ---------- 11. aktivnost čip (filter po aktivnosti, ne po odjelu) ----------
  ok("slicer filtrira po AKTIVNOSTI (nema data-odj čipova)",
    (await page.locator('.chip[data-odj]').count()) === 0);
  await page.locator('.chip[data-akt]').first().click();
  await page.waitForTimeout(300);
  ok("aktivnost filter -> AKTIVNI čip", await chipX("data-xakt").isVisible());
  await chipX("data-xakt").click();   // ukloni da ne ostane aktivan filter
  await page.waitForTimeout(200);

  // ---------- 12. Očisti sve ----------
  await page.click("#pfClear");
  await page.waitForTimeout(500);
  ok("Očisti: badge sakriven", await badge().isHidden());
  ok("Očisti: nema AKTIVNI čipova", (await page.locator("#activeBar .fchip").count()) === 0);

  // ---------- 12b. klik na DP ćeliju: puni projekat+kunde + otvara bočni panel (BEZ sužavanja) ----------
  await page.locator('.cell[data-fdp]').first().click();
  // panel klizi 0.38s (transform+visibility) — čekaj da se stvarno otvori, ne fiksni timeout
  await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(450);
  ok("klik na DP -> projekat popunjen", await chipX("data-xproj").isVisible());
  ok("klik na DP -> kunde popunjen", await chipX("data-xkunde").isVisible());
  ok("klik na DP -> NE filtrira na taj DP (nema DP čipa)", !(await chipX("data-xdp").isVisible().catch(() => false)));
  ok("klik na DP -> izabrani red istaknut (.group.sel)", (await page.locator("#tlScroll .tl-row.group.sel").count()) === 1);
  ok("klik na DP -> bočni panel (HP/HA + historija)", await page.locator("#drawer.open").isVisible());

  // ---------- 12c. komandni centar u panelu ----------
  const addDaysStr = (s, n) => { const d = new Date(s); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  ok("panel: progress ring", await page.locator("#drStats .drs-ring").isVisible());
  ok("panel: rok (Aktivacije) prikazan", await page.locator("#drStats .drs-rok").isVisible());
  // AKTIVNOSTI lista UKLONJENA iz panela (duplirala je tabelu)
  ok("panel: nema duplirane AKTIVNOSTI liste", (await page.locator("#drActs").count()) === 0);

  // komentari: kompaktni, s istaknutim vremenom (dc-time)
  await page.fill("#drCIn", "E2E test komentar");
  await page.click("#drCSend");
  await page.waitForTimeout(800);
  ok("komentar dodan u panel", (await page.locator("#drComments").textContent()).includes("E2E test komentar"));
  ok("komentar: istaknuto vrijeme (dc-time)", await page.locator("#drComments .dc-time b").first().isVisible());
  ok("komentar: prikazan datum uz vrijeme", (await page.locator("#drComments .dc-time i").first().textContent()).trim().length >= 4);

  // ---------- 12e. ±1 KW pomjeranje + undo ----------
  const segsA = (await (await page.request.get(BASE + "/api/data")).json()).segments;
  await page.locator('#drShift [data-shift="7"]').click();
  await page.waitForSelector(".swal2-confirm", { timeout: 5000 });
  await page.click(".swal2-confirm");
  await page.waitForTimeout(2500);
  const segsB = (await (await page.request.get(BASE + "/api/data")).json()).segments;
  ok("±KW: svi termini pomjereni +7d", segsB.every(s2 => {
    const s1 = segsA.find(x => x.id === s2.id);
    return s1 && addDaysStr(s1.datum_od, 7) === s2.datum_od;
  }));
  await page.click("#btnUndo");
  await page.waitForTimeout(2500);
  const segsC = (await (await page.request.get(BASE + "/api/data")).json()).segments;
  ok("undo vraća ±KW pomjeranje", segsC.every(s2 => {
    const s1 = segsA.find(x => x.id === s2.id);
    return s1 && s1.datum_od === s2.datum_od;
  }));

  // ---------- 12f. plan-vs-stvarnost ----------
  ok("plan-vs-stvarnost (HP/HA trake) prikazan", (await page.locator(".pv-wrap").count()) === 1);

  // ---------- 12g. Escape skida DP ali OSTAVLJA projekat (historija je sad SAMO u hover-kartici) ----------
  ok("panel: nema više liste historije (samo hover-kartica)", (await page.locator("#drHist").count()) === 0);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  ok("Esc: panel zatvoren", !(await page.locator("#drawer.open").isVisible().catch(() => false)));
  ok("Esc: isticanje reda skinuto (.group.sel)", (await page.locator("#tlScroll .tl-row.group.sel").count()) === 0);
  ok("Esc: nema DP filtera (klik ne sužava)", !(await chipX("data-xdp").isVisible().catch(() => false)));
  ok("Esc: projekat OSTAJE", await chipX("data-xproj").isVisible());
  ok("Esc: kunde OSTAJE", await chipX("data-xkunde").isVisible());

  await page.click("#pfClear");
  await page.waitForTimeout(400);

  // ---------- 12h. crtanje = ODMAH kreira (otvoreno), bez popovera i pitanja ----------
  const segCount = async () => (await (await page.request.get(BASE + "/api/data")).json()).segments.length;
  const lastSeg = async () => {
    const ss = (await (await page.request.get(BASE + "/api/data")).json()).segments;
    return ss.reduce((m, s) => (s.id > (m?.id || 0) ? s : m), null);
  };
  // collapse analitiku da timeline redovi ne padnu ispod viewporta (stabilno crtanje)
  if (!(await page.locator("#analyticsCard.collapsed").count()))
    await page.locator('[data-fold="analitika"]').click().catch(() => {});
  const rowBox = async name => {
    const tr = page.locator('.tl-row[data-task]', { hasText: name }).first();
    await tr.scrollIntoViewIfNeeded().catch(() => {});   // uvijek dovuci red u vidno polje
    await page.waitForTimeout(60);
    return tr.locator(".tl-track").boundingBox();
  };

  // (a) crtanje -> PITA otvoren/završen; Otkaži = ništa se ne kreira
  let bA = await rowBox("Asfaltiranje");
  let yA = bA.y + bA.height / 2;
  await page.mouse.move(bA.x + 300, yA);
  await page.mouse.down();
  await page.mouse.move(bA.x + 380, yA, { steps: 4 });
  ok("crtanje: živi brojač datuma vidljiv", await page.locator(".dragtip:not(.hidden)").isVisible());
  const tipTxt = await page.locator(".dragtip").textContent();
  ok("brojač: datumi + trajanje + KW", /\d{2}\/\d{2}/.test(tipTxt) && /d · KW/.test(tipTxt), `(${tipTxt})`);
  const cntBefore = await segCount();
  await page.mouse.up();
  await page.waitForSelector("#drawAsk:not(.hidden)", { timeout: 5000 });
  ok("crtanje: pita otvoren ili završen (zalijepljen za ghost)", await page.locator("#daDone").isVisible());
  ok("crtanje: ghost-trebovanje vidljiv dok biraš", (await page.locator(".ghost.keep").count()) === 1);
  await page.click("#daCancel");
  await page.waitForSelector("#drawAsk.hidden", { timeout: 1500 }).catch(() => {});
  ok("izbor NESTANE poslije Otkaži (<1.5s)", await page.locator("#drawAsk").isHidden());
  ok("otkazано: ghost-trebovanje uklonjen", (await page.locator(".ghost").count()) === 0);
  await page.waitForTimeout(200);
  ok("otkazано pitanje -> termin NIJE kreiran", (await segCount()) === cntBefore);

  // (a2) otvoren + kraj prije danas -> traži razlog; Otkaži razlog = ništa
  bA = await rowBox("Asfaltiranje"); yA = bA.y + bA.height / 2;
  await page.mouse.move(bA.x + 300, yA); await page.mouse.down();
  await page.mouse.move(bA.x + 380, yA, { steps: 4 }); await page.mouse.up();
  await page.waitForSelector("#drawAsk:not(.hidden)", { timeout: 5000 });
  await page.click("#daOpen");   // otvoren
  await page.waitForSelector("#daReason:not(.hidden)", { timeout: 5000 });
  ok("otvoren + kraj prije danas -> traži razlog (u oblačiću, ne modal)", await page.locator("#daReasonInput").isVisible());
  ok("razlog: nema velikog SweetAlerta", (await page.locator(".swal2-popup input.swal2-input").count()) === 0);
  await page.click("#daReasonCancel");
  await page.waitForSelector("#drawAsk.hidden", { timeout: 1500 }).catch(() => {});
  await page.waitForTimeout(300);
  ok("otkazan razlog -> termin NIJE kreiran", (await segCount()) === cntBefore);

  // (b) otvoren + razlog -> kreira se s kasni_razlog
  bA = await rowBox("Asfaltiranje"); yA = bA.y + bA.height / 2;
  await page.mouse.move(bA.x + 300, yA); await page.mouse.down();
  await page.mouse.move(bA.x + 380, yA, { steps: 4 }); await page.mouse.up();
  await page.waitForSelector("#drawAsk:not(.hidden)", { timeout: 5000 });
  await page.click("#daOpen");   // otvoren
  await page.waitForSelector("#daReason:not(.hidden)", { timeout: 5000 });
  await page.fill("#daReasonInput", "kasni zbog dozvole");
  await page.click("#daReasonSave");
  await page.waitForTimeout(600);
  ok("otvoren+razlog -> termin kreiran", (await segCount()) === cntBefore + 1);
  ok("kasni_razlog snimljen", (await lastSeg()).kasni_razlog === "kasni zbog dozvole");
  ok("kreiran kao otvoren", (await lastSeg()).status === "otvoreno");

  // (c) crtanje POSLIJE danas -> izaberi otvoren -> odmah kreira (bez razloga)
  const bM = await rowBox("Montaža");
  const yM = bM.y + bM.height / 2;
  await page.mouse.move(bM.x + 660, yM); await page.mouse.down();
  await page.mouse.move(bM.x + 740, yM, { steps: 4 }); await page.mouse.up();
  await page.waitForSelector("#drawAsk:not(.hidden)", { timeout: 5000 });
  await page.click("#daOpen");   // otvoren
  await page.waitForTimeout(700);
  ok("budući termin: bez razloga (nema input Swala)", (await page.locator(".swal2-popup input.swal2-input").count()) === 0);
  ok("budući termin: kreiran", (await segCount()) === cntBefore + 2);
  const segM = await lastSeg();
  ok("budući: status otvoreno", segM.status === "otvoreno");

  // (c2) crtanje -> ZAVRŠEN -> kreira završen i bez razloga (gotov je); prazan red
  const bD = await rowBox("Pregled");
  const yD = bD.y + bD.height / 2;
  await page.mouse.move(bD.x + 300, yD); await page.mouse.down();
  await page.mouse.move(bD.x + 360, yD, { steps: 4 }); await page.mouse.up();
  await page.waitForSelector("#drawAsk:not(.hidden)", { timeout: 5000 });
  await page.click("#daDone");   // završen
  await page.waitForTimeout(700);
  ok("završen termin: ne traži razlog", (await page.locator(".swal2-popup input.swal2-input").count()) === 0);
  ok("završen termin: status završeno", (await lastSeg()).status === "završeno");

  // (d) crtanje je PO DANU: kratak povlak < 7 dana (otvoren u budućnosti)
  const bH = await rowBox("Horizontalno");
  const yH = bH.y + bH.height / 2;
  await page.mouse.move(bH.x + 700, yH); await page.mouse.down();
  await page.mouse.move(bH.x + 712, yH, { steps: 3 }); await page.mouse.up();
  await page.waitForSelector("#drawAsk:not(.hidden)", { timeout: 5000 });
  await page.click("#daOpen");
  await page.waitForTimeout(700);
  const segH = await lastSeg();
  const ndays = Math.round((new Date(segH.datum_do) - new Date(segH.datum_od)) / 864e5) + 1;
  ok("crtanje PO DANU (kratak povlak < 7 dana)", ndays >= 1 && ndays < 7, `(${ndays}d)`);

  // (e) dupli klik = OTVORI EDITOR (NE mijenja status tiho -> termin nikad ne "nestaje")
  const segMEl = page.locator(`.seg[data-seg="${segM.id}"]`);
  await segMEl.dblclick();
  await page.waitForTimeout(400);
  ok("dupli klik -> editor otvoren", await page.locator("#pop:not(.hidden)").isVisible());
  ok("dupli klik NE mijenja status sam (ne briše/nestaje)",
    (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.id === segM.id).status === "otvoreno");
  // u editoru: označi 'završeno' + Sačuvaj -> tek tada se status mijenja
  await page.click('#popStatus .stpill[data-st="završeno"]');
  await page.click("#popSave");
  await page.waitForTimeout(700);
  ok("editor: 'završeno' + Sačuvaj -> status snimljen", (await (await page.request.get(BASE + "/api/data")).json())
    .segments.find(s => s.id === segM.id).status === "završeno");
  await page.click("#btnUndo");
  await page.waitForTimeout(800);
  ok("undo vraća na otvoreno", (await (await page.request.get(BASE + "/api/data")).json())
    .segments.find(s => s.id === segM.id).status === "otvoreno");
  await page.locator(`.seg[data-seg="${segM.id}"]`).click({ button: "right" });
  await page.waitForTimeout(400);
  ok("desni klik -> editor otvoren", await page.locator("#pop:not(.hidden)").isVisible());
  // klik na termin -> vizuelno istaknut na grafu (.sel)
  ok("termin koji se uređuje istaknut (.seg.sel)", (await page.locator(".seg.sel").count()) === 1);
  ok("istaknut je BAŠ taj termin", (await page.locator(`.seg[data-seg="${segM.id}"].sel`).count()) === 1);
  // editor MORA ostati cijeli u ekranu (i kad je visok zbog eskalacije na zadnjem redu) + skrolabilan
  await page.locator("#popEsk").check().catch(() => {});   // proširi -> najviši slučaj (eskalacija polja)
  await page.waitForTimeout(150);
  const popBox = await page.locator("#pop").boundingBox();
  const vh = await page.evaluate(() => window.innerHeight);
  ok("editor: cijeli unutar ekrana (ne ispada ispod)",
    !!popBox && popBox.y >= -1 && (popBox.y + popBox.height) <= vh + 1,
    `(y=${popBox && Math.round(popBox.y)} h=${popBox && Math.round(popBox.height)} vh=${vh})`);
  ok("editor: skrolabilan kad je visok (overflow-y auto)",
    (await page.locator("#pop").evaluate(el => getComputedStyle(el).overflowY)) === "auto");
  ok("editor: polja eskalacije dostupna (otkrivena)",
    (await page.locator("#popEskDatWrap").count()) === 1 &&
    !(await page.locator("#popEskDatWrap").evaluate(el => el.classList.contains("hidden"))));
  await page.locator("#popEsk").uncheck().catch(() => {});
  ok("editor: datum-polja skrivena po defaultu", (await page.locator("#popWhenEdit.hidden").count()) === 1);
  ok("editor: read-only datum traka", await page.locator("#popWhenDisp").isVisible());
  ok("editor: komentar opcionalan", (await page.locator("#pop .pop-field .opt").first().textContent()).toLowerCase().includes("opciona"));
  ok("editor: komentar je chat-oblačić", (await page.locator("#popKomWrap.chat").count()) === 1);
  await page.click("#popWhenDisp");
  await page.waitForTimeout(200);
  ok("editor: klik na datum otkriva ručno uređivanje", (await page.locator("#popWhenEdit.hidden").count()) === 0);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  ok("zatvaranje editora skida isticanje (.seg.sel)", (await page.locator(".seg.sel").count()) === 0);

  // ---------- 12i. eskalacija: ručica na grafu pomjera POČETAK eskalacije ----------
  await page.locator(`.seg[data-seg="${segM.id}"]`).scrollIntoViewIfNeeded().catch(() => {});
  await page.locator(`.seg[data-seg="${segM.id}"]`).click({ button: "right" });
  await page.waitForSelector("#pop:not(.hidden)", { timeout: 5000 });
  await page.locator("#popEsk").check();
  await page.waitForTimeout(150);
  await page.click("#popSave");
  await page.waitForTimeout(700);
  ok("eskalacija uključena -> ručica na traci (.esk-grip)",
    (await page.locator(`.seg[data-seg="${segM.id}"].esk .esk-grip`).count()) === 1);
  const eskBefore = (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.id === segM.id).esk_datum;
  await page.locator(`.seg[data-seg="${segM.id}"]`).scrollIntoViewIfNeeded().catch(() => {});
  const grip = page.locator(`.seg[data-seg="${segM.id}"] .esk-grip`);
  const gb = await grip.boundingBox();
  await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2);
  await page.mouse.down();
  await page.mouse.move(gb.x + 70, gb.y + gb.height / 2, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  const eskAfter = (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.id === segM.id).esk_datum;
  ok("ručica eskalacije: drag-and-drop pomjerio esk_datum", !!eskAfter && eskAfter !== eskBefore, `(${eskBefore} -> ${eskAfter})`);
  // hover-kartica označava datum eskalacije (.hc-eskd) i odražava NOVI datum poslije povlačenja
  await page.keyboard.press("Escape");   // zatvori editor (hover-kartica skrivena dok je editor otvoren)
  await page.waitForTimeout(250);
  await page.mouse.move(5, 5); await page.waitForTimeout(120);
  await page.locator(`.seg[data-seg="${segM.id}"]`).hover();
  await page.waitForSelector(".hovercard:not(.hidden) .hc-eskd", { timeout: 3000 }).catch(() => {});
  const eskdTxt = (await page.locator(".hovercard .hc-eskd").innerText().catch(() => "")) || "";
  ok("hover-kartica: označen datum eskalacije = novi (dd/mm/yyyy)",
    eskdTxt.includes(eskAfter.split("-").reverse().join("/")), `(${eskdTxt} / ${eskAfter})`);

  await page.keyboard.press("Escape");   // zatvori bočni panel (inače prekriva desne filtere/Očisti)
  await page.waitForTimeout(250);
  await page.mouse.move(5, 5); await page.waitForTimeout(120);
  await page.click("#pfClear");
  await page.waitForTimeout(400);

  // ---------- 13. SweetAlert dijalozi ----------
  await page.locator(".act-name").first().dblclick();
  await page.waitForSelector(".swal2-popup input.swal2-input", { timeout: 5000 });
  ok("Swal prompt (preimenovanje) se otvara", true);
  await page.fill(".swal2-popup input.swal2-input", "Dozvole TEST");
  await page.click(".swal2-confirm");
  await page.waitForTimeout(800);
  ok("preimenovanje primijenjeno", (await page.locator(".act-name").allTextContents()).some(t => t.includes("Dozvole TEST")));
  await page.locator(".rowdel").first().click();
  await page.waitForSelector(".swal2-popup", { timeout: 5000 });
  ok("Swal confirm (brisanje) se otvara", true);
  await page.click(".swal2-cancel");
  await page.waitForTimeout(500);
  ok("otkaži brisanje: aktivnost ostala", (await page.locator(".tl-row[data-task]").count()) === 8);

  // ---------- 14. export ----------
  const csv = await page.request.get(BASE + "/export/csv");
  const csvTxt = await csv.text();
  ok("export CSV 200 + kolona Kasni (dana)", csv.status() === 200 && csvTxt.includes("Kasni (dana)"));
  const xlsx = await page.request.get(BASE + "/export/xlsx");
  ok("export Excel 200", xlsx.status() === 200);

  // ---------- 15. admin panel ----------
  await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#tbody tr", { timeout: 8000 });
  ok("admin: lista korisnika", (await page.locator("#tbody tr").count()) >= 1);
  await page.fill("#addEmail", "test.e2e@gfcbh.ba");
  await page.click("#frmAdd button[type=submit]");
  await page.waitForTimeout(800);
  ok("admin: korisnik dodan", (await page.locator("#tbody").textContent()).includes("test.e2e@gfcbh.ba"));
  page.once("dialog", d => d.accept());
  await page.locator("#tbody .btn.danger").last().click();
  await page.waitForTimeout(800);
  ok("admin: korisnik uklonjen", !(await page.locator("#tbody").textContent()).includes("test.e2e@gfcbh.ba"));

  // ---------- 16. Batch 1: server-side validacija + čišćenje + delete undo ----------
  const d2 = await (await page.request.get(BASE + "/api/data")).json();
  const freeTask = d2.tasks.find(tk => !d2.segments.some(s => s.task_id === tk.id));
  if (freeTask) {
    const bad = await page.request.post(BASE + "/api/segments", { data: {
      task_id: freeTask.id, datum_od: "2026-01-05", datum_do: "2026-01-19", status: "otvoreno" } });
    ok("server: 400 na termin u prošlosti bez razloga", bad.status() === 400);
    const good = await page.request.post(BASE + "/api/segments", { data: {
      task_id: freeTask.id, datum_od: "2026-01-05", datum_do: "2026-01-19", status: "otvoreno",
      kasni_razlog: "kasnio teren" } });
    ok("server: 201 kad razlog postoji", good.status() === 201);
  } else { ok("server-validacija: (preskočeno)", true); }

  ok("/api/data bez baseline polja", !("baseline" in d2));
  ok("segment.created_by zabilježen (atribucija)", (d2.segments || []).some(s => s.created_by));
  const stats = await (await page.request.get(BASE + "/api/stats")).json();
  ok("/api/stats by_odjel bez utoku", (stats.by_odjel || []).every(r => !("utoku" in r)));
  ok("/api/baseline uklonjen (404/405)",
    [404, 405].includes((await page.request.post(BASE + "/api/baseline", { data: {} })).status()));
  // /api/projects/totals: Σ po projektu suženo na Datum od/do (project_daily)
  const totAll = await (await page.request.get(BASE + "/api/projects/totals")).json();
  ok("/api/projects/totals: ukupno (bez raspona) sumira sve dane",
    Math.round((totAll.totals || []).reduce((a, r) => a + (+r.hp || 0), 0)) === 590, // 100+150+200+80+60
    `(${(totAll.totals || []).reduce((a, r) => a + (+r.hp || 0), 0)})`);
  const totRange = await (await page.request.get(BASE + "/api/projects/totals?od=2026-06-01&do=2026-07-01")).json();
  ok("/api/projects/totals: raspon Jun sumira samo dane u opsegu",
    Math.round((totRange.totals || []).reduce((a, r) => a + (+r.hp || 0), 0)) === 180, // Wandlitz 10.06=100 + Briesen 20.06=80
    `(${JSON.stringify((totRange.totals || []).map(r => [r.projektname, r.hp]))})`);

  // delete-undo je DOM test -> vrati se na timeline (admin sekcija je ostavila /admin)
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".tl-row.group .delDp", { timeout: 10000 });
  const dCount = async () => (await (await page.request.get(BASE + "/api/data")).json()).dps.length;
  const beforeDel = await dCount();
  await page.locator(".tl-row.group .delDp").first().click();
  await page.waitForSelector(".swal2-confirm", { timeout: 5000 });
  await page.click(".swal2-confirm");
  await page.waitForTimeout(900);
  ok("DP obrisan", (await dCount()) === beforeDel - 1);
  await page.click("#btnUndo");
  await page.waitForTimeout(1800);
  ok("undo vraća obrisani DP", (await dCount()) === beforeDel);

  // ---------- 16c. "N kasni" čip u redu DP-a (umjesto plutajućeg balona) + modal + moved-ghost ----------
  await page.click("#pfClear").catch(() => {});   // bez filtera -> svi termini
  await page.waitForTimeout(500);
  const dLate = await (await page.request.get(BASE + "/api/data")).json();
  const todayStr = new Date().toISOString().slice(0, 10);
  const lateList = dLate.segments.filter(s => s.status !== "završeno" && s.datum_do < todayStr);
  ok("kasni: ima zakašnjelih (preduslov)", lateList.length > 0, `(${lateList.length})`);
  ok("kasni: NEMA plutajućeg balona (uklonjen)", (await page.locator("#lateBubble").count()) === 0);
  // probijena traka crveno pulsira; dupli klik NE označava tiho završeno -> otvara editor (razlog+produženje)
  ok("kasni: traka crveno pulsira (.seg.late)", (await page.locator(".seg.late").count()) >= 1);
  const odEl = page.locator(".seg.late").first();
  const odSegId = +(await odEl.getAttribute("data-seg"));
  // hovercard za prekoračeni rok mora biti CIJELI vidljiv (ne odsječen)
  await odEl.hover();
  await page.waitForSelector(".hovercard:not(.hidden)", { timeout: 3000 }).catch(() => {});
  const hcBox = await page.locator(".hovercard").boundingBox().catch(() => null);
  ok("hovercard (prekoračen rok): cijeli unutar ekrana (ne odsječen)",
    !!hcBox && hcBox.y >= 0 && (hcBox.y + hcBox.height) <= (await page.evaluate(() => innerHeight)) + 1);
  ok("hovercard: svaki red historije = JEDNA linija (ne lomi se)",
    await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".hovercard .hc-hist .hc-h")];
      return rows.length === 0 || rows.every(r => r.getBoundingClientRect().height <= 22);
    }));
  ok("hovercard: tip ('dupli klik') vidljiv na dnu", await page.locator(".hovercard .hc-tip").isVisible().catch(() => false));
  // hovercard prikazuje HP/HA količine DP-a (mjerodavna istaknuta)
  ok("hovercard: HP/HA količine prikazane", (await page.locator(".hovercard .hc-qty .hc-q").count()) === 2);
  const qtyTxt = (await page.locator(".hovercard .hc-qty").innerText().catch(() => "")).replace(/\s+/g, " ");
  ok("hovercard: sadrži HP i HA", /HP/.test(qtyTxt) && /HA/.test(qtyTxt), `(${qtyTxt})`);
  ok("hovercard: mjerodavna količina istaknuta (.rel)", (await page.locator(".hovercard .hc-q.rel").count()) === 1);
  await page.mouse.move(5, 5);   // skloni hover prije dblclick
  await page.waitForTimeout(150);
  await odEl.dblclick();
  await page.waitForTimeout(300);
  ok("kasni: dupli klik otvara editor (ne toggle završeno)", await page.locator("#pop:not(.hidden)").isVisible());
  ok("kasni: dupli klik NE mijenja status u završeno",
    (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.id === odSegId).status === "otvoreno");
  ok("kasni editor (dbl): razlog+datum crveno svijetle",
    (await page.locator("#popKasniWrap.req-late").count()) === 1 && (await page.locator("#popWhenEdit.req-late").count()) === 1);
  ok("kasni editor: opcionalni Komentar sakriven (jedan jasan komentar)",
    (await page.locator("#popKomWrap.hidden").count()) === 1);
  ok("kasni editor: razlog je crveni chat-oblačić",
    (await page.locator("#popKasniWrap.chat.kasni").count()) === 1);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  // ukupni "kasni" čip u filteru svijetli (glow) dok ima zakašnjelih
  ok("kasni: ukupni čip u filteru svijetli (glow)",
    (await page.locator(".slicers .chip.late.glow").count()) === 1);
  // kasni po DP-u -> modal SAMO za taj DP (scoped)
  const lateByDp = {};
  for (const s of lateList) {
    const tk = dLate.tasks.find(t => t.id === s.task_id);
    if (tk) lateByDp[tk.dp_id] = (lateByDp[tk.dp_id] || 0) + 1;
  }
  const lateDpId = Object.keys(lateByDp)[0];
  ok("kasni: 'N kasni' čip u redu DP-a", (await page.locator(`.tl-row.group[data-dp="${lateDpId}"] .gs-late`).count()) >= 1);
  await page.locator(`.tl-row.group[data-dp="${lateDpId}"] .gs-late`).click();
  await page.waitForTimeout(300);
  ok("kasni: klik na čip otvara modal", await page.locator("#lateModal:not(.hidden)").isVisible());
  ok("modal (per-DP): redova = kasni SAMO tog DP-a",
    (await page.locator("#lmList .lm-row").count()) === lateByDp[lateDpId], `(${lateByDp[lateDpId]})`);
  ok("modal (per-DP): zaglavlje pokazuje opseg (DP)",
    ((await page.locator("#lmScope").innerText()) || "").trim().length > 0);
  await page.locator("#lmList .lm-row").first().click();
  await page.waitForTimeout(400);
  ok("modal: red otvara editor termina", await page.locator("#pop:not(.hidden)").isVisible());
  ok("modal: datum-polja otkrivena (produženje)", (await page.locator("#popWhenEdit.hidden").count()) === 0);
  // probijen rok -> razlog (komentar) i datum-kraj crveno svijetle (jaka obaveza)
  ok("kasni editor: razlog crveno svijetli", (await page.locator("#popKasniWrap.req-late").count()) === 1);
  ok("kasni editor: datum-kraj crveno svijetli", (await page.locator("#popWhenEdit.req-late").count()) === 1);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  await page.locator(`.tl-row.group[data-dp="${lateDpId}"] .gs-late`).click();
  await page.waitForTimeout(200);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  ok("modal: Esc zatvara", (await page.locator("#lateModal.hidden").count()) === 1);

  // moved-ghost: pomjeri termin -> originalna pozicija ostaje vidljiva svima
  const moveSeg = lateList[0];
  const mv = await page.request.patch(BASE + "/api/segments/" + moveSeg.id, { data: {
    datum_od: addDaysStr(moveSeg.datum_od, 14), datum_do: addDaysStr(moveSeg.datum_do, 14),
    kasni_razlog: moveSeg.kasni_razlog || "pomjereno za test" } });
  ok("moved-ghost: pomjeranje termina (PATCH ok)", mv.ok());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(500);
  const dMoved = await (await page.request.get(BASE + "/api/data")).json();
  const movedNow = dMoved.segments.find(s => s.id === moveSeg.id);
  ok("moved-ghost: orig_od ostao netaknut nakon pomjeranja",
    movedNow && movedNow.orig_od === moveSeg.orig_od && movedNow.orig_od !== movedNow.datum_od);
  // "duh" traka VIŠE nije u tabeli (declutter) — originalna pozicija se sad vidi u hover-kartici
  ok("declutter: 'duh' traka uklonjena iz tabele", (await page.locator(".movedghost").count()) === 0);
  const movedEl = page.locator(`.seg[data-seg="${moveSeg.id}"]`).first();
  await movedEl.scrollIntoViewIfNeeded().catch(() => {});
  await movedEl.hover();
  await page.waitForSelector(".hovercard:not(.hidden)", { timeout: 3000 }).catch(() => {});
  ok("moved: hover-kartica pokazuje 'Original' (gdje je termin bio)",
    await page.locator(".hovercard:not(.hidden) .hc-row.gray").isVisible().catch(() => false));
  const origTxt = (await page.locator(".hovercard .hc-row.gray").innerText().catch(() => "")) || "";
  ok("moved: originalni datum u formatu dd/mm/yyyy", /\d{2}\/\d{2}\/\d{4}/.test(origTxt), `(${origTxt.replace(/\s+/g, " ")})`);

  // ---------- 16c2. historija termina je SAMO u hover-kartici (dd/mm/yyyy, red po promjeni) ----------
  const hcHist = ((await page.locator(".hovercard .hc-hist .hc-h").allInnerTexts().catch(() => [])) || []).join(" | ");
  ok("hover-kartica: historija u dd/mm/yyyy (red po promjeni)", /\d{2}\/\d{2}\/\d{4}/.test(hcHist), `(${hcHist.slice(0, 90)})`);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(200);
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(200);

  // ---------- 16c3. produžavanje ZAKAŠNJELOG termina traži razlog (inače se NE lijepi) ----------
  {
    const projRz = "[NORD CLUSTER 1] WANDLITZ [IP]";
    const isoT = d => d.toISOString().slice(0, 10);
    const past1 = isoT(new Date(Date.now() - 55 * 864e5)), past2 = isoT(new Date(Date.now() - 30 * 864e5));
    await page.request.post(BASE + "/api/pops", { data: { projekt: projRz, naziv: "POP RESIZE", rfa: "2027-06-01" } });
    await page.request.post(BASE + "/api/dps", { data: { pop: "POP RESIZE", projekt: projRz, naziv: "DP RESIZE", hp: 8, ha: 4 } });
    const dRz = await (await page.request.get(BASE + "/api/data")).json();
    const rzDp = dRz.dps.find(d => d.naziv === "DP RESIZE");
    const rzTask = rzDp && dRz.tasks.find(t => t.dp_id === rzDp.id && /asfalt/i.test(t.aktivnost));
    ok("resize-razlog: DP + aktivnost (preduslov)", !!rzTask);
    if (rzTask) {
      const cr = await page.request.post(BASE + "/api/segments", { data: {
        task_id: rzTask.id, datum_od: past1, datum_do: past2, status: "otvoreno", kasni_razlog: "init" } });
      const rzSeg = (await cr.json()).id;
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForSelector(`#tlScroll .seg[data-seg="${rzSeg}"]`, { timeout: 10000 });
      await page.click("#pfClear").catch(() => {});
      // simuliraj "kasni bez razloga" (kao termin koji je prešao rok) + povuci desni rub udesno
      const dragExtend = id => page.evaluate(segId => {
        const s = DATA.segments.find(x => x.id === segId); s.kasni_razlog = ""; renderTimeline(true);
        const seg = document.querySelector(`#tlScroll .seg[data-seg="${segId}"]`); seg.scrollIntoView({ block: "center" });
        const rs = seg.querySelector(".rs.r"); const rb = rs.getBoundingClientRect();
        rs.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, clientX: rb.x + 2, clientY: rb.y + 2 }));
        document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: rb.x + 160, clientY: rb.y + 2 }));
        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientX: rb.x + 160, clientY: rb.y + 2 }));
      }, id);
      await dragExtend(rzSeg);
      await page.waitForTimeout(400);
      ok("produženje kasnog termina: traži razlog (oblačić)", await page.locator("#drawAsk #daReason:not(.hidden)").isVisible());
      await page.click("#daReasonCancel");
      await page.waitForTimeout(450);
      const afterCancel = (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.id === rzSeg);
      ok("bez razloga -> promjena se NE lijepi (datum nepromijenjen, ostaje kasni)", afterCancel.datum_do === past2, `(${afterCancel.datum_do})`);
      await dragExtend(rzSeg);
      await page.waitForTimeout(400);
      await page.fill("#daReasonInput", "kasni zbog dozvole");
      await page.click("#daReasonSave");
      await page.waitForTimeout(650);
      const afterSave = (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.id === rzSeg);
      ok("s razlogom -> promjena se lijepi (datum produžen + razlog snimljen)",
        afterSave.datum_do !== past2 && afterSave.kasni_razlog === "kasni zbog dozvole",
        `(${afterSave.datum_do} / ${afterSave.kasni_razlog})`);
    }
    await page.keyboard.press("Escape").catch(() => {});
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(200);
  }

  // ---------- 16d. POP bez DP -> "čeka DP" red + "+ DP" konverzija ----------
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(300);
  await page.request.post(BASE + "/api/pops", { data: {
    projekt: "[NORD CLUSTER 1] BRIESEN [IP]", naziv: "POP CEKA-DP", hp: 50, ha: 10, rfa: "2026-08-01" } });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(400);
  const waitRow = page.locator(".tl-row.popwait", { hasText: "POP CEKA-DP" });
  ok("čeka DP: POP bez DP-a prikazan kao red (bez filtera)", (await waitRow.count()) === 1);
  ok("čeka DP: 'čeka DP' značka vidljiva", (await waitRow.innerText()).toLowerCase().includes("čeka dp"));
  ok("čeka DP: '+ DP' dugme prisutno", (await waitRow.locator(".addDpHere").count()) === 1);
  await waitRow.locator(".addDpHere").click();
  await page.waitForTimeout(300);
  ok("čeka DP: '+ DP' otvara DP dijalog", (await page.locator("#dlgDp[open]").count()) === 1);
  ok("čeka DP: POP preselektovan u dijalogu", (await page.locator("#dpUnder").innerText()).includes("POP CEKA-DP"));
  await page.fill("#frmDp [name=naziv]", "DP CEKA-1");
  await page.fill("#frmDp [name=hp]", "8");
  await page.fill("#frmDp [name=ha]", "4");
  await page.click('#frmDp button[value="ok"]');
  await page.waitForTimeout(900);
  ok("čeka DP: nakon kreiranja DP-a nestaje 'čeka' red",
    (await page.locator(".tl-row.popwait", { hasText: "POP CEKA-DP" }).count()) === 0);
  ok("čeka DP: novi DP ima aktivnosti u tabeli",
    (await page.locator(".tl-row.group:not(.popwait)", { hasText: "DP CEKA-1" }).count()) >= 1);

  // ---------- 16e. UI bez emojija (čist, profesionalan izgled) ----------
  const emojiBody = await page.evaluate(() => {
    const re = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}]/u;
    return [...new Set([...document.body.innerText].filter(c => re.test(c)))];
  });
  // ✕ (zatvori/očisti) i ▾ (caret) su standardni monohromni UI simboli, ne emoji
  const stray = emojiBody.filter(c => !["✕", "▾", "−", "→"].includes(c));
  ok("UI bez emojija (osim ✕/▾ kontrola)", stray.length === 0, JSON.stringify(stray));

  // ---------- 16f. impersonacija ("gledaj kao") — admin alat za testiranje ----------
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#userBadge", { timeout: 10000 });
  ok("impersonacija: 'Gledaj kao' dugme prisutno adminu",
    (await page.locator("#btnImpersonate").count()) === 1);
  ok("admin: admin dugme prisutno", (await page.locator("#btnAdmin").count()) === 1);
  await page.request.post(BASE + "/api/admin/users", { data: {
    email: "thomas.busch@mih-fiber.com", role: "user" } });
  const impStart = await page.request.post(BASE + "/api/admin/impersonate", { data: {
    email: "thomas.busch@mih-fiber.com" } });
  ok("impersonacija: start 200", impStart.ok());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#impBanner:not(.hidden)", { timeout: 8000 });
  const aImp = await page.evaluate(() => window.AUTH);
  ok("impersonacija: efektivni identitet = ciljani korisnik",
    aImp.email === "thomas.busch@mih-fiber.com" && aImp.impersonating === true && aImp.is_admin === false);
  ok("impersonacija: admin dugme NIJE u DOM-u (efektivno non-admin)",
    (await page.locator("#btnAdmin").count()) === 0);
  ok("impersonacija: 'Gledaj kao' NIJE u DOM-u dok je aktivna",
    (await page.locator("#btnImpersonate").count()) === 0);
  ok("impersonacija: admin API 403 u tom kontekstu",
    (await page.request.get(BASE + "/api/admin/users")).status() === 403);
  await page.click("#impStop");
  await page.waitForFunction(() => window.AUTH && window.AUTH.impersonating === false, { timeout: 8000 });
  const aBack = await page.evaluate(() => window.AUTH);
  ok("impersonacija: traka skrivena nakon povratka",
    (await page.locator("#impBanner.hidden").count()) === 1);
  ok("impersonacija: 'Vrati se' vraća na admina",
    aBack.email === "e.uzunovic@gfcbh.ba" && aBack.impersonating === false && aBack.is_admin === true);

  // ---------- 16g. inline traka grupnog reda: zadnji komentar · Preuzmi · vlasnik ----------
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".tl-row.group", { timeout: 10000 });
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(400);
  const dStrip = await (await page.request.get(BASE + "/api/data")).json();
  const freeDp = dStrip.dps.find(d => !dStrip.claims[d.projekt]) || dStrip.dps[0];
  await page.request.post(BASE + "/api/comments", { data: {
    dp_id: freeDp.id, tekst: "Test komentar za traku" } });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".tl-row.group", { timeout: 10000 });
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(400);
  const cRow = page.locator(`.tl-row.group[data-dp="${freeDp.id}"]`);
  ok("traka: zadnji komentar prikazan kao čip", (await cRow.locator(".gs-comment").count()) === 1);
  ok("traka: hover (title) nosi puni komentar",
    ((await cRow.locator(".gs-comment").getAttribute("title")) || "").includes("Test komentar za traku"));
  const claimBtn = cRow.locator(".gs-claim");
  ok("traka: 'Preuzmi' dugme za neclaimovan projekat", (await claimBtn.count()) === 1);
  await claimBtn.click();
  await page.waitForSelector(".swal2-confirm", { timeout: 5000 });
  await page.click(".swal2-confirm");
  await page.waitForTimeout(900);
  ok("traka: nakon preuzimanja prikazan vlasnik (.gs-owner)",
    (await page.locator(`.tl-row.group[data-dp="${freeDp.id}"] .gs-owner`).count()) === 1);
  // otpuštanje direktno iz reda: "Otpusti" -> potvrda -> opet "Preuzmi"
  const relBtn = page.locator(`.tl-row.group[data-dp="${freeDp.id}"] .gs-release`);
  ok("traka: 'Otpusti' dugme za vlastiti projekat", (await relBtn.count()) === 1);
  await relBtn.click();
  await page.waitForSelector(".swal2-confirm", { timeout: 5000 });
  await page.click(".swal2-confirm");
  await page.waitForTimeout(900);
  ok("traka: nakon otpuštanja projekat opet slobodan ('Preuzmi')",
    (await page.locator(`.tl-row.group[data-dp="${freeDp.id}"] .gs-claim`).count()) === 1);

  // ---------- 16h. zaglavlje ose: legenda MJESEC/KW/DAN, "KW" ne na svakoj, čiste linije ----------
  const legend = (await page.locator(".head .band-legend span").allInnerTexts()).map(s => s.trim().toLowerCase());
  ok("zaglavlje: legenda ima KW", legend.includes("kw"));
  ok("zaglavlje: legenda ima MJESEC", legend.includes("mjesec"));
  ok("zaglavlje: nema 'bar' linija preko redova (month-line uklonjen)",
    (await page.locator(".month-line").count()) === 0);
  const kwTexts = (await page.locator(".tl-head-band.kw .hb").allInnerTexts()).map(s => s.trim()).filter(Boolean);
  ok("zaglavlje: KW prefiks NIJE na svakoj ćeliji",
    kwTexts.length > 3 && kwTexts.filter(s => /KW/.test(s)).length < kwTexts.length);
  ok("zaglavlje: dnevna traka bez naziva dana (samo broj)",
    (await page.locator(".tl-head-band.days .hb").allInnerTexts()).every(s => !/[A-Za-zČčŠšĐđŽž]/.test(s)));

  // ---------- jezik: aktivnosti + odjeli su PODACI -> prevode se za prikaz ----------
  await page.locator('#langToggle button[data-lang="de"]').click();
  await page.waitForTimeout(400);
  const actDe = (await page.locator("#tlScroll .act-name").allInnerTexts()).map(s => s.trim());
  ok("DE: aktivnost prevedena (Genehmigungen)", actDe.includes("Genehmigungen"), `(${actDe.slice(0,3)})`);
  ok("DE: aktivnost prevedena (Horizontalbohrung)", actDe.includes("Horizontalbohrung"));
  // slicer filtrira po AKTIVNOSTI -> čipovi su prevedene aktivnosti (ne odjeli)
  const aktDe = (await page.locator("#slicers .chip.akt").allInnerTexts()).map(s => s.trim());
  ok("DE: slicer aktivnost prevedena (Hausbegehungen)", aktDe.includes("Hausbegehungen"), `(${aktDe})`);
  ok("DE: slicer nema odjel-samo naziv (Planung) — sad je aktivnost, ne Abteilung",
    !aktDe.includes("Planung"), `(${aktDe})`);
  // odjel-balončići u redovima su UKLONJENI (duplirali su Abteilung filter — ništa ne znače)
  ok("redovi: nema odjel-balončića (.odj-tag uklonjen)",
    (await page.locator("#tlScroll .odj-tag").count()) === 0);
  // eskalacije tabela: aktivnost se prevodi (ne sirovi BS naziv "Montaža"/"Priključak na POP")
  const eskActsDe = (await page.locator("#eskPanel table.mini tr td:nth-child(2)").allInnerTexts()).map(s => s.trim());
  ok("DE: eskalacije — aktivnost prevedena (nije sirovi BS naziv)",
    !eskActsDe.some(a => a === "Montaža" || a === "Priključak na POP" || a === "Pregled objekata"),
    `(${eskActsDe.join("|")})`);
  await page.locator('#langToggle button[data-lang="bs"]').click();
  await page.waitForTimeout(400);
  ok("BS vraćeno (Dozvole)", (await page.locator("#tlScroll .act-name").allInnerTexts()).map(s => s.trim()).includes("Dozvole"));

  // ---------- 16i. plan raspodjela po terminima (auto + ručni override) + KPI prozor ----------
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(400);
  const dPlan = await (await page.request.get(BASE + "/api/data")).json();
  // DP s bar jednim terminom -> ima fazne redove za raspodjelu
  const planDp = dPlan.dps.find(d => dPlan.segments.some(s => {
    const tk = dPlan.tasks.find(t => t.id === s.task_id); return tk && tk.dp_id === d.id;
  }));
  ok("plan: postoji DP s terminima (preduslov)", !!planDp);
  if (planDp) {
    await page.request.patch(BASE + "/api/dps/" + planDp.id, { data: { hp: 30, ha: 20 } });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(400);
    const cell = page.locator(`#tlScroll .cell[data-fdp="${planDp.id}"]`).first();
    await cell.scrollIntoViewIfNeeded().catch(() => {});
    await cell.click();
    await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(450);
    ok("plan: 'Raspodjela plana' sekcija vidljiva", await page.locator("#drPlan").isVisible());
    ok("plan: termini izlistani s poljima", (await page.locator("#drPlan .dpp-row").count()) >= 1);
    const firstIn = page.locator("#drPlan .dpp-in").first();
    const segId = +(await firstIn.getAttribute("data-seg"));
    const ph = await firstIn.getAttribute("placeholder");
    ok("plan: auto vrijednost u placeholderu", ph !== null && ph !== "", `(${ph})`);
    const inp = () => page.locator(`#drPlan .dpp-in[data-seg="${segId}"]`);
    await inp().fill("7"); await inp().evaluate(e => e.blur());
    await page.waitForTimeout(700);
    const segMan = (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.id === segId);
    ok("plan: ručni override snimljen (plan_qty=7)", segMan && Math.round(+segMan.plan_qty) === 7, `(${segMan && segMan.plan_qty})`);
    ok("plan: red označen kao ručni (.man)",
      (await page.locator(`#drPlan .dpp-row.man .dpp-in[data-seg="${segId}"]`).count()) === 1);
    await inp().fill(""); await inp().evaluate(e => e.blur());
    await page.waitForTimeout(700);
    const segAuto = (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.id === segId);
    ok("plan: prazno vraća na auto (plan_qty NULL)", segAuto && (segAuto.plan_qty === null || segAuto.plan_qty === undefined), `(${segAuto && segAuto.plan_qty})`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }
  // KPI HP/HA: bez raspona = puni total; s Datum rasponom = raspoređena procjena (.est, "~")
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(300);
  ok("plan: HP/HA kartice NISU procjena bez Datum filtera", (await page.locator("#kpis .kpi.purple.est").count()) === 0);
  await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.setDate("2026-01-01", true));
  await page.evaluate(() => document.querySelector("#fDateDo")._flatpickr.setDate("2026-12-31", true));
  await page.waitForTimeout(700);
  ok("plan: HP/HA označene kao procjena (.est) uz Datum raspon", (await page.locator("#kpis .kpi.purple.est").count()) >= 1);
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(300);

  // ---------- 16j. Projektleiter (PM) filter — po vlasniku (claim) projekta ----------
  const dPm = await (await page.request.get(BASE + "/api/data")).json();
  const pmDp = dPm.dps[0];
  ok("PM: postoji DP (preduslov)", !!pmDp);
  if (pmDp) {
    await page.request.post(BASE + "/api/claims", { data: { projekt: pmDp.projekt } });
    const owner = (await (await page.request.get(BASE + "/api/data")).json()).claims[pmDp.projekt];
    const ownerName = owner ? (owner.name || owner.email) : "";
    ok("PM: claim postavljen (preduslov)", !!ownerName, `(${ownerName})`);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(300);
    ok("PM: Projektleiter combo postoji", (await page.locator("#pfPm").count()) === 1);
    await page.click("#pfPm");
    await page.waitForSelector(".combo:has(#pfPm) .combo-list:not([hidden]) .combo-opt", { timeout: 5000 });
    ok("PM: combo nudi vlasnike (claim owner)", (await page.locator(".combo:has(#pfPm) .combo-list .combo-opt").count()) >= 1);
    await page.fill("#pfPm", ownerName);
    await page.waitForTimeout(250);
    await page.locator(".combo:has(#pfPm) .combo-list .combo-opt").first().click();
    await page.waitForTimeout(400);
    ok("PM: izbor -> AKTIVNI čip (data-xpm)", await chipX("data-xpm").isVisible());
    // tabela suzena: svi prikazani DP-ovi pripadaju projektu tog vlasnika
    const fresh = await (await page.request.get(BASE + "/api/data")).json();
    const byId = new Map(fresh.dps.map(d => [d.id, d]));
    const shownIds = await page.locator(".tl-row.group[data-dp]").evaluateAll(els => els.map(e => +e.dataset.dp));
    ok("PM: prikazani su samo DP-ovi projekta tog vlasnika",
      shownIds.length >= 1 && shownIds.every(id => byId.get(id) && byId.get(id).projekt === pmDp.projekt), `(${shownIds.length})`);
    await chipX("data-xpm").click();
    await page.waitForTimeout(400);
    ok("PM: uklanjanje čipa skida filter", !(await chipX("data-xpm").isVisible().catch(() => false)));
    await page.request.delete(BASE + "/api/claims?projekt=" + encodeURIComponent(pmDp.projekt));
  }
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(300);

  // ---------- 16k. HP/HA brojčani raspon (od–do) filter ----------
  const dHp = await (await page.request.get(BASE + "/api/data")).json();
  const maxHp = Math.max(0, ...dHp.dps.map(d => d.hp || 0));
  ok("HP filter: ima DP-ova (preduslov)", dHp.dps.length >= 1);
  ok("HP/HA raspon: Min/Max polja postoje",
    (await page.locator("#fHpMin").count()) === 1 && (await page.locator("#fHpMax").count()) === 1 &&
    (await page.locator("#fHaMin").count()) === 1 && (await page.locator("#fHaMax").count()) === 1);
  if (maxHp > 0) {
    await page.fill("#fHpMin", String(maxHp));
    await page.waitForTimeout(400);
    ok("HP raspon -> AKTIVNI čip (data-xhp)", await chipX("data-xhp").isVisible());
    const fresh = await (await page.request.get(BASE + "/api/data")).json();
    const byId = new Map(fresh.dps.map(d => [d.id, d]));
    const shownIds = await page.locator(".tl-row.group[data-dp]").evaluateAll(els => els.map(e => +e.dataset.dp));
    ok("HP raspon: prikazani DP-ovi imaju hp >= Min",
      shownIds.length >= 1 && shownIds.every(id => (byId.get(id) ? byId.get(id).hp || 0 : 0) >= maxHp), `(${shownIds.length}, min=${maxHp})`);
    // nemoguć raspon (Min > svih) -> nijedan DP
    await page.fill("#fHpMin", String(maxHp + 1000));
    await page.waitForTimeout(400);
    ok("HP raspon: previsok Min -> nijedan DP", (await page.locator(".tl-row.group[data-dp]").count()) === 0);
    await chipX("data-xhp").click();
    await page.waitForTimeout(400);
    ok("HP raspon: uklanjanje čipa skida filter", !(await chipX("data-xhp").isVisible().catch(() => false)));
    ok("HP raspon: Min polje ispražnjeno", (await page.locator("#fHpMin").inputValue()) === "");
  } else { ok("HP raspon: (preskočeno — nema hp>0)", true); }
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(300);

  // ---------- 16l. RFA upozorenje: aktivacija planirana PRIJE RFA datuma POP-a ----------
  const rfaProjekt = "[NORD CLUSTER 1] WANDLITZ [IP]";
  await page.request.post(BASE + "/api/pops", { data: { projekt: rfaProjekt, naziv: "POP RFA-TEST", rfa: "2027-01-01" } });
  const rfaPop = (await (await page.request.get(BASE + "/api/data")).json()).pops.find(p => p.naziv === "POP RFA-TEST");
  ok("RFA: POP s RFA datumom kreiran", !!rfaPop && rfaPop.rfa === "2027-01-01", `(${rfaPop && rfaPop.rfa})`);
  await page.request.post(BASE + "/api/dps", { data: { pop: "POP RFA-TEST", projekt: rfaProjekt, naziv: "DP RFA-1", hp: 5, ha: 5 } });
  const dataR = await (await page.request.get(BASE + "/api/data")).json();
  const rfaDp = dataR.dps.find(d => d.naziv === "DP RFA-1");
  const aktTask = rfaDp && dataR.tasks.find(t => t.dp_id === rfaDp.id && /aktivacij/i.test(t.aktivnost));
  ok("RFA: DP + Aktivacije aktivnost postoje", !!rfaDp && !!aktTask);
  if (rfaDp && aktTask) {
    // aktivacija 2026-09-01 (budućnost) je PRIJE RFA 2027-01-01 -> mora upaliti upozorenje
    await page.request.post(BASE + "/api/segments", { data: {
      task_id: aktTask.id, datum_od: "2026-09-01", datum_do: "2026-09-14", status: "otvoreno" } });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(400);
    ok("RFA upozorenje: badge na redu DP-a (.rfa-bad)",
      (await page.locator(`.tl-row.group[data-dp="${rfaDp.id}"] .rfa-bad`).count()) === 1);
    await page.locator(`#tlScroll .cell[data-fdp="${rfaDp.id}"]`).first().click();
    await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(450);
    ok("RFA upozorenje: warning box vidljiv u panelu (#drWarn)", await page.locator("#drWarn:not(.hidden)").isVisible());
    ok("RFA upozorenje: poruka spominje DP", ((await page.locator("#drWarn .drw-row").innerText().catch(() => "")) || "").includes("DP RFA-1"));
    // kontrola: pomjeri aktivaciju POSLIJE RFA -> upozorenje nestaje
    const aktSeg = (await (await page.request.get(BASE + "/api/data")).json()).segments.find(s => s.task_id === aktTask.id);
    await page.request.patch(BASE + "/api/segments/" + aktSeg.id, { data: { datum_od: "2027-02-01", datum_do: "2027-02-14" } });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(400);
    ok("RFA upozorenje: nema badge-a kad je aktivacija POSLIJE RFA",
      (await page.locator(`.tl-row.group[data-dp="${rfaDp.id}"] .rfa-bad`).count()) === 0);
  }
  await page.keyboard.press("Escape");
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(300);

  // ---------- 16m. otvoreni bočni panel se PREVODI kad se prebaci jezik ----------
  const dLang = (await (await page.request.get(BASE + "/api/data")).json()).dps[0];
  if (dLang) {
    await page.locator(`#tlScroll .cell[data-fdp="${dLang.id}"]`).first().click();
    await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(400);
    await page.locator('#langToggle button[data-lang="de"]').click();
    await page.waitForTimeout(500);
    ok("jezik: otvoreni panel se prevodi na DE (dinamički t() sadržaj)",
      /Fortschritt/i.test(await page.locator("#drStats").innerText()));
    await page.locator('#langToggle button[data-lang="bs"]').click();
    await page.waitForTimeout(500);
    ok("jezik: panel se vraća na BS", /napredak/i.test(await page.locator("#drStats").innerText()));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  }
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(200);

  // ---------- 16n. više traka po aktivnosti (prekid pa nastavak) ----------
  const projMB = "[NORD CLUSTER 1] WANDLITZ [IP]";
  await page.request.post(BASE + "/api/pops", { data: { projekt: projMB, naziv: "POP MB-TEST", rfa: "2027-06-01" } });
  await page.request.post(BASE + "/api/dps", { data: { pop: "POP MB-TEST", projekt: projMB, naziv: "DP MB-1", hp: 5, ha: 5 } });
  const dMB = await (await page.request.get(BASE + "/api/data")).json();
  const mbDp = dMB.dps.find(x => x.naziv === "DP MB-1");
  const mbTask = mbDp && dMB.tasks.find(t => t.dp_id === mbDp.id && /iskop/i.test(t.aktivnost));
  ok("multi-traka: DP + aktivnost (preduslov)", !!mbTask);
  if (mbTask) {
    const b1 = await page.request.post(BASE + "/api/segments", { data: {
      task_id: mbTask.id, datum_od: "2026-09-01", datum_do: "2026-09-10", status: "završeno" } });
    const b2 = await page.request.post(BASE + "/api/segments", { data: {
      task_id: mbTask.id, datum_od: "2026-10-01", datum_do: "2026-10-10", status: "otvoreno" } });
    ok("multi-traka: druga traka dozvoljena (201, nema 409)", b1.status() === 201 && b2.status() === 201);
    const segsMB = (await (await page.request.get(BASE + "/api/data")).json()).segments.filter(s => s.task_id === mbTask.id);
    ok("multi-traka: aktivnost ima 2 trake", segsMB.length === 2, `(${segsMB.length})`);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(400);
    ok("multi-traka: obje trake vidljive na redu aktivnosti",
      (await page.locator(`.tl-row[data-task="${mbTask.id}"] .seg`).count()) === 2);
    // gotova tek kad je i zadnja traka završena (sad 1 od 2)
    ok("multi-traka: nije sve završeno dok zadnja traka nije gotova (1/2)",
      segsMB.filter(s => s.status === "završeno").length === 1);
  }

  // ---------- 16o. zabrana duplog imena DP-a u istom POP-u ----------
  const projDup = "[NORD CLUSTER 1] WANDLITZ [IP]";
  await page.request.post(BASE + "/api/pops", { data: { projekt: projDup, naziv: "POP DUP-TEST", rfa: "2027-06-01" } });
  const dupA = await page.request.post(BASE + "/api/dps", { data: { pop: "POP DUP-TEST", projekt: projDup, naziv: "DP UNIK", hp: 1, ha: 1 } });
  ok("dup DP: prvi DP kreiran (201)", dupA.status() === 201);
  const dupB = await page.request.post(BASE + "/api/dps", { data: { pop: "POP DUP-TEST", projekt: projDup, naziv: "DP UNIK", hp: 1, ha: 1 } });
  ok("dup DP: isti naziv u istom POP-u odbijen (409)", dupB.status() === 409);
  const dupC = await page.request.post(BASE + "/api/dps", { data: { pop: "POP DUP-TEST", projekt: projDup, naziv: " dp unik ", hp: 1, ha: 1 } });
  ok("dup DP: trim + case-insensitive duplikat odbijen (409)", dupC.status() === 409, `(${dupC.status()})`);
  const dupD = await page.request.post(BASE + "/api/dps", { data: { pop: "POP DUP-TEST", projekt: projDup, naziv: "DP UNIK 2", hp: 1, ha: 1 } });
  ok("dup DP: drugačiji naziv prolazi (201)", dupD.status() === 201);
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(200);

  // ---------- 16p. klik/zakazivanje NE sužava tabelu na taj DP; zatvaranje ne skače ----------
  {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(300);
    const allD = await (await page.request.get(BASE + "/api/data")).json();
    const byProj = {};
    for (const d of allD.dps) (byProj[d.projekt] ||= []).push(d);
    const proj = Object.keys(byProj).find(p => byProj[p].length >= 2);
    ok("no-collapse: projekat s ≥2 DP postoji (preduslov)", !!proj, `(${proj})`);
    if (proj) {
      // klik na DP -> panel se otvori, ali tabela OSTAJE (sve grupe projekta vidljive, ne samo taj DP)
      await page.locator(`#tlScroll .cell[data-fdp="${byProj[proj][0].id}"]`).first().click();
      await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(300);
      const groupsOpen = await page.locator("#tlScroll .tl-row.group").count();
      ok("klik na DP NE sužava tabelu (sve grupe projekta ostaju, ne samo taj DP)", groupsOpen >= 2, `(grupa=${groupsOpen})`);
      ok("klik na DP: tačno jedan red istaknut (.group.sel)", (await page.locator("#tlScroll .tl-row.group.sel").count()) === 1);
      ok("klik na DP: bez DP filter čipa (data-xdp)", !(await chipX("data-xdp").isVisible().catch(() => false)));
      // otvori DRUGI DP, zabilježi redove+skrol, zatvori -> ništa se ne mijenja (nema skoka na prvi DP)
      await page.evaluate(() => { document.querySelector("#tlScroll").scrollTop = 90; });
      await page.locator(`#tlScroll .cell[data-fdp="${byProj[proj][1].id}"]`).first().click();
      await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(200);
      const scrollOpen = await page.evaluate(() => document.querySelector("#tlScroll").scrollTop);
      const groupsBeforeClose = await page.locator("#tlScroll .tl-row.group").count();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      const scrollClosed = await page.evaluate(() => document.querySelector("#tlScroll").scrollTop);
      const groupsAfterClose = await page.locator("#tlScroll .tl-row.group").count();
      ok("zatvaranje panela: tabela i skrol ostaju (bez skoka na prvi DP)",
        groupsAfterClose === groupsBeforeClose && Math.abs(scrollClosed - scrollOpen) <= 4,
        `(grupa ${groupsBeforeClose}->${groupsAfterClose} skrol ${scrollOpen}->${scrollClosed})`);
    }
    await page.keyboard.press("Escape").catch(() => {});
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(200);
  }

  // ---------- 16q. HP/HA se nikad ne snimaju kao 0 ----------
  const projHH = "[NORD CLUSTER 1] WANDLITZ [IP]";
  await page.request.post(BASE + "/api/pops", { data: { projekt: projHH, naziv: "POP HH-TEST", rfa: "2027-06-01" } });
  const z1 = await page.request.post(BASE + "/api/dps", { data: { pop: "POP HH-TEST", projekt: projHH, naziv: "DP HH-A", hp: 0, ha: 5 } });
  ok("HP/HA: DP s HP=0 odbijen (400)", z1.status() === 400, `(${z1.status()})`);
  const z2 = await page.request.post(BASE + "/api/dps", { data: { pop: "POP HH-TEST", projekt: projHH, naziv: "DP HH-B", hp: 5, ha: 0 } });
  ok("HP/HA: DP s HA=0 odbijen (400)", z2.status() === 400, `(${z2.status()})`);
  const z3 = await page.request.post(BASE + "/api/dps", { data: { pop: "POP HH-TEST", projekt: projHH, naziv: "DP HH-OK", hp: 5, ha: 3 } });
  ok("HP/HA: DP s HP>0 i HA>0 prolazi (201)", z3.status() === 201);
  const z3d = (await (await page.request.get(BASE + "/api/data")).json()).dps.find(d => d.naziv === "DP HH-OK");
  const z4 = await page.request.patch(BASE + "/api/dps/" + z3d.id, { data: { hp: 0 } });
  ok("HP/HA: PATCH HP=0 odbijen (400)", z4.status() === 400, `(${z4.status()})`);
  const z5 = await page.request.patch(BASE + "/api/dps/" + z3d.id, { data: { ha: 7 } });
  ok("HP/HA: PATCH HA>0 prolazi (200)", z5.ok());

  // plan-vs: izvedeno (Azure) > plan (Σ DP) -> stvarni % NIJE kapiran na 100 (amber .pv-over)
  await page.click("#pfProj");
  await page.waitForSelector(".combo:has(#pfProj) .combo-list:not([hidden]) .combo-opt", { timeout: 5000 });
  await page.fill("#pfProj", "WANDLITZ");
  await page.waitForTimeout(250);
  await page.locator(".combo:has(#pfProj) .combo-list .combo-opt").first().click();
  await page.waitForTimeout(500);
  ok("plan-vs: % nije kapiran na 100 (izvedeno > plan -> >100%, .pv-over)",
    (await page.locator("#projKpis .pv-num b.pv-over").count()) >= 1);
  const pvTxt = await page.locator("#projKpis .pv-num").first().innerText();
  ok("plan-vs: oznake Izvedeno/Ist + Plan (manje zabune)", /(Izvedeno|Ist|Actual)/.test(pvTxt) && /Plan/.test(pvTxt), `(${pvTxt})`);
  ok("plan-vs: pojašnjavajući tooltip (title)", !!(await page.locator("#projKpis .pv-wrap").first().getAttribute("title")));
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(200);

  // ---------- 16r. "Novi DP" dijalog stane u ekran — 'Sačuvaj' UVIJEK vidljiv (sticky footer) ----------
  await page.setViewportSize({ width: 1280, height: 600 });   // nizak ekran: prije je footer ispadao van vidnog polja
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#btnAddDp", { timeout: 10000 });
  await page.click("#btnAddDp");
  await page.waitForSelector("#dlgDp[open]", { timeout: 5000 });
  await page.evaluate(() => document.querySelector("#dpRfaRow")?.classList.remove("hidden"));   // najviši slučaj: novi POP -> RFA red
  await page.waitForTimeout(200);
  const dfit = await page.evaluate(() => {
    const dlg = document.querySelector("#dlgDp");
    const ok = dlg.querySelector("menu button[value=ok]");
    const body = dlg.querySelector(".dlg-body");
    const head = dlg.querySelector(".dlg-h");
    const ob = ok.getBoundingClientRect();
    const hit = document.elementFromPoint(ob.left + ob.width / 2, ob.top + ob.height / 2);
    return {
      vh: window.innerHeight,
      dlgH: Math.round(dlg.getBoundingClientRect().height),
      headTop: Math.round(head.getBoundingClientRect().top),
      okBottom: Math.round(ob.bottom),
      okClickable: hit === ok || ok.contains(hit) || !!(hit && hit.closest("menu")),
      bodyScrolls: body.scrollHeight > body.clientHeight + 1,
    };
  });
  ok("Novi DP: dijalog stane u ekran (≤ 92vh)", dfit.dlgH <= dfit.vh * 0.92 + 2, `(h=${dfit.dlgH} vh=${dfit.vh})`);
  ok("Novi DP: zaglavlje nije odsječeno gore", dfit.headTop >= -1, `(top=${dfit.headTop})`);
  ok("Novi DP: 'Sačuvaj' vidljiv u ekranu (sticky footer)", dfit.okBottom <= dfit.vh + 1, `(ok=${dfit.okBottom} vh=${dfit.vh})`);
  ok("Novi DP: 'Sačuvaj' klikabilan (nije prekriven)", dfit.okClickable === true);
  ok("Novi DP: tijelo skrola kad je sadržaj visok", dfit.bodyScrolls === true);
  await page.click("#dlgDp .dlg-x").catch(() => {});
  await page.setViewportSize({ width: 1600, height: 950 });   // vrati standardni viewport
  await page.waitForTimeout(150);

  // ---------- 16s. napredak po AKTIVNOSTI (ne po traci) + Datum placeholder prijevod ----------
  const projPg = "[NORD CLUSTER 1] WANDLITZ [IP]";
  await page.request.post(BASE + "/api/pops", { data: { projekt: projPg, naziv: "POP PG-TEST", rfa: "2027-06-01" } });
  await page.request.post(BASE + "/api/dps", { data: { pop: "POP PG-TEST", projekt: projPg, naziv: "DP PG-1", hp: 5, ha: 3 } });
  const dPg = await (await page.request.get(BASE + "/api/data")).json();
  const pgDp = dPg.dps.find(x => x.naziv === "DP PG-1");
  const pgTasks = dPg.tasks.filter(t => t.dp_id === pgDp.id);
  ok("napredak: novi DP ima 8 aktivnosti (preduslov)", pgTasks.length === 8, `(${pgTasks.length})`);
  const dz = pgTasks.find(t => t.aktivnost === "Dozvole");
  await page.request.post(BASE + "/api/segments", { data: { task_id: dz.id, datum_od: "2026-09-01", datum_do: "2026-09-05", status: "završeno" } });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(400);
  const pgPct = ((await page.locator(`.tl-row.group[data-dp="${pgDp.id}"] .pct`).innerText().catch(() => "")) || "").trim();
  ok("napredak: 1 od 8 aktivnosti gotovo -> 13% (NIJE 100%)", pgPct === "13%", `(${pgPct})`);
  await page.locator(`#tlScroll .cell[data-fdp="${pgDp.id}"]`).first().click();
  await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(400);
  ok("napredak: panel pokazuje 1 / 8 gotovo", /1 \/ 8/.test(await page.locator("#drStats").innerText()));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  await page.locator('#langToggle button[data-lang="de"]').click();
  await page.waitForTimeout(300);
  const phDe = await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.altInput.placeholder);
  ok("jezik: Datum placeholder preveden na DE (Von)", phDe === "Von", `(${phDe})`);
  await page.locator('#langToggle button[data-lang="bs"]').click();
  await page.waitForTimeout(300);
  const phBs = await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.altInput.placeholder);
  ok("jezik: Datum placeholder vraćen na BS (Od)", phBs === "Od", `(${phBs})`);
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(200);

  // ---------- 16t. Prognoza panel: planirano (Hausbeg./HP/Akt) u rasponu, po provajderu/projektu/ukupno ----------
  const fcProj = "[NORD CLUSTER 1] WANDLITZ [IP]";
  await page.request.post(BASE + "/api/pops", { data: { projekt: fcProj, naziv: "POP FC-T", rfa: "2027-06-01" } });
  await page.request.post(BASE + "/api/dps", { data: { pop: "POP FC-T", projekt: fcProj, naziv: "DP FC-T1", hp: 10, ha: 5 } });
  const fcD = await (await page.request.get(BASE + "/api/data")).json();
  const fcDp = fcD.dps.find(x => x.naziv === "DP FC-T1");
  const fcTk = a => fcD.tasks.find(t => t.dp_id === fcDp.id && a.test(t.aktivnost));
  const fcMk = (task, od, dod) => page.request.post(BASE + "/api/segments", { data: { task_id: task.id, datum_od: od, datum_do: dod, status: "otvoreno" } });
  await fcMk(fcTk(/aktivacij/i), "2026-06-15", "2026-06-25");
  await fcMk(fcTk(/pregled/i), "2026-06-20", "2026-06-25");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#forecastBody .fc-tbl", { timeout: 10000 });
  ok("prognoza: panel + tablica + UKUPNO + group-by + summary",
    (await page.locator("#forecastBody .fc-tbl").count()) === 1 &&
    (await page.locator("#forecastBody .fc-total").count()) === 1 &&
    (await page.locator("#forecastBody .fc-by").count()) === 3 &&
    (await page.locator("#forecastBody .fc-sum .fc-s").count()) === 3);
  ok("prognoza: default grupiranje = Provider (aktivno)", await page.locator('#forecastBody .fc-by[data-by="provider"].on').isVisible());
  ok("prognoza: ima redove (provajder)", (await page.locator("#forecastBody .fc-row").count()) >= 1);
  // inline period (von/bis) na vrhu prognoze pogoni ISTI globalni Datum filter
  ok("prognoza: inline period kontrola (von/bis + ✕)",
    (await page.locator("#fcControls #fcDateOd").count()) === 1 &&
    (await page.locator("#fcControls #fcDateDo").count()) === 1 &&
    (await page.locator("#fcControls #fcDateClear").count()) === 1);
  ok("prognoza: ✕ za raspon skriven dok nema raspona", await page.locator("#fcDateClear").isHidden());
  await page.evaluate(() => document.querySelector("#fcDateOd")._flatpickr.setDate("2026-06-01", true));
  await page.evaluate(() => document.querySelector("#fcDateDo")._flatpickr.setDate("2026-06-30", true));
  await page.waitForTimeout(500);
  const gOdFromFc = await page.evaluate(() => { const fp = document.querySelector("#fDateOd")._flatpickr; return fp.selectedDates[0] ? fp.formatDate(fp.selectedDates[0], "Y-m-d") : ""; });
  ok("prognoza: inline period postavlja globalni Datum filter", gOdFromFc === "2026-06-01", `(${gOdFromFc})`);
  ok("prognoza: ✕ vidljiv kad je raspon postavljen", await page.locator("#fcDateClear").isVisible());
  await page.locator("#fcDateClear").click();
  await page.waitForTimeout(400);
  ok("prognoza: ✕ čisti globalni Datum raspon", (await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.selectedDates.length)) === 0);
  // prognoza zauzima malo prostora: lista je ograničena (~5 redova) i skrola; zaglavlje+UKUPNO ostaju
  const fcCss = await page.evaluate(() => {
    const sc = document.querySelector("#forecastBody .fc-scroll");
    const th = document.querySelector("#forecastBody .fc-tbl thead th");
    const tot = document.querySelector("#forecastBody .fc-total td");
    const cs = e => e ? getComputedStyle(e) : {};
    return { max: cs(sc).maxHeight, oy: cs(sc).overflowY, thPos: cs(th).position, totPos: cs(tot).position };
  });
  ok("prognoza: lista ograničena visinom + skrol (ne troši prostor)",
    fcCss.max !== "none" && parseInt(fcCss.max) > 0 && fcCss.oy === "auto", JSON.stringify(fcCss));
  ok("prognoza: zaglavlje i UKUPNO ostaju (sticky) pri skrolu", fcCss.thPos === "sticky" && fcCss.totPos === "sticky");
  // group-by toggle -> Projekt
  await page.locator('#forecastBody .fc-by[data-by="projekt"]').click();
  await page.waitForTimeout(300);
  ok("prognoza: prebacivanje na Projekt grupiranje", await page.locator('#forecastBody .fc-by[data-by="projekt"].on').isVisible());
  await page.locator('#forecastBody .fc-by[data-by="provider"]').click();
  await page.waitForTimeout(300);
  // sortiranje: klik na HP header (strelica = .fc-arr, ne emoji)
  await page.locator('#forecastBody th[data-sort="hp"]').click();
  await page.waitForTimeout(200);
  ok("prognoza: HP kolona sortabilna (strelica)", (await page.locator('#forecastBody th[data-sort="hp"] .fc-arr').count()) === 1);
  // reaguje na Datum prozor: uži prozor smanji planirani HP (UKUPNO HP = 3. ćelija).
  // prazan prozor -> renderForecast prikaže prazno stanje (nema .fc-total) -> čitaj kao 0 (ne ruši test)
  const fcTotalHp = async () => (await page.locator("#forecastBody .fc-total td").count())
    ? +((await page.locator("#forecastBody .fc-total td").nth(2).innerText()) || "0").replace(/\D/g, "")
    : 0;
  await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.setDate("2026-06-01", true));
  await page.evaluate(() => document.querySelector("#fDateDo")._flatpickr.setDate("2026-07-01", true));
  await page.waitForTimeout(500);
  const fcWide = await fcTotalHp();
  await page.evaluate(() => document.querySelector("#fDateDo")._flatpickr.setDate("2026-06-05", true));
  await page.waitForTimeout(500);
  const fcNarrow = await fcTotalHp();
  ok("prognoza: uži Datum prozor smanji planirani HP", fcWide > 0 && fcNarrow < fcWide, `(wide=${fcWide} narrow=${fcNarrow})`);
  // drill-down: klik na red provajdera -> filtrira na njega (čip Kunde) i spušta nivo na Projekt
  await page.evaluate(() => document.querySelector("#fDateDo")._flatpickr.setDate("2026-07-01", true));
  await page.waitForTimeout(400);
  await page.locator("#forecastBody .fc-row.fc-clickable").first().click();
  await page.waitForTimeout(500);
  ok("prognoza: drill-down na red postavlja Kunde filter", await chipX("data-xkunde").isVisible());
  ok("prognoza: drill-down spustio grupiranje na Projekt", await page.locator('#forecastBody .fc-by[data-by="projekt"].on').isVisible());
  // dalji drill: Projekt red -> spušta na POP (lanac provajder -> projekt -> POP)
  await page.locator("#forecastBody .fc-row.fc-clickable").first().click();
  await page.waitForTimeout(500);
  ok("prognoza: drill-down Projekt -> grupiranje POP", await page.locator('#forecastBody .fc-by[data-by="pop"].on').isVisible());
  // Očisti vraća prognozu na default (fcReset -> Provider)
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(300);
  ok("prognoza: Očisti vraća grupiranje na Provider", await page.locator('#forecastBody .fc-by[data-by="provider"].on').isVisible());

  // ---------- 16t. panel HP/HA: udio AKTIVNOSTI na hover, UKUPNO DP inače ----------
  {
    const projSh = "[NORD CLUSTER 1] WANDLITZ [IP]";
    await page.request.post(BASE + "/api/pops", { data: { projekt: projSh, naziv: "POP SHARE", rfa: "2027-06-01" } });
    await page.request.post(BASE + "/api/dps", { data: { pop: "POP SHARE", projekt: projSh, naziv: "DP SHARE", hp: 30, ha: 12 } });
    const dSh = await (await page.request.get(BASE + "/api/data")).json();
    const shDp = dSh.dps.find(d => d.naziv === "DP SHARE");
    const asf = shDp && dSh.tasks.find(t => t.dp_id === shDp.id && /asfalt/i.test(t.aktivnost));   // HP-faza
    const mon = shDp && dSh.tasks.find(t => t.dp_id === shDp.id && /montaž/i.test(t.aktivnost));    // HA-faza
    ok("HP/HA udio: DP + HP/HA aktivnost (preduslov)", !!asf && !!mon);
    if (asf && mon) {
      await page.request.post(BASE + "/api/segments", { data: { task_id: asf.id, datum_od: "2026-07-01", datum_do: "2026-07-20", status: "otvoreno" } });
      await page.request.post(BASE + "/api/segments", { data: { task_id: mon.id, datum_od: "2026-08-01", datum_do: "2026-08-15", status: "otvoreno" } });
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForSelector(".tl-row[data-task]", { timeout: 10000 });
      await page.click("#pfClear").catch(() => {});
      await page.locator(`#tlScroll .cell[data-fdp="${shDp.id}"]`).first().click();
      await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(400);
      const read = () => page.evaluate(() => ({ hp: $("#drHp").value, ha: $("#drHa").value,
        ro: $("#drHp").readOnly, act: $(".dr-nums").classList.contains("act") }));
      const dpv = await read();   // odmah po otvaranju DP-a: UKUPNO DP (ne udio aktivnosti pod kursorom)
      ok("HP/HA: DP prikaz = UKUPNO DP, editabilno", dpv.hp === "30" && dpv.ha === "12" && !dpv.ro && !dpv.act, JSON.stringify(dpv));
      await page.locator(`#tlScroll .tl-row[data-task="${asf.id}"] .act-name`).hover();
      await page.waitForTimeout(250);
      const asfv = await read();
      ok("HP/HA: hover HP-aktivnost -> njen HP udio, HA=0, read-only", asfv.hp === "30" && asfv.ha === "0" && asfv.ro && asfv.act, JSON.stringify(asfv));
      await page.locator(`#tlScroll .tl-row[data-task="${mon.id}"] .act-name`).hover();
      await page.waitForTimeout(250);
      const monv = await read();
      ok("HP/HA: hover HA-aktivnost -> njen HA udio, HP=0", monv.hp === "0" && monv.ha === "12" && monv.act, JSON.stringify(monv));
      await page.locator(`#tlScroll .tl-row.group[data-dp="${shDp.id}"] .gr-info`).hover();   // hover DP red -> UKUPNO DP
      await page.waitForTimeout(250);
      const backv = await read();
      ok("HP/HA: hover DP red -> natrag UKUPNO DP (editabilno)", backv.hp === "30" && backv.ha === "12" && !backv.ro && !backv.act, JSON.stringify(backv));
    }
    await page.keyboard.press("Escape").catch(() => {});
    await page.click("#pfClear").catch(() => {});
    await page.waitForTimeout(200);
  }

  // ---------- JS greške ----------
  const realErrors = jsErrors.filter(e => !/favicon|net::|Failed to load resource/i.test(e));
  ok("nema JS grešaka u konzoli", realErrors.length === 0, JSON.stringify(realErrors.slice(0, 3)));

  await browser.close();
  console.log(`\n===== REZULTAT: ${pass} PASS / ${fail} FAIL =====`);
  if (failures.length) console.log("PALI: " + failures.join(" | "));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("E2E CRASH:", e); process.exit(2); });
