# DP Planiranje

Interaktivni terminski plan gradnje (Bauzeitenplan) — glassmorphism dark UI,
zoom timeline od mjeseci do dana, sve se radi mišem. Flask + SQLite, radi lokalno.

## Pokretanje

```
pip install flask openpyxl
python app.py
```

ili dupli klik na **START.bat** (Windows) — otvori **http://127.0.0.1:5050**.

> Grafikoni koriste Chart.js sa CDN-a — sve ostalo radi offline.
> `http://127.0.0.1:5050/?static=1` isključuje animacije (slabiji računari).

## Kako se koristi

| Akcija | Kako |
|---|---|
| **Novi termin** | prevuci mišem po praznom dijelu reda → izaberi status, komentar, eskalaciju |
| **Uredi termin** | dupli klik na traku → promijeni status/datume/komentar ili obriši |
| **Zoom** | `Ctrl` + kolutić, kolutić na datumima, ili +/−/⛶ dugmad — KW preraste u dane |
| **Filtriranje** | klikni slicer čipove (DP / status / odjel / ⚠ eskalacije) — sve reaguje uživo |
| **Više statusa po aktivnosti** | nacrtaj više termina na istom redu (npr. dio završen, dio otvoren) |
| **Eskalacija** | ⚠ kvačica u popoveru + razlog → traka pulsira crveno, vidi se i u tabeli ispod |
| **Preimenovanje** | dupli klik na naziv aktivnosti; klik na ljubičasti tag mijenja odjel |

- Statusi: 🔴 otvoreno · 🟡 u toku · 🟢 završeno; "danas" linija na timeline-u.
- KPI kartice, grafikoni (status / odjel / % po DP) i lista eskalacija su na **istoj
  stranici** i reaguju na slicere.
- **+ Novi DP** kreira 8 standardnih aktivnosti.

## Podaci & export

- Sve u **bauzeitenplan.db** (SQLite) — backup = kopiraj fajl, briši za reset.
- Više termina (segmenata) po aktivnosti — tabela `segments` (od, do, status,
  komentar, eskalacija, razlog).
- **Export CSV / Excel** (po terminu) + REST API: `/api/data`, `/api/stats`,
  `/api/segments`, `/api/tasks`, `/api/dps`.

## Struktura

```
app.py               Flask backend + SQLite (dps, tasks, segments) + export
templates/index.html UI (jedna stranica)
static/app.js        timeline, zoom, drag-crtanje, popover, sliceri, grafikoni
static/style.css     glassmorphism dark tema + animacije
START.bat            pokretanje duplim klikom (Windows)
```
