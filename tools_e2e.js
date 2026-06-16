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
  ok("brojač kasnih (čip) u traci DP reda", await page.locator(".gr-strip .gs-late").first().isVisible());

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
  // panel klizi 0.38s (transform+visibility) — čekaj da se stvarno otvori, ne fiksni timeout
  await page.locator("#drawer.open").waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(450);
  ok("klik na DP -> projekat popunjen", await chipX("data-xproj").isVisible());
  ok("klik na DP -> kunde popunjen", await chipX("data-xkunde").isVisible());
  ok("klik na DP -> DP čip", await chipX("data-xdp").isVisible());
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

  // ---------- 12g. zbijena historija (1 red, boja po akciji) + Escape skida DP ali OSTAVLJA projekat ----------
  ok("historija: zbijen red (vrijeme)", (await page.locator("#drHist .dr-h .evt").count()) >= 1);
  ok("historija: zbijen datum dd/mm[/yy] hh:mm",
    /\d{2}\/\d{2}(\/\d{2})?\s+\d{2}:\d{2}/.test(await page.locator("#drHist .dr-h .evt").first().textContent().catch(() => "")));
  ok("historija: boja po akciji",
    (await page.locator("#drHist .dr-h.ev-green, #drHist .dr-h.ev-teal, #drHist .dr-h.ev-amber, #drHist .dr-h.ev-blue, #drHist .dr-h.ev-red, #drHist .dr-h.ev-purple, #drHist .dr-h.ev-gray").count()) >= 1);
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
  ok("brojač: datumi + trajanje + KW", /\d{2}\.\d{2}\./.test(tipTxt) && /d · KW/.test(tipTxt), `(${tipTxt})`);
  const cntBefore = await segCount();
  await page.mouse.up();
  await page.waitForSelector(".swal2-popup", { timeout: 5000 });
  ok("crtanje: pita otvoren ili završen", await page.locator(".swal2-deny").isVisible());
  await page.click(".swal2-cancel");
  await page.waitForSelector(".swal2-container", { state: "detached", timeout: 1500 }).catch(() => {});
  ok("Swal NESTANE poslije Otkaži (<1.5s)", (await page.locator(".swal2-container").count()) === 0);
  await page.waitForTimeout(300);
  ok("otkazано pitanje -> termin NIJE kreiran", (await segCount()) === cntBefore);

  // (a2) otvoren + kraj prije danas -> traži razlog; Otkaži razlog = ništa
  bA = await rowBox("Asfaltiranje"); yA = bA.y + bA.height / 2;
  await page.mouse.move(bA.x + 300, yA); await page.mouse.down();
  await page.mouse.move(bA.x + 380, yA, { steps: 4 }); await page.mouse.up();
  await page.waitForSelector(".swal2-popup", { timeout: 5000 });
  await page.click(".swal2-confirm");   // otvoren
  await page.waitForSelector(".swal2-popup input.swal2-input", { timeout: 5000 });
  ok("otvoren + kraj prije danas -> traži razlog", true);
  await page.click(".swal2-cancel");
  await page.waitForTimeout(400);
  ok("otkazan razlog -> termin NIJE kreiran", (await segCount()) === cntBefore);

  // (b) otvoren + razlog -> kreira se s kasni_razlog
  bA = await rowBox("Asfaltiranje"); yA = bA.y + bA.height / 2;
  await page.mouse.move(bA.x + 300, yA); await page.mouse.down();
  await page.mouse.move(bA.x + 380, yA, { steps: 4 }); await page.mouse.up();
  await page.waitForSelector(".swal2-popup", { timeout: 5000 });
  await page.click(".swal2-confirm");   // otvoren
  await page.waitForSelector(".swal2-popup input.swal2-input", { timeout: 5000 });
  await page.fill(".swal2-popup input.swal2-input", "kasni zbog dozvole");
  await page.click(".swal2-confirm");
  await page.waitForTimeout(600);
  ok("otvoren+razlog -> termin kreiran", (await segCount()) === cntBefore + 1);
  ok("kasni_razlog snimljen", (await lastSeg()).kasni_razlog === "kasni zbog dozvole");
  ok("kreiran kao otvoren", (await lastSeg()).status === "otvoreno");

  // (c) crtanje POSLIJE danas -> izaberi otvoren -> odmah kreira (bez razloga)
  const bM = await rowBox("Montaža");
  const yM = bM.y + bM.height / 2;
  await page.mouse.move(bM.x + 660, yM); await page.mouse.down();
  await page.mouse.move(bM.x + 740, yM, { steps: 4 }); await page.mouse.up();
  await page.waitForSelector(".swal2-popup", { timeout: 5000 });
  await page.click(".swal2-confirm");   // otvoren
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
  await page.waitForSelector(".swal2-popup", { timeout: 5000 });
  await page.click(".swal2-deny");   // završen
  await page.waitForTimeout(700);
  ok("završen termin: ne traži razlog", (await page.locator(".swal2-popup input.swal2-input").count()) === 0);
  ok("završen termin: status završeno", (await lastSeg()).status === "završeno");

  // (d) crtanje je PO DANU: kratak povlak < 7 dana (otvoren u budućnosti)
  const bH = await rowBox("Horizontalno");
  const yH = bH.y + bH.height / 2;
  await page.mouse.move(bH.x + 700, yH); await page.mouse.down();
  await page.mouse.move(bH.x + 712, yH, { steps: 3 }); await page.mouse.up();
  await page.waitForSelector(".swal2-popup", { timeout: 5000 });
  await page.click(".swal2-confirm");
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
  ok("editor: datum-polja skrivena po defaultu", (await page.locator("#popWhenEdit.hidden").count()) === 1);
  ok("editor: read-only datum traka", await page.locator("#popWhenDisp").isVisible());
  ok("editor: komentar opcionalan", (await page.locator("#pop .pop-field .opt").first().textContent()).toLowerCase().includes("opciona"));
  ok("editor: komentar je chat-oblačić", (await page.locator("#popKomWrap.chat").count()) === 1);
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
  ok("moved-ghost: original (👻) vidljiv u tabeli", (await page.locator(".movedghost").count()) >= 1);

  // ---------- 16d. POP bez DP -> "čeka DP" red + "+ DP" konverzija ----------
  await page.click("#pfClear").catch(() => {});
  await page.waitForTimeout(300);
  await page.request.post(BASE + "/api/pops", { data: {
    projekt: "[NORD CLUSTER 1] BRIESEN [IP]", naziv: "POP CEKA-DP", hp: 50, ha: 10 } });
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

  // ---------- JS greške ----------
  const realErrors = jsErrors.filter(e => !/favicon|net::|Failed to load resource/i.test(e));
  ok("nema JS grešaka u konzoli", realErrors.length === 0, JSON.stringify(realErrors.slice(0, 3)));

  await browser.close();
  console.log(`\n===== REZULTAT: ${pass} PASS / ${fail} FAIL =====`);
  if (failures.length) console.log("PALI: " + failures.join(" | "));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("E2E CRASH:", e); process.exit(2); });
