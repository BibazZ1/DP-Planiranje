#!/bin/bash
# ==================================================================================
# DP PLANIRANJE - produkcijski entrypoint (gunicorn + cloudflared + GIT AUTO-PULL)
# ==================================================================================
# Isti princip kao ULAZNE-FAKTURE:
#   - AUTO_UPDATE=true -> kontejner svakih POLL_INTERVAL sekundi povuče main granu
#     s GitHuba i GRACEFULNO reloada gunicorn (HUP) = zero-downtime deploy.
#   - Korisnik samo push-a na main. Bez ručnog rebuild-a za izmjene koda
#     (.py/.js/.html/.css). Rebuild treba SAMO za Dockerfile/requirements/entrypoint.
#   - .env NIJE u gitu (dolazi kroz env_file), pa ga sparse-checkout isključuje.
# ==================================================================================

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }

AUTO_UPDATE="${AUTO_UPDATE:-false}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO_URL="${REPO_URL:-https://github.com/BibazZ1/DP-Planiranje.git}"
BRANCH="${BRANCH:-main}"
POLL_INTERVAL="${POLL_INTERVAL:-30}"

GUNICORN_PID=""
CLOUDFLARED_PID=""
SHUTDOWN=false
GUNICORN_FAILS=0
CLOUDFLARED_FAILS=0
FETCH_FAIL_COUNT=0
LAST_POLL=0
DEPLOY_MANIFEST="/app/.deploy_manifest.json"

# ----------------------------------------------------------------------------------
# Git: inicijalizacija repozitorija (ako ne postoji) i povlačenje main grane
# ----------------------------------------------------------------------------------
setup_git() {
    git config --global --add safe.directory /app 2>/dev/null || true
    git config --global credential.helper "" 2>/dev/null || true

    if [ -n "$GITHUB_TOKEN" ]; then
        # GIT_ASKPASS da token NE završi u .git/config
        export GIT_ASKPASS_SCRIPT="/tmp/.git_askpass.sh"
        echo '#!/bin/sh' > "$GIT_ASKPASS_SCRIPT"
        echo "echo \"$GITHUB_TOKEN\"" >> "$GIT_ASKPASS_SCRIPT"
        chmod 700 "$GIT_ASKPASS_SCRIPT"
        export GIT_ASKPASS="$GIT_ASKPASS_SCRIPT"
        log "🔑 GitHub token konfigurisan (GIT_ASKPASS)"
    else
        log "⚠️ GITHUB_TOKEN nije postavljen — privatni repo se neće moći povući."
    fi

    if [ ! -d ".git" ]; then
        log "📦 Nema git repo-a — inicijalizujem s GitHub-a ($BRANCH)..."
        git init -q
        git remote add origin "$REPO_URL"
        git config core.sparseCheckout true
        mkdir -p .git/info
        echo "/*" > .git/info/sparse-checkout
        echo "!.env" >> .git/info/sparse-checkout
        if GIT_TERMINAL_PROMPT=0 timeout 30 git fetch origin "$BRANCH" 2>/dev/null; then
            git reset --hard "origin/$BRANCH" 2>&1 || true
            git config advice.detachedHead false 2>/dev/null || true
            log "✅ Inicijalizovan repo s $BRANCH ($(git rev-parse --short HEAD 2>/dev/null))"
        else
            log "❌ Fetch nije uspio — provjeri GITHUB_TOKEN/repo. Krećem s kodom iz image-a."
        fi
    else
        git remote set-url origin "$REPO_URL" 2>/dev/null || true
        git config core.sparseCheckout true 2>/dev/null || true
        mkdir -p .git/info
        echo "/*" > .git/info/sparse-checkout
        echo "!.env" >> .git/info/sparse-checkout
        log "✅ Git repo postoji — pratim izmjene na $BRANCH."
    fi
}

# vraća 0 ako ima novih commit-ova na main, inače 1
check_for_updates() {
    [ -d ".git" ] || { setup_git; return 1; }
    local out status
    out=$(GIT_TERMINAL_PROMPT=0 timeout 30 git fetch origin "$BRANCH" 2>&1); status=$?
    if [ $status -ne 0 ]; then
        FETCH_FAIL_COUNT=$((FETCH_FAIL_COUNT + 1))
        if [ $FETCH_FAIL_COUNT -le 3 ]; then
            log "❌ git fetch neuspješan (#$FETCH_FAIL_COUNT): $out"
        elif [ $FETCH_FAIL_COUNT -eq 10 ]; then
            log "🚨 10 uzastopnih fetch grešaka — kontejner vrti STARI kod! Provjeri GITHUB_TOKEN/mrežu."
        fi
        echo "$out" | grep -qi "authentication\|credential\|401\|403" && \
            log "   🔑 Postavi GITHUB_TOKEN u .env za privatni repo."
        return 1
    fi
    [ $FETCH_FAIL_COUNT -gt 0 ] && { log "✅ git fetch oporavljen nakon $FETCH_FAIL_COUNT grešaka"; FETCH_FAIL_COUNT=0; }
    local LOCAL REMOTE
    LOCAL=$(git rev-parse HEAD 2>/dev/null || echo none)
    REMOTE=$(git rev-parse "origin/$BRANCH" 2>/dev/null || echo none)
    if [ "$LOCAL" != "$REMOTE" ] && [ "$REMOTE" != none ] && [ "$LOCAL" != none ]; then
        log "📦 Novi commit-ovi na $BRANCH: ${LOCAL:0:8} -> ${REMOTE:0:8}"
        return 0
    fi
    return 1
}

# povuče izmjene s main; pri promjeni entrypoint-a radi self-update + re-exec
pull_updates() {
    log "📥 Povlačim izmjene s $BRANCH..."
    local CHANGED
    CHANGED=$(git diff --name-only HEAD "origin/$BRANCH" 2>/dev/null | grep -v "^\.env$" || true)
    git reset --hard "origin/$BRANCH" 2>/dev/null || git checkout -f "origin/$BRANCH" 2>/dev/null || true
    local n=0; [ -n "$CHANGED" ] && n=$(echo "$CHANGED" | wc -l)
    log "✅ Ažurirano na $(git rev-parse --short HEAD 2>/dev/null) ($n fajlova)"

    if echo "$CHANGED" | grep -q "requirements.txt"; then
        log "📦 requirements.txt promijenjen — instaliram pakete..."
        pip install -r requirements.txt 2>&1 | tail -20 || \
            log "⚠️ pip install NEUSPJEŠAN — moguć ImportError na novim paketima."
    fi

    # Entrypoint self-update: ako je /app/docker/entrypoint.sh promijenjen, kopiraj i re-exec
    if [ -f "/app/docker/entrypoint.sh" ] && \
       ! cmp -s "/usr/local/bin/entrypoint.sh" "/app/docker/entrypoint.sh" 2>/dev/null; then
        log "🔄 [SelfUpdate] entrypoint promijenjen — ažuriram i re-exec..."
        sed -i 's/\r$//' "/app/docker/entrypoint.sh" 2>/dev/null || true
        cp -f "/app/docker/entrypoint.sh" "/usr/local/bin/entrypoint.sh"
        chmod 755 "/usr/local/bin/entrypoint.sh"
        [ -n "$GUNICORN_PID" ] && kill -TERM "$GUNICORN_PID" 2>/dev/null || true
        [ -n "$CLOUDFLARED_PID" ] && kill -TERM "$CLOUDFLARED_PID" 2>/dev/null || true
        sleep 2
        kill -9 "$GUNICORN_PID" 2>/dev/null || true
        exec "/usr/local/bin/entrypoint.sh" "$@"
    fi
    return 0
}

# zapiše .deploy_manifest.json (čita ga /api/deploy-status)
verify_deployment() {
    local context="${1:-post-update}"
    [ -d ".git" ] || return 0
    local commit short
    commit=$(git rev-parse HEAD 2>/dev/null || echo unknown)
    short=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)
    local h_app h_js h_css h_html
    h_app=$(md5sum /app/app.py 2>/dev/null | cut -d' ' -f1 || echo error)
    h_js=$(md5sum /app/static/app.js 2>/dev/null | cut -d' ' -f1 || echo error)
    h_css=$(md5sum /app/static/style.css 2>/dev/null | cut -d' ' -f1 || echo error)
    h_html=$(md5sum /app/templates/index.html 2>/dev/null | cut -d' ' -f1 || echo error)
    cat > "$DEPLOY_MANIFEST" << MANIFEST_EOF
{
  "commit": "$commit",
  "short": "$short",
  "branch": "$BRANCH",
  "context": "$context",
  "deploy_time": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "hashes": {
    "app.py": "$h_app",
    "static/app.js": "$h_js",
    "static/style.css": "$h_css",
    "templates/index.html": "$h_html"
  }
}
MANIFEST_EOF
    chmod 644 "$DEPLOY_MANIFEST" 2>/dev/null || true
    log "✅ [DeployVerify] $short ($context) — manifest zapisan"
}

# ----------------------------------------------------------------------------------
# Servisi
# ----------------------------------------------------------------------------------
start_gunicorn() {
    log "🚀 Pokrećem gunicorn (port 5000)..."
    gunicorn --bind 0.0.0.0:5000 \
        --workers "${GUNICORN_WORKERS:-2}" \
        --threads "${GUNICORN_THREADS:-8}" \
        --timeout "${GUNICORN_TIMEOUT:-120}" \
        --access-logfile - --error-logfile - \
        app:app &
    GUNICORN_PID=$!
    log "✅ Gunicorn pokrenut (PID: $GUNICORN_PID)"
}

start_cloudflared() {
    if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
        log "☁️ Pokrećem Cloudflare Tunnel..."
        cloudflared tunnel --no-autoupdate --protocol http2 run --token "$CLOUDFLARE_TUNNEL_TOKEN" \
            > >(grep --line-buffered -v -E "CLOUDFLARE_TUNNEL_TOKEN|Environmental variables map|context canceled|stream [0-9]+ canceled by remote with error code 0|ICMP proxy will use|Cannot determine default origin certificate") 2>&1 &
        CLOUDFLARED_PID=$!
        log "✅ Cloudflare Tunnel pokrenut (PID: $CLOUDFLARED_PID)"
        log "🌍 Aplikacija: ${APP_DOMAIN:-https://dp-planiranje.mih-kontroling.com}"
    else
        log "⚠️ CLOUDFLARE_TUNNEL_TOKEN nije postavljen — tunel se NE pokreće (samo lokalno)."
    fi
}

shutdown() {
    SHUTDOWN=true
    log "🛑 Gasim servise..."
    [ -n "$CLOUDFLARED_PID" ] && kill -TERM "$CLOUDFLARED_PID" 2>/dev/null
    [ -n "$GUNICORN_PID" ] && kill -TERM "$GUNICORN_PID" 2>/dev/null
    for _ in $(seq 1 15); do
        g_alive=false; c_alive=false
        [ -n "$GUNICORN_PID" ] && kill -0 "$GUNICORN_PID" 2>/dev/null && g_alive=true
        [ -n "$CLOUDFLARED_PID" ] && kill -0 "$CLOUDFLARED_PID" 2>/dev/null && c_alive=true
        if ! $g_alive && ! $c_alive; then break; fi
        sleep 1
    done
    [ -n "$GUNICORN_PID" ] && kill -9 "$GUNICORN_PID" 2>/dev/null
    [ -n "$CLOUDFLARED_PID" ] && kill -9 "$CLOUDFLARED_PID" 2>/dev/null
    log "✅ Servisi ugašeni."
    exit 0
}
trap shutdown TERM INT

# SIGHUP NIKAD ne gasi kontejner — prosljeđuje se gunicorn-u za graceful reload
handle_hup() {
    if [ -n "$GUNICORN_PID" ] && kill -0 "$GUNICORN_PID" 2>/dev/null; then
        log "🔄 SIGHUP — graceful reload gunicorn-a (PID: $GUNICORN_PID)"
        kill -HUP "$GUNICORN_PID" 2>/dev/null || true
    fi
}
trap handle_hup HUP

# ----------------------------------------------------------------------------------
# Start
# ----------------------------------------------------------------------------------
if [ "$AUTO_UPDATE" = "true" ]; then
    log "🔁 AUTO_UPDATE=true — povlačim main s GitHub-a svakih ${POLL_INTERVAL}s."
    setup_git
    verify_deployment "boot"
else
    log "ℹ️ AUTO_UPDATE=false — kod iz Docker image-a (rebuild za izmjene)."
fi

start_gunicorn
start_cloudflared

# nadzor (svakih 5s) + git poll (svakih POLL_INTERVAL s)
while true; do
    sleep 5
    $SHUTDOWN && break

    if ! kill -0 "$GUNICORN_PID" 2>/dev/null; then
        GUNICORN_FAILS=$((GUNICORN_FAILS + 1))
        if [ "$GUNICORN_FAILS" -ge 5 ]; then
            log "🚨 Gunicorn pao ${GUNICORN_FAILS}x — izlazim, Docker restartuje kontejner..."
            exit 1
        fi
        log "⚠️ Gunicorn pao — restart (#$GUNICORN_FAILS)..."
        start_gunicorn
    else
        GUNICORN_FAILS=0
    fi

    if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ] && ! kill -0 "$CLOUDFLARED_PID" 2>/dev/null; then
        CLOUDFLARED_FAILS=$((CLOUDFLARED_FAILS + 1))
        if [ "$CLOUDFLARED_FAILS" -ge 10 ]; then
            log "🚨 Cloudflare Tunnel pao ${CLOUDFLARED_FAILS}x — izlazim, Docker restartuje kontejner..."
            exit 1
        fi
        log "⚠️ Cloudflare Tunnel pao — restart za 5s (#$CLOUDFLARED_FAILS)..."
        sleep 5
        start_cloudflared
    else
        [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ] && CLOUDFLARED_FAILS=0
    fi

    if [ "$AUTO_UPDATE" = "true" ]; then
        now=$(date +%s)
        if [ $((now - LAST_POLL)) -ge "$POLL_INTERVAL" ]; then
            LAST_POLL=$now
            if check_for_updates; then
                pull_updates "$@"
                verify_deployment "post-update"
                handle_hup
            fi
        fi
    fi
done
