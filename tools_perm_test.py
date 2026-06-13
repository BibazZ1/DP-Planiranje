"""Provjera claim enforcementa s NE-admin korisnikom (Flask test_client, TEST baza)."""
import os
os.environ["POSTGRES_DATABASE"] = "DP-PLANIRANJE-TEST"
os.environ["DEV_FAKE_USER"] = ""          # bez auto-logina; sesiju postavljamo ručno
from dotenv import load_dotenv
load_dotenv()
os.environ["POSTGRES_DATABASE"] = "DP-PLANIRANJE-TEST"

import app as A

ADMIN = "e.uzunovic@gfcbh.ba"
USER = "user2@gfcbh.ba"
c = A.app.test_client()
passed = failed = 0


def ok(name, cond):
    global passed, failed
    if cond:
        passed += 1; print("PASS ", name)
    else:
        failed += 1; print("FAIL ", name)


def login(email, name):
    with c.session_transaction() as s:
        s["user_email"] = email
        s["user_name"] = name
        s.permanent = True


# admin doda non-admin korisnika
login(ADMIN, "Admin")
r = c.post("/api/admin/users", json={"email": USER, "role": "user"})
ok("admin doda non-admin korisnika", r.status_code in (201, 409))

# admin kreira POP+DP pod projektom 'TESTPROJ' i preuzme projekat
c.post("/api/pops", json={"naziv": "POP PC", "projekt": "TESTPROJ", "hp": 1, "ha": 1})
dp = c.post("/api/dps", json={"pop": "POP PC", "projekt": "TESTPROJ", "naziv": "DP PC"}).get_json()
r = c.post("/api/claims", json={"projekt": "TESTPROJ"})
ok("admin preuzme projekat", r.status_code == 201)

# non-admin NE smije uređivati zaključan projekat
login(USER, "User Dva")
tasks = c.get("/api/data").get_json()["tasks"]
tk = [t for t in tasks if t["dp_id"] == dp["id"]][0]
r = c.post("/api/segments", json={"task_id": tk["id"], "datum_od": "2026-09-01",
                                  "datum_do": "2026-09-07", "status": "otvoreno"})
ok("non-admin: 403 na termin u zaključanom projektu", r.status_code == 403)
r = c.patch(f"/api/dps/{dp['id']}", json={"hp": 99})
ok("non-admin: 403 na izmjenu DP-a", r.status_code == 403)
r = c.post("/api/claims", json={"projekt": "TESTPROJ"})
ok("non-admin: 403 na preuzimanje tuđeg projekta", r.status_code == 403)
r = c.post("/api/claims/request", json={"projekt": "TESTPROJ"})
ok("non-admin: zahtjev za pristup prolazi (200)", r.status_code == 200)

# non-admin SMIJE raditi na NEclaimovanom projektu
c.post("/api/pops", json={"naziv": "POP FREE", "projekt": "SLOBODAN", "hp": 1, "ha": 1})
dp2 = c.post("/api/dps", json={"pop": "POP FREE", "projekt": "SLOBODAN", "naziv": "DP FREE"}).get_json()
ok("non-admin: smije kreirati DP na slobodnom projektu", bool(dp2.get("id")))

# vlasnik (admin) otpusti -> non-admin sad smije
login(ADMIN, "Admin")
c.delete("/api/claims?projekt=TESTPROJ")
login(USER, "User Dva")
r = c.post("/api/segments", json={"task_id": tk["id"], "datum_od": "2026-09-01",
                                  "datum_do": "2026-09-07", "status": "otvoreno"})
ok("poslije otpuštanja: non-admin smije uređivati (201)", r.status_code == 201)

print(f"\n===== PERM: {passed} PASS / {failed} FAIL =====")
raise SystemExit(1 if failed else 0)
