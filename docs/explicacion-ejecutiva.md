# Núcleo Operativo — explicación ejecutiva (sin tecnicismos)

Documento para explicar el proyecto a cualquier persona, sin saber de programación.

## ¿Qué estamos construyendo?

Un **equipo de asistentes digitales con inteligencia artificial** para el
despacho de la Gobernadora, con un **tablero único** donde se ve y controla todo.

Piénsalo como contratar a un **jefe de gabinete digital** que coordina a varios
**asistentes especializados**. Cada asistente hace una tarea; el jefe de
gabinete reparte el trabajo y junta los resultados en una sola pantalla.

## Los 4 asistentes (Fase 1)

1. **Agenda y Reuniones** — prepara a la Gobernadora antes de cada reunión: una
   ficha con el objetivo, quiénes asisten, antecedentes, temas delicados y
   posibles acuerdos.
2. **Peticiones Ciudadanas** — recibe una solicitud de un ciudadano, la entiende,
   le pone folio, define qué tan urgente es y a qué dependencia debe ir.
3. **Pendientes y Prioridades** — junta todos los pendientes y los ordena: qué es
   urgente, qué es estratégico y qué se puede delegar.
4. **Control de Acuerdos** — vigila compromisos: quién es responsable, para
   cuándo, si hay retraso, con alertas tipo semáforo.

> La arquitectura ya está pensada para **10 asistentes**, pero por contrato ahora
> trabajamos y cobramos por **4**. Sumar más después es “enchufar” uno nuevo, no
> rehacer el sistema.

## ¿En qué punto estamos hoy? (avance real)

Imagina construir una casa: ya está **la estructura completa y funcionando**, y
una habitación **totalmente amueblada** como muestra.

- ✅ **El tablero existe y se ve**: muestra los asistentes activos.
- ✅ **El “jefe de gabinete” funciona**: reparte trabajo a los asistentes.
- ✅ **El asistente de Peticiones ya trabaja de verdad**: le escribes una petición
  ciudadana y la IA la clasifica (urgencia, dependencia, folio). *Esta es la
  demostración en vivo.*
- ✅ Los otros 3 asistentes están **conectados y responden**, en versión básica.
- ✅ **Controles de calidad automáticos** que verifican que los asistentes hacen
  lo que se espera.

Lo que **falta** (siguiente etapa):
- 🔲 Darles **memoria documental** (el RAG, abajo se explica).
- 🔲 Conectar entradas reales (formularios, correo, calendario).
- 🔲 Pantallas para los otros 3 asistentes y control de accesos.
- 🔲 Publicarlo en la nube para uso real.

## ¿Cómo entra el “RAG”? (en simple)

Hoy los asistentes responden con su **conocimiento general**. El **RAG** es
darles un **archivero inteligente** del despacho: minutas, oficios, acuerdos
previos.

Analogía: en vez de pedirle a un asistente que conteste **de memoria**, primero
**consulta el archivo del despacho** y responde con base en documentos reales.
Así la ficha de una reunión incluye los **antecedentes verdaderos**, no algo
inventado.

Importante: ese archivero vive **dentro del entorno del despacho**. Los
documentos **no se prestan a nadie de fuera**; solo se consulta el pedacito
necesario para cada respuesta.

## ¿Cómo se complementa con la nube?

La **nube** es simplemente **el edificio rentado donde vive el sistema** (los
servidores). Nuestro sistema es **portátil**: corre igual en la nube (AWS) o en
un servidor propio del gobierno.

- La nube guarda la **base de datos** (folios, acuerdos, agenda) **y** el
  archivero del RAG — son **la misma base**, no dos sistemas.
- Hoy, para avanzar rápido y con **datos de prueba**, el “cerebro” de IA es un
  servicio externo (Claude).
- Para **datos reales de gobierno**, el plan es mover ese cerebro a un **servidor
  propio** (IA local), para que **nada sensible salga**. Cambiar de uno a otro es
  apretar un interruptor, no rehacer nada.

## En una frase

Ya tenemos un sistema **vivo y demostrable** con un asistente trabajando de
verdad; lo que sigue es **darle memoria documental (RAG)**, **conectar las
fuentes reales** y **publicarlo en la nube** para uso del despacho.
