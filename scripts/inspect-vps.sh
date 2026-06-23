#!/usr/bin/env bash
# INSPECCIÓN DE SOLO LECTURA. No instala, no arranca, no borra nada.
# Muestra el estado del VPS para decidir con seguridad antes de desplegar.
set -uo pipefail

echo "==================================================="
echo " Núcleo Operativo · inspección de VPS (solo lectura)"
echo "==================================================="

echo
echo "── Sistema ─────────────────────────────────────────"
hostname 2>/dev/null
(. /etc/os-release 2>/dev/null && echo "OS: $PRETTY_NAME") || uname -s
echo "Uptime/carga:$(uptime 2>/dev/null | sed 's/.*up/ up/')"
echo "vCPU: $(nproc)"

echo
echo "── Memoria y disco ─────────────────────────────────"
free -h | awk 'NR==1 || /^Mem/'
echo
df -h / 2>/dev/null | awk 'NR==1 || NR==2'

echo
echo "── Top 5 procesos por memoria ──────────────────────"
ps -eo pmem,pcpu,comm --sort=-pmem 2>/dev/null | head -6

echo
echo "── Puertos en escucha (los que ya usan tus proyectos) ──"
LISTEN=$( (ss -ltnH 2>/dev/null || netstat -tlnp 2>/dev/null | tail -n +3) \
          | awk '{print $4}' | sed 's/.*[:.]//' | sort -un | tr '\n' ' ')
echo "Ocupados: ${LISTEN:-(no pude leer; prueba con sudo)}"

echo
echo "── ¿Chocan los puertos que usaríamos? ──────────────"
for p in 80 443 3000; do
  if echo " $LISTEN " | grep -q " $p "; then
    echo "  puerto $p: OCUPADO"
  else
    echo "  puerto $p: libre"
  fi
done
# Sugiere un puerto libre para el tablero (DASHBOARD_PORT)
for cand in 8090 8091 8092 8095 8100 9000; do
  if ! echo " $LISTEN " | grep -q " $cand "; then
    echo "  → sugerencia DASHBOARD_PORT=$cand (libre)"
    break
  fi
done

echo
echo "── Docker ──────────────────────────────────────────"
if command -v docker >/dev/null 2>&1; then
  docker --version
  echo "Contenedores corriendo:"
  docker ps --format '  {{.Names}}  ({{.Image}})  {{.Ports}}' 2>/dev/null || echo "  (sin permiso; prueba con sudo)"
  echo "Proyectos compose:"
  docker compose ls 2>/dev/null || echo "  (ninguno o sin permiso)"
  echo "¿Existe ya algo llamado 'nucleo' (colisión)?:"
  found=$(docker ps -a --filter name=nucleo --format '{{.Names}}' 2>/dev/null)
  netf=$(docker network ls --filter name=nucleo --format '{{.Name}}' 2>/dev/null)
  volf=$(docker volume ls --filter name=nucleo --format '{{.Name}}' 2>/dev/null)
  if [ -z "$found$netf$volf" ]; then echo "  no — nombre libre ✅"; else echo "  ⚠️  $found $netf $volf"; fi
  echo "Uso de disco de Docker:"
  docker system df 2>/dev/null | sed 's/^/  /'
else
  echo "Docker NO está instalado (se instala con: curl -fsSL https://get.docker.com | sh)"
fi

echo
echo "Inspección terminada. No se modificó nada."
