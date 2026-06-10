# -*- coding: utf-8 -*-
"""Bauzeitenplan - lokalna web aplikacija (Flask + SQLite)."""
import csv
import datetime
import io
import os
import sqlite3

from flask import Flask, g, jsonify, request, render_template, send_file

BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE, "bauzeitenplan.db")

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

TASK_FIELDS = ["aktivnost", "odjel", "status", "plan_od", "plan_do",
               "stvarno_od", "stvarno_do", "eskalacija", "komentar"]
DP_FIELDS = ["pop", "naziv", "lokacija", "voditelj", "hp", "ha"]


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


def _monday(year, week):
    return datetime.date.fromisocalendar(year, week, 1).isoformat()


def _sunday(year, week):
    return datetime.date.fromisocalendar(year, week, 7).isoformat()


def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("PRAGMA foreign_keys = ON")
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
    """)
    if con.execute("SELECT COUNT(*) FROM dps").fetchone()[0] == 0:
        seed(con)
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
            p = plan.get(akt)
            if p:
                kw_od, kw_do, st = p
                con.execute(
                    "INSERT INTO tasks(dp_id,aktivnost,odjel,status,plan_od,plan_do) "
                    "VALUES(?,?,?,?,?,?)",
                    (dp_id, akt, odjel, st, _monday(y, kw_od), _sunday(y, kw_do)))
            else:
                con.execute(
                    "INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(?,?,?)",
                    (dp_id, akt, odjel))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/data")
def api_data():
    dps = [dict(r) for r in db().execute("SELECT * FROM dps ORDER BY pop, naziv")]
    tasks = [dict(r) for r in db().execute("SELECT * FROM tasks ORDER BY dp_id, id")]
    return jsonify({"dps": dps, "tasks": tasks})


@app.route("/api/dps", methods=["POST"])
def add_dp():
    j = request.get_json(force=True)
    cur = db().execute(
        "INSERT INTO dps(pop,naziv,lokacija,voditelj,hp,ha) VALUES(?,?,?,?,?,?)",
        (j.get("pop", ""), j.get("naziv", ""), j.get("lokacija", ""),
         j.get("voditelj", ""), j.get("hp") or 0, j.get("ha") or 0))
    dp_id = cur.lastrowid
    for akt, odjel in STANDARD_AKTIVNOSTI:
        db().execute("INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(?,?,?)",
                     (dp_id, akt, odjel))
    db().commit()
    return jsonify({"id": dp_id}), 201


@app.route("/api/dps/<int:dp_id>", methods=["PATCH", "DELETE"])
def edit_dp(dp_id):
    if request.method == "DELETE":
        db().execute("DELETE FROM dps WHERE id=?", (dp_id,))
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    sets = {k: j[k] for k in DP_FIELDS if k in j}
    if sets:
        q = ", ".join(f"{k}=?" for k in sets)
        db().execute(f"UPDATE dps SET {q} WHERE id=?", (*sets.values(), dp_id))
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/tasks", methods=["POST"])
def add_task():
    j = request.get_json(force=True)
    cur = db().execute(
        "INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(?,?,?)",
        (j["dp_id"], j.get("aktivnost", "Nova aktivnost"), j.get("odjel", "")))
    db().commit()
    return jsonify({"id": cur.lastrowid}), 201


@app.route("/api/tasks/<int:task_id>", methods=["PATCH", "DELETE"])
def edit_task(task_id):
    if request.method == "DELETE":
        db().execute("DELETE FROM tasks WHERE id=?", (task_id,))
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    sets = {k: j[k] for k in TASK_FIELDS if k in j}
    if sets:
        q = ", ".join(f"{k}=?" for k in sets)
        db().execute(f"UPDATE tasks SET {q} WHERE id=?", (*sets.values(), task_id))
        db().commit()
    return jsonify({"ok": True})


@app.route("/api/stats")
def api_stats():
    d = db()
    by_status = {r["s"]: r["n"] for r in d.execute(
        "SELECT COALESCE(NULLIF(status,''),'nepopunjeno') s, COUNT(*) n "
        "FROM tasks GROUP BY s")}
    by_odjel = [dict(r) for r in d.execute(
        "SELECT odjel, "
        " SUM(CASE WHEN status='završeno' THEN 1 ELSE 0 END) zavrseno, "
        " SUM(CASE WHEN status='u toku' THEN 1 ELSE 0 END) utoku, "
        " SUM(CASE WHEN status='otvoreno' THEN 1 ELSE 0 END) otvoreno, "
        " SUM(CASE WHEN COALESCE(status,'')='' THEN 1 ELSE 0 END) nepopunjeno "
        "FROM tasks GROUP BY odjel ORDER BY odjel")]
    per_dp = [dict(r) for r in d.execute(
        "SELECT d.id, d.pop, d.naziv, d.lokacija, d.hp, d.ha, "
        " COUNT(t.id) ukupno, "
        " SUM(CASE WHEN t.status='završeno' THEN 1 ELSE 0 END) zavrseno, "
        " SUM(CASE WHEN t.eskalacija='da' THEN 1 ELSE 0 END) eskalacije "
        "FROM dps d LEFT JOIN tasks t ON t.dp_id=d.id "
        "GROUP BY d.id ORDER BY d.pop, d.naziv")]
    totals = dict(d.execute(
        "SELECT SUM(hp) hp, SUM(ha) ha FROM dps").fetchone())
    eskalacije = [dict(r) for r in d.execute(
        "SELECT t.*, d.pop, d.naziv dp_naziv, d.lokacija FROM tasks t "
        "JOIN dps d ON d.id=t.dp_id WHERE t.eskalacija='da' ORDER BY t.id")]
    kasnjenja = [dict(r) for r in d.execute(
        "SELECT t.*, d.pop, d.naziv dp_naziv FROM tasks t JOIN dps d ON d.id=t.dp_id "
        "WHERE t.plan_do IS NOT NULL AND t.plan_do < date('now') "
        " AND COALESCE(t.status,'') NOT IN ('završeno') ORDER BY t.plan_do")]
    return jsonify({"by_status": by_status, "by_odjel": by_odjel,
                    "per_dp": per_dp, "totals": totals,
                    "eskalacije": eskalacije, "kasnjenja": kasnjenja})


def _task_rows():
    return db().execute(
        "SELECT d.pop 'POP/FCP ID', d.naziv 'DP', d.lokacija 'Lokacija', "
        " d.voditelj 'Voditelj', d.hp 'HP', d.ha 'HA', "
        " t.aktivnost 'Aktivnost', t.odjel 'Odjel', t.status 'Status', "
        " t.plan_od 'Plan od', t.plan_do 'Plan do', "
        " t.stvarno_od 'Stvarno od', t.stvarno_do 'Stvarno do', "
        " t.eskalacija 'Eskalacija', t.komentar 'Komentar' "
        "FROM tasks t JOIN dps d ON d.id=t.dp_id ORDER BY d.pop, d.naziv, t.id"
    ).fetchall()


@app.route("/export/csv")
def export_csv():
    rows = _task_rows()
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=";")
    if rows:
        w.writerow(rows[0].keys())
        for r in rows:
            w.writerow(list(r))
    data = io.BytesIO(("﻿" + buf.getvalue()).encode("utf-8"))
    return send_file(data, as_attachment=True, download_name="bauzeitenplan.csv",
                     mimetype="text/csv")


@app.route("/export/xlsx")
def export_xlsx():
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    rows = _task_rows()
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
        for col, w_ in zip("ABCDEFGHIJKLMNO", (13, 7, 18, 16, 6, 6, 20, 15, 11, 12, 12, 12, 12, 11, 40)):
            ws.column_dimensions[col].width = w_
        ws.freeze_panes = "A2"
        ws.auto_filter.ref = ws.dimensions
    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return send_file(out, as_attachment=True, download_name="bauzeitenplan.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


init_db()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=False)
