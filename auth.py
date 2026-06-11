# -*- coding: utf-8 -*-
"""Azure AD (Microsoft Entra) prijava + kontrola pristupa po e-mail adresi.

Isti princip kao ULAZNE-FAKTURE: Microsoft prijava preko MSAL-a, a nakon nje
pristup ima SAMO e-mail koji je upisan u tabelu allowed_users (ili stalni admin).
Stalni admin (PERMANENT_ADMIN) upravlja listom kroz /admin panel i ne može
biti obrisan ni degradiran.
"""
import hmac
import os
import re
import secrets
from functools import wraps
from urllib.parse import quote

import msal
from flask import (Blueprint, g, jsonify, redirect, render_template, request,
                   session, url_for)

from database import audit, db, now_iso

auth_bp = Blueprint("auth", __name__)

PERMANENT_ADMIN = os.environ.get(
    "PERMANENT_ADMIN", "e.uzunovic@gfcbh.ba").strip().lower()

CLIENT_ID = os.environ.get("CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET", "")
AUTHORITY = "https://login.microsoftonline.com/organizations"
REDIRECT_PATH = "/getAToken"

IS_DOCKER = os.environ.get("DOCKER_CONTAINER") == "true"
# Lokalni razvoj bez Azure prijave: DEV_FAKE_USER=neko@mih-fiber.com (ignoriše se u Dockeru)
DEV_FAKE_USER = "" if IS_DOCKER else os.environ.get("DEV_FAKE_USER", "").strip().lower()

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


def base_url():
    if IS_DOCKER:
        return os.environ.get(
            "APP_DOMAIN", "https://dp-planiranje.mih-kontroling.com").rstrip("/")
    return "http://localhost:5050"


def get_allowed(email):
    """Vrati {email, role, permanent} ako e-mail smije u aplikaciju, inače None."""
    email = (email or "").strip().lower()
    if not email:
        return None
    if email == PERMANENT_ADMIN:
        return {"email": email, "role": "admin", "permanent": True}
    row = db().execute(
        "SELECT email, role FROM allowed_users WHERE LOWER(TRIM(email))=%s",
        (email,)).fetchone()
    if row is None:
        return None
    return {"email": email, "role": row["role"], "permanent": False}


def _dev_autologin():
    if DEV_FAKE_USER and "user_email" not in session:
        session["user_email"] = DEV_FAKE_USER
        session["user_name"] = DEV_FAKE_USER.split("@")[0].replace(".", " ").title()
        session.permanent = True


def _load_user_or_none():
    """Zajednička provjera za oba dekoratora. Vrati None ako je sve uredu."""
    _dev_autologin()
    if "user_email" not in session:
        return "login"
    allowed = get_allowed(session["user_email"])
    if allowed is None:
        return "denied"
    g.user_email = session["user_email"].strip().lower()
    g.user_name = session.get("user_name") or g.user_email
    g.role = allowed["role"]
    g.is_admin = allowed["role"] == "admin"
    g.is_permanent_admin = allowed.get("permanent", False)
    return None


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        problem = _load_user_or_none()
        if problem == "login":
            qs = request.query_string.decode("utf-8", errors="ignore")
            session["next_url"] = request.path + (f"?{qs}" if qs else "")
            return redirect(url_for("auth.login"))
        if problem == "denied":
            email = session.get("user_email", "")
            session.clear()
            return render_template("access_denied.html", email=email,
                                   admin_contact=PERMANENT_ADMIN), 403
        return f(*args, **kwargs)
    return wrapper


def api_login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        problem = _load_user_or_none()
        if problem == "login":
            return jsonify({"error": "Unauthorized"}), 401
        if problem == "denied":
            session.clear()
            return jsonify({"error": "Pristup odbijen — vaš nalog nije na listi."}), 403
        return f(*args, **kwargs)
    return wrapper


def admin_required(f):
    @wraps(f)
    @api_login_required
    def wrapper(*args, **kwargs):
        if not g.is_admin:
            return jsonify({"error": "Samo administrator"}), 403
        return f(*args, **kwargs)
    return wrapper


# ==================================================================================
# Microsoft Entra prijava (MSAL) — isti tok kao ULAZNE-FAKTURE
# ==================================================================================
def _msal_client():
    return msal.ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)


@auth_bp.route("/login")
def login():
    if DEV_FAKE_USER:
        _dev_autologin()
        return redirect(session.pop("next_url", None) or "/")
    state = secrets.token_urlsafe(32)
    session["oauth_state"] = state
    try:
        auth_url = _msal_client().get_authorization_request_url(
            scopes=["User.Read"],
            redirect_uri=base_url() + REDIRECT_PATH,
            state=state)
    except Exception:
        return "Privremena greška pri povezivanju na Microsoft prijavu.", 503
    # izgled identičan ULAZNE-FAKTURE login ekranu (ironman-auth, shared-animations.css)
    return f"""<!DOCTYPE html>
<html lang="bs"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Authenticating…</title>
<link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
<meta http-equiv="refresh" content="1;url={auth_url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
.ironman-auth{{position:relative;overflow:hidden;min-height:100vh;
  background:
    radial-gradient(ellipse 60% 45% at 12% 8%, rgba(16,185,129,0.05) 0%, transparent 65%),
    radial-gradient(ellipse 55% 50% at 88% 94%, rgba(20,184,166,0.04) 0%, transparent 65%),
    linear-gradient(180deg,#020617 0%,#0f172a 100%);
  color:#e2e8f0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}}
.ironman-auth-panel{{position:relative;z-index:2;display:flex;flex-direction:column;
  align-items:center;justify-content:center;min-height:100vh;padding:2rem}}
.ironman-auth-card{{position:relative;width:100%;max-width:440px;padding:2.5rem 2rem 2rem;
  background:linear-gradient(135deg,rgba(15,23,42,0.85),rgba(30,41,59,0.85));
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  border:1px solid rgba(16,185,129,0.25);border-radius:18px;
  box-shadow:0 0 40px rgba(16,185,129,0.15),0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.06);
  animation:ironman-card-enter 520ms cubic-bezier(0.22,1,0.36,1) both}}
@keyframes ironman-card-enter{{0%{{opacity:0;transform:translateY(16px) scale(0.96);filter:blur(6px)}}
  100%{{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}}}
.ironman-auth-card::before,.ironman-auth-card::after{{content:'';position:absolute;
  width:22px;height:22px;border:1.5px solid rgba(16,185,129,0.7);pointer-events:none}}
.ironman-auth-card::before{{top:8px;left:8px;border-right:none;border-bottom:none;border-top-left-radius:6px}}
.ironman-auth-card::after{{bottom:8px;right:8px;border-left:none;border-top:none;border-bottom-right-radius:6px}}
.ironman-loader{{position:relative;width:84px;height:84px;margin:0 auto 1.5rem}}
.ironman-loader::before,.ironman-loader::after,.ironman-loader>span{{content:'';position:absolute;
  inset:0;border-radius:50%;border:2px solid transparent}}
.ironman-loader::before{{border-top-color:#10b981;border-right-color:rgba(16,185,129,0.4);
  animation:ironman-spin 1.1s linear infinite;box-shadow:0 0 22px rgba(16,185,129,0.45)}}
.ironman-loader::after{{inset:10px;border-top-color:#3b82f6;border-left-color:rgba(59,130,246,0.4);
  animation:ironman-spin 1.7s linear infinite reverse;box-shadow:0 0 18px rgba(59,130,246,0.35)}}
.ironman-loader>span{{inset:22px;border:1px solid rgba(16,185,129,0.3);
  animation:ironman-pulse 1.4s ease-in-out infinite}}
@keyframes ironman-spin{{to{{transform:rotate(360deg)}}}}
@keyframes ironman-pulse{{0%,100%{{transform:scale(0.9);opacity:0.5}}50%{{transform:scale(1.05);opacity:1}}}}
.ironman-auth-title{{color:#f8fafc;font-weight:700;font-size:1.15rem;letter-spacing:0.06em;
  text-transform:uppercase;text-align:center;margin:0 0 0.5rem}}
.ironman-auth-subtitle{{color:#94a3b8;font-size:0.9rem;text-align:center;line-height:1.55;margin:0 0 1.25rem}}
.ironman-auth-dots{{display:inline-block;min-width:1.5em;text-align:left}}
.ironman-auth-dots::after{{content:'';display:inline-block;animation:ironman-dots 1.4s steps(4,end) infinite}}
@keyframes ironman-dots{{0%{{content:''}}25%{{content:'.'}}50%{{content:'..'}}75%{{content:'...'}}100%{{content:''}}}}
.ironman-auth-link{{display:block;text-align:center;color:#10b981;text-decoration:none;
  font-size:0.8rem;margin-top:0.75rem;opacity:0.85;transition:opacity 150ms ease,text-shadow 150ms ease}}
.ironman-auth-link:hover{{opacity:1;text-decoration:underline;text-shadow:0 0 12px rgba(16,185,129,0.5)}}
@media (prefers-reduced-motion: reduce){{
  .ironman-loader::before,.ironman-loader::after,.ironman-loader>span,
  .ironman-auth-dots::after,.ironman-auth-card{{animation:none !important}}}}
</style></head>
<body class="ironman-auth">
  <div class="ironman-auth-panel">
    <div class="ironman-auth-card">
      <div class="ironman-loader"><span></span></div>
      <h2 class="ironman-auth-title">Authenticating<span class="ironman-auth-dots"></span></h2>
      <p class="ironman-auth-subtitle">Securely redirecting you to Microsoft Entra ID.<br>Establishing encrypted channel…</p>
      <a href="{auth_url}" class="ironman-auth-link">If you are not redirected automatically, click here.</a>
    </div>
  </div>
</body></html>"""


@auth_bp.route(REDIRECT_PATH)
def authorized():
    # CSRF zaštita: state mora odgovarati onom iz sesije
    expected = session.pop("oauth_state", None)
    got = request.args.get("state")
    if not expected or not got or not hmac.compare_digest(str(got), str(expected)):
        session.clear()
        return redirect(url_for("auth.login"))
    if "code" not in request.args:
        return redirect(url_for("auth.login"))
    try:
        token = _msal_client().acquire_token_by_authorization_code(
            request.args["code"], scopes=["User.Read"],
            redirect_uri=base_url() + REDIRECT_PATH)
    except Exception:
        return "Privremena greška pri Microsoft prijavi. Pokušajte ponovo.", 503
    if "error" in token:
        return "Prijava nije uspjela. Pokušajte ponovo ili kontaktirajte administratora.", 400

    claims = token.get("id_token_claims") or {}
    user_email = (claims.get("preferred_username") or "").strip().lower()
    if not user_email:
        session.clear()
        return "Prijava nije uspjela — nedostaje e-mail identitet.", 400

    # 🛡️ KAPIJA: Microsoft prijava NIJE dovoljna — e-mail mora biti na listi
    allowed = get_allowed(user_email)
    if allowed is None:
        session.clear()
        return render_template("access_denied.html", email=user_email,
                               admin_contact=PERMANENT_ADMIN), 403

    next_url = session.get("next_url")
    session.clear()  # protiv session-fixation napada
    session["user_email"] = user_email
    session["user_name"] = claims.get("name") or user_email
    session["_session_start"] = now_iso()
    session.permanent = True
    return redirect(next_url or "/")


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(
        "https://login.microsoftonline.com/organizations/oauth2/v2.0/logout"
        "?post_logout_redirect_uri=" + quote(base_url() + "/login", safe=""))


# ==================================================================================
# Admin panel — upravljanje listom dozvoljenih e-mail adresa
# ==================================================================================
@auth_bp.route("/admin")
@login_required
def admin_page():
    if not g.is_admin:
        return render_template("access_denied.html", email=g.user_email,
                               admin_contact=PERMANENT_ADMIN), 403
    return render_template("admin.html", auth={
        "email": g.user_email, "name": g.user_name,
        "is_admin": g.is_admin, "permanent_admin": PERMANENT_ADMIN})


@auth_bp.route("/api/admin/users", methods=["GET"])
@admin_required
def admin_list_users():
    rows = [dict(r) for r in db().execute(
        "SELECT id, email, role, added_by, added_at FROM allowed_users "
        "ORDER BY (LOWER(email)=%s) DESC, email", (PERMANENT_ADMIN,))]
    for r in rows:
        r["permanent"] = r["email"].strip().lower() == PERMANENT_ADMIN
    return jsonify({"users": rows, "permanent_admin": PERMANENT_ADMIN})


@auth_bp.route("/api/admin/users", methods=["POST"])
@admin_required
def admin_add_user():
    j = request.get_json(force=True)
    email = (j.get("email") or "").strip().lower()
    role = "admin" if j.get("role") == "admin" else "user"
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Neispravna e-mail adresa"}), 400
    ex = db().execute(
        "SELECT id FROM allowed_users WHERE LOWER(TRIM(email))=%s", (email,)).fetchone()
    if ex:
        return jsonify({"error": "Taj e-mail je već na listi"}), 409
    cur = db().execute(
        "INSERT INTO allowed_users(email,role,added_by,added_at) "
        "VALUES(%s,%s,%s,%s) RETURNING id",
        (email, role, g.user_email, now_iso()))
    uid = cur.fetchone()["id"]
    audit(g.user_name, "korisnik", uid, "pristup dodan", novo=f"{email} ({role})", label=email)
    db().commit()
    return jsonify({"id": uid}), 201


@auth_bp.route("/api/admin/users/<int:uid>", methods=["PATCH", "DELETE"])
@admin_required
def admin_edit_user(uid):
    row = db().execute("SELECT * FROM allowed_users WHERE id=%s", (uid,)).fetchone()
    if row is None:
        return jsonify({"error": "Ne postoji"}), 404
    if row["email"].strip().lower() == PERMANENT_ADMIN:
        return jsonify({"error": "Stalni admin se ne može mijenjati ni brisati"}), 403
    if request.method == "DELETE":
        db().execute("DELETE FROM allowed_users WHERE id=%s", (uid,))
        audit(g.user_name, "korisnik", uid, "pristup uklonjen",
              staro=row["email"], label=row["email"])
        db().commit()
        return "", 204
    j = request.get_json(force=True)
    role = "admin" if j.get("role") == "admin" else "user"
    if role != row["role"]:
        db().execute("UPDATE allowed_users SET role=%s WHERE id=%s", (role, uid))
        audit(g.user_name, "korisnik", uid, "uloga promijenjena",
              staro=row["role"], novo=role, label=row["email"])
        db().commit()
    return jsonify({"ok": True})
