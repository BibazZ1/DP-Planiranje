# DP Planiranje – Bauzeitenplan

Interaktivni terminski plan gradnje (zamjena za Excel Gantt) — moderna dark-mode web
aplikacija koja radi lokalno (Flask + SQLite).

![status](https://img.shields.io/badge/status-aktivno-19e3a2) ![python](https://img.shields.io/badge/python-3.10%2B-39a7ff)

## Pokretanje

```
pip install flask openpyxl
python app.py
```

ili dupli klik na **START.bat** (Windows) — otvori se **http://127.0.0.1:5050**.

> Grafikoni (tab Statistika) koriste Chart.js sa CDN-a — sve ostalo radi 100% offline.

## Funkcije

### Plan (Gantt)
- Tabela po DP-ovima: POP/FCP, aktivnost, odjel, status, plan/stvarni datumi, eskalacija, komentar —
  sve se **edituje direktno u tabeli** (padajuće liste + kalendar).
- Gantt mreža KW1–52 s **datumima automatski iznad svake sedmice** (+ mjeseci).
- ✏ **Crtanje mišem**: izaberi status (otvoreno / u toku / završeno / briši) pa
  **klikni ili prevuci po mreži sedmica** — aplikacija sama upiše "plan od/do" datume
  i oboji trake. `Esc` otkazuje crtanje u toku.
- Boje: 🟢 završeno · 🟡 u toku · 🔴 otvoreno; stvarni datumi = plava linija ispod trake;
  tekuća sedmica je istaknuta.
- Ako upišeš "stvarno do", status automatski skoči na "završeno".
- Filteri (DP / status / odjel / eskalacija) + pretraga; KPI kartice uživo.
- **+ Novi DP** automatski kreira 8 standardnih aktivnosti; "+ aktivnost" dodaje custom.

### Statistika
- Kartice (ukupno / završeno / u toku / otvoreno / eskalacije / HP / HA),
  grafikoni po statusu, odjelu i % napretka po DP-u,
  lista eskalacija i **probijenih rokova** (plan do < danas, a nije završeno).

### Podaci & export
- Sve u **bauzeitenplan.db** (SQLite) pored aplikacije — backup = kopiraj fajl.
  Obriši ga za reset (na startu se ponovo napune primjeri).
- **Export CSV / Excel** dugmad gore desno — za pivot/analize.
- REST API: `/api/data`, `/api/stats`, `/api/tasks`, `/api/dps` — lako za integracije.

## Struktura

```
app.py               Flask backend + SQLite (dps, tasks) + export endpointi
templates/index.html UI
static/app.js        logika mreže, crtanje mišem, grafikoni
static/style.css     dark tema
START.bat            pokretanje duplim klikom (Windows)
```
