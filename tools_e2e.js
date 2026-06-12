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

  // ---------- 1. učitavanje + auth ----------
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  await page.waitForURL(BASE + "/", { timeout: 15000 });
  await page.waitForSelector("#userName", { timeout: 15000 });
  ok("login + index load", true);
  ok("auth ime prikazano", (await page.textContent("#userName")).trim().length > 1);
  ok("admin dugme vidljivo (admin)", await page.locator("#btnAdmin").isVisible());

  // dugmad zaključana bez projekta
  ok("Novi POP onemogućen bez projekta", await page.locator("#btnAddPopTop").isDisabled());
  ok("Novi DP onemogućen bez projekta", await page.locator("#btnAddDp").isDisabled());

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

  // ---------- 4. Novi POP (otključan + projekat zaključan) ----------
  ok("Novi POP otključan s projektom", !(await page.locator("#btnAddPopTop").isDisabled()));
  await page.click("#btnAddPopTop");
  await page.waitForSelector("#dlgPop[open]", { timeout: 5000 });
  ok("dijalog: projekat zaključan", await page.locator("#popProjSel").isDisabled());
  const lockedVal = await page.locator("#popProjSel").inputValue();
  ok("dijalog: zaključan na izabrani projekat", lockedVal.includes("WANDLITZ"), `(${lockedVal})`);
  await page.fill('#frmPop input[name="naziv"]', "POP TEST-1");
  await page.fill('#frmPop input[name="hp"]', "10");
  await page.fill('#frmPop input[name="ha"]', "5");
  await page.click('#frmPop button[value="ok"]');
  await page.waitForTimeout(800);
  ok("POP kreiran (bez greške)", !(await page.locator("#dlgPop[open]").isVisible().catch(() => false)));

  // ---------- 5. Novi DP pod POP-om ----------
  await page.click("#btnAddDp");
  await page.waitForSelector("#dlgDp[open]", { timeout: 5000 });
  const projRO = await page.locator('#frmDp input[name="projekt"]').evaluate(el => el.readOnly);
  ok("DP dijalog: projekat readonly", projRO);
  await page.fill('#frmDp input[name="pop"]', "POP TEST-1");
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
    datum_od: "2026-07-06", datum_do: "2026-07-19", status: "u toku" } });
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
  await page.click('.chip[data-st="u toku"]');
  await page.waitForTimeout(400);
  ok("status filter: samo 'u toku' istaknut", (await segVisible()) === 1);
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
