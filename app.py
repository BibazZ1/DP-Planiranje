# -*- coding: utf-8 -*-
"""DP Planiranje - lokalna web aplikacija (Flask + SQLite)."""
import csv
import datetime
import io
import os
import sqlite3
import threading
from urllib.parse import unquote

from flask import Flask, g, jsonify, request, render_template, send_file

BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE, "bauzeitenplan.db")

# --- Azure SQL (samo čitanje - nikad ne pišemo u Azure) ---
SQL_SERVER = os.environ.get("SQL_SERVER", "mihtest.database.windows.net")
SQL_DATABASE = os.environ.get("SQL_DATABASE", "Data Analyst")
SQL_UID = os.environ.get("SQL_UID", "korisnik")
SQL_PWD = os.environ.get("SQL_PWD", "AldinMujasevic123!")

app = Flask(__name__)
app.json.ensure_ascii = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

STANDARD_AKTIVNOSTI = [
    ("Dozvole", "Dozvole"),
    ("Priključak na POP", "POP / Provajder"),
    ("Pregled objekata", "Planiranje"),
    ("Iskopni radovi", "Tiefbau"),
    ("Horizontalno bušenje", "Spülbohrung"),
    ("Asfaltiranje", "Tiefbau"),
    ("Montaža", "Montaža"),
    ("Aktivacije", "Aktivacija"),
]

TASK_FIELDS = ["aktivnost", "odjel"]
SEG_FIELDS = ["datum_od", "datum_do", "status", "komentar", "eskalacija", "esk_razlog",
              "esk_datum", "kasni_razlog"]
DP_FIELDS = ["pop", "naziv", "lokacija", "voditelj", "hp", "ha", "projekt"]


def db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exc):
    d = g.pop("db", None)
    if d is not None:
        d.close()


def now_iso():
    return datetime.datetime.now().isoformat(timespec="seconds")


def req_user():
    """Ime korisnika iz X-User headera (frontend ga šalje URL-enkodirano)."""
    try:
        u = unquote(request.headers.get("X-User", "") or "")
    except Exception:
        u = ""
    return u.strip()[:60]


def _int(v):
    try:
        return int(float(v or 0))
    except (TypeError, ValueError):
        return 0


def audit(entity, entity_id, action, polje="", staro="", novo="", label=""):
    """Trajni dnevnik na POP/DP nivou: ko je šta i kada mijenjao.
    Zapis preživljava brisanje entiteta — historija ostaje mjesecima."""
    db().execute(
        "INSERT INTO audit_log(ts,user,entity,entity_id,action,polje,staro,novo,label) "
        "VALUES(?,?,?,?,?,?,?,?,?)",
        (now_iso(), req_user(), entity, entity_id, action, polje,
         "" if staro is None else str(staro),
         "" if novo is None else str(novo), label))


def _monday(year, week):
    return datetime.date.fromisocalendar(year, week, 1).isoformat()


def _sunday(year, week):
    return datetime.date.fromisocalendar(year, week, 7).isoformat()


def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("PRAGMA foreign_keys = ON")
    try:
        # WAL: izdržljivije i brže pisanje, čitanje ne blokira upis (dugotrajna historija)
        con.execute("PRAGMA journal_mode=WAL")
    except sqlite3.Error:
        pass
    con.executescript("""
    CREATE TABLE IF NOT EXISTS dps(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pop TEXT NOT NULL,
        naziv TEXT NOT NULL,
        lokacija TEXT DEFAULT '',
        voditelj TEXT DEFAULT '',
        hp INTEGER DEFAULT 0,
        ha INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS tasks(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dp_id INTEGER NOT NULL REFERENCES dps(id) ON DELETE CASCADE,
        aktivnost TEXT NOT NULL,
        odjel TEXT DEFAULT '',
        status TEXT DEFAULT '',
        plan_od TEXT, plan_do TEXT,
        stvarno_od TEXT, stvarno_do TEXT,
        eskalacija TEXT DEFAULT 'ne',
        komentar TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS segments(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        datum_od TEXT NOT NULL,
        datum_do TEXT NOT NULL,
        status TEXT DEFAULT 'otvoreno',
        komentar TEXT DEFAULT '',
        eskalacija INTEGER DEFAULT 0,
        esk_razlog TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS seg_history(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seg_id INTEGER NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
        ts TEXT NOT NULL,
        polje TEXT DEFAULT '',
        vrijednost TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS projects(
        projektname TEXT PRIMARY KEY,
        kunde TEXT DEFAULT '',
        projectcode TEXT DEFAULT '',
        hp REAL DEFAULT 0,
        trasa_m REAL DEFAULT 0,
        ha_m REAL DEFAULT 0,
        ha_stck REAL DEFAULT 0,
        montaza REAL DEFAULT 0,
        datum_od TEXT,
        datum_do TEXT,
        synced_at TEXT
    );
    CREATE TABLE IF NOT EXISTS pops(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projekt TEXT NOT NULL DEFAULT '',
        naziv TEXT NOT NULL,
        hp INTEGER DEFAULT 0,
        ha INTEGER DEFAULT 0,
        created_at TEXT DEFAULT '',
        created_by TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS audit_log(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,
        user TEXT DEFAULT '',
        entity TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        polje TEXT DEFAULT '',
        staro TEXT DEFAULT '',
        novo TEXT DEFAULT '',
        label TEXT DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id, ts);
    CREATE INDEX IF NOT EXISTS idx_sh_seg ON seg_history(seg_id);
    CREATE INDEX IF NOT EXISTS idx_seg_task ON segments(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_dp ON tasks(dp_id);
    """)
    # migracija: dps.projekt = pripadnost projektu iz Daily (Azure)
    cols = [r[1] for r in con.execute("PRAGMA table_info(dps)")]
    if "projekt" not in cols:
        con.execute("ALTER TABLE dps ADD COLUMN projekt TEXT DEFAULT ''")
        con.execute("UPDATE dps SET projekt='Wandlitz'")  # postojeći DP-ovi pod Wandlitz
    # migracija: segments.esk_datum = od kog datuma teče eskalacija
    seg_cols = [r[1] for r in con.execute("PRAGMA table_info(segments)")]
    if "esk_datum" not in seg_cols:
        con.execute("ALTER TABLE segments ADD COLUMN esk_datum TEXT DEFAULT ''")
    # migracija: segments.kasni_razlog = obavezan razlog kad termin probije rok
    if "kasni_razlog" not in seg_cols:
        con.execute("ALTER TABLE segments ADD COLUMN kasni_razlog TEXT DEFAULT ''")
    # migracija: dps.pop_id = veza na pops tabelu (Projekat ▸ POP ▸ DP)
    if "pop_id" not in cols:
        con.execute("ALTER TABLE dps ADD COLUMN pop_id INTEGER REFERENCES pops(id)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_dps_pop ON dps(pop_id)")
    # migracija: seg_history.user = ko je napravio promjenu
    sh_cols = [r[1] for r in con.execute("PRAGMA table_info(seg_history)")]
    if "user" not in sh_cols:
        con.execute("ALTER TABLE seg_history ADD COLUMN user TEXT DEFAULT ''")
    if con.execute("SELECT COUNT(*) FROM dps").fetchone()[0] == 0:
        seed(con)
    # migracija: stari plan_od/plan_do/status -> segmenti
    if con.execute("SELECT COUNT(*) FROM segments").fetchone()[0] == 0:
        rows = con.execute(
            "SELECT id, plan_od, plan_do, status, komentar FROM tasks "
            "WHERE plan_od IS NOT NULL AND plan_do IS NOT NULL AND COALESCE(status,'')<>''"
        ).fetchall()
        for tid, od, do_, st, kom in rows:
            con.execute(
                "INSERT INTO segments(task_id,datum_od,datum_do,status,komentar) VALUES(?,?,?,?,?)",
                (tid, od, do_, st, kom or ""))
    # migracija: postojeći DP-ovi (pop kao tekst) -> pravi POP zapisi + veza pop_id
    unlinked = con.execute(
        "SELECT id, pop, COALESCE(projekt,'') FROM dps "
        "WHERE pop_id IS NULL AND COALESCE(pop,'') <> ''").fetchall()
    if unlinked:
        now = datetime.datetime.now().isoformat(timespec="seconds")
        for did, pname, proj in unlinked:
            row = con.execute("SELECT id FROM pops WHERE naziv=? AND projekt=?",
                              (pname, proj)).fetchone()
            pid = row[0] if row else con.execute(
                "INSERT INTO pops(projekt,naziv,created_at) VALUES(?,?,?)",
                (proj, pname, now)).lastrowid
            con.execute("UPDATE dps SET pop_id=? WHERE id=?", (pid, did))
        # početni HP/HA POP-a = zbir njegovih DP-ova (poslije ručno promjenjivo)
        con.execute(
            "UPDATE pops SET "
            " hp=(SELECT COALESCE(SUM(hp),0) FROM dps WHERE pop_id=pops.id),"
            " ha=(SELECT COALESCE(SUM(ha),0) FROM dps WHERE pop_id=pops.id) "
            "WHERE hp=0 AND ha=0 AND id IN (SELECT DISTINCT pop_id FROM dps)")
    con.commit()
    con.close()


def seed(con):
    """Početni podaci iz Muster Bauzeitenplan 1.1 (2026)."""
    y = 2026
    dp1 = {"Dozvole": (4, 5, "završeno"), "Priključak na POP": (12, 13, "otvoreno"),
           "Pregled objekata": (5, 6, "završeno"), "Iskopni radovi": (8, 9, "završeno"),
           "Horizontalno bušenje": (9, 9, "otvoreno"), "Asfaltiranje": (10, 10, "otvoreno"),
           "Montaža": (11, 12, "otvoreno"), "Aktivacije": (16, 17, "otvoreno")}
    dp2 = {"Dozvole": (13, 18, "završeno"), "Priključak na POP": (25, 25, "otvoreno"),
           "Pregled objekata": (17, 19, "završeno"), "Iskopni radovi": (20, 22, "završeno"),
           "Horizontalno bušenje": (21, 21, "otvoreno"), "Asfaltiranje": (26, 26, "otvoreno"),
           "Montaža": (25, 26, "otvoreno"), "Aktivacije": (27, 31, "otvoreno")}
    blocks = [
        ("POP xyz-001", "DP 1", "Musterstrasse", "Max Mustermann", 32, 15, dp1),
        ("POP xyz-001", "DP 2", "Landstrasse 123", "Max Mustermann", 26, 18, dp2),
        ("POP xyz-002", "DP 3", "", "Max Mustermann", 35, 21, {}),
    ]
    for pop, naziv, lok, vod, hp, ha, plan in blocks:
        cur = con.execute(
            "INSERT INTO dps(pop,naziv,lokacija,voditelj,hp,ha) VALUES(?,?,?,?,?,?)",
            (pop, naziv, lok, vod, hp, ha))
        dp_id = cur.lastrowid
        for akt, odjel in STANDARD_AKTIVNOSTI:
            cur2 = con.execute(
                "INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(?,?,?)",
                (dp_id, akt, odjel))
            p = plan.get(akt)
            if p:
                kw_od, kw_do, st = p
                con.execute(
                    "INSERT INTO segments(task_id,datum_od,datum_do,status) VALUES(?,?,?,?)",
                    (cur2.lastrowid, _monday(y, kw_od), _sunday(y, kw_do), st))


# --- Sync iz Azure SQL (SREDJENI_Daily) u lokalni SQLite, agregirano po projektu ---
_sync_state = {"status": "nikad", "time": None, "error": None, "count": 0}
_sync_lock = threading.Lock()

AZURE_PROJECT_QUERY = """
SELECT [Projektname],
       MAX([Kunde])              AS Kunde,
       MAX([Projectcode Intern]) AS Projectcode,
       SUM([HP])                 AS HP,
       SUM([Trasa(m)])           AS Trasa_m,
       SUM([HA(m)])              AS HA_m,
       SUM([HA stck.])           AS HA_stck,
       SUM([Montage])            AS Montaza,
       MIN([Datum])              AS Datum_od,
       MAX([Datum])              AS Datum_do
FROM [SREDJENI_Daily]
WHERE [Projektname] IS NOT NULL AND LTRIM(RTRIM([Projektname])) <> ''
GROUP BY [Projektname]
"""


def sync_projects_from_azure():
    """Povuče zbirne podatke po projektu iz Azure SQL (samo SELECT) u lokalni SQLite."""
    if not _sync_lock.acquire(blocking=False):
        return  # sync već u toku
    try:
        _sync_state.update(status="u toku", error=None)
        import pyodbc
        cs = (
            "DRIVER={ODBC Driver 18 for SQL Server};"
            f"SERVER={SQL_SERVER};DATABASE={SQL_DATABASE};"
            f"UID={SQL_UID};PWD={SQL_PWD};"
            "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
            "ApplicationIntent=ReadOnly"
        )
        az = pyodbc.connect(cs, readonly=True)
        rows = az.cursor().execute(AZURE_PROJECT_QUERY).fetchall()
        az.close()

        now = datetime.datetime.now().isoformat(timespec="seconds")
        con = sqlite3.connect(DB_PATH)
        con.executemany(
            "INSERT INTO projects(projektname,kunde,projectcode,hp,trasa_m,ha_m,ha_stck,"
            " montaza,datum_od,datum_do,synced_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) "
            "ON CONFLICT(projektname) DO UPDATE SET kunde=excluded.kunde,"
            " projectcode=excluded.projectcode, hp=excluded.hp, trasa_m=excluded.trasa_m,"
            " ha_m=excluded.ha_m, ha_stck=excluded.ha_stck, montaza=excluded.montaza,"
            " datum_od=excluded.datum_od, datum_do=excluded.datum_do,"
            " synced_at=excluded.synced_at",
            [(r[0].strip(), (r[1] or "").strip(), (r[2] or "").strip(),
              float(r[3] or 0), float(r[4] or 0), float(r[5] or 0), float(r[6] or 0),
              float(r[7] or 0), str(r[8] or ""), str(r[9] or ""), now) for r in rows])
        con.commit()
        con.close()
        _sync_state.update(status="ok", time=now, count=len(rows))
    except Exception as e:
        _sync_state.update(status="greška", error=str(e))
    finally:
        _sync_lock.release()


@app.route("/")
def index():
    return render_template("index.html")


def log_hist(seg_id, polje, vrijednost):
    db().execute(
        "INSERT INTO seg_history(seg_id,ts,user,polje,vrijednost) VALUES(?,?,?,?,?)",
        (seg_id, now_iso(), req_user(), polje, str(vrijednost)))


@app.route("/api/data")
def api_data():
    dps = [dict(r) for r in db().execute(
        "SELECT d.id, COALESCE(p.naziv, d.pop) AS pop, d.naziv, d.lokacija, "
        " d.voditelj, d.hp, d.ha, COALESCE(NULLIF(p.projekt,''), d.projekt) AS projekt, "
        " d.pop_id "
        "FROM dps d LEFT JOIN pops p ON p.id = d.pop_id ORDER BY pop, d.naziv")]
    pops = [dict(r) for r in db().execute(
        "SELECT * FROM pops ORDER BY projekt, naziv")]
    tasks = [dict(r) for r in db().execute(
        "SELECT id, dp_id, aktivnost, odjel FROM tasks ORDER BY dp_id, id")]
    segments = [dict(r) for r in db().execute(
        "SELECT * FROM segments ORDER BY task_id, datum_od")]
    history = [dict(r) for r in db().execute(
        "SELECT seg_id, ts, user, polje, vrijednost FROM seg_history "
        "ORDER BY ts DESC, id DESC")]
    return jsonify({"dps": dps, "pops": pops, "tasks": tasks, "segments": segments,
                    "history": history})


@app.route("/api/pops", methods=["POST"])
def add_pop():
    j = request.get_json(force=True)
    naziv = (j.get("naziv") or "").strip()
    projekt = (j.get("projekt") or "").strip()
    if not naziv:
        return jsonify({"error": "naziv je obavezan"}), 400
    ex = db().execute("SELECT id FROM pops WHERE naziv=? AND projekt=?",
                      (naziv, projekt)).fetchone()
    if ex:
        return jsonify({"error": "postoji", "id": ex["id"]}), 409
    hp, ha = _int(j.get("hp")), _int(j.get("ha"))
    cur = db().execute(
        "INSERT INTO pops(projekt,naziv,hp,ha,created_at,created_by) VALUES(?,?,?,?,?,?)",
        (projekt, naziv, hp, ha, now_iso(), req_user()))
    audit("pop", cur.lastrowid, "kreirano", novo=f"HP {hp} · HA {ha}", label=naziv)
    db().commit()
    return jsonify({"id": cur.lastrowid}), 201


@app.route("/api/pops/<int:pop_id>", methods=["PATCH", "DELETE"])
def edit_pop(pop_id):
    old = db().execute("SELECT * FROM pops WHERE id=?", (pop_id,)).fetchone()
    if old is None:
        return jsonify({"error": "ne postoji"}), 404
    if request.method == "DELETE":
        for d_ in db().execute("SELECT id, naziv FROM dps WHERE pop_id=?",
                               (pop_id,)).fetchall():
            audit("dp", d_["id"], "obrisano", label=d_["naziv"],
                  staro=f'{old["naziv"]} · {d_["naziv"]}')
            db().execute("DELETE FROM dps WHERE id=?", (d_["id"],))
        db().execute("DELETE FROM pops WHERE id=?", (pop_id,))
        audit("pop", pop_id, "obrisano", label=old["naziv"], staro=old["naziv"])
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    sets = {}
    if "naziv" in j and (j["naziv"] or "").strip():
        sets["naziv"] = j["naziv"].strip()
    for k in ("hp", "ha"):
        if k in j:
            sets[k] = _int(j[k])
    if sets:
        q = ", ".join(f"{k}=?" for k in sets)
        db().execute(f"UPDATE pops SET {q} WHERE id=?", (*sets.values(), pop_id))
        if "naziv" in sets and sets["naziv"] != old["naziv"]:
            # sinhronizuj tekstualni naziv POP-a na svim njegovim DP-ovima
            db().execute("UPDATE dps SET pop=? WHERE pop_id=?",
                         (sets["naziv"], pop_id))
        for k, v in sets.items():
            if str(old[k]) != str(v):
                audit("pop", pop_id, "izmjena", polje=k, staro=old[k], novo=v,
                      label=sets.get("naziv", old["naziv"]))
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/dps", methods=["POST"])
def add_dp():
    j = request.get_json(force=True)
    d = db()
    pop_id = j.get("pop_id") or None
    projekt = (j.get("projekt") or "").strip()
    pop_name = (j.get("pop") or "").strip()
    prow = None
    if pop_id:
        prow = d.execute("SELECT * FROM pops WHERE id=?", (pop_id,)).fetchone()
    if prow is None and pop_name:
        prow = d.execute("SELECT * FROM pops WHERE naziv=? AND projekt=?",
                         (pop_name, projekt)).fetchone()
        if prow is None:
            # POP upisan kao novi naziv -> automatski se kreira pod projektom
            cur = d.execute(
                "INSERT INTO pops(projekt,naziv,created_at,created_by) VALUES(?,?,?,?)",
                (projekt, pop_name, now_iso(), req_user()))
            audit("pop", cur.lastrowid, "kreirano", label=pop_name)
            prow = d.execute("SELECT * FROM pops WHERE id=?",
                             (cur.lastrowid,)).fetchone()
    if prow is not None:
        pop_id, pop_name = prow["id"], prow["naziv"]
        projekt = prow["projekt"] or projekt
    naziv = j.get("naziv", "")
    hp, ha = _int(j.get("hp")), _int(j.get("ha"))
    cur = d.execute(
        "INSERT INTO dps(pop,naziv,lokacija,voditelj,hp,ha,projekt,pop_id) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (pop_name, naziv, j.get("lokacija", ""), j.get("voditelj", ""),
         hp, ha, projekt, pop_id))
    dp_id = cur.lastrowid
    audit("dp", dp_id, "kreirano", novo=f"HP {hp} · HA {ha}", label=naziv)
    for akt, odjel in STANDARD_AKTIVNOSTI:
        d.execute("INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(?,?,?)",
                  (dp_id, akt, odjel))
    d.commit()
    return jsonify({"id": dp_id}), 201


@app.route("/api/dps/<int:dp_id>", methods=["PATCH", "DELETE"])
def edit_dp(dp_id):
    old = db().execute("SELECT * FROM dps WHERE id=?", (dp_id,)).fetchone()
    if request.method == "DELETE":
        db().execute("DELETE FROM dps WHERE id=?", (dp_id,))
        if old is not None:
            audit("dp", dp_id, "obrisano", label=old["naziv"],
                  staro=f'{old["pop"]} · {old["naziv"]}')
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    sets = {k: j[k] for k in DP_FIELDS if k in j}
    if sets:
        q = ", ".join(f"{k}=?" for k in sets)
        db().execute(f"UPDATE dps SET {q} WHERE id=?", (*sets.values(), dp_id))
        if old is not None:
            for k, v in sets.items():
                if str(old[k]) != str(v):
                    audit("dp", dp_id, "izmjena", polje=k, staro=old[k], novo=v,
                          label=sets.get("naziv", old["naziv"]))
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/tasks", methods=["POST"])
def add_task():
    j = request.get_json(force=True)
    akt = j.get("aktivnost", "Nova aktivnost")
    cur = db().execute(
        "INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(?,?,?)",
        (j["dp_id"], akt, j.get("odjel", "")))
    dpr = db().execute("SELECT naziv FROM dps WHERE id=?", (j["dp_id"],)).fetchone()
    audit("dp", j["dp_id"], "aktivnost dodana", novo=akt,
          label=dpr["naziv"] if dpr else "")
    db().commit()
    return jsonify({"id": cur.lastrowid}), 201


@app.route("/api/tasks/<int:task_id>", methods=["PATCH", "DELETE"])
def edit_task(task_id):
    old = db().execute(
        "SELECT t.*, d.naziv AS dp_naziv FROM tasks t JOIN dps d ON d.id=t.dp_id "
        "WHERE t.id=?", (task_id,)).fetchone()
    if request.method == "DELETE":
        db().execute("DELETE FROM tasks WHERE id=?", (task_id,))
        if old is not None:
            audit("dp", old["dp_id"], "aktivnost obrisana",
                  staro=old["aktivnost"], label=old["dp_naziv"])
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    sets = {k: j[k] for k in TASK_FIELDS if k in j}
    if sets:
        q = ", ".join(f"{k}=?" for k in sets)
        db().execute(f"UPDATE tasks SET {q} WHERE id=?", (*sets.values(), task_id))
        if old is not None:
            for k, v in sets.items():
                if str(old[k]) != str(v):
                    audit("dp", old["dp_id"], "izmjena", polje=k,
                          staro=old[k], novo=v, label=old["dp_naziv"])
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/segments", methods=["POST"])
def add_segment():
    j = request.get_json(force=True)
    cur = db().execute(
        "INSERT INTO segments(task_id,datum_od,datum_do,status,komentar,eskalacija,"
        "esk_razlog,esk_datum,kasni_razlog) VALUES(?,?,?,?,?,?,?,?,?)",
        (j["task_id"], j["datum_od"], j["datum_do"], j.get("status", "otvoreno"),
         j.get("komentar", ""), 1 if j.get("eskalacija") else 0, j.get("esk_razlog", ""),
         j.get("esk_datum", ""), j.get("kasni_razlog", "")))
    seg_id = cur.lastrowid
    log_hist(seg_id, "kreirano",
             f"{j['datum_od']} – {j['datum_do']} · {j.get('status', 'otvoreno')}")
    for k in ("komentar", "esk_razlog", "kasni_razlog"):
        if j.get(k):
            log_hist(seg_id, k, j[k])
    db().commit()
    return jsonify({"id": seg_id}), 201


@app.route("/api/segments/<int:seg_id>", methods=["PATCH", "DELETE"])
def edit_segment(seg_id):
    if request.method == "DELETE":
        # zapamti u trajni dnevnik prije brisanja (seg_history nestaje s terminom)
        info = db().execute(
            "SELECT s.datum_od, s.datum_do, t.aktivnost, t.dp_id, d.naziv AS dp_naziv "
            "FROM segments s JOIN tasks t ON t.id=s.task_id JOIN dps d ON d.id=t.dp_id "
            "WHERE s.id=?", (seg_id,)).fetchone()
        db().execute("DELETE FROM segments WHERE id=?", (seg_id,))
        if info is not None:
            audit("dp", info["dp_id"], "termin obrisan", polje=info["aktivnost"],
                  staro=f'{info["datum_od"]} – {info["datum_do"]}',
                  label=info["dp_naziv"])
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    if "eskalacija" in j:
        j["eskalacija"] = 1 if j["eskalacija"] else 0
    sets = {k: j[k] for k in SEG_FIELDS if k in j}
    if sets:
        old = db().execute("SELECT * FROM segments WHERE id=?", (seg_id,)).fetchone()
        q = ", ".join(f"{k}=?" for k in sets)
        db().execute(f"UPDATE segments SET {q} WHERE id=?", (*sets.values(), seg_id))
        if old is not None:
            # historija: zapiši svaku stvarnu promjenu
            for k, v in sets.items():
                if old[k] != v:
                    if k == "eskalacija":
                        log_hist(seg_id, k, "uključena" if v else "isključena")
                    elif k in ("datum_od", "datum_do"):
                        log_hist(seg_id, k, f"{old[k]} → {v}")
                    else:
                        log_hist(seg_id, k, v or "(obrisano)")
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/projects")
def api_projects():
    rows = [dict(r) for r in db().execute(
        "SELECT * FROM projects ORDER BY projektname")]
    return jsonify({"projects": rows, "sync": _sync_state})


@app.route("/api/projects/sync", methods=["POST"])
def api_projects_sync():
    t = threading.Thread(target=sync_projects_from_azure, daemon=True)
    t.start()
    t.join(timeout=60)
    return jsonify(_sync_state)


@app.route("/api/history")
def api_history():
    """Spojena historija za POP ili DP: trajni audit_log + seg_history termina.
    Indeksirano po (entity, entity_id) -> brzo i nakon mjeseci podataka."""
    entity = request.args.get("entity", "dp")
    eid = request.args.get("id", default=0, type=int)
    limit = min(request.args.get("limit", default=150, type=int), 500)
    d = db()
    events = []
    if entity == "pop":
        dp_ids = [r["id"] for r in d.execute(
            "SELECT id FROM dps WHERE pop_id=?", (eid,))]
        for r in d.execute(
                "SELECT * FROM audit_log WHERE entity='pop' AND entity_id=? "
                "ORDER BY id DESC LIMIT ?", (eid, limit)):
            events.append({**dict(r), "kind": "audit"})
    else:
        dp_ids = [eid]
    if dp_ids:
        ph = ",".join("?" * len(dp_ids))
        for r in d.execute(
                f"SELECT * FROM audit_log WHERE entity='dp' AND entity_id IN ({ph}) "
                "ORDER BY id DESC LIMIT ?", (*dp_ids, limit)):
            events.append({**dict(r), "kind": "audit"})
        for r in d.execute(
                "SELECT h.ts, h.user, h.polje, h.vrijednost, t.aktivnost, "
                " d2.naziv AS dp_naziv "
                "FROM seg_history h JOIN segments s ON s.id=h.seg_id "
                "JOIN tasks t ON t.id=s.task_id JOIN dps d2 ON d2.id=t.dp_id "
                f"WHERE t.dp_id IN ({ph}) ORDER BY h.id DESC LIMIT ?",
                (*dp_ids, limit)):
            events.append({**dict(r), "kind": "seg"})
    events.sort(key=lambda e: e["ts"], reverse=True)
    return jsonify({"events": events[:limit]})


@app.route("/api/stats")
def api_stats():
    d = db()
    by_status = {r["s"]: r["n"] for r in d.execute(
        "SELECT status s, COUNT(*) n FROM segments GROUP BY status")}
    by_odjel = [dict(r) for r in d.execute(
        "SELECT t.odjel, "
        " SUM(CASE WHEN s.status='završeno' THEN 1 ELSE 0 END) zavrseno, "
        " SUM(CASE WHEN s.status='u toku' THEN 1 ELSE 0 END) utoku, "
        " SUM(CASE WHEN s.status='otvoreno' THEN 1 ELSE 0 END) otvoreno "
        "FROM segments s JOIN tasks t ON t.id=s.task_id GROUP BY t.odjel ORDER BY t.odjel")]
    per_dp = [dict(r) for r in d.execute(
        "SELECT d.id, d.pop, d.naziv, d.hp, d.ha, COUNT(s.id) ukupno, "
        " SUM(CASE WHEN s.status='završeno' THEN 1 ELSE 0 END) zavrseno, "
        " SUM(CASE WHEN s.eskalacija=1 THEN 1 ELSE 0 END) eskalacije "
        "FROM dps d LEFT JOIN tasks t ON t.dp_id=d.id "
        "LEFT JOIN segments s ON s.task_id=t.id GROUP BY d.id ORDER BY d.pop, d.naziv")]
    return jsonify({"by_status": by_status, "by_odjel": by_odjel, "per_dp": per_dp})


def _seg_rows():
    return db().execute(
        "SELECT d.pop 'POP/FCP ID', d.naziv 'DP', d.lokacija 'Lokacija', "
        " d.voditelj 'Voditelj', d.hp 'HP', d.ha 'HA', "
        " t.aktivnost 'Aktivnost', t.odjel 'Odjel', s.status 'Status', "
        " s.datum_od 'Od', s.datum_do 'Do', "
        " CASE s.eskalacija WHEN 1 THEN 'da' ELSE 'ne' END 'Eskalacija', "
        " s.esk_datum 'Datum eskalacije', s.esk_razlog 'Razlog eskalacije', "
        " s.kasni_razlog 'Razlog kašnjenja', s.komentar 'Komentar' "
        "FROM segments s JOIN tasks t ON t.id=s.task_id JOIN dps d ON d.id=t.dp_id "
        "ORDER BY d.pop, d.naziv, t.id, s.datum_od"
    ).fetchall()


@app.route("/export/csv")
def export_csv():
    rows = _seg_rows()
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=";")
    if rows:
        w.writerow(rows[0].keys())
        for r in rows:
            w.writerow(list(r))
    data = io.BytesIO(("﻿" + buf.getvalue()).encode("utf-8"))
    return send_file(data, as_attachment=True, download_name="dp_planiranje.csv",
                     mimetype="text/csv")


@app.route("/export/xlsx")
def export_xlsx():
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    rows = _seg_rows()
    wb = Workbook()
    ws = wb.active
    ws.title = "Plan"
    if rows:
        heads = list(rows[0].keys())
        ws.append(heads)
        for j in range(1, len(heads) + 1):
            c = ws.cell(row=1, column=j)
            c.font = Font(name="Arial", bold=True, color="FFFFFF")
            c.fill = PatternFill("solid", fgColor="1F4E78")
            c.alignment = Alignment(horizontal="center")
        for r in rows:
            ws.append(list(r))
        for col, w_ in zip("ABCDEFGHIJKLMNOP", (13, 7, 18, 16, 6, 6, 20, 15, 11, 12, 12, 11, 13, 30, 30, 30)):
            ws.column_dimensions[col].width = w_
        ws.freeze_panes = "A2"
        ws.auto_filter.ref = ws.dimensions
    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return send_file(out, as_attachment=True, download_name="dp_planiranje.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


init_db()
# sync iz Azure pri pokretanju aplikacije (u pozadini, ne blokira start)
threading.Thread(target=sync_projects_from_azure, daemon=True).start()

if __name__ == "__main__":
    import os as _os
    port = int(_os.environ.get("PORT", 5050))
    app.run(host="127.0.0.1", port=port, debug=False)
