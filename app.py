# -*- coding: utf-8 -*-
"""DP Planiranje - web aplikacija (Flask + PostgreSQL + Azure AD prijava).

Hostuje se kao i ULAZNE-FAKTURE: Docker + Cloudflare tunel, ali u VLASTITOJ
Postgres bazi (DP-PLANIRANJE) i pod vlastitom domenom.
"""
import csv
import datetime
import hashlib
import hmac
import io
import os
import subprocess
import threading
import time

from dotenv import load_dotenv
load_dotenv()  # lokalni razvoj; u Dockeru varijable stižu kroz compose env_file

from flask import Flask, g, jsonify, request, render_template, send_file, session

import database
from database import db, now_iso
from auth import (auth_bp, login_required, api_login_required,
                  PERMANENT_ADMIN, IS_DOCKER)

# --- Azure SQL (samo čitanje - nikad ne pišemo u Azure) ---
SQL_SERVER = os.environ.get("SQL_SERVER", "mihtest.database.windows.net")
SQL_DATABASE = os.environ.get("SQL_DATABASE", "Data Analyst")
SQL_UID = os.environ.get("SQL_UID", "korisnik")
SQL_PWD = os.environ.get("SQL_PWD", "")

app = Flask(__name__)
app.json.ensure_ascii = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

# --- sesija / kolačići (isti princip kao ULAZNE-FAKTURE) ---
_secret = os.environ.get("API_SECRET_KEY", "")
if not _secret:
    if IS_DOCKER:
        raise ValueError("Nedostaje API_SECRET_KEY u .env!")
    import secrets as _s
    _secret = _s.token_hex(32)  # dev fallback
app.config.update(
    SECRET_KEY=_secret,
    SESSION_COOKIE_NAME="session_dp",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=IS_DOCKER,   # HTTPS samo u produkciji
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME=8 * 3600,
)
app.register_blueprint(auth_bp)

# --- verzija/deploy (isto kao ULAZNE-FAKTURE: /api/deploy-status za DEPLOY.bat) ---
APP_START_TIME = time.time()
APP_DIR = os.path.dirname(os.path.abspath(__file__))


def _git_version():
    """Kratki git hash trenutnog koda (fallback: vrijeme builda)."""
    try:
        return subprocess.check_output(
            ["git", "-c", "safe.directory=/app", "rev-parse", "--short", "HEAD"],
            cwd=APP_DIR, stderr=subprocess.DEVNULL).decode().strip()
    except Exception:
        return datetime.datetime.now().strftime("%Y%m%d-%H%M%S")


APP_GIT_VERSION = _git_version()

STANDARD_AKTIVNOSTI = database.STANDARD_AKTIVNOSTI

TASK_FIELDS = ["aktivnost", "odjel"]
SEG_FIELDS = ["datum_od", "datum_do", "status", "komentar", "eskalacija", "esk_razlog",
              "esk_datum", "kasni_razlog"]
DP_FIELDS = ["pop", "naziv", "lokacija", "voditelj", "hp", "ha", "projekt"]


@app.teardown_appcontext
def close_db(exc):
    database.close_db(exc)


def req_user():
    """Ime prijavljenog korisnika (iz Azure sesije — ide u historiju izmjena)."""
    u = session.get("user_name") or session.get("user_email") or ""
    return u.strip()[:60]


def _int(v):
    try:
        return int(float(v or 0))
    except (TypeError, ValueError):
        return 0


def audit(entity, entity_id, action, polje="", staro="", novo="", label=""):
    database.audit(req_user(), entity, entity_id, action, polje, staro, novo, label)


def log_hist(seg_id, polje, vrijednost):
    db().execute(
        'INSERT INTO seg_history(seg_id,ts,"user",polje,vrijednost) VALUES(%s,%s,%s,%s,%s)',
        (seg_id, now_iso(), req_user(), polje, str(vrijednost)))


# --- Sync iz Azure SQL (SREDJENI_Daily) u Postgres, agregirano po projektu ---
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
    """Povuče zbirne podatke po projektu iz Azure SQL (samo SELECT) u Postgres."""
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

        now = now_iso()
        con = database.connect()
        cur = con.cursor()
        cur.executemany(
            "INSERT INTO projects(projektname,kunde,projectcode,hp,trasa_m,ha_m,ha_stck,"
            " montaza,datum_od,datum_do,synced_at) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
            "ON CONFLICT(projektname) DO UPDATE SET kunde=EXCLUDED.kunde,"
            " projectcode=EXCLUDED.projectcode, hp=EXCLUDED.hp, trasa_m=EXCLUDED.trasa_m,"
            " ha_m=EXCLUDED.ha_m, ha_stck=EXCLUDED.ha_stck, montaza=EXCLUDED.montaza,"
            " datum_od=EXCLUDED.datum_od, datum_do=EXCLUDED.datum_do,"
            " synced_at=EXCLUDED.synced_at",
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


@app.route("/api/health")
def api_health():
    """Healthcheck za Docker — provjerava i bazu."""
    try:
        db().execute("SELECT 1").fetchone()
        return jsonify({"status": "ok", "db": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "db": str(e)[:200]}), 503


# Datoteke čiji se MD5 poredi lokalno vs. kontejner (DEPLOY.bat verifikacija)
_DEPLOY_HASH_FILES = {
    "app.py": os.path.join(APP_DIR, "app.py"),
    "static/app.js": os.path.join(APP_DIR, "static", "app.js"),
    "static/style.css": os.path.join(APP_DIR, "static", "style.css"),
    "templates/index.html": os.path.join(APP_DIR, "templates", "index.html"),
}


@app.route("/api/deploy-status")
def deploy_status():
    """Stanje deploya za DEPLOY.bat: git commit + MD5 ključnih fajlova.

    Isti princip kao ULAZNE-FAKTURE — zaštićeno X-API-KEY (API_SECRET_KEY),
    jer otkriva git hash i checksume fajlova.
    """
    if not hmac.compare_digest(request.headers.get("X-API-KEY", ""), _secret):
        return jsonify({"error": "Unauthorized"}), 401

    result = {
        "version": APP_GIT_VERSION,
        "uptime_seconds": int(time.time() - APP_START_TIME),
        "timestamp": datetime.datetime.now().isoformat(),
    }

    # živi git HEAD (čita se pri zahtjevu): subprocess -> .git/HEAD -> manifest -> verzija
    git_commit, git_branch = None, "main"
    try:
        git_commit = subprocess.check_output(
            ["git", "-c", "safe.directory=/app", "rev-parse", "HEAD"],
            cwd=APP_DIR, stderr=subprocess.DEVNULL).decode().strip()
        git_branch = subprocess.check_output(
            ["git", "-c", "safe.directory=/app", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=APP_DIR, stderr=subprocess.DEVNULL).decode().strip()
    except Exception:
        pass
    if not git_commit or len(git_commit) < 40:
        try:
            with open(os.path.join(APP_DIR, ".git", "HEAD")) as f:
                head = f.read().strip()
            if head.startswith("ref: "):
                with open(os.path.join(APP_DIR, ".git", head[5:])) as f:
                    git_commit = f.read().strip()
                git_branch = head[5:].split("/")[-1]
            elif len(head) == 40:
                git_commit = head
        except Exception:
            pass
    if not git_commit or len(git_commit) < 40:
        try:
            import json as _json
            with open(os.path.join(APP_DIR, ".deploy_manifest.json")) as f:
                m = _json.load(f)
            if m.get("commit") and len(m["commit"]) == 40:
                git_commit = m["commit"]
                git_branch = m.get("branch", "main")
        except Exception:
            pass
    if not git_commit:
        git_commit = APP_GIT_VERSION
    result["git"] = {"commit": git_commit, "branch": git_branch,
                     "short": git_commit[:7] if len(git_commit) >= 7 else git_commit}

    # živi MD5 ključnih fajlova (dokazuje šta je STVARNO na disku)
    hashes = {}
    for name, path in _DEPLOY_HASH_FILES.items():
        try:
            with open(path, "rb") as f:
                hashes[name] = hashlib.md5(f.read()).hexdigest()
        except Exception:
            hashes[name] = "error"
    result["file_hashes"] = hashes
    return jsonify(result)


@app.route("/")
@login_required
def index():
    return render_template("index.html", auth={
        "email": g.user_email, "name": g.user_name, "is_admin": g.is_admin})


@app.route("/api/data")
@api_login_required
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
        'SELECT seg_id, ts, "user", polje, vrijednost FROM seg_history '
        "ORDER BY ts DESC, id DESC")]
    return jsonify({"dps": dps, "pops": pops, "tasks": tasks, "segments": segments,
                    "history": history})


@app.route("/api/pops", methods=["POST"])
@api_login_required
def add_pop():
    j = request.get_json(force=True)
    naziv = (j.get("naziv") or "").strip()
    projekt = (j.get("projekt") or "").strip()
    if not naziv:
        return jsonify({"error": "naziv je obavezan"}), 400
    ex = db().execute("SELECT id FROM pops WHERE naziv=%s AND projekt=%s",
                      (naziv, projekt)).fetchone()
    if ex:
        return jsonify({"error": "postoji", "id": ex["id"]}), 409
    hp, ha = _int(j.get("hp")), _int(j.get("ha"))
    cur = db().execute(
        "INSERT INTO pops(projekt,naziv,hp,ha,created_at,created_by) "
        "VALUES(%s,%s,%s,%s,%s,%s) RETURNING id",
        (projekt, naziv, hp, ha, now_iso(), req_user()))
    pop_id = cur.fetchone()["id"]
    audit("pop", pop_id, "kreirano", novo=f"HP {hp} · HA {ha}", label=naziv)
    db().commit()
    return jsonify({"id": pop_id}), 201


@app.route("/api/pops/<int:pop_id>", methods=["PATCH", "DELETE"])
@api_login_required
def edit_pop(pop_id):
    old = db().execute("SELECT * FROM pops WHERE id=%s", (pop_id,)).fetchone()
    if old is None:
        return jsonify({"error": "ne postoji"}), 404
    if request.method == "DELETE":
        for d_ in db().execute("SELECT id, naziv FROM dps WHERE pop_id=%s",
                               (pop_id,)).fetchall():
            audit("dp", d_["id"], "obrisano", label=d_["naziv"],
                  staro=f'{old["naziv"]} · {d_["naziv"]}')
            db().execute("DELETE FROM dps WHERE id=%s", (d_["id"],))
        db().execute("DELETE FROM pops WHERE id=%s", (pop_id,))
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
        q = ", ".join(f"{k}=%s" for k in sets)
        db().execute(f"UPDATE pops SET {q} WHERE id=%s", (*sets.values(), pop_id))
        if "naziv" in sets and sets["naziv"] != old["naziv"]:
            # sinhronizuj tekstualni naziv POP-a na svim njegovim DP-ovima
            db().execute("UPDATE dps SET pop=%s WHERE pop_id=%s",
                         (sets["naziv"], pop_id))
        for k, v in sets.items():
            if str(old[k]) != str(v):
                audit("pop", pop_id, "izmjena", polje=k, staro=old[k], novo=v,
                      label=sets.get("naziv", old["naziv"]))
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/dps", methods=["POST"])
@api_login_required
def add_dp():
    j = request.get_json(force=True)
    d = db()
    pop_id = j.get("pop_id") or None
    projekt = (j.get("projekt") or "").strip()
    pop_name = (j.get("pop") or "").strip()
    prow = None
    if pop_id:
        prow = d.execute("SELECT * FROM pops WHERE id=%s", (pop_id,)).fetchone()
    if prow is None and pop_name:
        prow = d.execute("SELECT * FROM pops WHERE naziv=%s AND projekt=%s",
                         (pop_name, projekt)).fetchone()
        if prow is None:
            # POP upisan kao novi naziv -> automatski se kreira pod projektom
            cur = d.execute(
                "INSERT INTO pops(projekt,naziv,created_at,created_by) "
                "VALUES(%s,%s,%s,%s) RETURNING id",
                (projekt, pop_name, now_iso(), req_user()))
            new_pop_id = cur.fetchone()["id"]
            audit("pop", new_pop_id, "kreirano", label=pop_name)
            prow = d.execute("SELECT * FROM pops WHERE id=%s",
                             (new_pop_id,)).fetchone()
    if prow is not None:
        pop_id, pop_name = prow["id"], prow["naziv"]
        projekt = prow["projekt"] or projekt
    naziv = j.get("naziv", "")
    hp, ha = _int(j.get("hp")), _int(j.get("ha"))
    cur = d.execute(
        "INSERT INTO dps(pop,naziv,lokacija,voditelj,hp,ha,projekt,pop_id) "
        "VALUES(%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (pop_name, naziv, j.get("lokacija", ""), j.get("voditelj", ""),
         hp, ha, projekt, pop_id))
    dp_id = cur.fetchone()["id"]
    audit("dp", dp_id, "kreirano", novo=f"HP {hp} · HA {ha}", label=naziv)
    for akt, odjel in STANDARD_AKTIVNOSTI:
        d.execute("INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(%s,%s,%s)",
                  (dp_id, akt, odjel))
    d.commit()
    return jsonify({"id": dp_id}), 201


@app.route("/api/dps/<int:dp_id>", methods=["PATCH", "DELETE"])
@api_login_required
def edit_dp(dp_id):
    old = db().execute("SELECT * FROM dps WHERE id=%s", (dp_id,)).fetchone()
    if request.method == "DELETE":
        db().execute("DELETE FROM dps WHERE id=%s", (dp_id,))
        if old is not None:
            audit("dp", dp_id, "obrisano", label=old["naziv"],
                  staro=f'{old["pop"]} · {old["naziv"]}')
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    sets = {k: j[k] for k in DP_FIELDS if k in j}
    if sets:
        q = ", ".join(f"{k}=%s" for k in sets)
        db().execute(f"UPDATE dps SET {q} WHERE id=%s", (*sets.values(), dp_id))
        if old is not None:
            for k, v in sets.items():
                if str(old[k]) != str(v):
                    audit("dp", dp_id, "izmjena", polje=k, staro=old[k], novo=v,
                          label=sets.get("naziv", old["naziv"]))
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/tasks", methods=["POST"])
@api_login_required
def add_task():
    j = request.get_json(force=True)
    akt = j.get("aktivnost", "Nova aktivnost")
    cur = db().execute(
        "INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(%s,%s,%s) RETURNING id",
        (j["dp_id"], akt, j.get("odjel", "")))
    task_id = cur.fetchone()["id"]
    dpr = db().execute("SELECT naziv FROM dps WHERE id=%s", (j["dp_id"],)).fetchone()
    audit("dp", j["dp_id"], "aktivnost dodana", novo=akt,
          label=dpr["naziv"] if dpr else "")
    db().commit()
    return jsonify({"id": task_id}), 201


@app.route("/api/tasks/<int:task_id>", methods=["PATCH", "DELETE"])
@api_login_required
def edit_task(task_id):
    old = db().execute(
        "SELECT t.*, d.naziv AS dp_naziv FROM tasks t JOIN dps d ON d.id=t.dp_id "
        "WHERE t.id=%s", (task_id,)).fetchone()
    if request.method == "DELETE":
        db().execute("DELETE FROM tasks WHERE id=%s", (task_id,))
        if old is not None:
            audit("dp", old["dp_id"], "aktivnost obrisana",
                  staro=old["aktivnost"], label=old["dp_naziv"])
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    sets = {k: j[k] for k in TASK_FIELDS if k in j}
    if sets:
        q = ", ".join(f"{k}=%s" for k in sets)
        db().execute(f"UPDATE tasks SET {q} WHERE id=%s", (*sets.values(), task_id))
        if old is not None:
            for k, v in sets.items():
                if str(old[k]) != str(v):
                    audit("dp", old["dp_id"], "izmjena", polje=k,
                          staro=old[k], novo=v, label=old["dp_naziv"])
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/segments", methods=["POST"])
@api_login_required
def add_segment():
    j = request.get_json(force=True)
    cur = db().execute(
        "INSERT INTO segments(task_id,datum_od,datum_do,status,komentar,eskalacija,"
        "esk_razlog,esk_datum,kasni_razlog) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (j["task_id"], j["datum_od"], j["datum_do"], j.get("status", "otvoreno"),
         j.get("komentar", ""), 1 if j.get("eskalacija") else 0, j.get("esk_razlog", ""),
         j.get("esk_datum", ""), j.get("kasni_razlog", "")))
    seg_id = cur.fetchone()["id"]
    log_hist(seg_id, "kreirano",
             f"{j['datum_od']} – {j['datum_do']} · {j.get('status', 'otvoreno')}")
    for k in ("komentar", "esk_razlog", "kasni_razlog"):
        if j.get(k):
            log_hist(seg_id, k, j[k])
    db().commit()
    return jsonify({"id": seg_id}), 201


@app.route("/api/segments/<int:seg_id>", methods=["PATCH", "DELETE"])
@api_login_required
def edit_segment(seg_id):
    if request.method == "DELETE":
        # zapamti u trajni dnevnik prije brisanja (seg_history nestaje s terminom)
        info = db().execute(
            "SELECT s.datum_od, s.datum_do, t.aktivnost, t.dp_id, d.naziv AS dp_naziv "
            "FROM segments s JOIN tasks t ON t.id=s.task_id JOIN dps d ON d.id=t.dp_id "
            "WHERE s.id=%s", (seg_id,)).fetchone()
        db().execute("DELETE FROM segments WHERE id=%s", (seg_id,))
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
        old = db().execute("SELECT * FROM segments WHERE id=%s", (seg_id,)).fetchone()
        q = ", ".join(f"{k}=%s" for k in sets)
        db().execute(f"UPDATE segments SET {q} WHERE id=%s", (*sets.values(), seg_id))
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
@api_login_required
def api_projects():
    rows = [dict(r) for r in db().execute(
        "SELECT * FROM projects ORDER BY projektname")]
    return jsonify({"projects": rows, "sync": _sync_state})


@app.route("/api/projects/sync", methods=["POST"])
@api_login_required
def api_projects_sync():
    t = threading.Thread(target=sync_projects_from_azure, daemon=True)
    t.start()
    t.join(timeout=60)
    return jsonify(_sync_state)


@app.route("/api/history")
@api_login_required
def api_history():
    """Spojena historija za POP ili DP: trajni audit_log + seg_history termina."""
    entity = request.args.get("entity", "dp")
    eid = request.args.get("id", default=0, type=int)
    limit = min(request.args.get("limit", default=150, type=int), 500)
    d = db()
    events = []
    if entity == "pop":
        dp_ids = [r["id"] for r in d.execute(
            "SELECT id FROM dps WHERE pop_id=%s", (eid,))]
        for r in d.execute(
                "SELECT * FROM audit_log WHERE entity='pop' AND entity_id=%s "
                "ORDER BY id DESC LIMIT %s", (eid, limit)):
            events.append({**dict(r), "kind": "audit"})
    else:
        dp_ids = [eid]
    if dp_ids:
        ph = ",".join(["%s"] * len(dp_ids))
        for r in d.execute(
                f"SELECT * FROM audit_log WHERE entity='dp' AND entity_id IN ({ph}) "
                "ORDER BY id DESC LIMIT %s", (*dp_ids, limit)):
            events.append({**dict(r), "kind": "audit"})
        for r in d.execute(
                'SELECT h.ts, h."user", h.polje, h.vrijednost, t.aktivnost, '
                " d2.naziv AS dp_naziv "
                "FROM seg_history h JOIN segments s ON s.id=h.seg_id "
                "JOIN tasks t ON t.id=s.task_id JOIN dps d2 ON d2.id=t.dp_id "
                f"WHERE t.dp_id IN ({ph}) ORDER BY h.id DESC LIMIT %s",
                (*dp_ids, limit)):
            events.append({**dict(r), "kind": "seg"})
    events.sort(key=lambda e: e["ts"], reverse=True)
    return jsonify({"events": events[:limit]})


@app.route("/api/stats")
@api_login_required
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
        'SELECT d.pop AS "POP/FCP ID", d.naziv AS "DP", d.lokacija AS "Lokacija", '
        ' d.voditelj AS "Voditelj", d.hp AS "HP", d.ha AS "HA", '
        ' t.aktivnost AS "Aktivnost", t.odjel AS "Odjel", s.status AS "Status", '
        ' s.datum_od AS "Od", s.datum_do AS "Do", '
        " CASE s.eskalacija WHEN 1 THEN 'da' ELSE 'ne' END AS \"Eskalacija\", "
        " CASE WHEN s.status <> 'završeno' AND s.datum_do < to_char(CURRENT_DATE,'YYYY-MM-DD') "
        "      THEN (CURRENT_DATE - s.datum_do::date)::text ELSE '' END AS \"Kasni (dana)\", "
        ' s.esk_datum AS "Datum eskalacije", s.esk_razlog AS "Razlog eskalacije", '
        ' s.kasni_razlog AS "Razlog kašnjenja", s.komentar AS "Komentar" '
        "FROM segments s JOIN tasks t ON t.id=s.task_id JOIN dps d ON d.id=t.dp_id "
        "ORDER BY d.pop, d.naziv, t.id, s.datum_od"
    ).fetchall()


@app.route("/export/csv")
@login_required
def export_csv():
    rows = _seg_rows()
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=";")
    if rows:
        w.writerow(rows[0].keys())
        for r in rows:
            w.writerow(list(r.values()))
    data = io.BytesIO(("﻿" + buf.getvalue()).encode("utf-8"))
    return send_file(data, as_attachment=True, download_name="dp_planiranje.csv",
                     mimetype="text/csv")


@app.route("/export/xlsx")
@login_required
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
            ws.append(list(r.values()))
        for col, w_ in zip("ABCDEFGHIJKLMNOPQ", (13, 7, 18, 16, 6, 6, 20, 15, 11, 12, 12, 11, 11, 13, 30, 30, 30)):
            ws.column_dimensions[col].width = w_
        ws.freeze_panes = "A2"
        ws.auto_filter.ref = ws.dimensions
    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return send_file(out, as_attachment=True, download_name="dp_planiranje.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


database.init_db(permanent_admin=PERMANENT_ADMIN)


def _sync_loop():
    """Automatski sync iz Azure: odmah pri startu pa svakih 30 minuta
    (ručno Sync dugme je uklonjeno iz UI-ja)."""
    while True:
        sync_projects_from_azure()
        time.sleep(30 * 60)


threading.Thread(target=_sync_loop, daemon=True).start()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host=os.environ.get("HOST", "127.0.0.1"), port=port, debug=False,
            threaded=True)
