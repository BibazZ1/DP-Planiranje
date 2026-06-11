@echo off
REM ==================================================================================
REM  DEPLOY.bat - Push na main + verifikacija da je kontejner povukao novi commit
REM ==================================================================================
REM
REM  STA RADI (isti princip kao ULAZNE-FAKTURE):
REM    1. Push-a lokalnu main granu na GitHub
REM    2. Ceka da kontejner AUTO-PULL-a novi commit (max 90s)
REM    3. Provjerava da kontejner vrti TACNO isti commit
REM    4. Poredi MD5 hash-eve kljucnih fajlova (lokalno vs kontejner)
REM
REM  UPOTREBA:
REM    DEPLOY.bat              (push main + verifikacija)
REM    DEPLOY.bat --verify     (samo verifikacija, bez push-a)
REM
REM  NAPOMENA: kontejner povlaci kod s main-a (AUTO_UPDATE=true u compose-u).
REM            Za izmjene koda NE treba rebuild — samo push na main + ovaj script.
REM ==================================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

set "VERIFY_ONLY=false"
if "%~1"=="--verify" set "VERIFY_ONLY=true"

REM DP kontejner mapira host 5050 -> kontejner 5000
set "BASE_URL=http://localhost:5050"

REM API_SECRET_KEY iz .env (deploy-status je zasticen X-API-KEY)
set "API_KEY="
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        if "%%a"=="API_SECRET_KEY" set "API_KEY=%%b"
    )
)
if "!API_KEY!"=="" echo    UPOZORENJE: API_SECRET_KEY nije nadjen u .env - provjere mogu pasti

set "TMPJSON=%TEMP%\dp_deploy_%RANDOM%.json"

echo.
echo ==================================================================================
echo    DEPLOY - Push na main + verifikacija kontejnera (DP Planiranje)
echo ==================================================================================
echo.

REM ---- Korak 1: push na main ----
if "%VERIFY_ONLY%"=="true" (
    echo    [SKIP] --verify: preskacem git push
) else (
    echo    [1/4] Push na main granu...
    for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%b"
    if not "!CURRENT_BRANCH!"=="main" (
        echo    GRESKA: nisi na main grani ^(trenutno: !CURRENT_BRANCH!^). Uradi: git checkout main
        exit /b 1
    )
    git push origin main
    if errorlevel 1 (
        echo    GRESKA: git push nije uspio!
        exit /b 1
    )
    echo    OK - push-ano na origin/main
)
echo.

REM ---- Korak 2: lokalni commit ----
echo    [2/4] Lokalni commit...
for /f "delims=" %%h in ('git rev-parse HEAD 2^>nul') do set "LOCAL_COMMIT=%%h"
for /f "delims=" %%s in ('git rev-parse --short HEAD 2^>nul') do set "LOCAL_SHORT=%%s"
echo    Lokalni HEAD: !LOCAL_SHORT! ^(!LOCAL_COMMIT!^)
echo.

REM ---- Korak 3: cekaj da kontejner povuce commit ----
echo    [3/4] Cekam da kontejner auto-pull-a (svakih 5s, max 90s)...
echo.
set "MAX_WAIT=90"
set "POLL=5"
set "ELAPSED=0"
set "MATCH=false"

:poll_loop
if !ELAPSED! GEQ !MAX_WAIT! goto poll_timeout
curl -sf --max-time 5 -H "X-API-KEY: !API_KEY!" -o "!TMPJSON!" "!BASE_URL!/api/deploy-status" 2>nul
if not exist "!TMPJSON!" (
    echo    [!ELAPSED!s] Kontejner ne odgovara...
    goto poll_wait
)
for /f "delims=" %%c in ('powershell -NoProfile -Command "try { (Get-Content -Raw '!TMPJSON!' ^| ConvertFrom-Json).git.commit } catch { '' }"') do set "CONTAINER_COMMIT=%%c"
if "!CONTAINER_COMMIT!"=="" (
    echo    [!ELAPSED!s] Kontejner ne odgovara...
    goto poll_wait
)
if "!CONTAINER_COMMIT!"=="!LOCAL_COMMIT!" (
    set "MATCH=true"
    goto poll_done
)
for /f "delims=" %%s in ('powershell -NoProfile -Command "try { (Get-Content -Raw '!TMPJSON!' ^| ConvertFrom-Json).git.short } catch { '?' }"') do set "CONTAINER_SHORT=%%s"
echo    [!ELAPSED!s] Kontejner na !CONTAINER_SHORT! - cekam !LOCAL_SHORT!...

:poll_wait
del "!TMPJSON!" 2>nul
timeout /t %POLL% /nobreak >nul
set /a ELAPSED+=POLL
goto poll_loop

:poll_timeout
echo.
echo    TIMEOUT: kontejner nije povukao !LOCAL_SHORT! za %MAX_WAIT%s
echo      - kontejner ne radi?       docker ps
echo      - AUTO_UPDATE=false?        provjeri docker-compose.production.yml
echo      - GITHUB_TOKEN istekao?     provjeri .env
echo.
if exist "!TMPJSON!" ( type "!TMPJSON!" & del "!TMPJSON!" 2>nul )
exit /b 1

:poll_done
echo    [!ELAPSED!s] Kontejner azuriran na !LOCAL_SHORT! - commit se poklapa!
echo.

REM ---- Korak 4: verifikacija hash-eva fajlova ----
echo    [4/4] Provjera hash-eva (lokalno vs kontejner)...
echo.
curl -sf --max-time 5 -H "X-API-KEY: !API_KEY!" -o "!TMPJSON!" "!BASE_URL!/api/deploy-status" 2>nul

powershell -NoProfile -Command ^
    "$response = Get-Content -Raw '%TMPJSON%' | ConvertFrom-Json;" ^
    "$root = '%~dp0'.TrimEnd('\');" ^
    "$files = @(" ^
    "  @{Name='app.py'; Path="""$root\app.py"""}," ^
    "  @{Name='static/app.js'; Path="""$root\static\app.js"""}," ^
    "  @{Name='static/style.css'; Path="""$root\static\style.css"""}," ^
    "  @{Name='templates/index.html'; Path="""$root\templates\index.html"""}" ^
    ");" ^
    "$md5 = [System.Security.Cryptography.MD5]::Create();" ^
    "$dirty = (git diff --name-only 2>$null) -split '`n' | Where-Object { $_ };" ^
    "$errors = 0;" ^
    "foreach ($f in $files) {" ^
    "  $name = $f.Name; $localPath = $f.Path;" ^
    "  if (Test-Path $localPath) {" ^
    "    $bytes = [System.IO.File]::ReadAllBytes($localPath);" ^
    "    $text = [System.Text.Encoding]::UTF8.GetString($bytes);" ^
    "    $normalized = $text.Replace(\"`r`n\", \"`n\");" ^
    "    $normBytes = [System.Text.Encoding]::UTF8.GetBytes($normalized);" ^
    "    $localHash = -join ($md5.ComputeHash($normBytes) | ForEach-Object { $_.ToString('x2') });" ^
    "    $containerHash = $response.file_hashes.$name;" ^
    "    $isDirty = $dirty -contains ($name -replace '/','\') -or $dirty -contains $name;" ^
    "    if ($localHash -eq $containerHash) {" ^
    "      Write-Host ('    OK    ' + $name + '  ' + $localHash.Substring(0,12) + '...');" ^
    "    } elseif ($isDirty) {" ^
    "      Write-Host ('    WARN  ' + $name + ' - necommitane lokalne izmjene (kontejner ima committanu verziju)') -ForegroundColor Yellow;" ^
    "    } else {" ^
    "      Write-Host ('    FAIL  ' + $name) -ForegroundColor Red;" ^
    "      Write-Host ('          Lokalno:   ' + $localHash);" ^
    "      Write-Host ('          Kontejner: ' + $containerHash);" ^
    "      $errors++;" ^
    "    }" ^
    "  } else { Write-Host ('    SKIP  ' + $name + ' (lokalni fajl nije nadjen)'); }" ^
    "};" ^
    "$md5.Dispose(); exit $errors"

set "HASH_ERRORS=%errorlevel%"
del "!TMPJSON!" 2>nul
echo.

if !HASH_ERRORS! EQU 0 (
    echo ==================================================================================
    echo    DEPLOY VERIFIKOVAN
    echo      Commit:    !LOCAL_SHORT! ^(!LOCAL_COMMIT!^)
    echo      Kontejner: vrti isti commit
    echo      Fajlovi:   svi hash-evi se poklapaju
    echo      Vrijeme:   !ELAPSED!s
    echo ==================================================================================
) else (
    echo ==================================================================================
    echo    DEPLOY UPOZORENJE - NEPOKLAPANJE HASH-EVA ^(!HASH_ERRORS! fajl^(ova^)^)
    echo      Commit se poklapa, ali fajlovi ne — najcesce necommitane lokalne izmjene.
    echo      Rjesenje: commit+push lokalne izmjene, ili provjeri da su namjerne.
    echo ==================================================================================
    exit /b 1
)
echo.
endlocal
