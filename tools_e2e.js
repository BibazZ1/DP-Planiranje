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
  await page.fill('#frmPop input[name="hp"]', "10");
  await page.fill('#frmPop input[name="ha"]', "5");
  await page.click('#frmPop button[value="ok"]');
  await page.waitForTimeout(800);
  ok("POP kreiran (bez greške)", !(await page.locator("#dlgPop[open]").isVisible().catch(() => false)));

  // ---------- 5. Novi DP pod POP-om (kaskada do POP koraka) ----------
  await page.click("#btnAddDp");
  await page.waitForSelector("#dlgDp[open]", { timeout: 5000 });
  ok("DP dijalog: Kunde+Projekat predizabrani", (await pickVal("dpProj")).includes("WANDLITZ"));
  ok("DP dijalog: POP korak SVIJETLI", await page.locator("#dpPop.glow-req").isVisible());
  await pick("dpPop", "POP TEST-1");
  await page.fill('#frmDp input[name="naziv"]', "DP T1");
  await page.fill('#frmDp input[name="hp"]', "10");
  await page.click('#frmDp button[value="ok"]');
  await page.waitForTimeout(1000);
  const rows = await page.locator(".tl-row[data-task]").count();
  ok("DP kreiran -> 8 aktivnosti u timelineu", rows === 8, `(${rows})`);
  ok("prazno stanje nestalo", !(await page.locator(".tl-empty").isVisible().catch(() => false)));

  // ---------- 6. termini kroz API (prošli rok -> kasni; Aktivacije -> rok DP-a) ----------
  const dataRes = await page.request.get(BASE + "/api/data");
  const data = await dataRes.json();
  const dpT1 = data.dps.find(d => d.naziv === "DP T1");
  const tasks = data.tasks.filter(t => t.dp_id === dpT1.id);
  const tIskop = tasks.find(t => t.aktivnost.includes("Iskopni"));
  const tAkt = tasks.find(t => /aktivacij/i.test(t.aktivnost));
  await page.request.post(BASE + "/api/segments", { data: {
    task_id: tIskop.id, datum_od: "2026-03-02", datum_do: "2026-03-15", status: "otvoreno" } });
  await page.request.post(BASE + "/api/segments", { data: {
    task_id: tAkt.id, datum_od: "2026-05-04", datum_do: "2026-05-17", status: "otvoreno" } });
  await page.request.post(BASE + "/api/segments", { data: {
    task_id: tasks.find(t => t.aktivnost === "Dozvole").id,
    datum_od: "2026-07-06", datum_do: "2026-07-19", status: "završeno" } });
  // jedna aktivnost = JEDNA traka: drugi termin na istom redu mora biti odbijen
  const dup = await page.request.post(BASE + "/api/segments", { data: {
    task_id: tIskop.id, datum_od: "2026-08-03", datum_do: "2026-08-09", status: "otvoreno" } });
  ok("jedna traka po aktivnosti (409 na drugu)", dup.status() === 409);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".seg", { timeout: 10000 });
  // refiltriranje nakon reload-a (filteri se ne pamte) — ponovo izaberi projekat
  ok("termini vidljivi nakon reload (bez filtera)", (await page.locator(".seg").count()) === 3);

  ok("kasni: crvena značka +Nd na traci", (await page.locator(".seg .latebadge").count()) >= 1);
  ok("rok DP-a (Aktivacije) prikazan", await page.locator(".rokb").first().isVisible());
  ok("rok DP-a CRVEN (prošao)", await page.locator(".rokb.late").first().isVisible());
  ok("brojač kasnih u redu DP-a", await page.locator(".latecnt").first().isVisible());

  // ---------- 7. status čipovi ----------
  const segVisible = async () => page.locator(".seg").evaluateAll(els =>
    els.filter(e => !e.classList.contains("dim")).length);
  ok("nema više 'u toku' čipa", (await page.locator('.chip[data-st="u toku"]').count()) === 0);
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

  // ---------- 9. datumski filter (flatpickr) ----------
  await page.evaluate(() => document.querySelector("#fDateOd")._flatpickr.setDate("2026-07-01", true));
  await page.waitForTimeout(400);
  ok("datum od -> AKTIVNI čip", await chipX("data-xdod").isVisible());
  ok("datum od filtrira termine", (await segVisible()) === 1);
  await chipX("data-xdod").click();
  await page.waitForTimeout(400);
  ok("uklanjanje datuma vraća sve", (await segVisible()) === 3);

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

  // ---------- 11. odjel čip ----------
  await page.locator('.chip[data-odj]').first().click();
  await page.waitForTimeout(300);
  ok("odjel filter -> AKTIVNI čip", await chipX("data-xodj").isVisible());

  // ---------- 12. Očisti sve ----------
  await page.click("#pfClear");
  await page.waitForTimeout(500);
  ok("Očisti: badge sakriven", await badge().isHidden());
  ok("Očisti: nema AKTIVNI čipova", (await page.locator("#activeBar .fchip").count()) === 0);

  // ---------- 12b. klik na DP ćeliju: puni projekat+kunde + otvara bočni panel ----------
  await page.locator('.cell[data-fdp]').first().click();
  await page.waitForTimeout(500);
  ok("klik na DP -> projekat popunjen", await chipX("data-xproj").isVisible());
  ok("klik na DP -> kunde popunjen", await chipX("data-xkunde").isVisible());
  ok("klik na DP -> DP čip", await chipX("data-xdp").isVisible());
  ok("klik na DP -> bočni panel (HP/HA + historija)", await page.locator("#drawer.open").isVisible());

  // ---------- 12c. komandni centar u panelu ----------
  const addDaysStr = (s, n) => { const d = new Date(s); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  ok("panel: progress ring", await page.locator("#drStats .drs-ring").isVisible());
  ok("panel: rok (Aktivacije) prikazan", await page.locator("#drStats .drs-rok").isVisible());
  ok("panel: 8 aktivnosti", (await page.locator("#drActs .da-row").count()) === 8);

  const segCntBefore = (await (await page.request.get(BASE + "/api/data")).json()).segments.length;
  await page.locator("#drActs .da-row.noseg").first().click();   // klik crta sedmicu
  await page.waitForTimeout(1000);
  const segCntAfter = (await (await page.request.get(BASE + "/api/data")).json()).segments.length;
  ok("panel: klik na 'bez termina' crta termin", segCntAfter === segCntBefore + 1);

  const stBefore = await page.locator('#drActs .da-row[data-seg]').first().getAttribute("data-st");
  await page.locator('#drActs .da-row[data-seg]').first().click(); // quick toggle statusa
  await page.waitForTimeout(1000);
  const stAfter = await page.locator('#drActs .da-row[data-seg]').first().getAttribute("data-st");
  ok("panel: klik mijenja status", stAfter !== stBefore);
  ok("undo dugme aktivno", !(await page.locator("#btnUndo").isDisabled()));
  await page.click("#btnUndo");
  await page.waitForTimeout(1000);
  ok("undo vraća status", (await page.locator('#drActs .da-row[data-seg]').first()
    .getAttribute("data-st")) === stBefore);

  await page.fill("#drCIn", "E2E test komentar");
  await page.click("#drCSend");
  await page.waitForTimeout(800);
  ok("komentar dodan u panel", (await page.locator("#drComments").textContent()).includes("E2E test komentar"));

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

  // ---------- 12g. krupna vremena + Escape skida DP ali OSTAVLJA projekat ----------
  ok("historija: krupno KO + KADA", (await page.locator("#drHist .evwhen b").count()) >= 1);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  ok("Esc: panel zatvoren", !(await page.locator("#drawer.open").isVisible().catch(() => false)));
  ok("Esc: DP filter skinut", !(await chipX("data-xdp").isVisible().catch(() => false)));
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
  const rowBox = async name =>
    page.locator('.tl-row[data-task]', { hasText: name }).first().locator(".tl-track").boundingBox();

  // (a) crtanje koje ZAVRŠAVA PRIJE DANAS -> Swal traži razlog; Otkaži = ništa se ne kreira
  let bA = await rowBox("Asfaltiranje");
  let yA = bA.y + bA.height / 2;
  await page.mouse.move(bA.x + 300, yA);
  await page.mouse.down();
  await page.mouse.move(bA.x + 380, yA, { steps: 4 });
  ok("crtanje: živi brojač datuma vidljiv", await page.locator(".dragtip:not(.hidden)").isVisible());
  const tipTxt = await page.locator(".dragtip").textContent();
  ok("brojač: datumi + trajanje + KW", /\d{2}\.\d{2}\./.test(tipTxt) && /d · KW/.test(tipTxt), `(${tipTxt})`);
  const cntBefore = await segCount();
  await page.mouse.up();
  await page.waitForSelector(".swal2-popup input.swal2-input", { timeout: 5000 });
  ok("kraj PRIJE danas -> traži razlog (Swal)", true);
  await page.click(".swal2-cancel");
  // dijalog mora VIZUELNO nestati brzo (ne smije ostati "zaglavljen")
  await page.waitForSelector(".swal2-container", { state: "detached", timeout: 1500 }).catch(() => {});
  ok("Swal NESTANE poslije Otkaži (<1.5s)", (await page.locator(".swal2-container").count()) === 0);
  await page.waitForTimeout(300);
  ok("otkazan razlog -> termin NIJE kreiran", (await segCount()) === cntBefore);
  // klik na timeline NAKON zatvaranja ne smije pokrenuti novi 'duh' potez
  ok("nema zaostalog dijaloga (bez 'duh' prompta)", (await page.locator(".swal2-popup").count()) === 0);

  // (b) isti potez s razlogom -> kreira se s kasni_razlog
  bA = await rowBox("Asfaltiranje");
  yA = bA.y + bA.height / 2;
  await page.mouse.move(bA.x + 300, yA);
  await page.mouse.down();
  await page.mouse.move(bA.x + 380, yA, { steps: 4 });
  await page.mouse.up();
  await page.waitForSelector(".swal2-popup input.swal2-input", { timeout: 5000 });
  await page.fill(".swal2-popup input.swal2-input", "kasni zbog dozvole");
  await page.click(".swal2-confirm");
  await page.waitForSelector(".swal2-container", { state: "detached", timeout: 1500 }).catch(() => {});
  ok("Swal NESTANE poslije Sačuvaj (<1.5s)", (await page.locator(".swal2-container").count()) === 0);
  await page.waitForTimeout(500);
  ok("razlog upisan -> termin kreiran", (await segCount()) === cntBefore + 1);
  ok("kasni_razlog snimljen", (await lastSeg()).kasni_razlog === "kasni zbog dozvole");

  // (c) crtanje POSLIJE danas -> NIŠTA ne pita: odmah otvoreno, bez popovera
  const bM = await rowBox("Montaža");
  const yM = bM.y + bM.height / 2;
  await page.mouse.move(bM.x + 660, yM);
  await page.mouse.down();
  await page.mouse.move(bM.x + 740, yM, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  ok("budući termin: NEMA Swal pitanja", (await page.locator(".swal2-popup").count()) === 0);
  ok("budući termin: NEMA popovera", !(await page.locator("#pop:not(.hidden)").isVisible().catch(() => false)));
  ok("budući termin: kreiran odmah", (await segCount()) === cntBefore + 2);
  const segM = await lastSeg();
  ok("default status = otvoreno", segM.status === "otvoreno");
  ok("brojač sakriven poslije puštanja", !(await page.locator(".dragtip:not(.hidden)").isVisible().catch(() => false)));

  // (d) crtanje je PO DANU: kratak povlak (~12px) < 7 dana
  const bH = await rowBox("Horizontalno");
  const yH = bH.y + bH.height / 2;
  await page.mouse.move(bH.x + 700, yH);
  await page.mouse.down();
  await page.mouse.move(bH.x + 712, yH, { steps: 3 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  const segH = await lastSeg();
  const ndays = Math.round((new Date(segH.datum_do) - new Date(segH.datum_od)) / 864e5) + 1;
  ok("crtanje PO DANU (kratak povlak < 7 dana)", ndays >= 1 && ndays < 7, `(${ndays}d)`);

  // (e) dupli klik na traku = završeno; undo vraća; desni klik = editor
  const segMEl = page.locator(`.seg[data-seg="${segM.id}"]`);
  await segMEl.dblclick();
  await page.waitForTimeout(800);
  ok("dupli klik -> završeno", (await (await page.request.get(BASE + "/api/data")).json())
    .segments.find(s => s.id === segM.id).status === "završeno");
  await page.click("#btnUndo");
  await page.waitForTimeout(800);
  ok("undo vraća na otvoreno", (await (await page.request.get(BASE + "/api/data")).json())
    .segments.find(s => s.id === segM.id).status === "otvoreno");
  await page.locator(`.seg[data-seg="${segM.id}"]`).click({ button: "right" });
  await page.waitForTimeout(400);
  ok("desni klik -> editor otvoren", await page.locator("#pop:not(.hidden)").isVisible());
  ok("editor: datum-polja skrivena po defaultu", (await page.locator("#popWhenEdit.hidden").count()) === 1);
  ok("editor: read-only datum traka", await page.locator("#popWhenDisp").isVisible());
  ok("editor: komentar opcionalan", (await page.locator("#pop .pop-field .opt").first().textContent()).toLowerCase().includes("opciona"));
  await page.click("#popWhenDisp");
  await page.waitForTimeout(200);
  ok("editor: klik na datum otkriva ručno uređivanje", (await page.locator("#popWhenEdit.hidden").count()) === 0);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
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

  // ---------- JS greške ----------
  const realErrors = jsErrors.filter(e => !/favicon|net::|Failed to load resource/i.test(e));
  ok("nema JS grešaka u konzoli", realErrors.length === 0, JSON.stringify(realErrors.slice(0, 3)));

  await browser.close();
  console.log(`\n===== REZULTAT: ${pass} PASS / ${fail} FAIL =====`);
  if (failures.length) console.log("PALI: " + failures.join(" | "));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("E2E CRASH:", e); process.exit(2); });
