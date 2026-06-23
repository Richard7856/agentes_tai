# Montar la DEMO en producción

Objetivo: una URL funcional para mostrar **cómo sirve** el sistema, rápido y
barato. La demo corre con **Claude** como cerebro y **datos sintéticos** (no
necesita GPU). Producción real conmuta a **Ollama local** (ver `docs/arquitectura.md`).

> ⚠️ La demo NO es para datos reales de la Gobernadora — eso exige la puerta de
> soberanía (ADR-002) y el servidor con IA local.

## Seguro para un VPS compartido (con otros proyectos corriendo)

Este stack está pensado para no estorbar a otros proyectos del mismo servidor:
- **Nombre de proyecto `nucleo`** → contenedores, red y volúmenes namespaced
  (`nucleo_*`); no chocan con tus otros contenedores.
- **Solo el tablero publica puerto** al host (configurable con `DASHBOARD_PORT`).
  Base de datos, agentes, gateway, etc. quedan en la red interna, **sin exponerse**.

## Qué necesitas
- VM/VPS Linux sin GPU, **≥4 GB RAM** (el build de Next pide memoria). Tu VPS de
  16 GB sobra.
- Tu **`ANTHROPIC_API_KEY`** real.
- Un **puerto libre** para el tablero (revisa cuáles usan tus otros proyectos).

---

## Camino A — recomendado en VPS compartido (IP + puerto libre)

```bash
# 1. Docker (si no lo tienes)
curl -fsSL https://get.docker.com | sh

# 2. Código (repo privado → usa tu token/SSH de GitHub al clonar)
git clone <repo> agentes_tai && cd agentes_tai
git checkout claude/nucleo-operativo-architecture-24x4bz

# 3. Revisa qué puertos están ocupados, para elegir uno libre
ss -tlnp | awk '{print $4}'        # lista puertos en uso

# 4. Secretos + puerto del tablero
cp .env.example .env
nano .env
#   - ANTHROPIC_API_KEY = tu key real
#   - DASHBOARD_PORT = un puerto libre (ej. 8090)
#   - cambia PG_PASSWORD y N8N_ENCRYPTION_KEY

# 5. Arranca (solo expone el tablero en DASHBOARD_PORT)
bash scripts/deploy-demo.sh

# 6. Abre ese puerto en el firewall del proveedor
```

Abre **http://IP_DEL_VPS:DASHBOARD_PORT** → tablero (Resumen + Peticiones).

---

## Camino B — con dominio + HTTPS + login (Caddy)

Solo si los puertos **80 y 443 están LIBRES** en tu VPS.

```bash
# 1-4 igual que el Camino A (+ apunta un registro A del dominio a la IP)

# 5. Hash del password de la demo
docker run --rm caddy caddy hash-password --plaintext 'TU_PASSWORD'
#   en .env: DEMO_DOMAIN, DEMO_USER, DEMO_PASSWORD_HASH

# 6. Arranca con el proxy
bash scripts/deploy-demo.sh https

# 7. Abre SOLO 80 y 443 en el firewall (Caddy saca el certificado solo)
```

Abre **https://demo.tudominio.com** → login → tablero con candado verde.

### Si 80/443 ya los usa otro proyecto (caso común)
No uses Caddy. Deja el tablero en `DASHBOARD_PORT` (Camino A) y, en tu **proxy
existente** (nginx/Caddy/Traefik de tus otros proyectos), agrega un vhost que
mande tu dominio a `http://127.0.0.1:DASHBOARD_PORT`. Así reutilizas el HTTPS
que ya tienes sin tocar los otros sitios.

---

## Operación

```bash
docker compose logs -f                 # ver logs
docker compose ps                      # estado de servicios
docker compose down                    # apagar (sin borrar datos)
docker compose up -d --build           # actualizar tras un git pull
```

> Depurar en local (re-expone puertos internos en 127.0.0.1):
> `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`

## Recordatorios
- **Pon una alarma de presupuesto en Anthropic.** El login básico (Camino B)
  evita que cualquiera dispare tokens; en Camino A, no compartas la URL pública.
- La demo prueba **el flujo y la experiencia**; el cerebro (Claude) se cambia por
  **Ollama local** en producción real con un cambio de `LLM_PROVIDER`.
- Para el cliente: "demo funcional sobre datos de prueba; la versión final corre
  con IA local en nube privada".
