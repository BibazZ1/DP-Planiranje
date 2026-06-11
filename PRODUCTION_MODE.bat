@echo off
REM ==================================================================================
REM DP PLANIRANJE - produkcijski start (Docker + Cloudflare tunel)
REM ==================================================================================
cd /d "%~dp0"

if not exist .env (
    echo [GRESKA] Nema .env fajla! Kopiraj .env.example u .env i popuni vrijednosti.
    pause
    exit /b 1
)

REM Backup .env prije git operacija (reset --hard ga ne smije izgubiti)
copy /y ".env" ".env.bak" >nul 2>&1

REM Povuci najnoviju main granu (isti princip kao ULAZNE-FAKTURE)
echo Prebacujem na main i povlacim najnovije...
git checkout main
git fetch origin main
git reset --hard origin/main

REM Vrati .env ako ga je git reset obrisao (npr. ako je ikad bio trackan)
if not exist .env (
    echo    [!] git reset je obrisao .env - vracam iz .env.bak...
    copy /y ".env.bak" ".env" >nul 2>&1
)

echo Pokrecem DP Planiranje (build + up)...
REM -p dp-planiranje: vlastiti compose projekat — NE smije dijeliti ime sa ULAZNE-FAKTURE!
REM Nakon starta kontejner AUTO-PULL-a main svakih 30s — za izmjene koda koristi DEPLOY.bat.
docker compose -p dp-planiranje --env-file .env -f docker/docker-compose.production.yml up -d --build

echo.
echo Status:
docker ps --filter "name=dp_planiranje" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
echo Lokalno:  http://localhost:5050
echo Javno:    https://dp-planiranje.mih-kontroling.com  (kad je tunel podesen)
echo Logovi:   docker logs -f dp_planiranje_prod
pause
