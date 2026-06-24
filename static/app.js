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
    tlHint: "prevuci = novi termin (otvoreno) · dupli klik = završeno · desni klik = uredi · povuci rub = produži · Ctrl+kolutić = zoom",
    kasniPitanje: "Termin završava PRIJE danas — razlog produženja (obavezno):",
    preuzmiProj: "Preuzmi projekat", vlasnikLbl: "vlasnik", otpustiProj: "Otpusti",
    zatraziPristup: "Zatraži pristup", zahtjevPoslan: "Zahtjev poslan vlasniku.",
    slobodanProj: "slobodan", nacrtao: "nacrtao", preuzmiPitanje: "Preuzeti ovaj projekat (samo ti ćeš moći uređivati)?",
    otpustiPitanje: "Otpustiti projekat (drugi će moći preuzeti)?",
    kasniTitle: "Kasne aktivnosti", kasniModalHint: "klik na red = produži rok i upiši razlog",
    kasniBubbleTip: "Termini kojima je rok prošao, a nisu završeni — klik za pregled",
    kasniBubbleN: "kasni", nemaKasnih: "Nema zakašnjelih termina",
    origLbl: "originalno", pomjereno: "pomjereno", produzi: "Produži",
    cekaDp: "čeka DP", cekaDpTip: "POP još nema nijedan DP — klik za detalje, ＋ DP za dodavanje", dodajDp: "＋ DP",
    impViewingAs: "Gledate kao", impYou: "vi", impStop: "Vrati se na svoj nalog",
    impTip: "Gledaj kao korisnik", impPickTitle: "Gledaj kao korisnik",
    impPickPh: "izaberi korisnika", impStart: "Gledaj", impNoUsers: "Nema drugih korisnika za pregled",
    legMonth: "Mjesec", legDay: "Dan", legTip: "Zaglavlje: mjesec · KW (sedmica) · dan",
    zoomOut: "Umanji", zoomIn: "Uvećaj", zoomFit: "Cijela godina",
    zDani: "dani", zSedmice: "sedmice", zMjeseci: "mjeseci",
    stOtvoreno: "otvoreno", stUToku: "u toku", stZavrseno: "završeno",
    od: "od", do: "do", komentar: "komentar", komPh: "npr. čeka se dozvola…",
    kasniLbl: "Zašto termin kasni? (obavezno)",
    kasniPh: "zašto još nije gotovo?", esk: "eskalacija",
    eskOd: "eskalacija od datuma", eskRazlog: "razlog eskalacije", eskPh: "šta je zapelo?",
    eskGripTip: "povuci = pomjeri početak eskalacije",
    obrisi: "Obriši", otkazi: "Otkaži", sacuvaj: "Sačuvaj", odustani: "Odustani",
    noviDpH: "Novi DP", projDaily: "Projekat (Daily)", nazivDp: "Naziv DP",
    lokacija: "Lokacija / dionica", voditelj: "Voditelj projekta",
    brojHp: "Broj HP", brojHa: "Broj HA", plShare: "Planirano za aktivnost",
    dlgHint: "Automatski se kreira 8 standardnih aktivnosti.",
    noviTermin: "Novi termin", urediTermin: "Uredi termin",
    opcionalno: "(opcionalno)", izmijeniDatume: "klik = ručno izmijeni datume",
    kTermina: "Termina", kEsk: "Eskalacije",
    slDp: "DP", slStatus: "Status", slOdjel: "Odjel",
    eskChip: "eskalacije", clearAll: "✕ očisti sve",
    sviKunde: "— svi kunde —", sviProj: "— svi projekti —", sviCode: "— svi code —",
    projekata: "projekata", sviProjekti: "svi projekti", filterLbl: "filter",
    syncUToku: "⟳ sync u toku…", syncGreska: "sync greška", syncLbl: "sync",
    trasa: "Trasa (m)", haM: "HA (m)", haKom: "HA kom", montaza: "Montaža",
    zadnjiRad: "Zadnji rad", dpUPlanu: "DP u planu",
    dpChipHint: "klik na DP = filtriraj timeline ispod",
    noDp: "nema DP-ova vezanih za ovaj izbor — kod \"+ Novi DP\" upiši projekat",
    eskTitle: "Eskalacije — šta je zapelo", thDp: "DP", thAkt: "Aktivnost",
    thTermin: "Termin", thStatus: "Status", thRazlog: "Razlog", thKomentar: "Komentar",
    noEsk: "Nema aktivnih eskalacija",
    kasni: "KASNI", kasniDoDanas: "produženo do danas",
    razlogProd: "razlog produženja", razlogNijeUpisan: "nije upisan — dupli klik!",
    hist: "Historija", noHist: "nema zabilježenih promjena", histMore: "još u bočnom panelu", hcEdit: "dupli klik = uredi",
    drawAskTitle: "Otvoren ili završen termin?",
    hcLateTip: "PROBIJEN ROK · dupli klik = produži rok + razlog · povuci rub = pomjeri kraj",
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
    izaberiPh: "— izaberi —", popNovPh: "izaberi postojeći ili upiši novi…",
    dpSub: "novi dionički plan — 8 aktivnosti automatski",
    popSub: "nova POP/FCP tačka pod projektom", popHpNote: "HP i HA se vode na DP-u (ne na POP-u).",
    kundePh: "izaberi klijenta…", projPh: "izaberi projekat…",
    foldFilteri: "Filteri", foldAnalitika: "Analitika", ocisti: "Očisti",
    aktivniFilteri: "aktivni filteri",
    aktivni: "Aktivni", ocistiSve: "Očisti sve", traziPh: "Pretraži…",
    statusLbl: "Status", odjelLbl: "Odjel",
    datumOd: "Datum od", datumDo: "Datum do", datum: "Datum", odPh: "Od", doPh: "Do",
    nemaRez: "nema rezultata", da: "Da",
    kasniChip: "kasni", kasniTip: "rok prošao, a termin nije završen", dana: "dana",
    napredak: "napredak", gotovo: "gotovo", aktTitle: "Aktivnosti",
    planTitle: "Raspodjela plana", planAuto: "auto", planRucno: "ručno",
    planEst: "raspoređeno po planu (procjena)", planHint: "prazno = auto (linearno po terminima)",
    forecastTitle: "Prognoza", fcProvProj: "Provajder / Projekat", fcHausbeg: "Pregledi",
    fcAkt: "Aktivacije", fcTotal: "UKUPNO", fcAll: "ukupan plan (bez raspona)",
    fcNoData: "nema planiranih količina za izabrani raspon", fcHint: "planirano u rasponu Datum od/do (procjena po planu)",
    fcByProvider: "Provajder", fcByProject: "Projekat", fcDrillTip: "klik = filtriraj na ovo (i spusti nivo)",
    fcPeriod: "Razdoblje", fcClearPeriod: "Očisti razdoblje (cijeli plan)",
    aktKlikTip: "klik = promijeni status / nacrtaj termin",
    bezTermina: "bez termina — klik crta", pomjeriSve: "Pomjeri sve",
    shiftPitanje: "Pomjeriti i sve sljedeće aktivnosti ovog DP-a?",
    komentariTitle: "Komentari", komentarPh: "Dodaj komentar…",
    nemaKom: "još nema komentara", vrati: "Vrati zadnju promjenu",
    depTip: "počinje prije kraja", rokProsao: "prošao prije", rokZa: "za",
    planVs: "Plan (DP) vs izvedeno (Daily)",
    planVsHint: "Plan = Σ HP/HA unesenih na DP-ovima · Izvedeno = Azure Daily · % = Izvedeno ÷ Plan (NIJE napredak gradnje; >100% = na DP-ove još nije unesena sva količina)",
    vsIst: "Izvedeno", vsPlan: "Plan",
    planVsTip: "Poredi unos na DP-ovima (Plan) s količinama iz Azure Daily (Izvedeno). % nije \"koliko je izgrađeno\" nego pokrivenost: >100% znači da Azure prijavljuje više nego što je uneseno na DP-ove.",
    rokLbl: "rok", rokTip: "rok DP-a = kraj termina Aktivacija",
    rfaLbl: "RFA datum", rfaReq: "Upiši RFA datum POP-a.",
    rfaDlgNote: "RFA = Ready-for-Activation. Aktivacije planirane prije ovog datuma se upozoravaju.",
    rfaNote: "Aktivacije DP-ova prije ovog datuma se označavaju upozorenjem.",
    rfaMissing: "RFA datum nije upisan — upiši ga da se provjere aktivacije.",
    rfaWarnTitle: "Aktivacija prije RFA",
    rfaRowTip: "Aktivacija počinje prije RFA ({0})",
    rfaConfLine: "{0}: aktivacija {1} (RFA {2})",
    rfaDpNew: "(novi POP)", rfaDpNote: "Novi POP se kreira s ovim RFA datumom.",
    tlEmpty: "Nema DP-ova za izabrane filtere.<br>Očisti filtere, ili kreiraj <b>＋ Novi POP</b> pa <b>＋ Novi DP</b> pod izabranim projektom.",
    drDpCount: "DP-ova", histTitle: "Historija",
    histEmpty: "još nema zabilježenih aktivnosti", histEmptyAkt: "nema promjena za ovu aktivnost", histLoad: "učitavam…",
    aKreirano: "kreirano", aObrisano: "obrisano", aTerminObrisan: "termin obrisan",
    aAktDodana: "aktivnost dodana", aAktObrisana: "aktivnost obrisana",
    fNaziv: "naziv", fOdjel: "odjel",
    confDelPop: "Obrisati POP {0} i {1} DP-ova (sa svim aktivnostima)?",
    renameTo: "Novi naziv:",
    popPostoji: "POP s tim nazivom već postoji pod ovim projektom.",
    dpPostoji: "DP s tim imenom već postoji u ovom POP-u.",
    hpHaReq: "HP i HA moraju biti veći od 0.",
    dpHistTip: "klik = historija DP-a",
    drRenameTip: "preimenuj", drDelTip: "obriši",
  },
  en: {
    sub: "construction schedule", godina: "Year", noviDp: "+ New DP",
    projekat: "Project", kunde: "Client", ocistiTip: "Clear filters",
    syncTip: "Pull fresh data from Azure SQL",
    chStatus: "Slots by status", chOdjel: "Slots by department",
    chDp: "Progress per DP — % done",
    tlHint: "drag = new slot (open) · double-click = done · right-click = edit · drag edge = extend · Ctrl+wheel = zoom",
    kasniPitanje: "Slot ends BEFORE today — reason for delay (required):",
    preuzmiProj: "Claim project", vlasnikLbl: "owner", otpustiProj: "Release",
    zatraziPristup: "Request access", zahtjevPoslan: "Request sent to owner.",
    slobodanProj: "free", nacrtao: "drawn by", preuzmiPitanje: "Claim this project (only you will be able to edit)?",
    otpustiPitanje: "Release project (others can claim it)?",
    kasniTitle: "Late activities", kasniModalHint: "click a row = extend the deadline and add a reason",
    kasniBubbleTip: "Slots past their deadline and not finished — click to review",
    kasniBubbleN: "late", nemaKasnih: "No overdue slots",
    origLbl: "original", pomjereno: "moved", produzi: "Extend",
    cekaDp: "awaiting DP", cekaDpTip: "POP has no DP yet — click for details, ＋ DP to add one", dodajDp: "＋ DP",
    impViewingAs: "Viewing as", impYou: "you", impStop: "Back to my account",
    impTip: "View as user", impPickTitle: "View as user",
    impPickPh: "choose a user", impStart: "View", impNoUsers: "No other users to view as",
    legMonth: "Month", legDay: "Day", legTip: "Header: month · KW (week) · day",
    zoomOut: "Zoom out", zoomIn: "Zoom in", zoomFit: "Whole year",
    zDani: "days", zSedmice: "weeks", zMjeseci: "months",
    stOtvoreno: "open", stUToku: "in progress", stZavrseno: "done",
    od: "from", do: "to", komentar: "comment", komPh: "e.g. waiting for permit…",
    kasniLbl: "Why is the slot late? (required)",
    kasniPh: "why is it not finished yet?", esk: "escalation",
    eskOd: "escalation from date", eskRazlog: "escalation reason", eskPh: "what is stuck?",
    eskGripTip: "drag = move escalation start",
    obrisi: "Delete", otkazi: "Cancel", sacuvaj: "Save", odustani: "Cancel",
    noviDpH: "New DP", projDaily: "Project (Daily)", nazivDp: "DP name",
    lokacija: "Location / section", voditelj: "Project manager",
    brojHp: "HP count", brojHa: "HA count", plShare: "Planned for activity",
    dlgHint: "8 standard activities are created automatically.",
    noviTermin: "New slot", urediTermin: "Edit slot",
    opcionalno: "(optional)", izmijeniDatume: "click = edit dates manually",
    kTermina: "Slots", kEsk: "Escalations",
    slDp: "DP", slStatus: "Status", slOdjel: "Dept.",
    eskChip: "escalations", clearAll: "✕ clear all",
    sviKunde: "— all clients —", sviProj: "— all projects —", sviCode: "— all codes —",
    projekata: "projects", sviProjekti: "all projects", filterLbl: "filter",
    syncUToku: "⟳ sync running…", syncGreska: "sync error", syncLbl: "sync",
    trasa: "Route (m)", haM: "HA (m)", haKom: "HA pcs", montaza: "Installation",
    zadnjiRad: "Last work", dpUPlanu: "DPs in plan",
    dpChipHint: "click a DP = filter timeline below",
    noDp: "no DPs linked to this selection — enter the project in \"+ New DP\"",
    eskTitle: "Escalations — what is stuck", thDp: "DP", thAkt: "Activity",
    thTermin: "Slot", thStatus: "Status", thRazlog: "Reason", thKomentar: "Comment",
    noEsk: "No active escalations",
    kasni: "LATE", kasniDoDanas: "extended to today",
    razlogProd: "extension reason", razlogNijeUpisan: "not entered — double-click!",
    hist: "History", noHist: "no recorded changes", histMore: "more in side panel", hcEdit: "double-click = edit",
    drawAskTitle: "Open or completed slot?",
    hcLateTip: "OVERDUE · double-click = extend + reason · drag edge = move end",
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
    izaberiPh: "— select —", popNovPh: "pick existing or type a new one…",
    dpSub: "new section plan — 8 activities auto-created",
    popSub: "new POP/FCP point under a project", popHpNote: "HP and HA are tracked on the DP (not the POP).",
    kundePh: "select a client…", projPh: "select a project…",
    foldFilteri: "Filters", foldAnalitika: "Analytics", ocisti: "Clear",
    aktivniFilteri: "active filters",
    aktivni: "Active", ocistiSve: "Clear all", traziPh: "Search…",
    statusLbl: "Status", odjelLbl: "Department",
    datumOd: "Date from", datumDo: "Date to", datum: "Date", odPh: "From", doPh: "To",
    nemaRez: "no results", da: "Yes",
    kasniChip: "late", kasniTip: "past due date and not finished", dana: "days",
    napredak: "progress", gotovo: "done", aktTitle: "Activities",
    planTitle: "Plan allocation", planAuto: "auto", planRucno: "manual",
    planEst: "distributed per plan (estimate)", planHint: "empty = auto (linear over termini)",
    forecastTitle: "Forecast", fcProvProj: "Provider / Project", fcHausbeg: "Home visits",
    fcAkt: "Activations", fcTotal: "TOTAL", fcAll: "total plan (no range)",
    fcNoData: "no planned quantities for the selected range", fcHint: "planned within the Date from/to range (plan-based estimate)",
    fcByProvider: "Provider", fcByProject: "Project", fcDrillTip: "click = filter to this (drill down)",
    fcPeriod: "Period", fcClearPeriod: "Clear period (whole plan)",
    aktKlikTip: "click = toggle status / draw dates",
    bezTermina: "no dates — click to draw", pomjeriSve: "Shift all",
    shiftPitanje: "Also shift all later activities of this DP?",
    komentariTitle: "Comments", komentarPh: "Add a comment…",
    nemaKom: "no comments yet", vrati: "Undo last change",
    depTip: "starts before the end of", rokProsao: "overdue by", rokZa: "in",
    planVs: "Plan (DP) vs actual (Daily)",
    planVsHint: "Plan = Σ HP/HA entered on DPs · Actual = Azure Daily · % = Actual ÷ Plan (NOT build progress; >100% = not all quantity entered on DPs yet)",
    vsIst: "Actual", vsPlan: "Plan",
    planVsTip: "Compares what's entered on the DPs (Plan) with the quantities from Azure Daily (Actual). The % is not \"how much is built\" but coverage: >100% means Azure reports more than has been entered on the DPs.",
    rokLbl: "due", rokTip: "DP due date = end of Activations",
    rfaLbl: "RFA date", rfaReq: "Enter the POP's RFA date.",
    rfaDlgNote: "RFA = Ready-for-Activation. Activations planned before this date are flagged.",
    rfaNote: "DP activations before this date are flagged with a warning.",
    rfaMissing: "RFA date not set — enter it to check activations.",
    rfaWarnTitle: "Activation before RFA",
    rfaRowTip: "Activation starts before RFA ({0})",
    rfaConfLine: "{0}: activation {1} (RFA {2})",
    rfaDpNew: "(new POP)", rfaDpNote: "The new POP is created with this RFA date.",
    tlEmpty: "No DPs match the selected filters.<br>Clear the filters, or create <b>＋ New POP</b> then <b>＋ New DP</b> under the selected project.",
    drDpCount: "DPs", histTitle: "History",
    histEmpty: "no recorded activity yet", histEmptyAkt: "no changes for this activity", histLoad: "loading…",
    aKreirano: "created", aObrisano: "deleted", aTerminObrisan: "slot deleted",
    aAktDodana: "activity added", aAktObrisana: "activity deleted",
    fNaziv: "name", fOdjel: "department",
    confDelPop: "Delete POP {0} and {1} DPs (with all activities)?",
    renameTo: "New name:",
    popPostoji: "A POP with that name already exists under this project.",
    dpPostoji: "A DP with that name already exists under this POP.",
    hpHaReq: "HP and HA must be greater than 0.",
    dpHistTip: "click = DP history",
    drRenameTip: "rename", drDelTip: "delete",
  },
  de: {
    sub: "Bauzeitenplan", godina: "Jahr", noviDp: "+ Neuer DP",
    projekat: "Projekt", kunde: "Kunde", ocistiTip: "Filter zurücksetzen",
    syncTip: "Frische Daten aus Azure SQL laden",
    chStatus: "Termine nach Status", chOdjel: "Termine nach Abteilung",
    chDp: "Fortschritt je DP — % fertig",
    tlHint: "Ziehen = neuer Termin (offen) · Doppelklick = fertig · Rechtsklick = bearbeiten · Rand ziehen = verlängern · Strg+Mausrad = Zoom",
    kasniPitanje: "Termin endet VOR heute — Verzögerungsgrund (Pflicht):",
    preuzmiProj: "Projekt übernehmen", vlasnikLbl: "Eigentümer", otpustiProj: "Freigeben",
    zatraziPristup: "Zugang anfragen", zahtjevPoslan: "Anfrage an Eigentümer gesendet.",
    slobodanProj: "frei", nacrtao: "gezeichnet von", preuzmiPitanje: "Projekt übernehmen (nur du kannst bearbeiten)?",
    otpustiPitanje: "Projekt freigeben (andere können übernehmen)?",
    kasniTitle: "Verspätete Aktivitäten", kasniModalHint: "Zeile klicken = Frist verlängern und Grund eingeben",
    kasniBubbleTip: "Termine über der Frist, nicht abgeschlossen — zum Ansehen klicken",
    kasniBubbleN: "verspätet", nemaKasnih: "Keine überfälligen Termine",
    origLbl: "ursprünglich", pomjereno: "verschoben", produzi: "Verlängern",
    cekaDp: "wartet auf DP", cekaDpTip: "POP hat noch keinen DP — Klick für Details, ＋ DP zum Hinzufügen", dodajDp: "＋ DP",
    impViewingAs: "Ansicht als", impYou: "Sie", impStop: "Zurück zu meinem Konto",
    impTip: "Als Benutzer ansehen", impPickTitle: "Als Benutzer ansehen",
    impPickPh: "Benutzer wählen", impStart: "Ansehen", impNoUsers: "Keine anderen Benutzer",
    legMonth: "Monat", legDay: "Tag", legTip: "Kopf: Monat · KW (Woche) · Tag",
    zoomOut: "Verkleinern", zoomIn: "Vergrößern", zoomFit: "Ganzes Jahr",
    zDani: "Tage", zSedmice: "Wochen", zMjeseci: "Monate",
    stOtvoreno: "offen", stUToku: "laufend", stZavrseno: "fertig",
    od: "von", do: "bis", komentar: "Kommentar", komPh: "z. B. warten auf Genehmigung…",
    kasniLbl: "Warum ist der Termin überfällig? (Pflicht)",
    kasniPh: "warum noch nicht fertig?", esk: "Eskalation",
    eskOd: "Eskalation ab Datum", eskRazlog: "Eskalationsgrund", eskPh: "was klemmt?",
    eskGripTip: "ziehen = Eskalationsbeginn verschieben",
    obrisi: "Löschen", otkazi: "Abbrechen", sacuvaj: "Speichern", odustani: "Abbrechen",
    noviDpH: "Neuer DP", projDaily: "Projekt (Daily)", nazivDp: "DP-Name",
    lokacija: "Lage / Abschnitt", voditelj: "Projektleiter",
    brojHp: "Anzahl HP", brojHa: "Anzahl HA", plShare: "Geplant für Aktivität",
    dlgHint: "8 Standardaktivitäten werden automatisch angelegt.",
    noviTermin: "Neuer Termin", urediTermin: "Termin bearbeiten",
    opcionalno: "(optional)", izmijeniDatume: "Klick = Daten manuell ändern",
    kTermina: "Termine", kEsk: "Eskalationen",
    slDp: "DP", slStatus: "Status", slOdjel: "Abteilung",
    eskChip: "Eskalationen", clearAll: "✕ alle löschen",
    sviKunde: "— alle Kunden —", sviProj: "— alle Projekte —", sviCode: "— alle Codes —",
    projekata: "Projekte", sviProjekti: "alle Projekte", filterLbl: "Filter",
    syncUToku: "⟳ Sync läuft…", syncGreska: "Sync-Fehler", syncLbl: "Sync",
    trasa: "Trasse (m)", haM: "HA (m)", haKom: "HA Stk.", montaza: "Montage",
    zadnjiRad: "Letzte Arbeit", dpUPlanu: "DPs im Plan",
    dpChipHint: "Klick auf DP = Timeline unten filtern",
    noDp: "keine DPs für diese Auswahl — Projekt bei \"+ Neuer DP\" eintragen",
    eskTitle: "Eskalationen — was klemmt", thDp: "DP", thAkt: "Aktivität",
    thTermin: "Termin", thStatus: "Status", thRazlog: "Grund", thKomentar: "Kommentar",
    noEsk: "Keine aktiven Eskalationen",
    kasni: "VERSPÄTET", kasniDoDanas: "bis heute verlängert",
    razlogProd: "Verlängerungsgrund", razlogNijeUpisan: "nicht eingetragen — Doppelklick!",
    hist: "Verlauf", noHist: "keine Änderungen erfasst", histMore: "mehr im Seitenpanel", hcEdit: "Doppelklick = bearbeiten",
    drawAskTitle: "Offen oder abgeschlossen?",
    hcLateTip: "ÜBERFÄLLIG · Doppelklick = verlängern + Grund · Rand ziehen = Ende verschieben",
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
    izaberiPh: "— wählen —", popNovPh: "wählen oder neu eingeben…",
    dpSub: "neuer DP — 8 Aktivitäten automatisch",
    popSub: "neuer POP/FCP-Punkt unter einem Projekt", popHpNote: "HP und HA werden am DP geführt (nicht am POP).",
    kundePh: "Kunde wählen…", projPh: "Projekt wählen…",
    foldFilteri: "Filter", foldAnalitika: "Analyse", ocisti: "Leeren",
    aktivniFilteri: "aktive Filter",
    aktivni: "Aktiv", ocistiSve: "Alle leeren", traziPh: "Suchen…",
    statusLbl: "Status", odjelLbl: "Abteilung",
    datumOd: "Datum von", datumDo: "Datum bis", datum: "Datum", odPh: "Von", doPh: "Bis",
    nemaRez: "keine Treffer", da: "Ja",
    kasniChip: "verspätet", kasniTip: "Frist überschritten, nicht abgeschlossen", dana: "Tage",
    napredak: "Fortschritt", gotovo: "fertig", aktTitle: "Aktivitäten",
    planTitle: "Planverteilung", planAuto: "auto", planRucno: "manuell",
    planEst: "nach Plan verteilt (Schätzung)", planHint: "leer = auto (linear über Termine)",
    forecastTitle: "Prognose", fcProvProj: "Provider / Projekt", fcHausbeg: "Hausbegehungen",
    fcAkt: "Aktivierungen", fcTotal: "GESAMT", fcAll: "Gesamtplan (ohne Zeitraum)",
    fcNoData: "keine geplanten Mengen für den gewählten Zeitraum", fcHint: "geplant im Zeitraum Datum von/bis (Schätzung nach Plan)",
    fcByProvider: "Provider", fcByProject: "Projekt", fcDrillTip: "Klick = darauf filtern (Ebene tiefer)",
    fcPeriod: "Zeitraum", fcClearPeriod: "Zeitraum löschen (gesamter Plan)",
    aktKlikTip: "Klick = Status wechseln / Termin zeichnen",
    bezTermina: "kein Termin — Klick zeichnet", pomjeriSve: "Alle verschieben",
    shiftPitanje: "Auch alle späteren Aktivitäten dieses DP verschieben?",
    komentariTitle: "Kommentare", komentarPh: "Kommentar hinzufügen…",
    nemaKom: "noch keine Kommentare", vrati: "Letzte Änderung rückgängig",
    depTip: "beginnt vor dem Ende von", rokProsao: "überfällig seit", rokZa: "in",
    planVs: "Plan (DP) vs Ist (Daily)",
    planVsHint: "Plan = Σ HP/HA der DPs · Ist = Azure Daily · % = Ist ÷ Plan (KEIN Baufortschritt; >100% = noch nicht die gesamte Menge auf den DPs erfasst)",
    vsIst: "Ist", vsPlan: "Plan",
    planVsTip: "Vergleicht die auf den DPs erfasste Menge (Plan) mit den Mengen aus Azure Daily (Ist). Das % ist nicht \"wie viel gebaut ist\", sondern die Abdeckung: >100% bedeutet, Azure meldet mehr, als auf den DPs erfasst wurde.",
    rokLbl: "Frist", rokTip: "DP-Frist = Ende der Aktivierungen",
    rfaLbl: "RFA-Termin", rfaReq: "RFA-Termin des POP eingeben.",
    rfaDlgNote: "RFA = Ready-for-Activation. Vor diesem Datum geplante Aktivierungen werden gewarnt.",
    rfaNote: "DP-Aktivierungen vor diesem Datum werden mit einer Warnung markiert.",
    rfaMissing: "RFA-Termin nicht eingetragen — eintragen, um Aktivierungen zu prüfen.",
    rfaWarnTitle: "Aktivierung vor RFA",
    rfaRowTip: "Aktivierung beginnt vor RFA ({0})",
    rfaConfLine: "{0}: Aktivierung {1} (RFA {2})",
    rfaDpNew: "(neuer POP)", rfaDpNote: "Der neue POP wird mit diesem RFA-Termin angelegt.",
    tlEmpty: "Keine DPs für die gewählten Filter.<br>Filter leeren, oder <b>＋ Neuer POP</b> und dann <b>＋ Neuer DP</b> unter dem gewählten Projekt anlegen.",
    drDpCount: "DPs", histTitle: "Verlauf",
    histEmpty: "noch keine Aktivitäten erfasst", histEmptyAkt: "keine Änderungen für diese Tätigkeit", histLoad: "lädt…",
    aKreirano: "erstellt", aObrisano: "gelöscht", aTerminObrisan: "Termin gelöscht",
    aAktDodana: "Aktivität hinzugefügt", aAktObrisana: "Aktivität gelöscht",
    fNaziv: "Name", fOdjel: "Abteilung",
    confDelPop: "POP {0} und {1} DPs (mit allen Aktivitäten) löschen?",
    renameTo: "Neuer Name:",
    popPostoji: "Ein POP mit diesem Namen existiert bereits in diesem Projekt.",
    dpPostoji: "Ein DP mit diesem Namen existiert bereits in diesem POP.",
    hpHaReq: "HP und HA müssen größer als 0 sein.",
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

/* Aktivnosti i odjeli su PODACI (8 standardnih, fiksne bs/de vrijednosti u bazi).
   Prevodimo ih SAMO za prikaz — vrijednost u bazi/filterima ostaje kanonska. */
const AKT_I18N = {
  en: { "Dozvole": "Permits", "Priključak na POP": "POP connection", "Pregled objekata": "Site survey",
    "Iskopni radovi": "Excavation", "Horizontalno bušenje": "Horizontal drilling",
    "Asfaltiranje": "Asphalting", "Montaža": "Assembly", "Aktivacije": "Activation" },
  de: { "Dozvole": "Genehmigungen", "Priključak na POP": "POP-DP Anbindung", "Pregled objekata": "Hausbegehungen",
    "Iskopni radovi": "Erdarbeiten", "Horizontalno bušenje": "Horizontalbohrung",
    "Asfaltiranje": "Asphaltierung", "Montaža": "Montage", "Aktivacije": "Aktivierung" },
};
const ODJ_I18N = {
  en: { "Dozvole": "Permits", "POP / Provajder": "POP / Provider", "Planiranje": "Planning",
    "Tiefbau": "Civil works", "Spülbohrung": "Flush drilling", "Montaža": "Assembly", "Aktivacija": "Activation" },
  de: { "Dozvole": "Genehmigungen", "POP / Provajder": "POP / Provider", "Planiranje": "Planung",
    "Tiefbau": "Tiefbau", "Spülbohrung": "Spülbohrung", "Montaža": "Montage", "Aktivacija": "Aktivierung" },
};
const tAkt = name => (AKT_I18N[LANG] && AKT_I18N[LANG][name]) || name;
const tOdjel = name => (ODJ_I18N[LANG] && ODJ_I18N[LANG][name]) || name;

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
let eskDrag = null;               // {id, segEl, grip, part, track, a, b, cur} — povlačenje početka eskalacije
let popCtx = null;                // {mode:'new'|'edit', taskId, segId, status}
const F = { dp: new Set(), pop: new Set(), st: new Set(), odj: new Set(), esk: false,
            kasni: false, dOd: "", dDo: "",
            hpMin: "", hpMax: "", haMin: "", haMax: "" };   // HP/HA raspon (od–do) po DP-u
let SEL = null;                   // {type:'pop'|'dp', id} — otvorena historija u draweru

/* monohromne SVG ikone (bez emojija) — nasljeđuju boju teksta (currentColor) */
const ICON = {
  lock: '<svg class="i-ic" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  trash: '<svg class="i-ic" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  comment: '<svg class="i-ic" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8 8 0 0 1-11.5 7.2L3 21l2.3-6.5A8 8 0 1 1 21 11.5z"/></svg>',
  warn: '<svg class="i-ic" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.3v.01"/></svg>',
};
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
  /* admin/„Gledaj kao" dugmad se renderuju samo adminu (server-side, Jinja) — ovdje nema potrebe */
}
function askUser() {
  /* ime je vezano za Microsoft nalog — ne mijenja se ručno */
  if (window.AUTH && window.AUTH.email) {
    uiAlert(`${USER} (${window.AUTH.email})`, "info");
  }
}

/* ---------- impersonacija: admin "gleda kao" drugi korisnik (testiranje/bug-fix) ---------- */
function renderImpersonation() {
  const A = window.AUTH || {};
  const banner = $("#impBanner");
  if (banner) {
    banner.classList.toggle("hidden", !A.impersonating);
    document.body.classList.toggle("impersonating", !!A.impersonating);
    if (A.impersonating) {
      $("#impTxt").innerHTML = `${t("impViewingAs")} <b>${esc(A.name || A.email)}</b>` +
        `<span class="imp-mail">${esc(A.email)}</span>` +
        `<span class="imp-you">${t("impYou")}: ${esc(A.real_name || A.real_email)}</span>`;
    }
  }
  /* "Gledaj kao" dugme (#btnImpersonate) renderuje se samo realnom adminu (Jinja) */
}
async function openImpersonatePicker() {
  let users = [];
  try { users = (await api("/api/admin/users")).users || []; }
  catch (e) { return handleApiErr(e); }
  const me = ((window.AUTH && window.AUTH.real_email) || "").toLowerCase();
  const opts = users.filter(u => (u.email || "").toLowerCase() !== me);
  if (!opts.length) return uiAlert(t("impNoUsers"), "info");
  const r = await swalBase({
    title: t("impPickTitle"), input: "select",
    inputOptions: Object.fromEntries(opts.map(u =>
      [u.email, `${u.email}${u.role === "admin" ? " · admin" : ""}`])),
    inputPlaceholder: t("impPickPh"), showCancelButton: true,
    confirmButtonText: t("impStart"), cancelButtonText: t("otkazi"),
  });
  if (!r.isConfirmed || !r.value) return;
  try { await api("/api/admin/impersonate", "POST", { email: r.value }); location.href = "/"; }
  catch (e) { handleApiErr(e); }
}
async function stopImpersonation() {
  try { await api("/api/admin/impersonate", "DELETE"); location.href = "/"; }
  catch (e) { handleApiErr(e); }
}
$("#btnImpersonate")?.addEventListener("click", openImpersonatePicker);
$("#impStop")?.addEventListener("click", stopImpersonation);

if (new URLSearchParams(location.search).has("static"))
  document.documentElement.classList.add("noanim");

/* ---------- date helpers (local, no TZ surprises) ---------- */
function pd(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function iso(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
         "-" + String(d.getDate()).padStart(2, "0");
}
function fmt(s) { if (!s) return ""; const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; }
/* kompaktni datum dd/mm (graf, oblačići, badge) */
function fmtShort(s) { if (!s) return ""; const [, m, d] = s.split("-"); return `${d}/${m}`; }
/* prepiši SVE ISO datume (YYYY-MM-DD) unutar proizvoljnog stringa u dd/mm/yyyy
   (historija: "2026-04-24 → 2026-05-01" -> "24/04/2026 → 01/05/2026") */
function fmtDatesIn(s) { return String(s ?? "").replace(/(\d{4})-(\d{2})-(\d{2})/g, "$3/$2/$1"); }
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
  if (!r.ok) {
    /* izvuci čitljivu poruku iz {"error": "..."} ako je JSON */
    const txt = await r.text();
    let msg = txt, data = null;
    try { data = JSON.parse(txt); msg = data.error || txt; } catch (e) { /* plain text */ }
    const err = new Error(msg);
    err.status = r.status; err.data = data;
    throw err;
  }
  return r.status === 204 ? null : r.json();
}

/* ---------- claim / vlasništvo projekta ---------- */
function projOwner(projekt) { return (DATA.claims && DATA.claims[projekt]) || null; }
/* "Projektleiter" = vlasnik (claim) projekta -> prikazno ime za filter/čip */
function ownerNameOf(projekt) { const o = projOwner(projekt); return o ? (o.name || o.email || "") : ""; }
function myEmail() { return ((window.AUTH && window.AUTH.email) || "").toLowerCase(); }
function canEditProjekt(projekt) {
  if (window.AUTH && window.AUTH.is_admin) return true;
  const o = projOwner(projekt);
  return !o || (o.email || "").toLowerCase() === myEmail();
}
function taskProjekt(taskId) {
  const tk = DATA.tasks.find(x => x.id === taskId);
  const dp = tk && DATA.dps.find(d => d.id === tk.dp_id);
  return dp ? dp.projekt : null;
}
/* greška servera: 403 zaključan -> ponudi zahtjev za pristup; ostalo -> alert */
async function handleApiErr(e) {
  if (e && e.status === 403 && e.data && e.data.projekt) {
    if (await uiConfirm(`${e.message} Zatraži pristup?`)) {
      try { await api("/api/claims/request", "POST", { projekt: e.data.projekt });
        uiToast(t("zahtjevPoslan")); } catch (x) { /* ignore */ }
    }
    return;
  }
  uiAlert(String((e && e.message) || e), "error");
}
function lockToast(projekt) {
  const o = projOwner(projekt);
  uiToast(`${t("vlasnikLbl")}: ${o ? (o.name || o.email) : "?"}`, "warning");
}
/* claim kontrola u filter panelu — vidljiva kad je izabran tačno jedan projekat */
/* preuzmi / otpusti projekat (iz panela ILI iz reda DP-a) */
async function doClaim(projekt) {
  if (!projekt || !await uiConfirm(t("preuzmiPitanje"))) return;
  try { await api("/api/claims", "POST", { projekt }); await load(); }
  catch (e) { handleApiErr(e); }
}
async function doRelease(projekt) {
  if (!projekt || !await uiConfirm(t("otpustiPitanje"))) return;
  try { await api("/api/claims?projekt=" + encodeURIComponent(projekt), "DELETE"); await load(); }
  catch (e) { handleApiErr(e); }
}
function renderProjClaim() {
  const pc = $("#projClaim");
  if (!pc) return;
  if (!PROJ.name) { pc.innerHTML = ""; return; }
  const o = projOwner(PROJ.name);
  const mine = !!o && ((o.email || "").toLowerCase() === myEmail() ||
                       (window.AUTH && window.AUTH.is_admin));
  if (!o) {
    pc.innerHTML = `<span class="claim-lbl">${esc(PROJ.name)}</span>` +
      `<span class="claim-free">${t("slobodanProj")}</span>` +
      `<button class="btn sm primary" id="btnClaim">${t("preuzmiProj")}</button>`;
  } else {
    pc.innerHTML = `<span class="claim-lbl">${esc(PROJ.name)}</span>` +
      `<span class="claim-chip${mine ? " mine" : ""}">${ICON.lock} ${t("vlasnikLbl")}: <b>${esc(o.name || o.email)}</b></span>` +
      (mine ? `<button class="btn sm" id="btnRelease">${t("otpustiProj")}</button>`
            : `<button class="btn sm" id="btnReqAccess">${t("zatraziPristup")}</button>`);
  }
  $("#btnClaim")?.addEventListener("click", () => doClaim(PROJ.name));
  $("#btnRelease")?.addEventListener("click", () => doRelease(PROJ.name));
  $("#btnReqAccess")?.addEventListener("click", async () => {
    try { await api("/api/claims/request", "POST", { projekt: PROJ.name }); uiToast(t("zahtjevPoslan")); }
    catch (e) { handleApiErr(e); }
  });
}

/* ---------- lijepi dijalozi (SweetAlert2, kao ULAZNE-FAKTURE) ---------- */
function swalBase(opts) {
  return Swal.fire({
    color: "#f1f5f9",
    background: "transparent",
    customClass: { container: "scifi-popup" },
    confirmButtonColor: "#10b981",
    cancelButtonColor: "#475569",
    /* bez animacija — trenutno otvaranje/zatvaranje (nikad "zaglavljen" dijalog) */
    showClass: { popup: "", backdrop: "swal2-backdrop-show", icon: "" },
    hideClass: { popup: "", backdrop: "", icon: "" },
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
function uiToast(msg, icon = "success") {
  /* neblokirajuća potvrda (gore desno) — ne prekriva app kao puni dijalog */
  if (typeof Swal === "undefined") return;
  Swal.fire({ toast: true, position: "top-end", icon, title: msg,
    showConfirmButton: false, timer: 2400, timerProgressBar: true,
    background: "#1e293b", color: "#f1f5f9" });
}
async function uiPrompt(title, val = "") {
  if (typeof Swal === "undefined") return prompt(title, val);
  const r = await swalBase({
    title, input: "text", inputValue: val, showCancelButton: true,
    confirmButtonText: t("sacuvaj"), cancelButtonText: t("otkazi"),
  });
  return r.isConfirmed ? (r.value || "") : null;
}

/* logički redoslijed gradnje — za upozorenja o zavisnostima */
const DEP_ORDER = ["Dozvole", "Pregled objekata", "Iskopni radovi", "Horizontalno bušenje",
                   "Asfaltiranje", "Montaža", "Priključak na POP", "Aktivacije"];

/* ---------- filtering ---------- */
/* kasni = rok (datum_do) prošao, a termin nije završen — računa se automatski */
function segLate(s) { return s.status !== "završeno" && s.datum_do < todayIso(); }
/* aktivnost je "gotova" tek kad joj je ZADNJA traka završena (prekid pa nastavak).
   Napredak se računa po SVIM aktivnostima DP-a: aktivnost bez ijedne trake = nije
   gotova, pa DP ne može biti 100% dok sve aktivnosti nisu odrađene. */
function taskComplete(segs) {
  if (!segs || !segs.length) return false;
  const last = segs.reduce((m, s) => (!m || s.datum_do > m.datum_do ? s : m), null);
  return !!last && last.status === "završeno";
}
/* ---------- RFA (Ready-for-Activation) ---------- */
/* RFA datum se vodi na POP-u; aktivacija DP-a ne smije početi prije RFA */
function popRfaOf(popId) {
  const p = DATA.pops.find(x => x.id === popId);
  return p && p.rfa ? p.rfa : "";
}
/* najraniji planirani početak aktivacije ovog DP-a ("" ako nema termina aktivacije) */
function dpActStart(dpId) {
  const akt = DATA.tasks.find(tk => tk.dp_id === dpId && /aktivacij/i.test(tk.aktivnost));
  if (!akt) return "";
  const segs = DATA.segments.filter(s => s.task_id === akt.id);
  return segs.length ? segs.map(s => s.datum_od).sort()[0] : "";
}
/* aktivacija DP-a počinje prije RFA svog POP-a? vrati datum početka ili "" */
function dpRfaBreach(dp) {
  const rfa = dp && dp.pop_id ? popRfaOf(dp.pop_id) : "";
  if (!rfa) return "";
  const st = dpActStart(dp.id);
  return st && st < rfa ? st : "";
}
/* svi DP-ovi jednog POP-a čija aktivacija počinje prije RFA */
function rfaConflicts(popId) {
  const rfa = popRfaOf(popId);
  if (!rfa) return [];
  return DATA.dps.filter(d => d.pop_id === popId)
    .map(d => { const st = dpActStart(d.id); return st && st < rfa ? { dp: d.naziv, datum: st } : null; })
    .filter(Boolean);
}
function lateDays(s) {
  return Math.max(1, Math.round((new Date(todayIso()) - new Date(s.datum_do)) / 864e5));
}
function segMatch(s) {
  if (F.st.size && !F.st.has(s.status)) return false;
  if (F.esk && !s.eskalacija) return false;
  if (F.kasni && !segLate(s)) return false;
  /* datumski filter: termin se preklapa sa izabranim rasponom */
  if (F.dOd && s.datum_do < F.dOd) return false;
  if (F.dDo && s.datum_od > F.dDo) return false;
  return true;
}
/* kaskada: Kunde -> Projekat -> DP/POP. Kad je projekt-filter aktivan,
   svuda se vide samo DP-ovi koji pripadaju izabranim projektima. */
function projNameSet() {
  if (!(PROJ.kunde || PROJ.code || PROJ.name || PROJ.pm)) return null;
  const names = new Set(projFiltered().map(p => p.projektname));
  /* PM kao jedini filter: uključi i projekte koji postoje samo kao claim (siročići van Azure liste) */
  if (PROJ.pm && !(PROJ.kunde || PROJ.code || PROJ.name))
    Object.keys(DATA.claims || {}).forEach(n => { if (ownerNameOf(n) === PROJ.pm) names.add(n); });
  return names;
}
function dpInProj(d, ns) { return !ns || (d && d.projekt && ns.has(d.projekt)); }
function scopedDps() {
  const ns = projNameSet();
  return ns ? DATA.dps.filter(d => dpInProj(d, ns)) : DATA.dps;
}
/* POP/DP filter (autocomplete pickeri) */
function numInRange(v, min, max) {
  v = +v || 0;
  return (min === "" || v >= +min) && (max === "" || v <= +max);
}
function dpNumActive() {
  return F.hpMin !== "" || F.hpMax !== "" || F.haMin !== "" || F.haMax !== "";
}
function rangeTxt(min, max) {
  return min !== "" && max !== "" ? `${min}–${max}` : min !== "" ? `≥ ${min}` : `≤ ${max}`;
}
function setNum(id, v) { const el = $("#" + id); if (el) el.value = v; }
function dpFilterOk(d) {
  if (!d) return false;
  if (F.pop.size && !F.pop.has(d.pop)) return false;
  if (F.dp.size && !F.dp.has(d.id)) return false;
  if (!numInRange(d.hp, F.hpMin, F.hpMax)) return false;   // HP raspon
  if (!numInRange(d.ha, F.haMin, F.haMax)) return false;   // HA raspon
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
  renderForecast();   // prognoza: planirano u rasponu Datum od/do po provajderu/projektu
  markEditingSeg();   // istakni termin koji se trenutno uređuje (preživi re-render)
}
/* termin koji se uređuje = vizuelno istaknut (.sel) na grafu */
function markEditingSeg() {
  $$("#tlScroll .seg.sel").forEach(el => el.classList.remove("sel"));
  if (popCtx && popCtx.mode === "edit" && popCtx.segId != null) {
    const el = document.querySelector(`#tlScroll .seg[data-seg="${popCtx.segId}"]`);
    if (el) el.classList.add("sel");
  }
}

/* ---------- zakašnjeli termini: lista + modal (okida se iz "N kasni" čipa u redu DP-a) ---------- */
function lateSegs() {
  return DATA.segments.filter(segLate).sort((a, b) =>
    (a.datum_do < b.datum_do ? -1 : 1));   // najstariji rok prvi
}
function dpOf(seg) {
  const tk = DATA.tasks.find(x => x.id === seg.task_id) || {};
  return DATA.dps.find(d => d.id === tk.dp_id) || {};
}
function aktOf(seg) {
  return (DATA.tasks.find(x => x.id === seg.task_id) || {}).aktivnost || "";
}
function openLateModal(dpId) {
  let list = lateSegs();
  if (dpId) list = list.filter(s => (DATA.tasks.find(t => t.id === s.task_id) || {}).dp_id === dpId);
  /* opseg u zaglavlju: konkretan DP (samo njegovi kasni) ili svi */
  const scope = $("#lmScope");
  if (scope) {
    const dp = dpId ? (DATA.dps.find(d => d.id === dpId) || {}) : null;
    scope.textContent = dp ? `${dp.pop || ""} · ${dp.naziv || ""}` : "";
  }
  $("#lmList").innerHTML = list.length ? list.map(s => {
    const dp = dpOf(s);
    return `<button class="lm-row" data-seg="${s.id}">
      <span class="lm-d">+${lateDays(s)}d</span>
      <span class="lm-b"><b>${esc(dp.pop || "")} · ${esc(dp.naziv || "")}</b>
        <i>${esc(tAkt(aktOf(s)))} · ${fmtShort(s.datum_od)}–${fmtShort(s.datum_do)}</i></span>
      <span class="lm-go">${t("produzi") || "Produži"} →</span>
    </button>`;
  }).join("") : `<div class="dr-h empty">${t("nemaKasnih")}</div>`;
  $$("#lmList .lm-row").forEach(row => row.addEventListener("click", () => {
    const segId = +row.dataset.seg;
    const s = DATA.segments.find(x => x.id === segId);
    closeLateModal();
    if (!s) return;
    ensureDpSelected(s.task_id);
    /* otvori editor termina, odmah otkrij datume da se rok produži + traži razlog */
    openPop("edit", segId, innerWidth / 2 - 150, 120);
    $("#popWhenEdit").classList.remove("hidden");
    $("#popDo").focus();
  }));
  $("#lateModal").classList.remove("hidden");
}
function closeLateModal() { $("#lateModal").classList.add("hidden"); }
$("#lmClose").addEventListener("click", closeLateModal);
$("#lateModal").addEventListener("mousedown", e => {
  if (e.target.id === "lateModal") closeLateModal();   // klik na pozadinu zatvara
});

/* ---------- aktivni filteri (pilule + brojač) — kao dashboard ULAZNE-FAKTURE ---------- */
function activeFilterList() {
  const out = [];
  if (PROJ.kunde) out.push({ k: "kunde", label: "" + PROJ.kunde });
  if (PROJ.name) out.push({ k: "name", label: "" + PROJ.name });
  if (PROJ.code) out.push({ k: "code", label: "# " + PROJ.code });
  [...F.pop].forEach(p => out.push({ k: "pop", v: p, label: "POP " + p }));
  [...F.dp].forEach(id => {
    const d = DATA.dps.find(x => x.id === id);
    if (d) out.push({ k: "dp", v: id, label: `${d.pop} · ${d.naziv}` });
  });
  [...F.st].forEach(s => out.push({ k: "st", v: s, label: stT(s) }));
  [...F.odj].forEach(o => out.push({ k: "odj", v: o, label: o }));
  if (F.esk) out.push({ k: "esk", label: "" + t("eskChip") });
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
/* ---------- plan raspodjela: DP-ov HP/HA -> po terminima (fazno + ručni override) ----------
   HP "ide" na termine gradnje (sve osim Montaže/Aktivacije), HA na Montažu/Aktivaciju.
   Ručno upisan plan_qty na terminu ima prednost; ostatak DP-ovog totala se LINEARNO
   (po dužini termina) raspoređuje na termine te faze bez ručne vrijednosti. */
/* opcioni keš `fc` (kad sumiramo MNOGO DP-ova, npr. prognoza) izbjegava skeniranje
   svih DATA.tasks/segments po svakom DP-u; bez keša radi kao prije (jedan DP) */
function segIsHa(s, fc) {
  const tk = fc ? fc.taskById.get(s.task_id) : DATA.tasks.find(t => t.id === s.task_id);
  return /montaž|aktiv/i.test(`${tk ? tk.aktivnost : ""} ${tk ? tk.odjel : ""}`);
}
function dpPhaseSegs(dpId, ha, fc) {
  if (fc) {
    const out = [];
    for (const t of (fc.tasksByDp.get(dpId) || []))
      for (const s of (fc.segsByTask.get(t.id) || [])) if (segIsHa(s, fc) === ha) out.push(s);
    return out;
  }
  const ids = new Set(DATA.tasks.filter(t => t.dp_id === dpId).map(t => t.id));
  return DATA.segments.filter(s => ids.has(s.task_id) && segIsHa(s) === ha);
}
function hasManual(s) { return s.plan_qty != null && s.plan_qty !== ""; }
/* Map seg.id -> planirana količina (ručna ili auto-ostatak) za DP + fazu (ha=true -> HA) */
function planAlloc(dpId, ha, fc) {
  const dp = fc ? fc.dpById.get(dpId) : DATA.dps.find(d => d.id === dpId);
  const total = dp ? (+dp[ha ? "ha" : "hp"] || 0) : 0;
  const segs = dpPhaseSegs(dpId, ha, fc);
  const out = new Map();
  if (!segs.length) return out;
  let manualSum = 0;
  segs.forEach(s => { if (hasManual(s)) { const v = Math.max(0, +s.plan_qty || 0); out.set(s.id, v); manualSum += v; } });
  const auto = segs.filter(s => !hasManual(s));
  const remain = Math.max(0, total - manualSum);
  const autoDays = auto.reduce((a, s) => a + durDays(s.datum_od, s.datum_do), 0);
  auto.forEach(s => out.set(s.id, autoDays ? remain * durDays(s.datum_od, s.datum_do) / autoDays
                                           : remain / auto.length));
  return out;
}
/* udio termina koji pada u prozor [od,do] (linearno unutar termina) */
function overlapFrac(s, od, do_) {
  const a = od && od > s.datum_od ? od : s.datum_od;
  const b = do_ && do_ < s.datum_do ? do_ : s.datum_do;
  if (a > b) return 0;
  return durDays(a, b) / durDays(s.datum_od, s.datum_do);
}
/* planirano (HP ili HA) za DP u prozoru Datum od/do */
function plannedInWindow(dpId, ha, od, do_, fc) {
  let sum = 0;
  for (const [segId, qty] of planAlloc(dpId, ha, fc)) {
    const s = fc ? fc.segById.get(segId) : DATA.segments.find(x => x.id === segId);
    if (s) sum += qty * overlapFrac(s, od, do_);
  }
  return sum;
}
/* "home visit" = Hausbegehung = aktivnost "Pregled objekata"; planirana u prozoru ako joj
   bar jedna traka pada u [od,do] */
function dpSurveyInWindow(dpId, od, do_, fc) {
  if (fc) {
    if (!fc.surveyDpIds.has(dpId)) return false;
    return (fc.tasksByDp.get(dpId) || []).some(t => /pregled|begehung/i.test(t.aktivnost) &&
      (fc.segsByTask.get(t.id) || []).some(s => overlapFrac(s, od, do_) > 0));
  }
  const ids = new Set(DATA.tasks.filter(t => t.dp_id === dpId && /pregled|begehung/i.test(t.aktivnost)).map(t => t.id));
  if (!ids.size) return false;
  return DATA.segments.some(s => ids.has(s.task_id) && overlapFrac(s, od, do_) > 0);
}
/* ---------- Prognoza: planirano (Hausbegehungen / HP / Aktivacije) u rasponu Datum od/do.
   Grupiranje po provajderu / projektu / POP-u; sortiranje; klik na red = drill-down filter
   (provajder -> njegovi projekti -> njegovi POP-ovi). Poštuje OPSEŽNE filtere
   (Kunde/Projekt/PM/POP/DP + HP/HA raspon) i Datum prozor; ne ovisi o statusu/odjelu
   (prognoza je o PLANU, ne o trenutnom statusu termina). ---------- */
const FCAST = { by: "provider", sortBy: "hp", dir: -1 };   // by: provider | projekt | pop
function fcReset() { FCAST.by = "provider"; FCAST.sortBy = "hp"; FCAST.dir = -1; }
function fcGroupKey(d) {
  return FCAST.by === "provider" ? (kundeOf(d.projekt) || "—")
    : FCAST.by === "pop" ? (d.pop || "—") : (d.projekt || "—");
}
/* klik na red = filtriraj na njega i spusti se nivo niže (provajder->projekti->POP);
   čisti zaostalo stanje (PM/POP/DP) da se opseg ne "zaglavi" */
function fcDrill(key) {
  if (!key || key === "—") return;
  F.pop.clear(); F.dp.clear();
  if (FCAST.by === "provider") { PROJ.kunde = key; PROJ.name = PROJ.code = PROJ.pm = ""; FCAST.by = "projekt"; projFilterChanged(); }
  else if (FCAST.by === "projekt") {
    if (!PROJ.rows.some(p => p.projektname === key)) return;   // siroče (van Azure liste) -> ne filtriraj naslijepo
    PROJ.name = key; FCAST.by = "pop"; projFilterChanged();
  } else { F.pop.add(key); renderAll(); }
}
function renderForecast() {
  const box = $("#forecastBody");
  if (!box) return;
  const od = F.dOd, do_ = F.dDo;
  const meta = $("#fcMeta");
  if (meta) meta.textContent = (od || do_) ? `${fmt(od) || "…"} – ${fmt(do_) || "…"}` : t("fcAll");
  /* inline period pickeri (von/bis) prate globalni Datum filter — tiho (bez okidanja onChange);
     ✕ za čišćenje raspona vidljiv samo kad je raspon postavljen */
  if (FP.fcDateOd) { if (od) FP.fcDateOd.setDate(od, false); else FP.fcDateOd.clear(false); }
  if (FP.fcDateDo) { if (do_) FP.fcDateDo.setDate(do_, false); else FP.fcDateDo.clear(false); }
  const fcClr = $("#fcDateClear"); if (fcClr) fcClr.classList.toggle("hidden", !(od || do_));
  const card = $("#forecastCard");
  if (card && card.classList.contains("collapsed")) return;   // ne računaj dok je panel sklopljen
  /* keš: izgradi mape jednom -> O(D+T+S) umjesto skeniranja DATA.tasks/segments po svakom DP-u */
  const fc = { dpById: new Map(DATA.dps.map(d => [d.id, d])), taskById: new Map(DATA.tasks.map(t => [t.id, t])),
    tasksByDp: new Map(), segsByTask: new Map(), segById: new Map(DATA.segments.map(s => [s.id, s])), surveyDpIds: new Set() };
  for (const tk of DATA.tasks) {
    let a = fc.tasksByDp.get(tk.dp_id); if (!a) fc.tasksByDp.set(tk.dp_id, a = []); a.push(tk);
    if (/pregled|begehung/i.test(tk.aktivnost)) fc.surveyDpIds.add(tk.dp_id);
  }
  for (const s of DATA.segments) { let a = fc.segsByTask.get(s.task_id); if (!a) fc.segsByTask.set(s.task_id, a = []); a.push(s); }
  const groups = new Map();
  let tSv = 0, tHp = 0, tHa = 0, tNdp = 0;
  for (const d of scopedDps().filter(dpFilterOk)) {   // poštuje i POP/DP/HP-HA filtere (kao timeline)
    const hp = Math.round(plannedInWindow(d.id, false, od, do_, fc));
    const ha = Math.round(plannedInWindow(d.id, true, od, do_, fc));
    const sv = dpSurveyInWindow(d.id, od, do_, fc) ? 1 : 0;
    if (!hp && !ha && !sv) continue;
    const key = fcGroupKey(d);
    let g = groups.get(key);
    if (!g) { g = { key, sv: 0, hp: 0, ha: 0, ndp: 0 }; groups.set(key, g); }
    g.sv += sv; g.hp += hp; g.ha += ha; g.ndp += 1;
    tSv += sv; tHp += hp; tHa += ha; tNdp += 1;
  }
  const byBtn = (k, lbl) => `<button class="fc-by${FCAST.by === k ? " on" : ""}" data-by="${k}">${lbl}</button>`;
  const toolbar = `<div class="fc-top">
    <div class="fc-seg">${byBtn("provider", t("fcByProvider"))}${byBtn("projekt", t("fcByProject"))}${byBtn("pop", "POP")}</div>
    <div class="fc-sum">
      <span class="fc-s sv"><b>${fmtNum(tSv)}</b>${t("fcHausbeg")}</span>
      <span class="fc-s hp"><b>${fmtNum(tHp)}</b>HP</span>
      <span class="fc-s ha"><b>${fmtNum(tHa)}</b>${t("fcAkt")}</span>
    </div></div>`;
  const wire = () => {
    box.querySelectorAll(".fc-by").forEach(b => b.addEventListener("click", () => { FCAST.by = b.dataset.by; renderForecast(); }));
    box.querySelectorAll(".fc-tbl th[data-sort]").forEach(h => h.addEventListener("click", () => {
      const c = h.dataset.sort;
      if (FCAST.sortBy === c) FCAST.dir = -FCAST.dir; else { FCAST.sortBy = c; FCAST.dir = c === "name" ? 1 : -1; }
      renderForecast();
    }));
    box.querySelectorAll(".fc-row[data-drill]").forEach(r => {
      r.addEventListener("click", () => fcDrill(r.dataset.drill));
      r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fcDrill(r.dataset.drill); } });
    });
  };
  if (!groups.size) { box.innerHTML = toolbar + `<div class="fc-empty">${t("fcNoData")}</div>`; wire(); return; }
  const rows = [...groups.values()].sort((a, b) =>
    (FCAST.sortBy === "name" ? FCAST.dir * cmpStr(a.key, b.key)
      : FCAST.dir * ((a[FCAST.sortBy] || 0) - (b[FCAST.sortBy] || 0))) || cmpStr(a.key, b.key));
  const arrow = c => FCAST.sortBy === c ? ` <i class="fc-arr${FCAST.dir < 0 ? "" : " up"}">▾</i>` : "";
  const th = (c, lbl, cls = "") => `<th class="fc-sortable ${cls}" data-sort="${c}">${lbl}${arrow(c)}</th>`;
  const levelLbl = FCAST.by === "provider" ? t("fcByProvider") : FCAST.by === "pop" ? "POP" : t("fcByProject");
  const drillable = g => g.key !== "—" && (FCAST.by !== "projekt" || PROJ.rows.some(p => p.projektname === g.key));
  const body = rows.map(g => {
    const dr = drillable(g);
    return `<tr class="fc-row${dr ? " fc-clickable" : ""}"${dr ? ` data-drill="${esc(g.key)}" tabindex="0" title="${t("fcDrillTip")}"` : ""}>
      <td><span class="fc-name">${esc(g.key)}</span> <i class="fc-ndp">${g.ndp} DP</i>${dr ? '<i class="fc-go">→</i>' : ""}</td>
      <td>${fmtNum(g.sv)}</td><td>${fmtNum(g.hp)}</td><td>${fmtNum(g.ha)}</td></tr>`;
  }).join("");
  box.innerHTML = toolbar + `<div class="fc-hint">${t("fcHint")}</div>
    <div class="fc-scroll"><table class="fc-tbl">
      <thead><tr>${th("name", levelLbl)}${th("sv", t("fcHausbeg"), "num")}${th("hp", "HP", "num")}${th("ha", t("fcAkt"), "num")}</tr></thead>
      <tbody>${body}
        <tr class="fc-total"><td>${t("fcTotal")} <i class="fc-ndp">${tNdp} DP</i></td>
          <td>${fmtNum(tSv)}</td><td>${fmtNum(tHp)}</td><td>${fmtNum(tHa)}</td></tr>
      </tbody>
    </table></div>`;
  wire();
}
function renderKpis() {
  const segs = visibleSegs();
  const c = st => segs.filter(s => s.status === st).length;
  const esk = segs.filter(s => s.eskalacija).length;
  /* HP/HA = zbroj po DP-ovima koji imaju BAR JEDAN termin u trenutnom filteru
     (Kunde/Projekt/POP/DP/Abteilung/Status/DATUM) -> "koliko je HP/HA planirano
     u tom rasponu za tog providera/POP/projekat". Bez filtera = svi DP-ovi s terminima. */
  const taskDp = new Map(DATA.tasks.map(tk => [tk.id, tk.dp_id]));
  const dpIds = new Set();
  segs.forEach(s => { const id = taskDp.get(s.task_id); if (id != null) dpIds.add(id); });
  const kdps = DATA.dps.filter(d => dpIds.has(d.id));
  /* bez Datum filtera -> puni DP totali (kao prije); s rasponom -> plan raspoređen na taj prozor */
  const dwin = !!(F.dOd || F.dDo);
  const hp = dwin ? Math.round(kdps.reduce((a, d) => a + plannedInWindow(d.id, false, F.dOd, F.dDo), 0))
                  : kdps.reduce((a, d) => a + (d.hp || 0), 0);
  const ha = dwin ? Math.round(kdps.reduce((a, d) => a + plannedInWindow(d.id, true, F.dOd, F.dDo), 0))
                  : kdps.reduce((a, d) => a + (d.ha || 0), 0);
  /* kartice = filteri: klik na status/eskalacije filtrira sve ispod */
  $("#kpis").innerHTML = `
    <div class="kpi blue click${F.st.size || F.esk ? "" : " on"}" data-all="1" title="${t("clearAll")}"><div class="num" data-n="${segs.length}">0</div><div class="lbl">${t("kTermina")}</div></div>
    <div class="kpi teal click${F.st.has("završeno") ? " on" : ""}" data-st="završeno"><div class="num" data-n="${c("završeno")}">0</div><div class="lbl">${stT("završeno")}</div></div>
    <div class="kpi red click${F.st.has("otvoreno") ? " on" : ""}" data-st="otvoreno"><div class="num" data-n="${c("otvoreno")}">0</div><div class="lbl">${stT("otvoreno")}</div></div>
    <div class="kpi red click${F.esk ? " on" : ""}" data-esk="1"><div class="num" data-n="${esk}">0</div><div class="lbl">${t("kEsk")}</div></div>
    <div class="kpi red click${F.kasni ? " on" : ""}" data-late="1" title="${t("kasniTip")}"><div class="num" data-n="${segs.filter(segLate).length}">0</div><div class="lbl">${t("kasniChip")}</div></div>
    <div class="kpi purple${dwin ? " est" : ""}"${dwin ? ` title="${t("planEst")}"` : ""}><div class="num" data-n="${hp}">0</div><div class="lbl">HP${dwin ? " ~" : ""}</div></div>
    <div class="kpi purple${dwin ? " est" : ""}"${dwin ? ` title="${t("planEst")}"` : ""}><div class="num" data-n="${ha}">0</div><div class="lbl">HA${dwin ? " ~" : ""}</div></div>`;
  $$("#kpis .num").forEach(el => countUp(el, +el.dataset.n));
  $$("#kpis .kpi.click").forEach(k => k.addEventListener("click", () => {
    if (k.dataset.all) { F.st.clear(); F.esk = false; F.kasni = false; }
    else if (k.dataset.st) { const v = k.dataset.st; F.st.has(v) ? F.st.delete(v) : F.st.add(v); }
    else if (k.dataset.esk) F.esk = !F.esk;
    else if (k.dataset.late) F.kasni = !F.kasni;
    renderAll();
    if (k.dataset.st) flashSegs(s => s.status === k.dataset.st);
    if (k.dataset.esk && F.esk) flashSegs(s => !!s.eskalacija);
    if (k.dataset.late && F.kasni) flashSegs(segLate);
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
  const nProj = (PROJ.kunde ? 1 : 0) + (PROJ.code ? 1 : 0) + (PROJ.name ? 1 : 0) + (PROJ.pm ? 1 : 0);
  const nNum = (F.hpMin !== "" || F.hpMax !== "" ? 1 : 0) + (F.haMin !== "" || F.haMax !== "" ? 1 : 0);
  const nAct = F.pop.size + F.dp.size + F.st.size + F.odj.size + (F.esk ? 1 : 0) + nProj
    + (F.kasni ? 1 : 0) + (F.dOd ? 1 : 0) + (F.dDo ? 1 : 0) + nNum;
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
  if (PROJ.kunde) act.push(fchip(`${esc(PROJ.kunde)}`, `data-xkunde="1"`));
  if (PROJ.name) act.push(fchip(`${esc(PROJ.name)}`, `data-xproj="1"`));
  if (PROJ.code) act.push(fchip(`# ${esc(PROJ.code)}`, `data-xcode="1"`));
  if (PROJ.pm) act.push(fchip(`${esc(t("voditelj"))}: ${esc(PROJ.pm)}`, `data-xpm="1"`));
  [...F.pop].forEach(p => act.push(fchip(`${esc(p)}`, `data-xpop="${esc(p)}"`)));
  [...F.dp].forEach(id => {
    const d = DATA.dps.find(x => x.id === id);
    if (d) act.push(fchip(`${esc(dpLbl(d))}`, `data-xdp="${id}"`));
  });
  [...F.st].forEach(s => act.push(fchip(esc(stT(s)), `data-xst="${esc(s)}"`)));
  [...F.odj].forEach(o => act.push(fchip(esc(tOdjel(o)), `data-xodj="${esc(o)}"`)));
  if (F.esk) act.push(fchip(`${t("kEsk")}`, `data-xesk="1"`));
  if (F.kasni) act.push(fchip(`${t("kasniChip")}`, `data-xlate="1"`));
  if (F.dOd) act.push(fchip(`≥ ${fmt(F.dOd)}`, `data-xdod="1"`));
  if (F.dDo) act.push(fchip(`≤ ${fmt(F.dDo)}`, `data-xddo="1"`));
  if (F.hpMin !== "" || F.hpMax !== "") act.push(fchip(`HP ${rangeTxt(F.hpMin, F.hpMax)}`, `data-xhp="1"`));
  if (F.haMin !== "" || F.haMax !== "") act.push(fchip(`HA ${rangeTxt(F.haMin, F.haMax)}`, `data-xha="1"`));
  const ab = $("#activeBar");
  if (ab) {
    ab.innerHTML = act.length
      ? `<span class="factive-lbl">${t("aktivni")}:</span> ${act.join("")}
         <button class="fchip clearall" data-clearall="1">${ICON.trash} ${t("ocistiSve")}</button>` : "";
    $$("#activeBar .fchip").forEach(ch => ch.addEventListener("click", () => {
      const clearedProj = ch.dataset.clearall || ch.dataset.xkunde || ch.dataset.xproj || ch.dataset.xcode || ch.dataset.xpm;
      if (ch.dataset.clearall) {
        F.dp.clear(); F.pop.clear(); F.st.clear(); F.odj.clear(); F.esk = false; F.kasni = false;
        F.dOd = F.dDo = ""; clearDate("fDateOd"); clearDate("fDateDo");
        F.hpMin = F.hpMax = F.haMin = F.haMax = "";
        ["fHpMin", "fHpMax", "fHaMin", "fHaMax"].forEach(id => setNum(id, ""));
        PROJ.kunde = PROJ.code = PROJ.name = PROJ.pm = "";
        fcReset();   // prognoza: nazad na grupiranje po provajderu
      }
      else if (ch.dataset.xhp) { F.hpMin = F.hpMax = ""; setNum("fHpMin", ""); setNum("fHpMax", ""); }
      else if (ch.dataset.xha) { F.haMin = F.haMax = ""; setNum("fHaMin", ""); setNum("fHaMax", ""); }
      else if (ch.dataset.xkunde) PROJ.kunde = "";
      else if (ch.dataset.xproj) PROJ.name = "";
      else if (ch.dataset.xcode) PROJ.code = "";
      else if (ch.dataset.xpm) PROJ.pm = "";
      else if (ch.dataset.xpop) F.pop.delete(ch.dataset.xpop);
      else if (ch.dataset.xdp) F.dp.delete(+ch.dataset.xdp);
      else if (ch.dataset.xst) F.st.delete(ch.dataset.xst);
      else if (ch.dataset.xodj) F.odj.delete(ch.dataset.xodj);
      else if (ch.dataset.xesk) F.esk = false;
      else if (ch.dataset.xlate) F.kasni = false;
      else if (ch.dataset.xdod) { F.dOd = ""; clearDate("fDateOd"); }
      else if (ch.dataset.xddo) { F.dDo = ""; clearDate("fDateDo"); }
      if (clearedProj) projFilterChanged(); else renderAll();
    }));
  }

  /* redovi čipova (kao "TIP FAKTURE" red u ULAZNE dashboardu) —
     POP/DP se filtriraju klikom na kartice/grafove, pa posebna polja nisu potrebna */
  $("#slicers").innerHTML = `
    <div class="sl-row">
      <span class="sl-lbl">${t("statusLbl")}</span>
      ${chip(`${stT("otvoreno")}${cnt(nSt("otvoreno"))}`, "mini st-otvoreno", F.st.has("otvoreno"), `data-st="otvoreno"`)}
      ${chip(`${stT("završeno")}${cnt(nSt("završeno"))}`, "mini st-zavrseno", F.st.has("završeno"), `data-st="završeno"`)}
      ${chip(`${t("eskChip")}${cnt(nEsk)}`, "mini esk", F.esk, `data-esk="1" title="${t("eskChip")}"`)}
      ${chip(`${t("kasniChip")}${cnt(DATA.segments.filter(segLate).length)}`, "mini late" + (DATA.segments.filter(segLate).length ? " glow" : ""), F.kasni, `data-late="1" title="${t("kasniTip")}"`)}
    </div>
    <div class="sl-row">
      <span class="sl-lbl">${t("odjelLbl")}</span>
      ${odj.map(o => chip(esc(tOdjel(o)), "mini odj", F.odj.has(o), `data-odj="${esc(o)}"`)).join("")}
    </div>`;

  $$("#slicers .chip").forEach(ch => ch.addEventListener("click", () => {
    if (ch.dataset.st) { const v = ch.dataset.st; F.st.has(v) ? F.st.delete(v) : F.st.add(v); }
    else if (ch.dataset.odj) { const v = ch.dataset.odj; F.odj.has(v) ? F.odj.delete(v) : F.odj.add(v); }
    else if (ch.dataset.esk) F.esk = !F.esk;
    else if (ch.dataset.late) F.kasni = !F.kasni;
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
  /* sedmice (KW): ćelija nosi SAMO broj sedmice (bez "KW" prefiksa — to bi se zbijalo
     i clipalo). "KW" je imenovan u legendi lijevo, koja je uvijek vidljiva. */
  let weeks = "";
  const wpx = 7 * PX;
  const skip = wpx >= 14 ? 1 : wpx >= 8 ? 2 : 4;
  let d = new Date(yearStart());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));   // ponedjeljak na/prije 1.1.
  const todayI = dayIdx(todayIso());
  while (d < new Date(YEAR + 1, 0, 1)) {
    const a = Math.round((d - yearStart()) / 864e5);
    const kw = isoWeekOf(d);
    const isNow = todayI >= a && todayI < a + 7;
    weeks += `<div class="hb${isNow ? " todayw" : ""}" style="left:${Math.max(0, a * PX)}px;width:${wpx - Math.max(0, -a * PX)}px">${skip === 1 || kw % skip === 0 ? kw : ""}</div>`;
    d.setDate(d.getDate() + 7);
  }
  /* dani: SAMO datum (bez dana u sedmici) — čisto i stane; 1. u mjesecu = jača linija */
  let days = "";
  if (dayMode()) {
    const everyDay = PX >= 11;   // dovoljno široko za dvocifren datum
    for (let i = 0; i < n; i++) {
      const dt = dateOfIdx(i);
      const we = dt.getDay() === 0 || dt.getDay() === 6;
      const first = dt.getDate() === 1;
      const lbl = (everyDay || dt.getDay() === 1) ? dt.getDate() : "";
      days += `<div class="hb${we ? " we" : ""}${i === todayI ? " today" : ""}${first ? " m1" : ""}${dt.getDay() === 1 ? " mon" : ""}" style="left:${i * PX}px;width:${PX}px">${lbl}</div>`;
    }
  } else if (PX >= 2.6) {
    let d2 = new Date(yearStart());
    d2.setDate(d2.getDate() + (8 - (d2.getDay() || 7)) % 7);  // prvi ponedjeljak
    while (d2 < new Date(YEAR + 1, 0, 1)) {
      const a = Math.round((d2 - yearStart()) / 864e5);
      days += `<div class="hb" style="left:${a * PX}px;width:${wpx}px">${wpx >= 18 ? String(d2.getDate()) : ""}</div>`;
      d2.setDate(d2.getDate() + 7);
    }
  }
  return `<div class="tl-row head">
    <div class="tl-label cols heads">
      <span class="th c-pop" data-k="pop" title="${t("sortPop")}">POP ${sortArrow("pop")}</span>
      <span class="th c-dp" data-k="dp" title="${t("sortDp")}">DP ${sortArrow("dp")}</span>
      <span class="th c-act" data-k="akt" title="${t("sortAkt")}">${t("aktivnost")} ${sortArrow("akt")}</span>
      <div class="band-legend" title="${t("legTip")}">
        <span style="height:24px">${t("legMonth")}</span>
        <span style="height:22px">KW</span>
        ${days ? `<span style="height:22px">${t("legDay")}</span>` : ""}
      </div>
    </div>
    <div class="tl-track" style="width:${totalW}px">
      <div class="tl-head-band months" style="width:${totalW}px">${months}</div>
      <div class="tl-head-band kw" style="width:${totalW}px">${weeks}</div>
      ${days ? `<div class="tl-head-band days" style="width:${totalW}px">${days}</div>` : ""}
    </div></div>`;
}

function trackBg() {
  /* suptilne sedmične linije iza aktivnosti (vodilice, ne "trake"); dnevne još tiše */
  const imgs = [`linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)`];
  const sizes = [`${7 * PX}px 100%`];
  if (dayMode()) {
    imgs.push(`linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)`);
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
  /* prevodi unaprijed: unutar petlje "for (const t of rows)" t je TASK, ne i18n! */
  const txtKasni = t("kasniTip"), txtDep = t("depTip"), txtEskGrip = t("eskGripTip");

  let html = headerBands(totalW);
  let anyRow = false;
  /* filteri vezani za termine (status/eskalacija/kasni/datum) — kad su aktivni,
     POP bez ijednog termina se ne prikazuje jer ne može zadovoljiti takav filter */
  const segFilterOn = F.st.size || F.esk || F.kasni || F.dOd || F.dDo;

  for (const dp of sortedDps()) {
    if (!dpFilterOk(dp)) continue;
    const tasks = sortTasks(DATA.tasks.filter(t => t.dp_id === dp.id)
      .filter(t => !F.odj.size || F.odj.has(t.odjel)));
    const rows = tasks.filter(t => {
      if (!segFilterOn) return true;
      return (segsByTask[t.id] || []).some(segMatch);
    });
    if (!rows.length && (segFilterOn || F.odj.size)) continue;

    const dpTasks = DATA.tasks.filter(x => x.dp_id === dp.id);
    const allSegs = dpTasks.flatMap(x => segsByTask[x.id] || []);
    /* napredak po AKTIVNOSTI (ne po traci): aktivnost bez trake = nije gotova */
    const pct = dpTasks.length
      ? Math.round(dpTasks.filter(x => taskComplete(segsByTask[x.id])).length / dpTasks.length * 100) : 0;

    /* rok DP-a = kraj termina aktivnosti "Aktivacije" (kraj gradnje = aktivacija) */
    const aktTask = DATA.tasks.find(tk => tk.dp_id === dp.id && /aktivacij/i.test(tk.aktivnost));
    const rokSegs = aktTask ? (segsByTask[aktTask.id] || []) : [];
    const rok = rokSegs.length ? rokSegs.map(s => s.datum_do).sort().pop() : "";
    const rokLate = rok && rok < todayIso() && pct < 100;
    const rfaBreach = dpRfaBreach(dp);   // aktivacija počinje prije RFA POP-a?
    const lateCnt = allSegs.filter(segLate).length;

    anyRow = true;
    let ri = 0;
    /* inline traka u praznom prostoru grupnog reda: ko kasni · ko je preuzeo · zadnji komentar */
    const owner = projOwner(dp.projekt);
    const ownerMine = owner && (owner.email || "").toLowerCase() === myEmail();
    const lc = (DATA.last_comments || {})[dp.id];
    let strip = `<div class="gr-strip">`;
    if (lateCnt) strip += `<button class="gs-late" title="${t("kasniTip")}">${lateCnt} ${t("kasniBubbleN")}</button>`;
    if (owner) {
      strip += `<span class="gs-owner${ownerMine ? " mine" : ""}" title="${t("vlasnikLbl")}">${ICON.lock} ${esc(owner.name || owner.email)}</span>`;
      /* vlasnik (ili admin) može otpustiti projekat direktno iz reda */
      if (ownerMine || (window.AUTH && window.AUTH.is_admin))
        strip += `<button class="gs-release" data-release="${esc(dp.projekt)}" title="${t("otpustiPitanje")}">${t("otpustiProj")}</button>`;
    } else {
      strip += `<button class="gs-claim" data-claim="${esc(dp.projekt)}" title="${t("preuzmiPitanje")}">${ICON.lock} ${t("preuzmiProj")}</button>`;
    }
    if (lc) {
      const when = lc.ts ? fmt(String(lc.ts).slice(0, 10)) : "";
      const txt = String(lc.tekst || "");
      strip += `<span class="gs-comment" title="${esc(lc.user || "")}${when ? " · " + when : ""} — ${esc(txt)}">` +
        `${ICON.comment} ${esc(txt.slice(0, 90))}${txt.length > 90 ? "…" : ""}</span>`;
    }
    strip += `</div>`;
    const dpSel = SEL && ((SEL.type === "dp" && SEL.id === dp.id) || (SEL.type === "pop" && SEL.id === dp.pop_id));
    html += `<div class="tl-row group${dpSel ? " sel" : ""}" data-dp="${dp.id}">
      <div class="tl-label">
        <div class="gr-info" title="${t("dpHistTip")}">
          <div class="gr-top"><span class="pop-badge" title="POP / FCP ID">${esc(dp.pop)}</span><b>${esc(dp.naziv)}</b>
            ${rok ? `<span class="rokb${rokLate ? " late" : ""}" title="${t("rokTip")}">${t("rokLbl")} ${fmtShort(rok)} · KW${isoWeekOf(rok)}</span>` : ""}
            ${rfaBreach ? `<span class="rokb rfa-bad" title="${esc(tf("rfaRowTip", fmt(popRfaOf(dp.pop_id))))}">${ICON.warn} RFA</span>` : ""}</div>
          <span class="meta">${dp.lokacija ? esc(dp.lokacija) + " · " : ""}HP ${dp.hp} · HA ${dp.ha}</span></div>
        <div class="gr-side"><span class="pbar"><i style="width:${pct}%"></i></span>
          <span class="pct">${pct}%</span>
          <button class="gbtn delDp" title="Obriši DP">${ICON.trash}</button></div>
      </div>
      <div class="tl-track" style="width:${totalW}px">${strip}</div></div>`;

    for (const t of rows) {
      let segs = "";
      const today = todayIso();
      /* zavisnost: aktivnost počinje prije kraja prethodne u nizu gradnje */
      let depFrom = "";
      const myOrd = DEP_ORDER.indexOf(t.aktivnost);
      const s0 = (segsByTask[t.id] || [])[0];
      if (myOrd > 0 && s0) {
        const conf = dpTasks.find(x => {
          const o = DEP_ORDER.indexOf(x.aktivnost);
          return o > -1 && o < myOrd &&
            (segsByTask[x.id] || []).some(ps => ps.datum_do > s0.datum_od);
        });
        if (conf) depFrom = conf.aktivnost;
      }
      for (const s of (segsByTask[t.id] || [])) {
        /* kašnjenje: otvoreno / u toku se automatski rasteže do danas; završeno ne */
        const late = s.status !== "završeno" && s.datum_do < today;
        const dispDo = late ? today : s.datum_do;
        const a = Math.max(0, dayIdx(s.datum_od)), b = Math.min(n - 1, dayIdx(dispDo));
        if (b < 0 || a > n - 1) continue;
        const x = a * PX, w = Math.max(PX, (b - a + 1) * PX);
        const dim = !segMatch(s);
        const cls = s.status === "završeno" ? "st-zavrseno" : "st-otvoreno";
        /* originalna pozicija termina se VIŠE ne crta kao "duh" traka u tabeli (zatrpavala je
           prikaz) — sad se vidi u hover-kartici (red "Original") i u historiji termina. */
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
          /* ručica: povuci da pomjeriš POČETAK eskalacije direktno na grafu */
          overlays += `<i class="esk-grip" title="${txtEskGrip}" style="left:${(ka - a) * PX}px"></i>`;
        }
        segs += `<div class="seg ${cls}${s.eskalacija ? " esk" : ""}${late ? " late" : ""}${dim ? " dim" : ""}" data-seg="${s.id}"
          style="left:${x}px;width:${w}px">` +
          overlays +
          `<i class="rs l" title="povuci rub = pomjeri početak"></i><i class="rs r" title="povuci rub = pomjeri kraj"></i>` +
          (late && w > 95 ? `<span class="latebadge" title="${txtKasni}">+${lateDays(s)}d</span>` : "") +
          (depFrom && w > 40 ? `<span class="depwarn" title="${txtDep}: ${esc(depFrom)}"></span>` : "") +
          (w > 60 ? `<span>${fmtShort(s.datum_od)}–${fmtShort(s.datum_do)}</span>` : "") +
          (s.komentar && w > 30 ? `<span class="kombadge" title="${esc(s.komentar)}"></span>` : "") +
          (s.komentar && w > 150 ? `<span class="kom">${esc(s.komentar)}</span>` : "") +
          `</div>`;
      }
      html += `<div class="tl-row${ri++ % 2 ? " zeb" : ""}" data-task="${t.id}" style="--ac:${aktColor(t.aktivnost)}">
        <div class="tl-label cols">
          <span class="c-pop cell" data-fpop="${esc(dp.pop)}" data-fpopid="${dp.pop_id || ""}" title="klik = filter + detalji POP-a">${esc(dp.pop)}</span>
          <span class="c-dp cell" data-fdp="${dp.id}" title="klik = filter + detalji (HP/HA, historija)">${esc(dp.naziv)}</span>
          <span class="c-act">
            <span class="act-name" title="dupli klik = preimenuj">${esc(tAkt(t.aktivnost))}</span>
            <span class="odj-tag" title="klik = promijeni odjel">${esc(t.odjel ? tOdjel(t.odjel) : "—")}</span>
            <button class="rowdel" title="Obriši">✕</button>
          </span>
        </div>
        <div class="tl-track" style="width:${totalW}px;${trackBg()}">${segs}</div></div>`;
    }
  }

  /* POP bez ijednog DP-a -> "čeka DP" red: vidljiv ODMAH po kreiranju POP-a,
     i bez ijednog filtera. Sakriva se samo kad je aktivan filter koji POP bez
     termina ne može zadovoljiti (status/kasni/datum/odjel ili konkretan DP). */
  if (!segFilterOn && !F.odj.size && !F.dp.size && !dpNumActive()) {
    const dpPopIds = new Set(DATA.dps.map(d => d.pop_id).filter(Boolean));
    const ns = projNameSet();
    for (const p of DATA.pops.filter(pp => !dpPopIds.has(pp.id))) {
      if (ns && !(p.projekt && ns.has(p.projekt))) continue;   // opseg projekta
      if (F.pop.size && !F.pop.has(p.naziv)) continue;          // POP filter (po nazivu)
      anyRow = true;
      html += `<div class="tl-row group popwait${SEL && SEL.type === "pop" && SEL.id === p.id ? " sel" : ""}" data-popwait="${p.id}">
        <div class="tl-label">
          <div class="pw-info" title="${t("cekaDpTip")}">
            <div class="gr-top"><span class="pop-badge" title="POP / FCP ID">${esc(p.naziv)}</span>
              <span class="waitb">${t("cekaDp")}</span></div>
            <span class="meta">${esc(p.projekt || "")}</span></div>
          <div class="gr-side">
            <button class="btn sm primary addDpHere" data-pop="${p.id}">${t("dodajDp")}</button></div>
        </div>
        <div class="tl-track" style="width:${totalW}px"></div></div>`;
    }
  }

  /* prazno stanje: objasni ZAŠTO nema redova i šta dalje */
  if (!anyRow) html += `<div class="tl-empty">${t("tlEmpty")}</div>`;

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
/* crtanje i razvlačenje su PO DANU (ne po sedmici) — ivica završava tačno
   na danu gdje pustiš, čak i kad je timeline zumiran na sedmice */
function snapRange(i0, i1) {
  return [Math.min(i0, i1), Math.max(i0, i1)];
}
function snapEdge(i) {
  return Math.max(0, Math.min(daysInYear() - 1, i));
}
function trackDay(e, track) {
  const r = track.getBoundingClientRect();
  return Math.max(0, Math.min(daysInYear() - 1, Math.floor((e.clientX - r.left) / PX)));
}

function bindTimeline() {
  $$("#tlScroll .tl-row[data-task] .tl-track").forEach(track => {
    track.addEventListener("mousedown", e => {
      if (e.button !== 0 || e.target.closest(".seg")) return;
      /* ne počinji crtanje dok je otvoren dijalog/popover (spriječi "duh" poteze) */
      if ((typeof Swal !== "undefined" && Swal.isVisible()) ||
          popCtx || $("dialog[open]")) return;
      e.preventDefault();
      const taskId = +track.closest(".tl-row").dataset.task;
      /* zaključan projekat -> ne crtaj (samo vlasnik/admin) */
      if (!canEditProjekt(taskProjekt(taskId))) { lockToast(taskProjekt(taskId)); return; }
      /* aktivnost može imati VIŠE traka (prekid pa nastavak): prazan dio reda = nova
         traka; klik direktno na postojeću traku = interakcija s njom (ne crtaj preko) */
      if (e.target.closest(".seg")) return;
      drag = { taskId, track, d0: trackDay(e, track), d1: trackDay(e, track), moved: false };
      ghost();
      const [a, b] = snapRange(drag.d0, drag.d1);
      dragTipShow(e, a, b);
    });
    track.addEventListener("mousemove", e => {
      if (!drag || drag.track !== track) return;
      drag.d1 = trackDay(e, track);
      drag.moved = true;
      ghost();
      const [a, b] = snapRange(drag.d0, drag.d1);
      dragTipShow(e, a, b);
    });
  });
  $$("#tlScroll .seg").forEach(sg => {
    /* dupli klik = OTVORI EDITOR (status/datumi/komentar mijenjaš eksplicitno i vidiš ih).
       Ranije je dupli klik tiho prebacivao status -> uz aktivan filter bi termin "nestao"
       iz prikaza (djelovalo kao brisanje). Editor nikad ne briše niti skriva termin. */
    sg.addEventListener("dblclick", e => {
      e.stopPropagation();
      const s = DATA.segments.find(x => x.id === +sg.dataset.seg);
      if (!s) return;
      if (!canEditProjekt(taskProjekt(s.task_id))) return lockToast(taskProjekt(s.task_id));
      ensureDpSelected(s.task_id);
      openPop("edit", s.id, e.clientX, e.clientY);
    });
    /* desni klik = puni editor (komentar, eskalacija, datumi, brisanje) */
    sg.addEventListener("contextmenu", e => {
      e.preventDefault();
      e.stopPropagation();
      const s = DATA.segments.find(x => x.id === +sg.dataset.seg);
      if (s) ensureDpSelected(s.task_id);
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
  /* ručica eskalacije: povuci POČETAK eskalacije direktno na grafu (snap po danu) */
  $$("#tlScroll .seg.esk .esk-grip").forEach(g => {
    g.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      const segEl = g.closest(".seg");
      const s = DATA.segments.find(x => x.id === +segEl.dataset.seg);
      if (!s) return;
      if (!canEditProjekt(taskProjekt(s.task_id))) return lockToast(taskProjekt(s.task_id));
      const a = dayIdx(s.datum_od), b = dayIdx(s.datum_do);
      eskDrag = { id: s.id, segEl, grip: g, part: segEl.querySelector(".eskpart"), track: segEl.closest(".tl-track"),
        a, b, cur: s.esk_datum ? Math.max(a, Math.min(b, dayIdx(s.esk_datum))) : a };
      segEl.classList.add("eskdragging");
    });
  });
  /* hover nad aktivnošću -> historija + HP/HA u panelu se fokusiraju na tu aktivnost (privremeno) */
  $$("#tlScroll .tl-row[data-task]").forEach(row => {
    const tid = +row.dataset.task;
    row.addEventListener("mouseenter", () => drHoverTask(tid));
  });
  /* hover nad DP grupnim redom (= sam DP) -> natrag na UKUPNO DP */
  $$("#tlScroll .tl-row.group[data-dp]").forEach(row =>
    row.addEventListener("mouseenter", drHoverClear));
  const tlBody = $("#tlScroll");
  if (tlBody && !tlBody.dataset.hovBound) {
    tlBody.dataset.hovBound = "1";
    tlBody.addEventListener("mouseleave", drHoverClear);
  }
  $$("#tlScroll .delDp").forEach(b => b.addEventListener("click", async () => {
    const dpId = +b.closest(".tl-row").dataset.dp;
    const dp = DATA.dps.find(d => d.id === dpId);
    if (!await uiConfirm(tf("confDelDp", `${dp.pop} · ${dp.naziv}`))) return;
    /* snimi DP + sve aktivnosti i termine za undo (vraćanje cijele grane) */
    const snap = snapshotDp(dpId);
    try { await api(`/api/dps/${dpId}`, "DELETE"); }
    catch (e) { return handleApiErr(e); }
    pushUndo({ label: t("obrisi") + " DP", run: () => restoreDp(snap) });
    await load();
  }));
  $$("#tlScroll .rowdel").forEach(b => b.addEventListener("click", async () => {
    const id = +b.closest(".tl-row").dataset.task;
    const tk = DATA.tasks.find(x => x.id === id);
    if (!await uiConfirm(tf("confDelAkt", tk.aktivnost))) return;
    const seg = DATA.segments.find(s => s.task_id === id);
    try { await api(`/api/tasks/${id}`, "DELETE"); }
    catch (e) { return handleApiErr(e); }
    /* undo: ponovo kreiraj aktivnost + njen termin (ako ga je imala) */
    pushUndo({ label: t("obrisi"), run: async () => {
      const r = await api("/api/tasks", "POST",
        { dp_id: tk.dp_id, aktivnost: tk.aktivnost, odjel: tk.odjel });
      if (r && r.id && seg) await api("/api/segments", "POST", {
        task_id: r.id, datum_od: seg.datum_od, datum_do: seg.datum_do, status: seg.status,
        komentar: seg.komentar, eskalacija: seg.eskalacija, esk_razlog: seg.esk_razlog,
        esk_datum: seg.esk_datum, kasni_razlog: seg.kasni_razlog });
    } });
    await load();
  }));
  $$("#tlScroll .gr-info").forEach(el => el.addEventListener("click", () => {
    selectDp(+el.closest(".tl-row").dataset.dp);
  }));
  /* "čeka DP" red: klik na info = otvori POP panel; "+ DP" = dijalog s tim POP-om */
  $$("#tlScroll .popwait .pw-info").forEach(el => el.addEventListener("click", () => {
    selectPop(+el.closest(".tl-row").dataset.popwait);
  }));
  $$("#tlScroll .addDpHere").forEach(b => b.addEventListener("click", e => {
    e.stopPropagation();
    openDpDialog(+b.dataset.pop);
  }));
  /* inline traka grupnog reda: "N kasni" -> modal SAMO za taj DP; "Preuzmi" -> claim */
  $$("#tlScroll .gs-late").forEach(b => b.addEventListener("click", e => {
    e.stopPropagation();
    openLateModal(+b.closest(".tl-row").dataset.dp);
  }));
  $$("#tlScroll .gs-claim").forEach(b => b.addEventListener("click", e => {
    e.stopPropagation(); doClaim(b.dataset.claim);
  }));
  $$("#tlScroll .gs-release").forEach(b => b.addEventListener("click", e => {
    e.stopPropagation(); doRelease(b.dataset.release);
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
  /* klik na POP/DP ćeliju = puni izbor: filter (i projekat+kunde) + bočni panel */
  $$("#tlScroll .cell[data-fpop]").forEach(el => el.addEventListener("click", () => {
    const pid = +el.dataset.fpopid;
    if (pid) { selectPop(pid); return; }
    const p = el.dataset.fpop;                       // fallback: POP bez veze
    F.pop.has(p) ? F.pop.delete(p) : F.pop.add(p);
    renderAll();
  }));
  $$("#tlScroll .cell[data-fdp]").forEach(el => el.addEventListener("click", () => {
    selectDp(+el.dataset.fdp);
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

/* živi brojač datuma na ivici dok crtaš / razvlačiš — vidiš TAČAN datum prije puštanja */
const dragTip = document.createElement("div");
dragTip.className = "dragtip hidden";
document.body.appendChild(dragTip);
function dragTipShow(e, a, b) {
  const nd = b - a + 1;
  dragTip.innerHTML =
    `<b>${fmtShort(iso(dateOfIdx(a)))}</b><span class="dt-arr">→</span>` +
    `<b>${fmtShort(iso(dateOfIdx(b)))}</b>` +
    `<span class="dt-n">${nd}d · KW${isoWeekOf(dateOfIdx(b))}</span>`;
  dragTip.classList.remove("hidden");
  dragTip.style.left = Math.min(e.clientX + 16, innerWidth - 200) + "px";
  dragTip.style.top = Math.max(8, e.clientY - 46) + "px";
}
function dragTipHide() { dragTip.classList.add("hidden"); }

/* poslije crtanja: mali izbor zalijepljen za ghost-"trebovanje" (NE veliki modal).
   Fixed je, ali ga JS drži uz traku pri skrolu. Otvoren termin koji završava prije
   danas traži razlog produženja — i to se rješava u istom oblačiću (pane 2). */
let drawAskState = null;
function placeDrawAsk() {
  if (!drawAskState) return;
  const ask = $("#drawAsk");
  const r = drawAskState.ghostEl.getBoundingClientRect();
  const W = ask.offsetWidth || 240, H = ask.offsetHeight || 64;
  let left = Math.max(8, Math.min(r.left + r.width / 2 - W / 2, innerWidth - W - 8));
  let top = r.bottom + 8;
  if (top + H > innerHeight - 8) top = r.top - H - 8;   // nema mjesta dolje -> iznad ghosta
  ask.style.left = left + "px";
  ask.style.top = Math.max(8, top) + "px";
}
/* vrati {status, kasni_razlog} ili null (otkazano). isPast = kraj prije danas. */
function askDraw(ghostEl, isPast) {
  return new Promise(resolve => {
    const onScroll = () => placeDrawAsk();
    drawAskState = { resolve, ghostEl, onScroll, isPast };
    $("#daChoice").classList.remove("hidden");   // uvijek počni od izbora
    $("#daReason").classList.add("hidden");
    $("#daReasonInput").value = "";
    $("#daReasonInput").classList.remove("err");
    $("#drawAsk").classList.remove("hidden");
    placeDrawAsk();
    $("#tlScroll").addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  });
}
function drawAskTo(val) {   // finaliziraj + počisti (ukloni trebovanje, skini listenere)
  if (!drawAskState) return;
  $("#drawAsk").classList.add("hidden");
  $("#tlScroll").removeEventListener("scroll", drawAskState.onScroll);
  window.removeEventListener("resize", drawAskState.onScroll);
  $$(".ghost").forEach(g => g.remove());
  const r = drawAskState.resolve;
  drawAskState = null;
  r(val);
}
$("#daDone").addEventListener("click", () => drawAskTo({ status: "završeno", kasni_razlog: "" }));
$("#daOpen").addEventListener("click", () => {
  if (drawAskState && drawAskState.isPast) {   // probijen rok -> traži razlog u istom oblačiću
    $("#daChoice").classList.add("hidden");
    $("#daReason").classList.remove("hidden");
    placeDrawAsk();
    $("#daReasonInput").focus();
  } else {
    drawAskTo({ status: "otvoreno", kasni_razlog: "" });
  }
});
$("#daCancel").addEventListener("click", () => drawAskTo(null));
$("#daReasonSave").addEventListener("click", () => {
  const v = ($("#daReasonInput").value || "").trim();
  if (!v) { $("#daReasonInput").classList.add("err"); $("#daReasonInput").focus(); return; }
  drawAskTo({ status: "otvoreno", kasni_razlog: v });
});
$("#daReasonCancel").addEventListener("click", () => drawAskTo(null));
$("#daReasonInput").addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); $("#daReasonSave").click(); }
});
/* samo razlog (bez izbora otvoren/završen) — kad se zakašnjeli termin produžava
   povlačenjem ruba: promjena se NE lijepi dok se ne upiše ŠTA je pošlo po zlu.
   Vraća {kasni_razlog} ili null (otkazano). */
function askLateReason(anchorEl) {
  return new Promise(resolve => {
    const onScroll = () => placeDrawAsk();
    drawAskState = { resolve, ghostEl: anchorEl, onScroll, isPast: true };
    $("#daChoice").classList.add("hidden");
    $("#daReason").classList.remove("hidden");
    $("#daReasonInput").value = "";
    $("#daReasonInput").classList.remove("err");
    $("#drawAsk").classList.remove("hidden");
    placeDrawAsk();
    $("#tlScroll").addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    setTimeout(() => $("#daReasonInput").focus(), 0);
  });
}

/* live resize of an existing termin by dragging its edge */
document.addEventListener("mousemove", e => {
  if (!segResize) return;
  const i = trackDay(e, segResize.track);
  let a = segResize.a, b = segResize.b;
  if (segResize.side === "l") a = snapEdge(Math.min(i, b));
  else b = snapEdge(Math.max(i, a));
  segResize.curA = a; segResize.curB = b;
  segResize.segEl.style.left = a * PX + "px";
  segResize.segEl.style.width = Math.max(PX, (b - a + 1) * PX) + "px";
  dragTipShow(e, a, b);   // živi datum na ivici i pri razvlačenju
});
document.addEventListener("mouseup", async () => {
  if (!segResize) return;
  dragTipHide();
  const sr = segResize; segResize = null;
  sr.segEl.classList.remove("resizing");
  const a = sr.curA ?? sr.a, b = sr.curB ?? sr.b;
  const od = iso(dateOfIdx(a)), do_ = iso(dateOfIdx(b));
  const s = DATA.segments.find(x => x.id === sr.id);
  if (!s || (s.datum_od === od && s.datum_do === do_)) { renderAll(); return; }   // ništa -> vrati prikaz
  const old = { od: s.datum_od, do_: s.datum_do };
  const today = todayIso();
  /* zakašnjeli termin (otvoren, rok prošao): produžavanje/uređivanje MORA imati razlog.
     Bez razloga se NE lijepi (vrati se) i ostaje "kasni" — ne smije tiho nestati iz filtera. */
  const wasLate = s.status !== "završeno" && old.do_ < today;
  const stillLate = s.status !== "završeno" && do_ < today;
  const extended = do_ > old.do_;
  const body = { datum_od: od, datum_do: do_ };
  if ((stillLate || (wasLate && extended)) && !s.kasni_razlog) {
    const res = await askLateReason(sr.segEl);
    if (!res || !res.kasni_razlog) { renderAll(); return; }   // nema razloga -> ne lijepi, ostaje kasni
    body.kasni_razlog = res.kasni_razlog;
  }
  s.datum_od = od; s.datum_do = do_;
  if (body.kasni_razlog) s.kasni_razlog = body.kasni_razlog;
  try { await api(`/api/segments/${sr.id}`, "PATCH", body); }
  catch (e) { s.datum_od = old.od; s.datum_do = old.do_; renderAll(); return handleApiErr(e); }
  pushUndo({ label: t("urediTermin"), run: async () =>
    api(`/api/segments/${sr.id}`, "PATCH", { datum_od: old.od, datum_do: old.do_ }) });
  renderAll();
  histDirty();
});
/* live povlačenje POČETKA eskalacije po danima (snap), uz živi datum */
document.addEventListener("mousemove", e => {
  if (!eskDrag) return;
  const k = Math.max(eskDrag.a, Math.min(eskDrag.b, trackDay(e, eskDrag.track)));
  eskDrag.cur = k;
  const off = (k - eskDrag.a) * PX;
  eskDrag.grip.style.left = off + "px";
  if (eskDrag.part) { eskDrag.part.style.left = off + "px"; eskDrag.part.style.width = (eskDrag.b - k + 1) * PX + "px"; }
  if (popCtx && popCtx.mode === "edit" && popCtx.segId === eskDrag.id) $("#popEskDat").value = iso(dateOfIdx(k));
  dragTip.innerHTML = `<b>⚑ ${fmtShort(iso(dateOfIdx(k)))}</b><span class="dt-n">KW${isoWeekOf(dateOfIdx(k))}</span>`;
  dragTip.classList.remove("hidden");
  dragTip.style.left = Math.min(e.clientX + 16, innerWidth - 200) + "px";
  dragTip.style.top = Math.max(8, e.clientY - 46) + "px";
});
document.addEventListener("mouseup", async () => {
  if (!eskDrag) return;
  const ed = eskDrag; eskDrag = null;
  ed.segEl.classList.remove("eskdragging");
  dragTipHide();
  const newDate = iso(dateOfIdx(ed.cur));
  const s = DATA.segments.find(x => x.id === ed.id);
  if (s && s.esk_datum !== newDate) {
    const old = s.esk_datum;
    s.esk_datum = newDate;
    try { await api(`/api/segments/${ed.id}`, "PATCH", { esk_datum: newDate }); }
    catch (err) { s.esk_datum = old; renderAll(); return handleApiErr(err); }
    pushUndo({ label: t("urediTermin"), run: async () =>
      api(`/api/segments/${ed.id}`, "PATCH", { esk_datum: old }) });
    if (popCtx && popCtx.mode === "edit" && popCtx.segId === ed.id) $("#popEskDat").value = newDate;
    renderAll();
    histDirty();
  }
});

document.addEventListener("mouseup", async e => {
  if (!drag) return;
  const { taskId, moved, track } = drag;
  const [a, b] = snapRange(drag.d0, drag.d1);
  drag = null;
  dragTipHide();
  if (!moved) { $$(".ghost").forEach(g => g.remove()); return; }   // običan klik nije crtanje
  const od = iso(dateOfIdx(a)), do_ = iso(dateOfIdx(b));
  /* zadrži nacrtani raspon kao "trebovanje" i zalijepi izbor na njega (prati skrol).
     Otvoren termin s krajem prije danas traži razlog produženja — u istom oblačiću. */
  const ghostEl = track && track.querySelector(".ghost");
  if (ghostEl) ghostEl.classList.add("keep");
  const res = ghostEl ? await askDraw(ghostEl, do_ < todayIso()) : null;
  $$(".ghost").forEach(g => g.remove());
  if (!res) return;                         // otkazано -> ništa
  const { status, kasni_razlog } = res;
  let r;
  try {
    r = await api("/api/segments", "POST",
      { task_id: taskId, datum_od: od, datum_do: do_, status, kasni_razlog });
  } catch (e) {
    return handleApiErr(e);   // 409/400/500 -> jasna poruka, čist UI
  }
  if (!r || !r.id) return;
  DATA.segments.push({ id: r.id, task_id: taskId, datum_od: od, datum_do: do_,
    status, komentar: "", eskalacija: 0, esk_razlog: "", esk_datum: "",
    kasni_razlog });
  pushUndo({ label: t("noviTermin"),
    run: async () => api(`/api/segments/${r.id}`, "DELETE") });
  ensureDpSelected(taskId);   // rad u DP-u -> otvori njegov panel desno
  renderAll();
  histDirty();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (drawAskState) { drawAskTo(null); return; }   // otkaži izbor/razlog + ukloni trebovanje
    if (!$("#lateModal").classList.contains("hidden")) { closeLateModal(); return; }
    if (drag) { drag = null; dragTipHide(); $$(".ghost").forEach(g => g.remove()); }
    if (popCtx) closePop();
    else if (SEL && !$("dialog[open]")) deselect();   // skini DP, zadrži projekat
  }
});

/* ---------- undo: vrati zadnju promjenu (stack u memoriji sesije) ---------- */
const UNDO = [];
function addDays(s, n) { const d = new Date(s); d.setDate(d.getDate() + n); return iso(d); }
/* snimak DP-a (sa svim terminima) za undo brisanja */
function snapshotDp(dpId) {
  const dp = DATA.dps.find(d => d.id === dpId);
  const tasks = DATA.tasks.filter(x => x.dp_id === dpId);
  const tIds = new Set(tasks.map(x => x.id));
  const byId = {}; tasks.forEach(x => (byId[x.id] = x));
  return {
    dp: dp ? { ...dp } : null,
    segs: DATA.segments.filter(s => tIds.has(s.task_id))
      .map(s => ({ ...s, aktivnost: (byId[s.task_id] || {}).aktivnost })),
  };
}
async function restoreDp(snap) {
  if (!snap || !snap.dp) return;
  const d = snap.dp;
  const r = await api("/api/dps", "POST", { pop: d.pop, projekt: d.projekt,
    naziv: d.naziv, lokacija: d.lokacija, voditelj: d.voditelj, hp: d.hp, ha: d.ha });
  if (!r || !r.id) return;
  const fresh = await api("/api/data");                 // nove (standardne) aktivnosti
  const newTasks = (fresh.tasks || []).filter(x => x.dp_id === r.id);
  for (const s of snap.segs) {
    const tk = newTasks.find(x => x.aktivnost === s.aktivnost);
    if (tk) await api("/api/segments", "POST", { task_id: tk.id, datum_od: s.datum_od,
      datum_do: s.datum_do, status: s.status, komentar: s.komentar, eskalacija: s.eskalacija,
      esk_razlog: s.esk_razlog, esk_datum: s.esk_datum, kasni_razlog: s.kasni_razlog });
  }
}
function pushUndo(op) {
  UNDO.push(op);
  if (UNDO.length > 30) UNDO.shift();
  undoBtn();
}
function undoBtn() {
  const b = $("#btnUndo");
  if (!b) return;
  b.disabled = !UNDO.length;
  b.title = UNDO.length ? `${t("vrati")}: ${UNDO[UNDO.length - 1].label}` : t("vrati");
}
$("#btnUndo")?.addEventListener("click", async () => {
  const op = UNDO.pop();
  undoBtn();
  if (!op) return;
  try { await op.run(); } catch (e) { /* entitet možda više ne postoji */ }
  await load();
});

/* zavisnosti: kraj produžen -> ponudi pomjeranje svih SLJEDEĆIH aktivnosti DP-a */
async function offerShiftFollowing(segId, fromOd, delta) {
  const s = DATA.segments.find(x => x.id === segId);
  const tk = s && DATA.tasks.find(x => x.id === s.task_id);
  if (!tk) return;
  const ids = new Set(DATA.tasks.filter(x => x.dp_id === tk.dp_id).map(x => x.id));
  const later = DATA.segments.filter(x =>
    x.id !== segId && ids.has(x.task_id) && x.datum_od > fromOd);
  if (!later.length) return;
  if (!await uiConfirm(`${t("shiftPitanje")} (+${delta}d · ${later.length})`)) return;
  for (const x of later) {
    await api(`/api/segments/${x.id}`, "PATCH",
      { datum_od: addDays(x.datum_od, delta), datum_do: addDays(x.datum_do, delta) });
  }
  const moved = later.map(x => x.id);
  pushUndo({ label: t("pomjeriSve"), run: async () => {
    for (const id of moved) {
      const x = DATA.segments.find(y => y.id === id);
      if (x) await api(`/api/segments/${id}`, "PATCH",
        { datum_od: addDays(x.datum_od, -delta), datum_do: addDays(x.datum_do, -delta) });
    }
  } });
  await load();
}

/* ---------- popover ---------- */
function popDurUpd() {
  const od = $("#popOd").value, do_ = $("#popDo").value;
  $("#popWhenDisp").innerHTML = od && do_ && do_ >= od
    ? `<b>${fmtShort(od)}</b><i class="pw-arr">→</i><b>${fmtShort(do_)}</b>` +
      `<span class="pw-n">${durDays(od, do_)} ${t("dana")} · KW${isoWeekOf(od)}–KW${isoWeekOf(do_)}</span>` +
      `<i class="pw-pen"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5l4 4M4 20l4.5-1 9-9-4-4-9 9L4 20z"/></svg></i>`
    : `—`;
}
function openPop(mode, segId, cx, cy, init = {}) {
  const pop = $("#pop");
  let s = { status: "otvoreno", komentar: "", eskalacija: 0, esk_razlog: "" };
  let taskId;
  if (mode === "edit") {
    s = DATA.segments.find(x => x.id === segId);
    taskId = s.task_id;
    popCtx = { mode, segId, status: s.status };
    $("#popTitle").textContent = t("urediTermin");
    $("#popOd").value = s.datum_od; $("#popDo").value = s.datum_do;
    $("#popDel").classList.remove("hidden");
  } else {
    taskId = init.taskId;
    popCtx = { mode, taskId: init.taskId, status: "otvoreno" };
    $("#popTitle").textContent = t("noviTermin");
    $("#popOd").value = init.od; $("#popDo").value = init.do_;
    $("#popDel").classList.add("hidden");
  }
  /* kontekst: koja aktivnost, kojeg DP-a */
  const tk = DATA.tasks.find(x => x.id === taskId) || {};
  const dp = DATA.dps.find(d => d.id === tk.dp_id) || {};
  $("#popCtx").innerHTML = tk.aktivnost
    ? `<span class="pc-dot" style="background:${aktColor(tk.aktivnost)}"></span>` +
      `${esc(dp.naziv || "")} <i>▸</i> <b>${esc(tAkt(tk.aktivnost))}</b>` : "";
  $("#popWhenEdit").classList.add("hidden");   // datumi su skriveni (dolaze iz crteža)
  popDurUpd();
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
  const W = pop.offsetWidth || 282, H = pop.offsetHeight || 330;
  pop.style.left = Math.max(8, Math.min(cx, innerWidth - W - 16)) + "px";
  pop.style.top = Math.max(8, Math.min(cy + 10, innerHeight - H - 16)) + "px";
  /* termin probio rok -> fokus na obavezni razlog; inače NE traži komentar
     (Enter sprema odmah) */
  if (popLate()) $("#popKasni").focus();
  markEditingSeg();                 // istakni traku koja se uređuje
  if (mode === "edit") drLockTask(taskId);   // panel: historija zaključana na ovu aktivnost
}
function closePop() {
  $("#pop").classList.add("hidden");
  popCtx = null;
  markEditingSeg();   // skini isticanje
  drUnlock();         // panel: historija nazad na cijeli DP
}
/* editor prati svoj termin pri skrolu (oblačić "na terminu"), umjesto da ostane
   fiksiran u viewportu; pozicija se drži uz traku, uz blago zaključavanje na rub ekrana */
function repositionPopToSeg() {
  if (!popCtx || popCtx.mode !== "edit") return;
  const seg = document.querySelector(`.seg[data-seg="${popCtx.segId}"]`);
  const pop = $("#pop");
  if (!seg || pop.classList.contains("hidden")) return;
  const r = seg.getBoundingClientRect();
  const W = pop.offsetWidth || 320, H = pop.offsetHeight || 330;
  pop.style.left = Math.max(8, Math.min(r.left, innerWidth - W - 16)) + "px";
  pop.style.top = Math.max(8, Math.min(r.bottom + 8, innerHeight - H - 16)) + "px";
}
$("#tlScroll").addEventListener("scroll", repositionPopToSeg, { passive: true });
/* kad editor naraste (eskalacija/razlog/datumi se otkriju) -> ponovo ga uglavi u ekran,
   da donja polja ne ispadnu ispod (uz max-height skrola unutar sebe ako je baš visok) */
function clampPop() {
  const pop = $("#pop");
  if (pop.classList.contains("hidden")) return;
  const W = pop.offsetWidth || 282, H = pop.offsetHeight || 330;
  const left = parseFloat(pop.style.left) || 8, top = parseFloat(pop.style.top) || 8;
  pop.style.left = Math.max(8, Math.min(left, innerWidth - W - 16)) + "px";
  pop.style.top = Math.max(8, Math.min(top, innerHeight - H - 8)) + "px";
}

/* termin probio rok? (otvoreno / u toku sa krajem u prošlosti) -> razlog obavezan */
function popLate() {
  return popCtx && popCtx.status !== "završeno" &&
         $("#popDo").value && $("#popDo").value < todayIso();
}
function updateKasniVis() {
  const late = popLate();
  $("#popKasniWrap").classList.toggle("hidden", !late);
  /* kad je razlog OBAVEZAN (probijen rok), sakrij opcionalni "Komentar" — jedan jasan
     komentar umjesto dva polja ("ako MORA komentarisati, nema 'opcionalno'") */
  $("#popKomWrap").classList.toggle("hidden", late);
  /* probijen rok -> JAKO naglasi obje obaveze: produži datum-kraj I upiši razlog (crveno svijetle) */
  if (late) $("#popWhenEdit").classList.remove("hidden");   // odmah otkrij datume za produženje
  $("#popWhenEdit").classList.toggle("req-late", late);
  $("#popWhenDisp").classList.toggle("req-late", late);
  $("#popKasniWrap").classList.toggle("req-late", late);
  clampPop();
}

$$("#popStatus .stpill").forEach(p => p.addEventListener("click", () => {
  popCtx.status = p.dataset.st;
  $$("#popStatus .stpill").forEach(x => x.classList.toggle("on", x === p));
  updateKasniVis();
}));
$("#popDo").addEventListener("change", () => { updateKasniVis(); popDurUpd(); });
$("#popOd").addEventListener("change", popDurUpd);
/* klik na datumsku traku = ručno fino podešavanje datuma (inače skriveno) */
$("#popWhenDisp").addEventListener("click", () => {
  const ed = $("#popWhenEdit");
  ed.classList.toggle("hidden");
  clampPop();
  if (!ed.classList.contains("hidden")) $("#popOd").focus();
});
/* Enter bilo gdje u popoveru = Sačuvaj (ne moraš ništa kliknuti) */
$("#pop").addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); $("#popSave").click(); }
});
$("#popKasni").addEventListener("input", () => $("#popKasni").classList.remove("err"));
$("#popEsk").addEventListener("change", () => {
  const on = $("#popEsk").checked;
  $("#popRazlogWrap").classList.toggle("hidden", !on);
  $("#popEskDatWrap").classList.toggle("hidden", !on);
  if (on && !$("#popEskDat").value) $("#popEskDat").value = todayIso();
  clampPop();
});
$("#popCancel").addEventListener("click", closePop);
$("#popClose").addEventListener("click", closePop);
$("#popDel").addEventListener("click", async () => {
  if (popCtx?.mode !== "edit") return;
  const old = { ...DATA.segments.find(s => s.id === popCtx.segId) };
  await api(`/api/segments/${popCtx.segId}`, "DELETE");
  DATA.segments = DATA.segments.filter(s => s.id !== popCtx.segId);
  if (old.task_id) pushUndo({ label: t("obrisi"), run: async () => {
    await api("/api/segments", "POST", {
      task_id: old.task_id, datum_od: old.datum_od, datum_do: old.datum_do,
      status: old.status, komentar: old.komentar, eskalacija: old.eskalacija,
      esk_razlog: old.esk_razlog, esk_datum: old.esk_datum,
      kasni_razlog: old.kasni_razlog });
  } });
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
    let r;
    try { r = await api("/api/segments", "POST", body); }
    catch (e) { return handleApiErr(e); }  // popover ostaje, jasna greška
    DATA.segments.push({ id: r.id, ...body });
    pushUndo({ label: t("noviTermin"),
      run: async () => api(`/api/segments/${r.id}`, "DELETE") });
    closePop(); renderAll(); histDirty();
  } else {
    const segId = popCtx.segId;
    const old = { ...DATA.segments.find(s => s.id === segId) };
    try { await api(`/api/segments/${segId}`, "PATCH", body); }
    catch (e) { return handleApiErr(e); }  // ne diraj lokalno stanje na grešci
    Object.assign(DATA.segments.find(s => s.id === segId), body);
    pushUndo({ label: t("urediTermin"), run: async () => {
      await api(`/api/segments/${segId}`, "PATCH", {
        datum_od: old.datum_od, datum_do: old.datum_do, status: old.status,
        komentar: old.komentar, eskalacija: old.eskalacija,
        esk_razlog: old.esk_razlog, esk_datum: old.esk_datum,
        kasni_razlog: old.kasni_razlog });
    } });
    closePop(); renderAll(); histDirty();
    /* kraj pomjeren kasnije -> ponudi pomjeranje sljedećih aktivnosti */
    const delta = Math.round((new Date(body.datum_do) - new Date(old.datum_do)) / 864e5);
    if (delta > 0) await offerShiftFollowing(segId, old.datum_od, delta);
  }
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
function hcHide() { hcEl.classList.add("hidden"); hcEl.dataset.seg = ""; }
function durDays(od, do_) {
  return Math.max(1, Math.round((new Date(do_) - new Date(od)) / 864e5) + 1);
}
function hcShow(el, ev) {
  const s = DATA.segments.find(x => x.id === +el.dataset.seg);
  if (!s) return hcHide();
  const tk = DATA.tasks.find(x => x.id === s.task_id) || {};
  const dp = DATA.dps.find(d => d.id === tk.dp_id) || {};
  const late = s.status !== "završeno" && s.datum_do < todayIso();
  const hist = (DATA.history || []).filter(h => h.seg_id === s.id);
  const stCls = s.status === "završeno" ? "teal" : "red";
  const nd = durDays(s.datum_od, s.datum_do);
  /* termin je pomjeran? originalnu poziciju pokazujemo OVDJE (umjesto "duh" trake u tabeli) */
  const moved = s.orig_od && s.orig_do && (s.orig_od !== s.datum_od || s.orig_do !== s.datum_do);
  /* HP/HA iz DP-a + koja je veličina "mjerodavna" za ovu aktivnost (Montaža/Aktivacija -> HA, ostalo -> HP) */
  const haRel = /montaž|aktiv/i.test(`${tk.aktivnost || ""} ${tk.odjel || ""}`);
  /* ne re-renderuj isti sadržaj na svaki mousemove — samo pomjeri */
  if (hcEl.dataset.seg !== String(s.id)) {
    hcEl.dataset.seg = String(s.id);
    hcEl.style.setProperty("--hc-ac", aktColor(tk.aktivnost));
    hcEl.innerHTML = `
    <div class="hc-head"><span class="hc-dot" style="background:${aktColor(tk.aktivnost)}"></span>
      <b>${esc(tk.aktivnost ? tAkt(tk.aktivnost) : "")}</b><span class="hc-st ${stCls}">${esc(stT(s.status))}</span></div>
    <div class="hc-ctx">${esc(dp.pop || "")} <i>▸</i> <b>${esc(dp.naziv || "")}</b>${s.created_by
      ? ` <span class="hc-by">${t("nacrtao")} ${esc(s.created_by)}</span>` : ""}</div>
    <div class="hc-when">
      <span class="hc-d"><i>${t("od")}</i><b>${fmt(s.datum_od)}</b><em>KW${isoWeekOf(s.datum_od)}</em></span>
      <span class="hc-arrow">→</span>
      <span class="hc-d"><i>${t("do")}</i><b>${fmt(s.datum_do)}</b><em>KW${isoWeekOf(s.datum_do)}</em></span>
      <span class="hc-dur">${nd}d</span>
    </div>
    ${moved ? `<div class="hc-row gray"><span>${t("origLbl")}</span>${fmt(s.orig_od)} <i class="arr">→</i> ${fmt(s.orig_do)}</div>` : ""}
    <div class="hc-qty">
      <span class="hc-q${haRel ? "" : " rel"}">HP <b>${fmtNum(dp.hp || 0)}</b></span>
      <span class="hc-q${haRel ? " rel" : ""}">HA <b>${fmtNum(dp.ha || 0)}</b></span>
    </div>
    ${late ? `<div class="hc-row red"><span>${t("kasniChip")}</span><b>+${lateDays(s)} ${t("dana")}</b> · ${t("rokLbl")} ${fmt(s.datum_do)}</div>` : ""}
    ${s.komentar ? `<div class="hc-row amber"><span>${t("komentar")}</span>${esc(s.komentar)}</div>` : ""}
    ${late ? `<div class="hc-row purple"><span>${t("razlogProd")}</span>${s.kasni_razlog
      ? esc(s.kasni_razlog) : t("razlogNijeUpisan")}</div>` : ""}
    ${s.eskalacija ? `<div class="hc-row orange"><span>${t("hEskalacija")}${s.esk_datum
      ? " · " + fmt(s.esk_datum) : ""}</span>${esc(s.esk_razlog || "—")}</div>` : ""}
    <div class="hc-hist"><h4>${t("hist")}</h4><div class="hc-hist-list">${hist.length
      ? hist.slice(0, 6).map(h => `<div class="hc-h"><i>${fmtTs(h.ts)}</i>
          <em>${hcLbl(h.polje)}</em><span>${escD(h.vrijednost)}</span>${h.user
            ? `<b class="hc-u">${esc(h.user)}</b>` : ""}</div>`).join("")
      : `<div class="hc-h empty">${t("noHist")}</div>`}${hist.length > 6
      ? `<div class="hc-h more">+${hist.length - 6} ${t("histMore")}</div>` : ""}</div></div>
    <div class="hc-tip${late ? " late" : ""}">${late ? t("hcLateTip") : t("hcEdit")}</div>`;
    hcEl.classList.remove("hidden");
  }
  /* uvijek drži CIJELU karticu u ekranu — flip iznad kursora pa klanjanje na rubove */
  const W = hcEl.offsetWidth || 328, H = hcEl.offsetHeight || 220;
  let left = Math.max(8, Math.min(ev.clientX + 14, innerWidth - W - 12));
  let top = ev.clientY + 16;
  if (top + H > innerHeight - 8) top = ev.clientY - H - 12;   // nema mjesta dolje -> iznad
  top = Math.max(8, Math.min(top, innerHeight - H - 8));      // nikad van ekrana (gore/dolje)
  hcEl.style.left = left + "px";
  hcEl.style.top = top + "px";
}
$("#tlScroll").addEventListener("mousemove", e => {
  drSuppressHover = false;   // stvarni pomak miša -> dopusti hover-prikaz HP/HA aktivnosti
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
/* broj unutar svakog segmenta horizontalne stsložene trake (kao ULAZNE-FAKTURE "po osobi") */
const odjCountPlugin = {
  id: "odjStackCount",
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx; ctx.save();
    ctx.font = "bold 10.5px 'Inter',sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(2,6,23,.9)"; ctx.shadowBlur = 3;
    chart.data.datasets.forEach((dset, di) => {
      const meta = chart.getDatasetMeta(di);
      if (!meta || meta.hidden) return;
      meta.data.forEach((bar, i) => {
        const val = dset.data[i];
        if (!val) return;
        const base = bar.base != null ? bar.base : 0;
        if (Math.abs(bar.x - base) < 14) return;   // pretanak segment -> ne crtaj broj
        ctx.fillStyle = "#fff";
        ctx.fillText(String(val), (bar.x + base) / 2, bar.y);
      });
    });
    ctx.shadowBlur = 0; ctx.restore();
  },
};
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
  const C = (id, cfg) => { const el = $(id); if (el) charts[id] = new Chart(el, cfg); };   // null-safe: graf može biti uklonjen iz HTML-a
  const taskOf = s => DATA.tasks.find(t => t.id === s.task_id);

  const STATUSI = ["završeno", "otvoreno"];
  C("#chStatus", { type: "doughnut", data: {
      labels: STATUSI.map(stT),
      datasets: [{ data: STATUSI.map(c),
        backgroundColor: ["#10b981", "#ef4444"],
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
  C("#chOdjel", { type: "bar",
    data: {
      labels: odj.map(tOdjel),
      datasets: [
        { label: stT("završeno"), data: byOdj("završeno"), backgroundColor: "#10b981", borderRadius: 4, borderWidth: 0 },
        { label: stT("otvoreno"), data: byOdj("otvoreno"), backgroundColor: "#ef4444", borderRadius: 4, borderWidth: 0 }] },
    plugins: [odjCountPlugin],
    options: {
      indexAxis: "y",                 // horizontalne trake: odjel lijevo, traka slijeva nadesno
      maintainAspectRatio: false,
      onHover: chartCursor,
      onClick: (e, els) => {
        if (!els.length) return;
        const o = odj[els[0].index];
        F.odj.has(o) ? F.odj.delete(o) : F.odj.add(o);
        renderAll();
        flashSegs(s => { const t = taskOf(s); return t && t.odjel === o; });
      },
      scales: {
        x: { stacked: true, beginAtZero: true,
             grid: { color: "rgba(148,163,184,.08)" },
             ticks: { precision: 0, color: "#cbd5e1", font: { size: 10.5, weight: "600" } } },
        y: { stacked: true, grid: { display: false },
             ticks: { color: "#e2e8f0", font: { size: 11, weight: "700" } } } },
      plugins: { legend: { position: "right",
        labels: { color: "#cbd5e1", boxWidth: 12, boxHeight: 12, padding: 8, font: { size: 11, weight: "600" } } } } } });

  const eskSegs = DATA.segments.filter(s => s.eskalacija);
  const rows = eskSegs.map(s => {
    const tk = DATA.tasks.find(x => x.id === s.task_id) || {};
    const d = DATA.dps.find(x => x.id === tk.dp_id) || {};
    return `<tr><td>${d.pop || ""} · ${d.naziv || ""}</td><td>${esc(tAkt(tk.aktivnost || ""))}</td>
      <td>${fmt(s.datum_od)} – ${fmt(s.datum_do)}</td><td>${stT(s.status)}</td>
      <td class="tag-esk">${esc(s.esk_razlog || "—")}</td><td>${esc(s.komentar || "")}</td></tr>`;
  }).join("");
  /* prazno -> tanak jednoredni prikaz (ne troši prostor); ima eskalacija -> puna tabela */
  $("#eskPanel").innerHTML = eskSegs.length
    ? `<h3>${t("eskTitle")}</h3>
       <table class="mini"><tr><th>${t("thDp")}</th><th>${t("thAkt")}</th><th>${t("thTermin")}</th>
       <th>${t("thStatus")}</th><th>${t("thRazlog")}</th><th>${t("thKomentar")}</th></tr>${rows}</table>`
    : `<div class="esk-empty"><b>${t("eskTitle")}</b> · ${t("noEsk")}</div>`;
}

/* ---------- projekat (Daily, Azure) — filteri + statistika + DP-ovi ---------- */
/* dateTotals: Σ po projektu suženo na Datum od/do (učita se s /api/projects/totals);
   dateKey: ključ raspona za keš (da ne dohvaćamo isto dvaput) */
const PROJ = { rows: [], sync: null, kunde: "", code: "", name: "", pm: "", dateTotals: null, dateKey: "" };
const ZERO_TOT = { hp: 0, trasa_m: 0, ha_m: 0, ha_stck: 0, montaza: 0, datum_od: "", datum_do: "" };
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
/* HP/Trasa/HA/Montaža po projektu suženi na Datum od/do (server sumira project_daily).
   Bez raspona -> dateTotals=null pa kartice koriste pune projektne totale (kao prije). */
async function refreshDateTotals() {
  const od = F.dOd, do_ = F.dDo;
  if (!od && !do_) { PROJ.dateTotals = null; PROJ.dateKey = ""; return; }
  const key = od + "|" + do_;
  if (PROJ.dateKey === key && PROJ.dateTotals) return;   // već dohvaćeno za isti raspon
  try {
    const qs = new URLSearchParams();
    if (od) qs.set("od", od);
    if (do_) qs.set("do", do_);
    const d = await api("/api/projects/totals?" + qs.toString());
    /* anti-race: ako se raspon promijenio dok je upit bio u letu (npr. brzo
       biranje od pa do), odbaci zastarjeli odgovor — vrijedi samo trenutni */
    if (F.dOd !== od || F.dDo !== do_) return;
    const m = new Map();
    for (const r of d.totals) m.set(r.projektname, r);
    PROJ.dateTotals = m; PROJ.dateKey = key;
  } catch (e) { PROJ.dateTotals = null; PROJ.dateKey = ""; }
}
function projFiltered() {
  return PROJ.rows.filter(p =>
    (!PROJ.kunde || p.kunde === PROJ.kunde) &&
    (!PROJ.code || p.projectcode === PROJ.code) &&
    (!PROJ.name || p.projektname === PROJ.name) &&
    (!PROJ.pm || ownerNameOf(p.projektname) === PROJ.pm));
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
  syncCombo("pfPm", PROJ.pm);

  const s = PROJ.sync || {};
  $("#projMeta").textContent =
    s.status === "u toku" ? t("syncUToku") :
    s.status === "greška" ? `${t("syncGreska")}: ${s.error || ""}` :
    s.time ? `${t("syncLbl")} ${s.time.replace("T", " ")}` : "";

  renderProjClaim();

  const f = projFiltered();
  /* kad je Datum od/do aktivan -> HP/Trasa/HA/Montaža se sumiraju u tom rasponu
     (po projektu iz project_daily); inače puni projektni totali */
  const dateOn = !!(F.dOd || F.dDo) && PROJ.dateTotals;
  const tot = p => dateOn ? (PROJ.dateTotals.get(p.projektname) || ZERO_TOT) : p;
  const sum = k => f.reduce((a, p) => a + (tot(p)[k] || 0), 0);
  const lastWork = f.map(p => tot(p).datum_do).filter(Boolean).sort().pop();
  const active = PROJ.kunde || PROJ.code || PROJ.name;
  const title = PROJ.name ? esc(PROJ.name)
    : active ? `${f.length} ${t("projekata")} (${t("filterLbl")})`
    : `${t("sviProjekti")} (${f.length})`;

  const card = (cls, val, lbl) =>
    `<div class="kpi ${cls}"><div class="num">${val}</div><div class="lbl">${lbl}</div></div>`;
  /* plan (Σ HP/HA s DP-ova) vs izvedeno (Azure Daily) — kad je izabran projekat */
  let pv = "";
  if (PROJ.name && f[0]) {
    const dpsOf = DATA.dps.filter(d => d.projekt === PROJ.name);
    /* uz Datum raspon plan se raspoređuje na taj prozor (isto kao izvedeno) -> pošten % */
    const planHP = dateOn ? dpsOf.reduce((a, d) => a + plannedInWindow(d.id, false, F.dOd, F.dDo), 0)
                          : dpsOf.reduce((a, d) => a + (d.hp || 0), 0);
    const planHA = dateOn ? dpsOf.reduce((a, d) => a + plannedInWindow(d.id, true, F.dOd, F.dDo), 0)
                          : dpsOf.reduce((a, d) => a + (d.ha || 0), 0);
    const pvBar = (lbl, act, plan) => {
      const pct = plan ? Math.round(act / plan * 100) : 0;   // stvarni % (može biti >100)
      const w = Math.min(100, pct);                          // traka ne prelazi punu širinu
      const over = pct > 100;                                // izvedeno > plan -> plan je podcijenjen (npr. DP-ovi bez HP/HA)
      return `<div class="pv-row"><span class="pv-lbl">${lbl}</span>
        <span class="pv-bar${over ? " over" : ""}"><i style="width:${plan ? w : 0}%"></i></span>
        <span class="pv-num">${t("vsIst")} ${fmtNum(act)} · ${t("vsPlan")} ${fmtNum(plan)} <b${over ? ' class="pv-over"' : ""}>${plan ? pct + "%" : "—"}</b></span></div>`;
    };
    pv = `<div class="pv-wrap" title="${esc(t("planVsTip"))}"><h4>${t("planVs")}</h4>
      ${pvBar("HP", tot(f[0]).hp || 0, planHP)}
      ${pvBar("HA", tot(f[0]).ha_stck || 0, planHA)}
      <span class="hint">${t("planVsHint")}</span></div>`;
  }
  /* --- KPI kartice projekta -> idu u sekciju Analitika --- */
  $("#projKpis").innerHTML = `<div class="proj-title">${title}
      ${PROJ.name && f[0] ? `<span class="proj-sub">${esc(f[0].kunde)} · code ${esc(f[0].projectcode)}</span>` : ""}
      ${dateOn ? `<span class="proj-range">${fmt(F.dOd) || "…"} – ${fmt(F.dDo) || "…"}</span>` : ""}
    </div>
    <div class="kpis proj-kpis">
      ${card("purple", fmtNum(sum("hp")), "HP")}
      ${card("blue", fmtNum(sum("trasa_m")), t("trasa"))}
      ${card("teal", fmtNum(sum("ha_m")), t("haM"))}
      ${card("teal", fmtNum(sum("ha_stck")), t("haKom"))}
      ${card("amber", fmtNum(sum("montaza")), t("montaza"))}
      ${card("grey", lastWork ? fmt(lastWork) : "—", t("zadnjiRad"))}
    </div>${pv}`;

  /* "+ Novi POP" / "+ Novi DP" su UVIJEK otključani — dijalog vodi kroz
     kaskadu Kunde → Projekat (→ POP); izabrani filteri su samo prijedlog */
  const pname = effProjName();
  const bPop = $("#btnAddPopTop"), bDp = $("#btnAddDp");
  if (bPop) { bPop.disabled = false; bPop.title = pname ? `→ ${pname}` : ""; }
  if (bDp) { bDp.disabled = false; bDp.title = pname ? `→ ${pname}` : ""; }
}
/* prijedlog projekta za dijaloge: izabrani, ili jedini u filteru */
function effProjName() {
  if (PROJ.name) return PROJ.name;
  const f = projFiltered();
  return (PROJ.kunde || PROJ.code) && f.length === 1 ? f[0].projektname : null;
}
/* ---------- kaskada Kunde → Projekat (→ POP) za dijaloge kreiranja ----------
   Azure projekti + "siročići" koji postoje samo na POP/DP zapisima (kunde "—") */
function projRowsAll() {
  const known = new Set(PROJ.rows.map(p => p.projektname));
  const orphan = [...new Set([...DATA.pops, ...DATA.dps]
    .map(x => x.projekt).filter(p => p && !known.has(p)))]
    .map(p => ({ projektname: p, kunde: "—" }));
  return PROJ.rows.concat(orphan);
}
function kundeOptions() {
  return [...new Set(projRowsAll().map(p => p.kunde || "—"))].sort(cmpStr);
}
function projOptions(kunde) {
  return [...new Set(projRowsAll()
    .filter(p => !kunde || (p.kunde || "—") === kunde)
    .map(p => p.projektname).filter(Boolean))].sort(cmpStr);
}
function kundeOf(projekt) {
  const r = projRowsAll().find(p => p.projektname === projekt);
  return r ? (r.kunde || "—") : "";
}
function popOptions(projekt) {
  return [...new Set(DATA.pops
    .filter(p => !projekt || p.projekt === projekt)
    .map(p => p.naziv).filter(Boolean))].sort(cmpStr);
}

/* ---------- searchable picker (kucaš -> filtrira; ▾ otvara sve) ----------
   allowNew=true (POP polje): dozvoljava upis posve novog naziva */
function makePicker(root, { onPick, allowNew = false, placeholder = "" } = {}) {
  const inp = root.querySelector(".pick-in");
  const list = root.querySelector(".pick-list");
  const cv = root.querySelector(".pick-cv");
  let committed = "", getOpts = () => [];
  inp.placeholder = placeholder;
  const value = () => allowNew ? inp.value.trim() : committed;

  function render(q) {
    const ql = (q || "").trim().toLowerCase();
    const all = getOpts();
    const hits = ql ? all.filter(o => o.toLowerCase().includes(ql)) : all;
    let html = hits.slice(0, 80).map(o => {
      const i = ql ? o.toLowerCase().indexOf(ql) : -1;
      const lbl = i >= 0
        ? esc(o.slice(0, i)) + "<b>" + esc(o.slice(i, i + ql.length)) + "</b>" + esc(o.slice(i + ql.length))
        : esc(o);
      return `<div class="pick-opt${o === committed ? " sel" : ""}" data-v="${esc(o)}">${lbl}</div>`;
    }).join("");
    const exact = all.some(o => o.toLowerCase() === ql);
    if (allowNew && ql && !exact)
      html += `<div class="pick-opt pick-new" data-v="${esc(q.trim())}">＋ „${esc(q.trim())}"</div>`;
    if (!html) html = `<div class="pick-empty">${t("nemaRez")}</div>`;
    list.innerHTML = html;
    list.hidden = false;
    root.classList.add("open");
  }
  function close() { list.hidden = true; root.classList.remove("open"); }
  function commit(v, fire = true) {
    committed = v || "";
    inp.value = committed;
    close();
    if (fire && onPick) onPick(committed);
  }

  inp.addEventListener("focus", () => { if (!inp.disabled) render(inp.value); });
  inp.addEventListener("input", () => { render(inp.value); if (allowNew && onPick) onPick(value()); });
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = list.querySelector(".pick-opt");
      if (first) commit(first.dataset.v);
      else if (allowNew && inp.value.trim()) { close(); if (onPick) onPick(value()); }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const opts = [...list.querySelectorAll(".pick-opt")];
      if (!opts.length) return;
      let i = opts.findIndex(o => o.classList.contains("act"));
      opts.forEach(o => o.classList.remove("act"));
      i = e.key === "ArrowDown" ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length;
      opts[i].classList.add("act");
      opts[i].scrollIntoView({ block: "nearest" });
    }
  });
  inp.addEventListener("blur", () => setTimeout(() => {
    close();
    if (!allowNew) inp.value = committed;   // bez allowNew: vrati na potvrđeno
  }, 160));
  list.addEventListener("pointerdown", e => {
    const o = e.target.closest(".pick-opt");
    if (!o) return;
    e.preventDefault();
    commit(o.dataset.v);
  });
  cv.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (inp.disabled) return;
    if (list.hidden) { inp.focus(); render(""); } else close();
  });

  return {
    get: value,
    set(v, fire = false) { commit(v, fire); },
    options(fn) { getOpts = typeof fn === "function" ? fn : () => fn; },
    enable(on) { inp.disabled = !on; root.classList.toggle("disabled", !on); },
    glow(on) { root.classList.toggle("glow-req", on); },
    focus() { inp.focus(); },
    isOpen() { return !list.hidden; },
    closeList: close,
    inp,
  };
}

/* prvi prazan obavezan korak SVIJETLI + dobija fokus; daljnji su zaključani.
   Ujedno crta korakovni indikator (Kunde › Projekat › POP). */
function refreshCascade(cfg) {
  let blocked = false, focusP = null;
  const states = cfg.pickers.map(p => {
    p.enable(!blocked);
    const v = p.get();
    const cur = !blocked && !v;
    p.glow(cur);
    if (cur && !focusP) focusP = p;
    const st = v ? "done" : (cur ? "cur" : "wait");
    if (!v) blocked = true;
    return st;
  });
  if (cfg.steps) cfg.steps.innerHTML = cfg.labels.map((lbl, i) =>
    `<span class="dstep ${states[i]}"><b>${states[i] === "done" ? "✓" : i + 1}</b>${esc(lbl)}</span>`
  ).join('<i class="dstep-sep">›</i>');
  return focusP;
}
/* napuni picker; ako je samo jedna opcija -> auto-izaberi (manje klikova) */
function loadPicker(picker, opts, preferred) {
  picker.options(opts);
  const pick = opts.includes(preferred) ? preferred : (opts.length === 1 ? opts[0] : "");
  picker.set(pick);
}

/* ---------- pickeri za dijaloge (instanciraju se jednom) ---------- */
const POPK = {}, DPK = {};
const POP_CFG = { get pickers() { return [POPK.kunde, POPK.projekt]; },
  steps: null, labels: ["Kunde", "Projekat"] };
const DP_CFG = { get pickers() { return [DPK.kunde, DPK.projekt, DPK.pop]; },
  steps: null, labels: ["Kunde", "Projekat", "POP"] };

function initDialogPickers() {
  POP_CFG.steps = $("#popSteps"); POP_CFG.labels = [t("kunde"), t("projekat")];
  DP_CFG.steps = $("#dpSteps");  DP_CFG.labels = [t("kunde"), t("projDaily"), "POP"];

  POPK.kunde = makePicker($("#popKunde"), { placeholder: t("kundePh"), onPick() {
    loadPicker(POPK.projekt, projOptions(POPK.kunde.get()), "");
    const f = refreshCascade(POP_CFG);
    (f && f !== POPK.kunde ? f : { focus: () => $("#frmPop [name=naziv]").focus() }).focus();
  } });
  POPK.projekt = makePicker($("#popProj"), { placeholder: t("projPh"), onPick() {
    refreshCascade(POP_CFG); $("#frmPop [name=naziv]").focus();
  } });

  DPK.kunde = makePicker($("#dpKunde"), { placeholder: t("kundePh"), onPick() {
    loadPicker(DPK.projekt, projOptions(DPK.kunde.get()), "");
    DPK.pop.options(() => popOptions(DPK.projekt.get())); DPK.pop.set("");
    const f = refreshCascade(DP_CFG);
    if (f && f !== DPK.kunde) f.focus();
  } });
  DPK.projekt = makePicker($("#dpProj"), { placeholder: t("projPh"), onPick() {
    DPK.pop.options(() => popOptions(DPK.projekt.get())); DPK.pop.set("");
    const f = refreshCascade(DP_CFG);
    if (f && f !== DPK.projekt) f.focus();
    dpRfaSync();
  } });
  DPK.pop = makePicker($("#dpPop"), { allowNew: true, placeholder: t("popNovPh"), onPick() {
    refreshCascade(DP_CFG); dpRfaSync();
  } });
}

/* RFA polje u DP dijalogu se prikazuje samo kad se kuca NOVI POP naziv
   (postojeći POP već ima svoj RFA; pod-POP kontekst je zaključan) */
function dpRfaSync() {
  const row = $("#dpRfaRow");
  if (!row) return;
  const underExisting = !!$("#dpPopId").value;
  const proj = DPK.projekt.get();
  const popName = (DPK.pop.get() || "").trim();
  const exists = popName && DATA.pops.some(p => p.naziv === popName && p.projekt === proj);
  row.classList.toggle("hidden", underExisting || !popName || exists);
}

/* "+ Novi POP" — uvijek dostupan; Kunde/Projekat predloženi iz filtera */
function openPopDialog() {
  $("#frmPop").reset();
  POP_CFG.labels = [t("kunde"), t("projekat")];
  POPK.kunde.inp.placeholder = t("kundePh");
  POPK.projekt.inp.placeholder = t("projPh");
  const pref = effProjName() || "";
  const kunde = pref ? kundeOf(pref) : (PROJ.kunde || "");
  loadPicker(POPK.kunde, kundeOptions(), kunde);
  loadPicker(POPK.projekt, projOptions(POPK.kunde.get()), POPK.kunde.get() ? pref : "");
  const f = refreshCascade(POP_CFG);
  $("#dlgPop").showModal();
  setTimeout(() => (f ? f.focus() : $("#frmPop [name=naziv]").focus()), 30);
}
/* promjena projekt-filtera mijenja i opseg DP/POP svuda -> renderAll */
function projFilterChanged() {
  if (PROJ.name && !projFiltered().length) PROJ.name = "";
  F.dp.clear();             // stari DP izbor možda više nije u opsegu
  SEL = null; closeDrawer();
  renderAll();
}

/* ---------- izbor POP/DP -> drawer s historijom (BEZ sužavanja tabele) ----------
   Klik/zakazivanje SAMO otvori panel i istakne red; tabela se NE filtrira na taj
   POP/DP (prije se filtrirala pa "odfiltrirala" pri zatvaranju -> skok na prvi DP).
   Projekat+Kunde kontekst se postavi (ostaje i po zatvaranju, ne uzrokuje skok). */
function selectPop(popId) {
  const p = DATA.pops.find(x => x.id === popId);
  if (!p) return;
  if (SEL && SEL.type === "pop" && SEL.id === popId) { deselect(); return; }   // ponovni klik = zatvori
  SEL = { type: "pop", id: popId };
  drFocusTask = null; drFocusLock = false; drSuppressHover = true;   // novi izbor -> HP/HA = UKUPNO DP dok miš stvarno ne pređe preko aktivnosti
  fillProjFilter(p.projekt);
  openDrawer();
  renderAll();
}
/* klik na DP/POP popunjava i Projekat + Kunde filter iz pripadnosti */
function fillProjFilter(projekt) {
  if (!projekt) return;
  const pr = PROJ.rows.find(p => p.projektname === projekt);
  if (!pr) return;
  PROJ.name = pr.projektname;
  PROJ.kunde = pr.kunde || "";
}
/* poslije kreiranja: filtriraj tabelu SAMO na novi POP/DP (lakša koncentracija) */
function focusNew({ dpId, popNaziv, projekt }) {
  F.dp.clear(); F.pop.clear(); F.st.clear(); F.odj.clear();
  F.esk = false; F.kasni = false; F.dOd = F.dDo = "";
  clearDate("fDateOd"); clearDate("fDateDo");
  PROJ.name = PROJ.kunde = PROJ.code = PROJ.pm = "";
  if (projekt) fillProjFilter(projekt);
  if (dpId) F.dp.add(dpId);
  else if (popNaziv) F.pop.add(popNaziv);
  renderAll();
}
function selectDp(dpId) {
  if (SEL && SEL.type === "dp" && SEL.id === dpId) { deselect(); return; }   // ponovni klik = zatvori
  SEL = { type: "dp", id: dpId };
  drFocusTask = null; drFocusLock = false; drSuppressHover = true;   // novi izbor -> HP/HA = UKUPNO DP dok miš stvarno ne pređe preko aktivnosti
  const d = DATA.dps.find(x => x.id === dpId);
  fillProjFilter(d && d.projekt);
  openDrawer();
  renderAll();   // istakni izabrani DP (.sel), bez sužavanja tabele na samo njega
}
function closeDrawer() { $("#drawer").classList.remove("open"); }
/* zatvaranje panela (Esc/✕): SAMO zatvori panel i skini isticanje reda.
   Ne dira filtere ni skrol -> tabela ostaje gdje jest (nema skoka na prvi DP).
   (Projekat/Kunde i eventualni ručni filteri ostaju netaknuti.) */
function deselect() {
  SEL = null;
  closeDrawer();
  renderAll();
}
/* rad unutar DP-a (crtanje/uređivanje termina) automatski otvara njegov panel */
function ensureDpSelected(taskId) {
  const tk = DATA.tasks.find(x => x.id === taskId);
  if (!tk) return;
  if (SEL && SEL.type === "dp" && SEL.id === tk.dp_id) return;
  selectDp(tk.dp_id);
}
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
  $("#drHp").readOnly = $("#drHa").readOnly = false;
  const numScope = $("#drNumsScope"); if (numScope) numScope.textContent = "";
  /* HP/HA se vode na DP-u — sakrij editor za POP; reset prikaza (DP ukupno) */
  const nums = $(".dr-nums"); if (nums) { nums.classList.remove("act", "ph-hp", "ph-ha"); nums.classList.toggle("hidden", SEL.type === "pop"); }
  /* ako je aktivnost trenutno fokusirana (hover/editor), zadrži njen HP/HA udio */
  if (SEL.type === "dp" && drFocusTask != null) drNumsForTask(drFocusTask);
  /* RFA se vodi na POP-u — editor samo na POP panelu */
  const rfaWrap = $("#drRfaWrap");
  if (SEL.type === "pop") {
    const p = DATA.pops.find(x => x.id === SEL.id);
    $("#drRfa").value = (p && p.rfa) || "";
    $("#drRfa").disabled = !(p && canEditProjekt(p.projekt));
    $("#drRfaNote").textContent = p && p.rfa ? t("rfaNote") : t("rfaMissing");
    $("#drRfaNote").classList.toggle("warn", !(p && p.rfa));
    rfaWrap.classList.remove("hidden");
  } else {
    rfaWrap.classList.add("hidden");
  }
  $("#drawer").classList.add("open");
  renderDrawerStats();
  renderDrawerPlan();
  loadComments();
  loadDrawerHist();
}

/* ---------- komandni centar: napredak + rok + aktivnosti + komentari ---------- */
function drawerTaskIds() {
  if (!SEL) return new Set();
  if (SEL.type === "dp")
    return new Set(DATA.tasks.filter(t => t.dp_id === SEL.id).map(t => t.id));
  const dpIds = new Set(DATA.dps.filter(d => d.pop_id === SEL.id).map(d => d.id));
  return new Set(DATA.tasks.filter(t => dpIds.has(t.dp_id)).map(t => t.id));
}
function renderDrawerStats() {
  const ids = drawerTaskIds();
  const segs = DATA.segments.filter(s => ids.has(s.task_id));
  const lateN = segs.filter(segLate).length;
  /* napredak po AKTIVNOSTI: gotova tek kad joj je zadnja traka završena; aktivnost
     bez trake = nije gotova -> DP nije 100% dok sve aktivnosti nisu odrađene */
  const byT = {};
  segs.forEach(s => (byT[s.task_id] ||= []).push(s));
  const total = ids.size;
  const done = [...ids].filter(id => taskComplete(byT[id])).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  let rokHtml = "";
  if (SEL && SEL.type === "dp") {
    const aktT = DATA.tasks.find(tk => tk.dp_id === SEL.id && /aktivacij/i.test(tk.aktivnost));
    const rokSegs = aktT ? segs.filter(s => s.task_id === aktT.id) : [];
    const rok = rokSegs.length ? rokSegs.map(s => s.datum_do).sort().pop() : "";
    if (rok) {
      const diff = Math.round((new Date(rok) - new Date(todayIso())) / 864e5);
      const lateR = diff < 0 && pct < 100;
      rokHtml = `<div class="drs-rok${lateR ? " late" : ""}">
        <i>${t("rokLbl")} · ${tAkt("Aktivacije")}</i>
        <b>${fmt(rok)} · KW${isoWeekOf(rok)}</b>
        <em>${diff < 0 ? `${t("rokProsao")} ${-diff} ${t("dana")}` : `${t("rokZa")} ${diff} ${t("dana")}`}</em>
      </div>`;
    }
  }
  const C = 125.7, dash = (pct / 100 * C).toFixed(1);
  $("#drStats").innerHTML = `
    <div class="drs-ring">
      <svg viewBox="0 0 48 48" width="54" height="54" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/>
        <circle cx="24" cy="24" r="20" fill="none" stroke="#10b981" stroke-width="5"
          stroke-dasharray="${dash} ${C}" stroke-linecap="round" transform="rotate(-90 24 24)"
          style="transition:stroke-dasharray .6s cubic-bezier(.2,.8,.25,1)"/>
        <text x="24" y="28" text-anchor="middle" font-size="11" font-weight="700" fill="#34d399">${pct}%</text>
      </svg>
      <div class="drs-info"><i>${t("napredak")}</i><b>${done} / ${total} ${t("gotovo")}</b>
        ${lateN ? `<em class="drs-late">${lateN} ${t("kasniChip")}</em>` : ""}</div>
    </div>${rokHtml}`;
  $("#drShift").innerHTML = segs.length ? `
    <span class="ds-lbl">${t("pomjeriSve")}:</span>
    <button class="btn sm" data-shift="-7">◀ −1 KW</button>
    <button class="btn sm" data-shift="7">+1 KW ▶</button>` : "";
  $$("#drShift [data-shift]").forEach(b =>
    b.addEventListener("click", () => shiftAll(+b.dataset.shift)));
  /* upozorenje: aktivacije planirane prije RFA datuma POP-a */
  const warnBox = $("#drWarn");
  if (warnBox) {
    let conf = [], rfa = "";
    if (SEL.type === "pop") { conf = rfaConflicts(SEL.id); rfa = popRfaOf(SEL.id); }
    else {
      const dp = DATA.dps.find(d => d.id === SEL.id);
      const st = dp ? dpRfaBreach(dp) : "";
      if (st) { conf = [{ dp: dp.naziv, datum: st }]; rfa = popRfaOf(dp.pop_id); }
    }
    if (conf.length) {
      warnBox.innerHTML = `<div class="drw-h">${ICON.warn} ${t("rfaWarnTitle")}</div>` +
        conf.map(c => `<div class="drw-row">${esc(tf("rfaConfLine", c.dp, fmt(c.datum), fmt(rfa)))}</div>`).join("");
      warnBox.classList.remove("hidden");
    } else { warnBox.innerHTML = ""; warnBox.classList.add("hidden"); }
  }
}
/* raspodjela DP-ovog HP/HA po terminima — auto (linearno) + ručni override po terminu */
function renderDrawerPlan() {
  const box = $("#drPlan");
  if (!box) return;
  if (!SEL || SEL.type !== "dp") { box.innerHTML = ""; box.classList.add("hidden"); return; }
  const dp = DATA.dps.find(d => d.id === SEL.id);
  if (!dp) { box.innerHTML = ""; box.classList.add("hidden"); return; }
  const editable = canEditProjekt(dp.projekt);
  const phase = (ha) => {
    const segs = dpPhaseSegs(SEL.id, ha).slice().sort((a, b) => a.datum_od < b.datum_od ? -1 : 1);
    if (!segs.length) return "";
    const alloc = planAlloc(SEL.id, ha);
    const total = +dp[ha ? "ha" : "hp"] || 0;
    let manualSum = 0;
    segs.forEach(s => { if (hasManual(s)) manualSum += Math.max(0, +s.plan_qty || 0); });
    const auto = Math.max(0, total - manualSum);
    const rows = segs.map(s => {
      const tk = DATA.tasks.find(t => t.id === s.task_id) || {};
      const autoVal = Math.round(alloc.get(s.id) || 0);
      const man = hasManual(s);
      return `<label class="dpp-row${man ? " man" : ""}">
        <span class="dpp-dot" style="background:${aktColor(tk.aktivnost)}"></span>
        <span class="dpp-akt">${esc(tAkt(tk.aktivnost || ""))}</span>
        <span class="dpp-dt">${fmtShort(s.datum_od)}–${fmtShort(s.datum_do)}</span>
        <input class="dpp-in" type="number" min="0" step="1" data-seg="${s.id}"
          placeholder="${autoVal}" value="${man ? Math.round(+s.plan_qty || 0) : ""}"${editable ? "" : " disabled"}>
      </label>`;
    }).join("");
    return `<div class="dpp-phase">
      <div class="dpp-h"><b>${ha ? "HA" : "HP"}</b>
        <span class="dpp-sum">${t("planRucno")} ${fmtNum(manualSum)} · ${t("planAuto")} ${fmtNum(auto)} / ${fmtNum(total)}</span></div>
      ${rows}</div>`;
  };
  const hpH = phase(false), haH = phase(true);
  if (!hpH && !haH) { box.innerHTML = ""; box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  box.innerHTML = `<h4>${t("planTitle")} <i class="dpp-tip">${t("planHint")}</i></h4>${hpH}${haH}`;
  box.querySelectorAll(".dpp-in").forEach(inp =>
    inp.addEventListener("change", () => savePlanQty(+inp.dataset.seg, inp.value)));
}
async function savePlanQty(segId, raw) {
  const s = DATA.segments.find(x => x.id === segId);
  if (!s) return;
  const dp = SEL && SEL.type === "dp" && DATA.dps.find(d => d.id === SEL.id);
  if (dp && !canEditProjekt(dp.projekt)) { lockToast(dp.projekt); return renderDrawerPlan(); }
  const val = String(raw).trim() === "" ? null : Math.max(0, Math.round(+raw || 0));
  const old = s.plan_qty ?? null;
  s.plan_qty = val;                 // optimistično -> odmah osvježi raspodjelu i KPI
  renderDrawerPlan(); renderKpis();
  try { await api(`/api/segments/${segId}`, "PATCH", { plan_qty: val }); }
  catch (e) { s.plan_qty = old; renderDrawerPlan(); renderKpis(); handleApiErr(e); }
}
async function shiftAll(days) {
  const ids = drawerTaskIds();
  const segs = DATA.segments.filter(s => ids.has(s.task_id));
  if (!segs.length) return;
  const dp = SEL && SEL.type === "dp" && DATA.dps.find(d => d.id === SEL.id);
  if (dp && !canEditProjekt(dp.projekt)) return lockToast(dp.projekt);
  if (!await uiConfirm(`${t("pomjeriSve")}: ${segs.length} × ${days > 0 ? "+" : ""}${days}d?`)) return;
  try {
    for (const s of segs) {
      await api(`/api/segments/${s.id}`, "PATCH",
        { datum_od: addDays(s.datum_od, days), datum_do: addDays(s.datum_do, days) });
    }
  } catch (e) { await load(); return handleApiErr(e); }
  const moved = segs.map(s => s.id);
  pushUndo({ label: t("pomjeriSve"), run: async () => {
    for (const id of moved) {
      const x = DATA.segments.find(y => y.id === id);
      if (x) await api(`/api/segments/${id}`, "PATCH",
        { datum_od: addDays(x.datum_od, -days), datum_do: addDays(x.datum_do, -days) });
    }
  } });
  await load();
}
/* AKTIVNOSTI lista uklonjena iz panela — duplirala je tabelu (svaka aktivnost je
   već red u timelineu sa statusom/datumima; status se mijenja duplim klikom na traku). */
async function loadComments() {
  const wrap = $("#drCommentsWrap");
  if (!SEL || SEL.type !== "dp") { wrap.classList.add("hidden"); return; }
  wrap.classList.remove("hidden");
  const key = `dp:${SEL.id}`;
  const r = await api(`/api/comments?dp_id=${SEL.id}`);
  if (!r || !SEL || `dp:${SEL.id}` !== key) return;
  $("#drComments").innerHTML = (r.comments || []).length
    ? r.comments.map(c => {
        const [dd, tt] = fmtTsParts(c.ts);
        const ini = (c.user || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
        return `<div class="dc-row">
          <span class="dc-time"><b>${tt}</b><i>${dd}</i></span>
          <div class="dc-b"><span class="dc-t">${esc(c.tekst)}</span>
            <span class="dc-who">${esc(ini)} · ${esc(c.user || "?")}</span></div></div>`;
      }).join("")
    : `<div class="dr-h empty">${t("nemaKom")}</div>`;
}
async function sendComment() {
  const v = $("#drCIn").value.trim();
  if (!v || !SEL || SEL.type !== "dp") return;
  try { await api("/api/comments", "POST", { dp_id: SEL.id, tekst: v }); }
  catch (e) { return handleApiErr(e); }
  $("#drCIn").value = "";
  loadComments();
  histDirty();
}
$("#drCSend").addEventListener("click", sendComment);
$("#drCIn").addEventListener("keydown", e => { if (e.key === "Enter") sendComment(); });
/* drawer prati svježe podatke poslije load(); zatvara se ako je entitet obrisan */
function drawerSync() {
  if (!SEL) return;
  const ok = SEL.type === "pop" ? DATA.pops.some(p => p.id === SEL.id)
                                : DATA.dps.some(d => d.id === SEL.id);
  if (ok) openDrawer();
  else { SEL = null; closeDrawer(); }
}
function histDirty() { if (SEL) loadDrawerHist(); }
/* fokus historije na pojedinu aktivnost: hover (privremeno) ili klik/editor (zaključano) */
let DR_EVENTS = [];
let drFocusTask = null, drFocusLock = false;
/* poslije izbora DP-a re-render izazove "sintetički" mouseenter na red pod kursorom
   (nema stvarnog pomaka miša) -> preskoči TAJ jedan da panel ostane na UKUPNO DP;
   stvarni pomak miša (#tlScroll mousemove) ga očisti pa hover normalno radi. */
let drSuppressHover = false;
function paintDrawerHist() {
  const wrap = $("#drHist");
  if (!wrap) return;
  let evs = DR_EVENTS, focusAkt = null;
  if (drFocusTask != null) {
    const tk = DATA.tasks.find(x => x.id === drFocusTask);
    focusAkt = tk && tk.aktivnost;
    if (focusAkt) evs = DR_EVENTS.filter(e => e.aktivnost === focusAkt);
  }
  const foc = $("#drHistFoc");
  if (foc) foc.textContent = focusAkt ? `· ${tAkt(focusAkt)}${drFocusLock ? " 📌" : ""}` : "";
  wrap.innerHTML = evs.length
    ? evs.map(evRow).join("")
    : `<div class="dr-h empty">${focusAkt ? t("histEmptyAkt") : t("histEmpty")}</div>`;
}
/* planirani udio AKTIVNOSTI = zbir alokacija njenih termina u njenoj fazi
   (HP-faza -> HP, HA-faza Montaža/Aktivacija -> HA; druga veličina je 0) */
function taskPlannedShare(taskId) {
  const tk = DATA.tasks.find(t => t.id === taskId);
  if (!tk) return { hp: 0, ha: 0, phase: "hp" };
  const ha = /montaž|aktiv/i.test(`${tk.aktivnost || ""} ${tk.odjel || ""}`);
  const alloc = planAlloc(tk.dp_id, ha);
  let sum = 0;
  for (const s of DATA.segments) if (s.task_id === taskId) sum += alloc.get(s.id) || 0;
  sum = Math.round(sum);
  return ha ? { hp: 0, ha: sum, phase: "ha" } : { hp: sum, ha: 0, phase: "hp" };
}
/* HP/HA kutije u panelu: prikaži udio AKTIVNOSTI (read-only) dok se ona gleda,
   a UKUPNO DP-a kad se gleda DP. */
function drNumsForTask(taskId) {
  if (!SEL || SEL.type !== "dp") return;
  const tk = DATA.tasks.find(t => t.id === taskId);
  if (!tk || tk.dp_id !== SEL.id) return;   // aktivnost mora pripadati otvorenom DP-u (ne stara/tuđa)
  const hp = $("#drHp"), ha = $("#drHa"), nums = $(".dr-nums"), scope = $("#drNumsScope");
  if (!hp || !ha || document.activeElement === hp || document.activeElement === ha) return;
  const sh = taskPlannedShare(taskId);
  hp.value = sh.hp; ha.value = sh.ha;
  hp.readOnly = ha.readOnly = true;
  if (nums) { nums.classList.add("act"); nums.classList.toggle("ph-ha", sh.phase === "ha"); nums.classList.toggle("ph-hp", sh.phase === "hp"); }
  if (scope) scope.textContent = tk ? `${t("plShare")} · ${tAkt(tk.aktivnost)}` : "";
}
function drNumsForDp() {
  const dp = SEL && SEL.type === "dp" && DATA.dps.find(d => d.id === SEL.id);
  const hp = $("#drHp"), ha = $("#drHa"), nums = $(".dr-nums"), scope = $("#drNumsScope");
  if (!hp || !ha || !dp || document.activeElement === hp || document.activeElement === ha) return;
  hp.value = dp.hp ?? 0; ha.value = dp.ha ?? 0;
  hp.readOnly = ha.readOnly = false;
  if (nums) nums.classList.remove("act", "ph-ha", "ph-hp");
  if (scope) scope.textContent = "";
}
/* hover nad aktivnošću -> fokusiraj njenu historiju + prikaži NJEN HP/HA udio; klik/editor -> zaključaj */
function drHoverTask(taskId) {
  if (drFocusLock || !SEL || SEL.type !== "dp") return;
  if (drSuppressHover) { drSuppressHover = false; return; }   // preskoči sintetički hover poslije izbora DP-a
  const tk = DATA.tasks.find(t => t.id === taskId);
  if (!tk || tk.dp_id !== SEL.id) return;   // samo aktivnosti otvorenog DP-a utiču na panel
  if (drFocusTask === taskId) return;
  drFocusTask = taskId; paintDrawerHist(); drNumsForTask(taskId);
}
function drHoverClear() {
  if (drFocusLock || drFocusTask == null) return;
  drFocusTask = null; paintDrawerHist(); drNumsForDp();
}
function drLockTask(taskId) {   // editor otvoren -> historija + HP/HA ostaju na toj aktivnosti
  drFocusTask = taskId; drFocusLock = true; paintDrawerHist(); drNumsForTask(taskId);
}
function drUnlock() { drFocusLock = false; drFocusTask = null; paintDrawerHist(); drNumsForDp(); }
async function loadDrawerHist() {
  if (!SEL) return;
  const key = `${SEL.type}:${SEL.id}`;
  $("#drHist").innerHTML = `<div class="dr-h empty">${t("histLoad")}</div>`;
  try {
    const r = await api(`/api/history?entity=${SEL.type}&id=${SEL.id}`);
    if (!SEL || `${SEL.type}:${SEL.id}` !== key) return;   // izbor se promijenio
    DR_EVENTS = r.events || [];
    paintDrawerHist();
  } catch {
    DR_EVENTS = [];
    $("#drHist").innerHTML = `<div class="dr-h empty">—</div>`;
  }
}
function fmtTs(ts) {
  const [d, tm] = String(ts).split("T");
  return fmtShort(d) + " " + (tm || "").slice(0, 5);
}
/* esc + datumi (ISO -> dd/mm/yyyy) za vrijednosti historije */
function escD(s) { return esc(fmtDatesIn(s)); }
function evText(e) {
  if (e.kind === "seg")
    return `<em>${esc(tAkt(e.aktivnost))}</em> · ${hcLbl(e.polje)}: ${escD(e.vrijednost)}`;
  const FL = { naziv: t("fNaziv"), lokacija: t("lokacija"), voditelj: t("voditelj"),
    hp: "HP", ha: "HA", pop: "POP", projekt: t("projekat"),
    aktivnost: t("aktivnost"), odjel: t("fOdjel") };
  switch (e.action) {
    case "kreirano": return `${t("aKreirano")}${e.novo ? ` · ${escD(e.novo)}` : ""}`;
    case "obrisano": return `${ICON.trash} ${t("aObrisano")}${e.staro ? ` · ${escD(e.staro)}` : ""}`;
    case "termin obrisan":
      return `${ICON.trash} ${t("aTerminObrisan")} · <em>${esc(e.polje)}</em> ${escD(e.staro)}`;
    case "aktivnost dodana": return `${t("aAktDodana")} · <em>${esc(e.novo)}</em>`;
    case "aktivnost obrisana": return `${ICON.trash} ${t("aAktObrisana")} · <em>${esc(e.staro)}</em>`;
    default:
      return `${FL[e.polje] || esc(e.polje)}: ${escD(e.staro ?? "")} <i class="arr">→</i> ${escD(e.novo ?? "")}`;
  }
}
function fmtTsParts(ts) {
  const [d, tm] = String(ts).split("T");
  return [fmtShort(d), (tm || "").slice(0, 5)];
}
/* zbijen datum: dd/mm hh:mm za tekuću godinu, dd/mm/yy za ranije */
function evWhen(ts) {
  const [d, tm] = String(ts).split("T");
  const [y, m, dd] = (d || "").split("-");
  if (!y) return String(ts);
  const hm = (tm || "").slice(0, 5);
  return y === todayIso().slice(0, 4) ? `${dd}/${m} ${hm}` : `${dd}/${m}/${y.slice(2)} ${hm}`;
}
/* kratko ime: Ime P. */
function shortUser(u) {
  u = (u || "").trim();
  if (!u) return t("nepoznat");
  const p = u.split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : u;
}
/* boja po vrsti akcije — da se na prvi pogled razazna šta se desilo */
function evColor(e) {
  const a = (e.action || "").toLowerCase();
  const p = (e.polje || "").toLowerCase();
  const v = String(e.vrijednost ?? e.novo ?? "").toLowerCase();
  if (/obrisan|brisanj/.test(a) || a === "termin obrisan") return "ev-red";
  if (/kreir|dodan/.test(a) || p === "kreirano") return "ev-green";
  if (p === "status") return /zavr/.test(v) ? "ev-teal" : "ev-amber";
  if (/datum|kraj|rok|od$|do$/.test(p)) return "ev-blue";
  if (/kasni|produ/.test(p)) return "ev-purple";
  if (/eskalac/.test(p)) return "ev-orange";
  return "ev-gray";
}
/* aktivnost (task) na koju se događaj odnosi — za "hover historije = duh na grafu" */
function evTaskId(e) {
  if (e.kind !== "seg" || !e.aktivnost || !SEL) return null;
  const dpId = SEL.type === "dp" ? SEL.id
    : (DATA.dps.find(d => d.pop_id === SEL.id && d.naziv === e.dp_naziv) || {}).id;
  const tk = dpId && DATA.tasks.find(t => t.dp_id === dpId && t.aktivnost === e.aktivnost);
  return tk ? tk.id : null;
}
function evRow(e) {
  /* u POP pogledu označi događaje koji pripadaju pojedinom DP-u */
  const child = SEL && SEL.type === "pop" && (e.kind === "seg" || e.entity === "dp");
  const chLbl = e.kind === "seg" ? e.dp_naziv : e.label;
  const pre = child && chLbl ? `<small class="ch">${esc(chLbl)}</small> ` : "";
  const detail = evText(e);
  /* jedan red: tačka · vrijeme · šta · ko — boja po akciji */
  const plain = `${shortUser(e.user)} · ${detail.replace(/<[^>]+>/g, "")}`;
  /* datumi iz događaja -> hover reda historije iscrta "duh" termina kako je tad bio */
  const isoDates = String(e.kind === "seg" ? e.vrijednost : `${e.staro ?? ""} ${e.novo ?? ""}`)
    .match(/\d{4}-\d{2}-\d{2}/g) || [];
  const tid = evTaskId(e);
  const hov = tid && isoDates.length ? ` data-task="${tid}" data-dates="${isoDates.join(",")}"` : "";
  return `<div class="dr-h ${evColor(e)}${hov ? " hoverable" : ""}" title="${esc(plain)}"${hov}>` +
    `<i class="ev-dot"></i>` +
    `<span class="evt">${evWhen(e.ts)}</span>` +
    `<span class="evx">${pre}${detail}</span>` +
    `<span class="evu">${esc(shortUser(e.user))}</span>` +
    `</div>`;
}
/* duh termina na grafu dok prelaziš mišem preko reda historije (kako je tad bio) */
function clearHistGhost() {
  $$("#tlScroll .histghost").forEach(g => g.remove());
  $$("#tlScroll .tl-row.hist-hl").forEach(r => r.classList.remove("hist-hl"));
}
function histGhost(row) {
  clearHistGhost();
  const tid = +row.dataset.task;
  const dates = (row.dataset.dates || "").split(",").filter(Boolean).sort();
  if (!tid || !dates.length) return;
  const trRow = document.querySelector(`#tlScroll .tl-row[data-task="${tid}"]`);
  const track = trRow && trRow.querySelector(".tl-track");
  if (!track) return;
  const n = daysInYear();
  const ga = Math.max(0, dayIdx(dates[0])), gb = Math.min(n - 1, dayIdx(dates[dates.length - 1]));
  if (gb < 0 || ga > n - 1) return;
  const g = document.createElement("i");
  g.className = "histghost";
  g.style.left = ga * PX + "px";
  g.style.width = Math.max(PX, (gb - ga + 1) * PX) + "px";
  track.appendChild(g);
  trRow.classList.add("hist-hl");
  trRow.scrollIntoView({ block: "nearest" });
}
$("#drHist")?.addEventListener("mouseover", e => {
  const row = e.target.closest(".dr-h.hoverable");
  if (row) histGhost(row); else clearHistGhost();   // prelaz na red bez datuma -> skloni duh
});
$("#drHist")?.addEventListener("mouseleave", clearHistGhost);
/* drawer akcije: HP/HA upis, preimenovanje, brisanje */
async function drNum(k) {
  if (!SEL) return;
  if ($(".dr-nums")?.classList.contains("act")) return;   // prikaz udjela aktivnosti (read-only) -> ne snimaj
  const inp = $(k === "hp" ? "#drHp" : "#drHa");
  const v = Math.round(+inp.value || 0);
  const cur = SEL.type === "pop" ? DATA.pops.find(p => p.id === SEL.id) : DATA.dps.find(d => d.id === SEL.id);
  /* HP/HA se nikad ne snimaju kao 0 -> odbij i vrati staru vrijednost u polje */
  if (v <= 0) { uiAlert(t("hpHaReq"), "warning"); if (cur) inp.value = cur[k]; return; }
  const url = SEL.type === "pop" ? `/api/pops/${SEL.id}` : `/api/dps/${SEL.id}`;
  try { await api(url, "PATCH", { [k]: v }); }
  catch (e) { await load(); return handleApiErr(e); }
  if (cur) cur[k] = v;
  renderAll();
  renderDrawerPlan();    // novi DP total -> ponovo rasporedi auto dio po terminima
  histDirty();
}
$("#drHp").addEventListener("change", () => drNum("hp"));
$("#drHa").addEventListener("change", () => drNum("ha"));
/* RFA datum POP-a — upis/izmjena iz panela */
$("#drRfa").addEventListener("change", async () => {
  if (!SEL || SEL.type !== "pop") return;
  const v = $("#drRfa").value;
  try { await api(`/api/pops/${SEL.id}`, "PATCH", { rfa: v }); }
  catch (e) { await load(); return handleApiErr(e); }
  const p = DATA.pops.find(x => x.id === SEL.id);
  if (p) p.rfa = v;
  $("#drRfaNote").textContent = v ? t("rfaNote") : t("rfaMissing");
  $("#drRfaNote").classList.toggle("warn", !v);
  renderAll();
  renderDrawerStats();
  histDirty();
});
$("#drClose").addEventListener("click", deselect);
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
  try {
    await api(SEL.type === "pop" ? `/api/pops/${SEL.id}` : `/api/dps/${SEL.id}`,
      "PATCH", { naziv: v.trim() });
  } catch (e) { return handleApiErr(e); }
  await load();
});
$("#drDel").addEventListener("click", async () => {
  if (!SEL) return;
  try {
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
      const snap = snapshotDp(d.id);
      await api(`/api/dps/${SEL.id}`, "DELETE");
      F.dp.delete(d.id);
      pushUndo({ label: t("obrisi") + " DP", run: () => restoreDp(snap) });
    }
  } catch (e) { return handleApiErr(e); }
  SEL = null; closeDrawer();
  await load();
});

/* ---------- dijalozi: novi POP / novi DP (pod POP-om ili slobodno) ---------- */
initDialogPickers();

function openDpDialog(popId) {
  $("#frmDp").reset();
  DP_CFG.labels = [t("kunde"), t("projDaily"), "POP"];
  DPK.kunde.inp.placeholder = t("kundePh");
  DPK.projekt.inp.placeholder = t("projPh");
  DPK.pop.inp.placeholder = t("popNovPh");
  const p = popId ? DATA.pops.find(x => x.id === popId) : null;
  $("#dpPopId").value = p ? p.id : "";
  $("#dpUnder").classList.toggle("hidden", !p);
  $("#dpSteps").classList.toggle("hidden", !!p);
  $("#dpKundeRow").classList.toggle("hidden", !!p);
  $("#dpProjRow").classList.toggle("hidden", !!p);
  $("#dpPopRow").classList.toggle("hidden", !!p);
  if (p) {
    /* ＋ DP s POP kartice: kontekst je zaključan, kaskada nije potrebna */
    $("#dpUnder").innerHTML =
      `${esc(p.projekt || "—")} <i>▸</i> <b>${esc(p.naziv)}</b> <i>▸</i> ${t("noviDpH")}`;
    DPK.projekt.options([p.projekt || ""]); DPK.projekt.set(p.projekt || "");
    DPK.kunde.set(kundeOf(p.projekt) || "");
    DPK.pop.options(() => popOptions(p.projekt)); DPK.pop.set(p.naziv);
    DP_CFG.pickers.forEach(pk => { pk.enable(true); pk.glow(false); });
  } else {
    const pref = effProjName() || "";
    const kunde = pref ? kundeOf(pref) : (PROJ.kunde || "");
    loadPicker(DPK.kunde, kundeOptions(), kunde);
    loadPicker(DPK.projekt, projOptions(DPK.kunde.get()), DPK.kunde.get() ? pref : "");
    DPK.pop.options(() => popOptions(DPK.projekt.get()));
    /* tačno jedan POP u filteru, pod izabranim projektom -> predloži ga */
    const selPop = F.pop.size === 1 ? [...F.pop][0] : "";
    DPK.pop.set(selPop && DATA.pops.some(x => x.naziv === selPop && x.projekt === DPK.projekt.get())
      ? selPop : "");
  }
  dpRfaSync();
  $("#dlgDp").showModal();
  if (!p) {
    const f = refreshCascade(DP_CFG);
    setTimeout(() => (f ? f.focus() : $("#frmDp [name=naziv]").focus()), 30);
  } else {
    setTimeout(() => $("#frmDp [name=naziv]").focus(), 30);
  }
}

$("#frmPop").addEventListener("submit", async e => {
  e.preventDefault();
  if (e.submitter && e.submitter.value === "cancel") { $("#dlgPop").close(); return; }
  const projekt = POPK.projekt.get();
  if (!POPK.kunde.get() || !projekt) { refreshCascade(POP_CFG); return; }
  const naziv = $("#frmPop [name=naziv]").value.trim();
  if (!naziv) { $("#frmPop [name=naziv]").focus(); return; }
  const rfa = $("#frmPop [name=rfa]").value;
  if (!rfa) { uiAlert(t("rfaReq"), "warning"); $("#frmPop [name=rfa]").focus(); return; }
  try {
    await api("/api/pops", "POST", { projekt, naziv, rfa });   // RFA na POP-u; HP/HA na DP-u
  } catch {
    uiAlert(t("popPostoji"), "warning");
    return;
  }
  $("#dlgPop").close();
  await load();
  focusNew({ popNaziv: naziv, projekt });   // filtriraj tabelu samo na novi POP
});

$("#frmDp").addEventListener("submit", async e => {
  e.preventDefault();
  if (e.submitter && e.submitter.value === "cancel") { $("#dlgDp").close(); return; }
  const naziv = $("#frmDp [name=naziv]").value.trim();
  if (!naziv) { $("#frmDp [name=naziv]").focus(); return; }
  /* HP i HA se nikad ne snimaju kao 0 */
  const hpV = Math.round(+$("#frmDp [name=hp]").value || 0);
  const haV = Math.round(+$("#frmDp [name=ha]").value || 0);
  if (hpV <= 0 || haV <= 0) {
    uiAlert(t("hpHaReq"), "warning");
    $("#frmDp [name=" + (hpV <= 0 ? "hp" : "ha") + "]").focus();
    return;
  }
  const body = { naziv, hp: hpV, ha: haV };
  const popId = $("#dpPopId").value;
  if (popId) {
    body.pop_id = popId;
  } else {
    body.projekt = DPK.projekt.get();
    body.pop = DPK.pop.get();
    if (!DPK.kunde.get() || !body.projekt || !body.pop) { refreshCascade(DP_CFG); return; }
    // novi POP naziv -> RFA datum je obavezan (kreira se novi POP)
    const newPop = !DATA.pops.some(p => p.naziv === body.pop && p.projekt === body.projekt);
    if (newPop) {
      dpRfaSync();
      const rfa = $("#frmDp [name=rfa]").value;
      if (!rfa) { uiAlert(t("rfaReq"), "warning"); $("#frmDp [name=rfa]").focus(); return; }
      body.rfa = rfa;
    }
  }
  /* spriječi dvostruko kreiranje DP-a istog imena u istom POP-u (instant + prevedeno) */
  const tgtPopId = popId ? +popId
    : (DATA.pops.find(p => p.naziv === body.pop && p.projekt === body.projekt) || {}).id;
  if (tgtPopId && DATA.dps.some(d => d.pop_id === tgtPopId &&
        (d.naziv || "").trim().toLowerCase() === naziv.toLowerCase())) {
    uiAlert(t("dpPostoji"), "warning"); $("#frmDp [name=naziv]").focus(); return;
  }
  let created;
  try { created = await api("/api/dps", "POST", body); }
  catch (err) { return handleApiErr(err); }   // 409 (duplikat) i ostalo -> jasna poruka
  $("#dlgDp").close();
  await load();
  if (created && created.id) {   // filtriraj tabelu samo na novi DP
    const nd = DATA.dps.find(x => x.id === created.id);
    focusNew({ dpId: created.id, projekt: nd && nd.projekt });
  }
});

/* ✕ u zaglavlju dijaloga */
$$(".dlg-x").forEach(b => b.addEventListener("click", () => $("#" + b.dataset.close).close()));
/* Escape: prvo zatvori otvoreni picker-dropdown, NE cijeli dijalog */
$$("#dlgDp, #dlgPop").forEach(d => d.addEventListener("cancel", e => {
  const open = d.querySelector(".pick.open");
  if (open) {
    e.preventDefault();
    open.classList.remove("open");
    open.querySelector(".pick-list").hidden = true;
    open.querySelector(".pick-in").blur();
  }
}));

/* ---------- ULAZNE-style autocomplete: kucaš -> padajuće sugestije ---------- */
function comboOpts(id) {
  if (id === "pfPm")   // Projektleiter = vlasnici (claim) projekata
    return [...new Set(Object.values(DATA.claims || {}).map(o => o.name || o.email).filter(Boolean))].sort(cmpStr);
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
  return id === "pfKunde" ? PROJ.kunde : id === "pfCode" ? PROJ.code
    : id === "pfPm" ? PROJ.pm : PROJ.name;
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
  else if (id === "pfPm") PROJ.pm = v;
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
["pfKunde", "pfProj", "pfCode", "pfPm", "fPop", "fDp"].forEach(initCombo);

/* ---------- datumski filter — Flatpickr (isti picker kao ULAZNE-FAKTURE) ---------- */
const FP = {};
[["fDateOd", v => { F.dOd = v; }], ["fDateDo", v => { F.dDo = v; }]].forEach(([id, set]) => {
  if (window.flatpickr) {
    FP[id] = flatpickr("#" + id, {
      dateFormat: "Y-m-d",          // interno (poklapa se s datumima termina)
      altInput: true, altFormat: "d/m/Y",   // korisnik vidi dd/mm/gggg
      monthSelectorType: "static",
      disableMobile: true, allowInput: true,
      onChange: async (_d, ds) => { set(ds || ""); await refreshDateTotals(); renderAll(); },
    });
  } else {
    const el = $("#" + id); el.type = "date";
    el.addEventListener("change", async e => { set(e.target.value || ""); await refreshDateTotals(); renderAll(); });
  }
});
/* Prognoza: inline period (von/bis) — pogoni ISTI globalni Datum filter
   (forecast picker -> globalni picker.setDate(triggerChange) -> postojeći onChange odradi posao).
   Sinhronizacija nazad (globalni -> forecast) ide tiho u renderForecast. */
[["fcDateOd", "fDateOd"], ["fcDateDo", "fDateDo"]].forEach(([fcId, gId]) => {
  const el = $("#" + fcId);
  if (!el) return;
  if (window.flatpickr) {
    FP[fcId] = flatpickr("#" + fcId, {
      dateFormat: "Y-m-d", altInput: true, altFormat: "d/m/Y",
      monthSelectorType: "static", disableMobile: true, allowInput: true,
      onChange: (_d, ds) => { if (!FP[gId]) return; if (ds) FP[gId].setDate(ds, true); else FP[gId].clear(true); },
    });
  } else {
    el.type = "date";
    el.addEventListener("change", e => { const g = $("#" + gId); if (!g) return; g.value = e.target.value; g.dispatchEvent(new Event("change")); });
  }
});
/* ✕ na prognozi = poništi samo Datum raspon (cijeli plan); ostali filteri ostaju */
{
  const fcClr = $("#fcDateClear");
  if (fcClr) fcClr.addEventListener("click", async () => {
    F.dOd = F.dDo = "";
    ["fDateOd", "fDateDo", "fcDateOd", "fcDateDo"].forEach(id => { if (FP[id]) FP[id].clear(false); else { const e2 = $("#" + id); if (e2) e2.value = ""; } });
    await refreshDateTotals(); renderAll();
  });
}
function clearDate(id) {
  if (FP[id]) FP[id].clear();      // clear() okida onChange -> F + renderAll
  else { const el = $("#" + id); if (el) el.value = ""; }
}

/* ---------- HP/HA brojčani raspon (od–do) ---------- */
[["fHpMin", "hpMin"], ["fHpMax", "hpMax"], ["fHaMin", "haMin"], ["fHaMax", "haMax"]].forEach(([id, key]) => {
  const el = $("#" + id);
  if (!el) return;
  el.addEventListener("input", () => { F[key] = el.value.trim(); renderAll(); });
});

/* ✕ Očisti = poništi SVE filtere odjednom */
$("#pfClear").addEventListener("click", () => {
  PROJ.kunde = PROJ.code = PROJ.name = PROJ.pm = "";
  F.dp.clear(); F.pop.clear(); F.st.clear(); F.odj.clear(); F.esk = false; F.kasni = false;
  F.dOd = F.dDo = ""; clearDate("fDateOd"); clearDate("fDateDo");
  F.hpMin = F.hpMax = F.haMin = F.haMax = "";
  ["fHpMin", "fHpMax", "fHaMin", "fHaMax"].forEach(id => setNum(id, ""));
  fcReset();   // prognoza: nazad na grupiranje po provajderu
  projFilterChanged();
});
/* sync iz Azure radi server automatski svakih 30 min — frontend samo
   periodično povuče svježe podatke (nema više ručnog Sync dugmeta) */
setInterval(loadProjects, 30 * 60 * 1000);

/* ---------- jezik ---------- */
function applyLang() {
  MJESECI = MJESECI_ALL[LANG];
  DANI = DANI_ALL[LANG];
  document.documentElement.lang = LANG;
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $$("[data-i18n-title]").forEach(el => { el.title = t(el.dataset.i18nTitle); });
  $$("#langToggle button").forEach(b => b.classList.toggle("on", b.dataset.lang === LANG));
  /* flatpickr alt-polja: Datum Od/Do placeholder mora pratiti jezik (altInput ne prevodi sam) */
  if (typeof FP !== "undefined") {
    if (FP.fDateOd && FP.fDateOd.altInput) FP.fDateOd.altInput.placeholder = t("odPh");
    if (FP.fDateDo && FP.fDateDo.altInput) FP.fDateDo.altInput.placeholder = t("doPh");
    if (FP.fcDateOd && FP.fcDateOd.altInput) FP.fcDateOd.altInput.placeholder = t("odPh");
    if (FP.fcDateDo && FP.fcDateDo.altInput) FP.fcDateDo.altInput.placeholder = t("doPh");
  }
}
function setLang(l) {
  LANG = l;
  localStorage.setItem("dp_lang", l);
  applyLang();
  renderAll();
  if (SEL) openDrawer();   // otvoreni panel ima dinamički t()-sadržaj -> ponovo iscrtaj na novom jeziku
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
         preračunaj ih kad se Analitika otvori; prognoza se ne računa dok je sklopljena */
      if (!collapsed) {
        for (const k in charts) charts[k].resize();
        if (h.dataset.fold === "prognoza") renderForecast();
      }
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
$("#btnAddPopTop").addEventListener("click", () => openPopDialog());

undoBtn();
$("#userBadge").addEventListener("click", askUser);
renderUser();
renderImpersonation();

async function load() {
  DATA = await api("/api/data");
  renderAll();
  setPx(PX);                       // clamp initial zoom to the viewport (no dead space)
  drawerSync();                    // osvježi/zatvori drawer ako se izbor promijenio
}
load();
loadProjects();
