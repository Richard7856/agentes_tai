#!/usr/bin/env bash
# Despliega la demo. Uso:
#   ./scripts/deploy-demo.sh           → modo IP directa (puerto 3000)
#   ./scripts/deploy-demo.sh https     → con dominio + HTTPS + login (Caddy)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "❌ No existe .env. Crea uno:  cp .env.example .env  y edítalo."
  exit 1
fi
if grep -q 'ANTHROPIC_API_KEY=sk-ant-\.\.\.' .env || ! grep -q '^ANTHROPIC_API_KEY=' .env; then
  echo "❌ Pon tu ANTHROPIC_API_KEY real en .env (todavía está el placeholder)."
  exit 1
fi

MODE="${1:-ip}"
if [ "$MODE" = "https" ] || [ "$MODE" = "--https" ]; then
  echo "🚀 Desplegando con HTTPS + login (Caddy)…"
  echo "   Verifica: DEMO_DOMAIN apunta a este servidor y DEMO_PASSWORD_HASH está puesto."
  docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build
  echo "✅ Listo → https://$(grep '^DEMO_DOMAIN=' .env | cut -d= -f2)"
  echo "   Abre SOLO los puertos 80 y 443 en el firewall."
else
  port="$(grep '^DASHBOARD_PORT=' .env | cut -d= -f2)"; port="${port:-3000}"
  echo "🚀 Desplegando en modo IP directa (solo el tablero, puerto ${port})…"
  docker compose up -d --build
  echo "✅ Listo → http://<IP_DEL_VPS>:${port}"
  echo "   Abre el puerto ${port} en el firewall."
fi

echo "-----------------------------------------"
docker compose ps
