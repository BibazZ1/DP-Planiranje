@echo off
title DP Planiranje (lokalni razvoj)
cd /d "%~dp0"

if not exist .venv\Scripts\python.exe (
    echo Pravim virtualno okruzenje i instaliram pakete...
    python -m venv .venv
    .venv\Scripts\python.exe -m pip install -r requirements.txt
)

REM Lokalni razvoj: prijava bez Azure-a (u Dockeru/produkciji se ignorise)
set DEV_FAKE_USER=e.uzunovic@gfcbh.ba

echo.
echo  DP Planiranje se pokrece... otvori u browseru:  http://127.0.0.1:5050
echo  (zatvori ovaj prozor da ugasis aplikaciju)
echo.
start "" http://127.0.0.1:5050
.venv\Scripts\python.exe app.py
pause
