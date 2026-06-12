"""Kreira/resetuje TEST bazu za E2E testove (nikad ne dira DP-PLANIRANJE!)."""
import os
import sys

TEST_DB = "DP-PLANIRANJE-TEST"
os.environ["POSTGRES_DATABASE"] = TEST_DB  # prije importa database modula!

from dotenv import load_dotenv
load_dotenv()  # POSTGRES_PASSWORD itd. (ne pregazi već postavljeni POSTGRES_DATABASE)

import psycopg2

# superuser kredencijali iz .env (SQL_UID/SQL_PWD = korisnik, isti kao Postgres)
SUPER = dict(host="localhost", port=5432, dbname="postgres",
             user=os.environ.get("SQL_UID", "korisnik"),
             password=os.environ["SQL_PWD"], connect_timeout=5)

con = psycopg2.connect(**SUPER)
con.autocommit = True
cur = con.cursor()
cur.execute(f'DROP DATABASE IF EXISTS "{TEST_DB}" WITH (FORCE)')
if sys.argv[1:] and sys.argv[1] == "drop":
    print("test DB dropped")
    con.close()
    sys.exit(0)
cur.execute(f'CREATE DATABASE "{TEST_DB}" OWNER dp_planiranje')
con.close()

import database  # noqa: E402  (PG_CONFIG sada cilja TEST bazu)
database.init_db(permanent_admin="e.uzunovic@gfcbh.ba")

tcon = database.connect()
tcur = tcon.cursor()
tcur.execute("""
INSERT INTO projects(projektname,kunde,projectcode,hp,trasa_m,datum_od,datum_do,synced_at) VALUES
 ('[NORD CLUSTER 1] WANDLITZ [IP]','mih Gmbh','NC1-WAN',1200,5400,'2026-01-05','2026-06-01','2026-06-12T08:00:00'),
 ('[NORD CLUSTER 1] BRIESEN [IP]','mih Gmbh','NC1-BRI',800,3100,'2026-02-01','2026-06-10','2026-06-12T08:00:00'),
 ('[SUED] MUSTERSTADT','mih construct GmbH','SU-MUS',500,2000,'2026-03-01','2026-05-20','2026-06-12T08:00:00')
ON CONFLICT (projektname) DO NOTHING
""")
tcon.commit()
tcon.close()
print("test DB created + schema + fixtures")
