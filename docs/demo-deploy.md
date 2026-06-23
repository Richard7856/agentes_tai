# Montar la DEMO en producción

Objetivo: una URL funcional para mostrar **cómo sirve** el sistema, rápido y
barato. La demo corre con **Claude** como cerebro y **datos sintéticos** (no
necesita GPU). Producción real conmuta a **Ollama local** (ver `docs/arquitectura.md`).

> ⚠️ La demo NO es para datos reales de la Gobernadora — eso exige la puerta de
> soberanía (ADR-002) y el servidor con IA local.

## Qué necesitas
- Un **VM Linux sin GPU**: 2 vCPU / **4–8 GB RAM** (el build de Next + agentes pide memoria).
  Opciones baratas: DigitalOcean ($12–24/mes), Hetzner (~€5), AWS Lightsail.
- Tu **`ANTHROPIC_API_KEY`** real.
- (Opcional, para verse pro) un **dominio** apuntando a la IP del VM.

---

## Camino A — Rápido (IP directa, ~5 min, sin dominio)

En el VM (Ubuntu):

```bash
# 1. Docker
curl -fsSL https://get.docker.com | sh

# 2. Código
git clone <repo> && cd agentes_tai
git checkout claude/nucleo-operativo-architecture-24x4bz

# 3. Secretos
cp .env.example .env
nano .env   # pon ANTHROPIC_API_KEY real y cambia PG_PASSWORD / N8N_ENCRYPTION_KEY

# 4. Arranca
docker compose up -d --build

# 5. Abre el puerto 3000 en el firewall/security group del proveedor
```

Abre **http://IP_DEL_VM:3000** → tablero (Resumen + Peticiones, clasificando con Claude).

---

## Camino B — Profesional (dominio + HTTPS + login)

Recomendado para enseñárselo al cliente / a tu socia.

```bash
# 1-3 igual que el Camino A (docker, código, .env con ANTHROPIC_API_KEY)

# 4. Apunta un registro A del dominio a la IP del VM (en tu DNS).

# 5. Genera el hash del password de la demo:
docker run --rm caddy caddy hash-password --plaintext 'TU_PASSWORD'
#   copia el hash a DEMO_PASSWORD_HASH en .env, y ajusta DEMO_DOMAIN y DEMO_USER

# 6. Arranca con el overlay de demo (añade el proxy Caddy con HTTPS automático)
docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build

# 7. Abre SOLO los puertos 80 y 443 en el firewall (Caddy saca el certificado solo)
```

Abre **https://demo.tudominio.com** → pide usuario/contraseña → tablero con candado verde.

---

## Operación

```bash
docker compose logs -f                 # ver logs
docker compose ps                      # estado de servicios
docker compose down                    # apagar (sin borrar datos)
docker compose up -d --build           # actualizar tras un git pull
```

## Recordatorios
- **Pon una alarma de presupuesto en Anthropic.** La demo gasta tokens por cada
  clasificación; el login básico evita que cualquiera la dispare.
- La demo prueba **el flujo y la experiencia**; el cerebro (Claude) se cambia por
  **Ollama local** en producción real con un cambio de `LLM_PROVIDER`.
- Para el cliente, sé claro: "demo funcional sobre datos de prueba; la versión
  final corre con IA local en nube privada".
