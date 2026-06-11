# -*- coding: utf-8 -*-
"""Postgres sloj za DP Planiranje.

Aplikacija koristi VLASTITU bazu (DP-PLANIRANJE) i vlastitog Postgres korisnika
(dp_planiranje) na istom serveru kao ULAZNE-FAKTURE — potpuno odvojeno,
tako da ova aplikacija fizički ne može dirati podatke ULAZNIH FAKTURA.
"""
import datetime
import os
import time

import psycopg2
import psycopg2.extras
from flask import g

PG_CONFIG = dict(
    host=os.environ.get("POSTGRES_HOST", "localhost"),
    port=int(os.environ.get("POSTGRES_PORT", "5432")),
    dbname=os.environ.get("POSTGRES_DATABASE", "DP-PLANIRANJE"),
    user=os.environ.get("POSTGRES_USER", "dp_planiranje"),
    password=os.environ.get("POSTGRES_PASSWORD", ""),
)


def connect():
    return psycopg2.connect(connect_timeout=10, **PG_CONFIG)


class DB:
    """Tanki omotač da rute mogu zvati db().execute(...) kao i prije (SQLite stil)."""

    def __init__(self, conn):
        self.conn = conn

    def execute(self, sql, params=()):
        cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params)
        return cur

    def executemany(self, sql, seq):
        cur = self.conn.cursor()
        cur.executemany(sql, seq)
        return cur

    def commit(self):
        self.conn.commit()


def db():
    """Po-zahtjevu konekcija preko flask.g (zatvara se u teardown-u)."""
    if "pgconn" not in g:
        g.pgconn = connect()
    return DB(g.pgconn)


def close_db(exc):
    conn = g.pop("pgconn", None)
    if conn is not None:
        try:
            conn.rollback()  # eksplicitni commit se već desio u rutama
        except psycopg2.Error:
            pass
        conn.close()


def now_iso():
    return datetime.datetime.now().isoformat(timespec="seconds")


def audit(user, entity, entity_id, action, polje="", staro="", novo="", label=""):
    """Trajni dnevnik na POP/DP/korisnik nivou: ko je šta i kada mijenjao."""
    db().execute(
        'INSERT INTO audit_log(ts,"user",entity,entity_id,action,polje,staro,novo,label) '
        "VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        (now_iso(), user, entity, entity_id, action, polje,
         "" if staro is None else str(staro),
         "" if novo is None else str(novo), label))


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS pops(
    id SERIAL PRIMARY KEY,
    projekt TEXT NOT NULL DEFAULT '',
    naziv TEXT NOT NULL,
    hp INTEGER DEFAULT 0,
    ha INTEGER DEFAULT 0,
    created_at TEXT DEFAULT '',
    created_by TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS dps(
    id SERIAL PRIMARY KEY,
    pop TEXT NOT NULL,
    naziv TEXT NOT NULL,
    lokacija TEXT DEFAULT '',
    voditelj TEXT DEFAULT '',
    hp INTEGER DEFAULT 0,
    ha INTEGER DEFAULT 0,
    projekt TEXT DEFAULT '',
    pop_id INTEGER REFERENCES pops(id)
);
CREATE TABLE IF NOT EXISTS tasks(
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    datum_od TEXT NOT NULL,
    datum_do TEXT NOT NULL,
    status TEXT DEFAULT 'otvoreno',
    komentar TEXT DEFAULT '',
    eskalacija INTEGER DEFAULT 0,
    esk_razlog TEXT DEFAULT '',
    esk_datum TEXT DEFAULT '',
    kasni_razlog TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS seg_history(
    id SERIAL PRIMARY KEY,
    seg_id INTEGER NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
    ts TEXT NOT NULL,
    "user" TEXT DEFAULT '',
    polje TEXT DEFAULT '',
    vrijednost TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS projects(
    projektname TEXT PRIMARY KEY,
    kunde TEXT DEFAULT '',
    projectcode TEXT DEFAULT '',
    hp DOUBLE PRECISION DEFAULT 0,
    trasa_m DOUBLE PRECISION DEFAULT 0,
    ha_m DOUBLE PRECISION DEFAULT 0,
    ha_stck DOUBLE PRECISION DEFAULT 0,
    montaza DOUBLE PRECISION DEFAULT 0,
    datum_od TEXT,
    datum_do TEXT,
    synced_at TEXT
);
CREATE TABLE IF NOT EXISTS audit_log(
    id SERIAL PRIMARY KEY,
    ts TEXT NOT NULL,
    "user" TEXT DEFAULT '',
    entity TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    polje TEXT DEFAULT '',
    staro TEXT DEFAULT '',
    novo TEXT DEFAULT '',
    label TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS allowed_users(
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user',
    added_by TEXT DEFAULT '',
    added_at TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id, ts);
CREATE INDEX IF NOT EXISTS idx_sh_seg ON seg_history(seg_id);
CREATE INDEX IF NOT EXISTS idx_seg_task ON segments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dp ON tasks(dp_id);
CREATE INDEX IF NOT EXISTS idx_dps_pop ON dps(pop_id);
"""

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


def _monday(year, week):
    return datetime.date.fromisocalendar(year, week, 1).isoformat()


def _sunday(year, week):
    return datetime.date.fromisocalendar(year, week, 7).isoformat()


def _seed(cur):
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
    now = now_iso()
    pop_ids = {}
    for pop, naziv, lok, vod, hp, ha, plan in blocks:
        if pop not in pop_ids:
            cur.execute(
                "INSERT INTO pops(projekt,naziv,created_at) VALUES('Wandlitz',%s,%s) RETURNING id",
                (pop, now))
            pop_ids[pop] = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO dps(pop,naziv,lokacija,voditelj,hp,ha,projekt,pop_id) "
            "VALUES(%s,%s,%s,%s,%s,%s,'Wandlitz',%s) RETURNING id",
            (pop, naziv, lok, vod, hp, ha, pop_ids[pop]))
        dp_id = cur.fetchone()[0]
        for akt, odjel in STANDARD_AKTIVNOSTI:
            cur.execute(
                "INSERT INTO tasks(dp_id,aktivnost,odjel) VALUES(%s,%s,%s) RETURNING id",
                (dp_id, akt, odjel))
            task_id = cur.fetchone()[0]
            p = plan.get(akt)
            if p:
                kw_od, kw_do, st = p
                cur.execute(
                    "INSERT INTO segments(task_id,datum_od,datum_do,status) VALUES(%s,%s,%s,%s)",
                    (task_id, _monday(y, kw_od), _sunday(y, kw_do), st))
    # početni HP/HA POP-a = zbir njegovih DP-ova
    cur.execute(
        "UPDATE pops SET "
        " hp=(SELECT COALESCE(SUM(hp),0) FROM dps WHERE pop_id=pops.id),"
        " ha=(SELECT COALESCE(SUM(ha),0) FROM dps WHERE pop_id=pops.id)")


def init_db(permanent_admin=""):
    """Kreira šemu ako ne postoji (sigurno i kad više gunicorn workera starta odjednom)."""
    con = None
    for _ in range(30):
        try:
            con = connect()
            break
        except psycopg2.OperationalError:
            time.sleep(2)
    if con is None:
        raise RuntimeError("Postgres nedostupan — provjeri POSTGRES_* postavke u .env")
    try:
        cur = con.cursor()
        # advisory lock: samo jedan worker kreira šemu, ostali čekaju
        cur.execute("SELECT pg_advisory_lock(727274001)")
        cur.execute(SCHEMA_SQL)
        cur.execute("SELECT COUNT(*) FROM dps")
        if cur.fetchone()[0] == 0:
            _seed(cur)
        if permanent_admin:
            cur.execute(
                "INSERT INTO allowed_users(email,role,added_by,added_at) "
                "VALUES(%s,'admin','system',%s) ON CONFLICT(email) DO UPDATE SET role='admin'",
                (permanent_admin.strip().lower(), now_iso()))
        con.commit()
    finally:
        con.close()  # disconnect otpušta advisory lock
