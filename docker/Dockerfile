# ==================================================================================
# 🚀 DP PLANIRANJE - PRODUKCIJSKI DOCKERFILE
# ==================================================================================
# Isti princip kao ULAZNE-FAKTURE: gunicorn + cloudflared U KONTEJNERU.
# Build:  docker compose --env-file .env -f docker/docker-compose.production.yml up -d --build
# ==================================================================================
FROM python:3.11-slim-bookworm

# git: za AUTO_UPDATE (povlačenje main grane u kontejneru, kao ULAZNE-FAKTURE)
# msodbcsql18: za read-only sync projekata iz Azure SQL (SREDJENI_Daily)
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl gnupg2 ca-certificates apt-transport-https git \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 unixodbc \
    && apt-get purge -y --auto-remove gnupg2 \
    && rm -rf /var/lib/apt/lists/*

# Cloudflare Tunnel (izlaže app na javnu domenu bez otvaranja portova)
RUN ARCH=$(dpkg --print-architecture) && \
    curl -L --output cloudflared.deb "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb" && \
    dpkg -i cloudflared.deb && rm cloudflared.deb

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh && chmod 755 /usr/local/bin/entrypoint.sh

ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD curl -sf http://localhost:5000/api/health || exit 1

EXPOSE 5000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
