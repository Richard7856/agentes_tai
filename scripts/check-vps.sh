#!/usr/bin/env bash
# Revisa que el VPS cumpla lo mínimo para montar la demo. No cambia nada.
set -euo pipefail

echo "== Núcleo Operativo · chequeo de VPS =="
echo "OS:        $(. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME" || uname -s)"
echo "vCPU:      $(nproc)"
echo "RAM total: $(free -h | awk '/^Mem/{print $2}')"
echo "Disco /:   $(df -h / | awk 'NR==2{print $4" libres de "$2}')"
printf "Docker:    "; docker --version 2>/dev/null || echo "NO instalado"
printf "Compose:   "; docker compose version 2>/dev/null | head -1 || echo "NO disponible"

ram_mb=$(free -m | awk '/^Mem/{print $2}')
echo "-----------------------------------------"
if [ "${ram_mb:-0}" -lt 3500 ]; then
  echo "⚠️  RAM = ${ram_mb} MB. El build de Next puede quedarse sin memoria."
  echo "    Soluciones: usa un VPS de >=4 GB, o activa swap (ver docs/demo-deploy.md)."
else
  echo "✅ RAM suficiente para el build (${ram_mb} MB)."
fi
disk_gb=$(df -BG / | awk 'NR==2{gsub("G","",$4); print $4}')
if [ "${disk_gb:-0}" -lt 10 ]; then
  echo "⚠️  Disco libre = ${disk_gb} GB. Recomendado >=10 GB para imágenes Docker."
else
  echo "✅ Disco suficiente (${disk_gb} GB libres)."
fi
