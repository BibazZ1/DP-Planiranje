# DP Planiranje

Interaktivni terminski plan gradnje (Bauzeitenplan) — glassmorphism dark UI,
zoom timeline od mjeseci do dana, sve se radi mišem.

**v4:** Flask + **PostgreSQL** + **Microsoft Entra (Azure AD) prijava** + admin
panel za kontrolu pristupa. Hostuje se kao ULAZNE-FAKTURE: Docker + Cloudflare
tunel → **https://dp-planiranje.mih-kontroling.com**

## 🔐 Prijava i pristup

- Prijava ide preko **Microsoft Entra ID** (isti app registration kao ULAZNE-FAKTURE).
- Microsoft prijava **nije dovoljna** — e-mail mora biti na listi u tabeli
  `allowed_users` (admin panel: **/admin**).
- **Stalni admin:** `e.uzunovic@gfcbh.ba` (env `PERMANENT_ADMIN`) — uvijek
  ima pristup, ne može se obrisati ni degradirati. Mora biti e-mail **kako ga
  Microsoft prijavljuje** (preferred_username), ne alias.
- Admini dodaju/brišu e-mail adrese i dodjeljuju uloge (korisnik / admin) na /admin.
- Svaka promjena pristupa se trajno bilježi u `audit_log`.

## 🗄️ Baza

PostgreSQL na istom serveru kao ULAZNE-FAKTURE (localhost:5432), ali:

- **vlastita baza** `DP-PLANIRANJE`
- **vlastiti korisnik** `dp_planiranje` koji **nema nikakva prava** na baze
  ULAZNIH FAKTURA — fizički ne može da ih ošteti.

## 🚀 Produkcija (Docker)

```
PRODUCTION_MODE.bat
```

ili ručno:

```
docker compose -p dp-planiranje --env-file .env -f docker/docker-compose.production.yml up -d --build
```

> ⚠️ **VAŽNO:** uvijek koristiti compose projekat `dp-planiranje` (`name:` u
> compose fajlu + `-p` flag). Bez toga bi se projekat zvao "docker" (po folderu)
> — isto kao ULAZNE-FAKTURE — i `up` bi zamijenio njihov produkcijski kontejner!

- Kontejner: `dp_planiranje_prod`, lokalna provjera: http://localhost:5050
- Cloudflare tunel radi **u kontejneru** (kao kod ULAZNIH FAKTURA) i izlaže
  aplikaciju na https://dp-planiranje.mih-kontroling.com — treba
  `CLOUDFLARE_TUNNEL_TOKEN` u `.env`.
- `.env` živi samo na host mašini (nije u gitu) — vidi `.env.example`.
- Logovi: `docker logs -f dp_planiranje_prod`

### Šta mora postojati da bi javni pristup radio

1. **Cloudflare tunel** (Zero Trust → Networks → Tunnels): novi tunel s javnim
   hostname-om `dp-planiranje.mih-kontroling.com` → `http://localhost:5000`,
   token upisati u `.env` kao `CLOUDFLARE_TUNNEL_TOKEN`, pa restart kontejnera.
2. **Azure redirect URI**: u app registration (`CLIENT_ID` iz .env) dodati
   `https://dp-planiranje.mih-kontroling.com/getAToken`
   (Azure Portal → App registrations → Authentication → Web → Add URI).

## 💻 Lokalni razvoj

```
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
set DEV_FAKE_USER=eldar.uzunovic@mih-fiber.com   (prijava bez Azure-a; ne radi u Dockeru)
.venv\Scripts\python app.py                       (port 5050, ili PORT=...)
```

## Kako se koristi

| Akcija | Kako |
|---|---|
| **Novi termin** | prevuci mišem po praznom dijelu reda → izaberi status, komentar, eskalaciju |
| **Produži / skrati** | povuci lijevu ili desnu ivicu trake → mijenja datum početka/kraja |
| **Uredi termin** | dupli klik na traku → promijeni status/datume/komentar ili obriši |
| **Zoom** | `Ctrl` + kolutić ili +/−/⛶ dugmad — KW preraste u dane (običan scroll = pomjeranje) |
| **Filtriranje** | klikni slicer čipove (POP / DP / status / odjel / ⚠ eskalacije) — sve reaguje uživo |
| **Više statusa po aktivnosti** | nacrtaj više termina na istom redu (npr. dio završen, dio otvoren) |
| **Eskalacija** | ⚠ kvačica u popoveru + razlog → traka pulsira crveno, vidi se i u tabeli ispod |
| **Preimenovanje** | dupli klik na naziv aktivnosti; klik na ljubičasti tag mijenja odjel |
| **Admin panel** | ⚙ Admin dugme u headeru (vide ga samo admini) → /admin |

- Statusi: 🔴 otvoreno · 🟡 u toku · 🟢 završeno; "danas" linija na timeline-u.
- KPI kartice, grafikoni i lista eskalacija su na istoj stranici i reaguju na slicere.
- **+ Novi DP** kreira 8 standardnih aktivnosti.
- Historija izmjena bilježi **stvarno ime prijavljenog korisnika** (iz Microsoft naloga).

## Podaci & export

- Sve u Postgres bazi `DP-PLANIRANJE` (dps, tasks, segments, pops, audit_log,
  allowed_users…).
- **Export CSV / Excel** (po terminu) + REST API: `/api/data`, `/api/stats`,
  `/api/segments`, `/api/tasks`, `/api/dps`, `/api/admin/users`.

## Struktura

```
app.py                Flask backend (Postgres) + export
auth.py               Microsoft Entra prijava + allowed_users kapija + admin API
database.py           Postgres konekcija, šema, seed
templates/index.html  UI (jedna stranica)
templates/admin.html  admin panel (lista dozvoljenih korisnika)
templates/access_denied.html  stranica za odbijene korisnike
static/app.js         timeline, zoom, drag-crtanje, popover, sliceri, grafikoni
static/style.css      glassmorphism dark tema + animacije
docker/               Dockerfile, entrypoint (gunicorn+cloudflared), compose
PRODUCTION_MODE.bat   produkcijski start (Docker)
.env.example          predložak konfiguracije (kopiraj u .env)
```
