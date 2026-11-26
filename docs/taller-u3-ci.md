# Taller Práctico – Unidad 3: Integración continua aplicada al proyecto

**Proyecto:** CHRONOS XXI – E-commerce de relojes premium (HTML/CSS/JavaScript vanilla)
**Repositorio:** https://github.com/estcaramirez-source/chronos
**Pipeline:** https://github.com/estcaramirez-source/chronos/actions/workflows/ci.yml
**Fecha de corte de la evidencia:** 18 de noviembre de 2026 (hora Colombia) – ejecuciones #1 a #7

---

## 1. Ficha de infraestructura de CI

| Campo | Su proyecto |
|---|---|
| Plataforma del repositorio y herramienta de CI | GitHub (repositorio público) + **GitHub Actions** |
| Tipo de ejecutor y sistema operativo | Runner **alojado por GitHub** (`ubuntu-latest`, Ubuntu 24.04, x64). Un job efímero por ejecución; Docker disponible en el runner para el job de staging |
| Lenguaje, versión y gestor de dependencias | JavaScript (ES2022, scripts de navegador) · **Node.js 22 LTS** para las herramientas · **npm** (versiones exactas fijadas en `package.json`) |
| Comando único de pruebas | `npm run test:ci` → `jest --ci --coverage` (lint + pruebas juntos: `npm run ci`) |
| Archivo de configuración del pipeline y su ruta | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) · complementos: `jest.config.js` (umbral de cobertura), `eslint.config.js` (análisis estático), `Dockerfile` (staging), `scripts/smoke-test.sh`, `scripts/coverage-summary.js` |
| Secretos o variables de entorno (nombres, no valores) | **Secretos:** `GITHUB_TOKEN` (lo inyecta GitHub automáticamente, con permisos mínimos `contents: read` y `pull-requests: write` solo en el job que comenta el PR). No se requieren otros secretos: el sitio es estático y no consume APIs con credenciales. **Variables:** `NODE_VERSION=22`, `APP_ENV=staging`, `STAGING_PORT=8080`. **Reservados para el despliegue real (futuro):** `STAGING_DEPLOY_TOKEN`, `PROD_DEPLOY_TOKEN` como *Environment secrets* |

## 2. Relación de conceptos

| Concepto | Letra |
|---|---|
| 1. Integración continua | **c** |
| 2. Runner / agente | **a** |
| 3. Artefacto | **b** |
| 4. Umbral de calidad | **f** |
| 5. Staging | **d** |
| 6. Jenkinsfile | **e** |

## 3. Diseño del flujo de CI (commit → notificación)

Tiempos reales tomados de la ejecución [#7](https://github.com/estcaramirez-source/chronos/actions/runs/44431413545) (API de GitHub, `started_at`/`completed_at` de cada paso).

| N.º | Etapa | Objetivo | Comando o acción real | Condición de fallo | Tiempo (real) |
|---|---|---|---|---|---|
| 1 | Disparo y checkout | Iniciar con cada *push* a `main`/`develop` o PR; obtener el código | `on: push / pull_request` + `actions/checkout@v5` | Error de sintaxis del YAML o repo inaccesible | 3 s |
| 2 | Entorno + caché | Instalar Node 22 y restaurar la caché de npm | `actions/setup-node@v5` con `cache: npm` | Versión de Node inexistente | 4 s |
| 3 | Instalación | Instalar dependencias de desarrollo | `npm install --no-audit --no-fund` | Paquete no resoluble / red | 5 s |
| 4 | Análisis estático | Detectar errores sin ejecutar código | `npm run lint` (`eslint . --max-warnings 0`) | ≥ 1 error **o** advertencia | 1 s |
| 5 | Auditoría de dependencias | Bloquear librerías con fallas graves | `npm audit --audit-level=critical` | ≥ 1 vulnerabilidad crítica | < 1 s |
| 6 | Pruebas + cobertura | Validar el comportamiento y medir cobertura | `npm run test:ci` (Jest + jsdom, 84 pruebas) | 1 prueba fallida **o** cobertura < umbral | 3 s |
| 7 | Reporte y artefacto | Conservar evidencia aun si falla | `scripts/coverage-summary.js` + `actions/upload-artifact@v6` (`coverage/`, `reports/junit.xml`) | Solo advierte si no hay archivos | 1 s |
| 8 | Staging (Docker) | Desplegar la imagen como en producción | `docker build` + `docker run nginx:1.27-alpine` | La imagen no construye o el contenedor no arranca | 3 s |
| 9 | Pruebas de humo | Verificar el despliegue | `bash scripts/smoke-test.sh` (17 recursos en 200, contenidos clave, 404 controlado) | Algún recurso ≠ 200 o falta contenido | < 1 s |
| 10 | Notificación | Informar al equipo | Anotaciones `::notice`/`::error`, resumen del job, comentario en el PR, insignia del README, correo de GitHub al autor | — | inmediato |

Duración total de una ejecución verde: **≈ 34 s** (build 18 s + staging 9 s + colas).

**Justificación *fail fast*.** Las etapas van de la más barata a la más costosa: el lint cuesta 1 s y detecta errores de sintaxis/variables que harían inútil ejecutar pruebas; la auditoría es casi gratuita; las pruebas (3 s) solo corren si el código es estáticamente válido; el job de staging construye una imagen Docker (lo más costoso) y se declara con `needs: build`, por lo que **no se ejecuta** si algo anterior falla. Evidencia: en la ejecución [#3](https://github.com/estcaramirez-source/chronos/actions/runs/44430471598) falló el lint y las pruebas no se ejecutaron; en la [#6](https://github.com/estcaramirez-source/chronos/actions/runs/44430954143) fallaron las pruebas y staging quedó *skipped*. Además `concurrency` con `cancel-in-progress` cancela ejecuciones obsoletas de la misma rama.

## 4. Selección de la herramienta de CI (2.2)

### a) Tabla comparativa

Límites verificados en la documentación oficial el 18/11/2026 (ver fuentes).

| Atributo | Jenkins | GitLab CI | GitHub Actions |
|---|---|---|---|
| Archivo de configuración | `Jenkinsfile` (Groovy, declarativo o *scripted*) | `.gitlab-ci.yml` (YAML) | `.github/workflows/*.yml` (YAML) |
| Modelo de infraestructura | Autogestionado: servidor controlador + agentes propios (on-premise o nube) | SaaS (GitLab.com) o autogestionado | SaaS integrado a GitHub; runners alojados o propios |
| Ejecutor | Agentes (nodos) configurados por el equipo | GitLab Runner (compartidos en GitLab.com o propios) | Runners alojados (Ubuntu/Windows/macOS) o *self-hosted* |
| Costo en un proyecto académico | Software libre, pero hay que pagar/proveer el servidor (VM, energía, tiempo de administración) | Nivel Free: **400 minutos de cómputo/mes** por *namespace*; máx. **5 usuarios** en grupos privados (sin límite si el grupo es público) | **Gratis e ilimitado en repos públicos** con runners estándar; repos privados del plan Free: cuota incluida de **US$12/mes** (≈ 2.000 min Linux a US$0,006/min), 500 MB de artefactos y 10 GB de caché por repo |
| Mantenimiento | Alto: actualizar Jenkins, plugins, Java, seguridad del servidor, respaldos | Bajo en SaaS; medio si se autogestiona el runner | Bajo: runners efímeros administrados por GitHub; solo mantener versiones de las *actions* |
| Integración con el repositorio | Vía *webhooks* y plugins (GitHub/GitLab Branch Source) | Nativa con GitLab (MR, *environments*, registro) | Nativa con GitHub: checks en PR, protección de ramas, insignias, `GITHUB_TOKEN` automático |
| Ecosistema | +1.800 plugins, muy flexible pero heterogéneo | Plantillas y componentes CI/CD, Auto DevOps | GitHub Marketplace con miles de *actions* reutilizables (`setup-node`, `upload-artifact`, `github-script`) |
| Manejo de secretos | Credentials plugin en el servidor | Variables CI/CD protegidas/enmascaradas | *Secrets* por repo/organización/*environment*, enmascarados en logs |

### b) Justificación y riesgos

**Elección: GitHub Actions.** (1) El repositorio ya está en GitHub, por lo que la integración es nativa (checks en PR, insignia, token automático) sin servidores ni *webhooks*. (2) Al ser un repositorio **público**, los minutos de runners estándar son gratuitos e ilimitados: con ~34 s por ejecución, incluso 50 *pushes* diarios costarían 0 USD (y, si fuera privado, 50 × 30 días × 1 min redondeado = 1.500 min/mes, todavía bajo la cuota de ~2.000 min). (3) El equipo no tiene infraestructura propia para Jenkins y GitLab CI exigiría migrar el repositorio. (4) Mantenimiento casi nulo: el runner es efímero.

| Riesgo | Impacto | Mitigación aplicada / prevista |
|---|---|---|
| **Cuota de minutos** si el repo pasa a privado o se agregan jobs pesados | Pipeline bloqueado a fin de mes | `concurrency` cancela ejecuciones obsoletas; caché de npm; jobs con `timeout-minutes: 10`; staging solo tras build verde; monitorear el consumo en *Settings → Billing* |
| **Manejo de secretos / cadena de suministro** (token con demasiados permisos o *action* de terceros comprometida) | Fuga de credenciales o código malicioso en el pipeline | `permissions: contents: read` global y permisos de escritura solo donde se necesitan; solo *actions* oficiales de `actions/*`; comentario en PR deshabilitado para PR desde *forks*; nunca se escriben valores en el YAML (se usarán *Environment secrets*) |
| Dependencia del proveedor (*lock-in*) | Migración costosa | La lógica vive en scripts npm (`npm run ci`, `smoke-test.sh`) ejecutables en cualquier CI; el YAML solo los orquesta |

## 5. Umbrales de calidad y retroalimentación (2.3)

### Tabla de umbrales

| # | Umbral (valor) | Comando que lo aplica | Qué ocurre al fallar | Canal de notificación |
|---|---|---|---|---|
| 1 | **0 errores y 0 advertencias** de ESLint | `npm run lint` (`--max-warnings 0`) | El paso termina con código 1; el job se detiene (no corren pruebas ni staging) | Anotación en archivo/línea en la ejecución y en la pestaña *Files* del PR; correo al autor; check rojo |
| 2 | **100 % de pruebas aprobadas** | `npm run test:ci` | Job rojo; staging *skipped* | Anotación `::error` con el nombre de cada prueba fallida; tabla en el resumen; **comentario en el PR** |
| 3 | **Cobertura ≥ 80 % líneas, sentencias y funciones; ≥ 70 % ramas** (módulos `auth`, `cart`, `products`) | `coverageThreshold` en `jest.config.js` | Jest sale con código 1 aunque todas las pruebas pasen | Anotación `Cobertura`, tabla ✅/❌ en el resumen y comentario en el PR |
| 4 | **0 vulnerabilidades críticas** en dependencias | `npm audit --audit-level=critical` | Job rojo antes de las pruebas | Log del paso + correo + check rojo |
| 5 | **100 % de pruebas de humo** (17 recursos en HTTP 200, contenido clave, 404 controlado) | `bash scripts/smoke-test.sh` | Job de staging rojo; se imprimen los logs del contenedor | Anotación `::error title=Smoke test`; insignia del README en rojo |
| 6 | **Duración ≤ 10 min** por job | `timeout-minutes: 10` | GitHub cancela el job | Estado *cancelled* + correo |

### Canales de retroalimentación

- **Insignia de estado en el README** (estado de `main`, visible para todo el equipo y el docente).
- **Checks del pull request**: el PR muestra ✅/❌ por job; con protección de rama en `main` se exige verde para fusionar.
- **Comentario automático en el PR** (`actions/github-script`): tabla de pruebas y cobertura; se actualiza el mismo comentario en cada *push*.
- **Anotaciones y resumen del job** (`$GITHUB_STEP_SUMMARY`): prueba fallida con su mensaje, sin leer el log completo.
- **Correo de GitHub** al autor del commit cuando su ejecución falla (configuración por defecto de *Notifications → Actions*).

### Plan de subida progresiva del umbral

Situación actual: los módulos de negocio tienen 100 % de líneas y 88,8 % de ramas, pero `scripts.js` (246 líneas de interfaz: menú, animaciones, garantías) **aún no tiene pruebas y está fuera de la medición**. Objetivo del plan de pruebas: **≥ 85 % de líneas y ≥ 80 % de ramas sobre todo el JavaScript**. Regla: el umbral solo sube (*ratchet*), nunca baja.

| Sprint | Fechas | Alcance medido | Umbral líneas / ramas | Acción |
|---|---|---|---|---|
| S1 (actual) | 18 nov – 1 dic 2026 | `auth`, `cart`, `products` | 80 % / 70 % | Gate activo; medir línea base global con `scripts.js` en modo informe |
| S2 | 2 – 15 dic 2026 | Igual | 90 % / 85 % | Pruebas de ramas faltantes (errores de almacenamiento, rutas alternas) |
| S3 | 12 – 25 ene 2027 | **+ `scripts.js`** | 70 % / 60 % global | Refactor de `scripts.js` en funciones exportables y primeras pruebas DOM |
| S4 | 26 ene – 8 feb 2027 | Todo el JS | 80 % / 70 % global | Pruebas de menú, contador y garantías |
| S5 | 9 – 22 feb 2027 | Todo el JS | **85 % / 80 % global (objetivo)** | Consolidar; agregar umbral por archivo para evitar regresiones |

## 6. Pipeline funcionando en el repositorio – evidencia

| Requisito | Cumplimiento |
|---|---|
| Archivo versionado, disparado por *push* a `main`/`develop` y por PR | `.github/workflows/ci.yml` – bloque `on:` |
| Instalación, análisis estático, pruebas, cobertura con umbral que falla, artefacto | Pasos 3 a 7 del job `build`; artefacto `reportes-ci-<n>` (14 días) |
| Secretos de la plataforma | Solo `GITHUB_TOKEN` automático con permisos mínimos; ningún valor sensible en el repo |
| Caché de dependencias | `actions/setup-node` con `cache: npm` |
| Insignia de estado | Primera línea del README |

**Ejecuciones (todas públicas):**

| # | Rama | Commit | Resultado | Causa |
|---|---|---|---|---|
| [1](https://github.com/estcaramirez-source/chronos/actions/runs/44430272616) | main | [141ff11](https://github.com/estcaramirez-source/chronos/commit/141ff113f661decc88827584ea20d07a7403557d) | ❌ | 73/74: la prueba del modal recargaba `cart.js` sin `window.authSystem` (error de la prueba) |
| [2](https://github.com/estcaramirez-source/chronos/actions/runs/44430272674) | develop | 141ff11 | ❌ | Misma causa |
| [3](https://github.com/estcaramirez-source/chronos/actions/runs/44430471598) | main | [52db852](https://github.com/estcaramirez-source/chronos/commit/52db8527f93f20e833c0632eb12ffea053ea0a8a) | ❌ | **Lint**: regex con carácter de control (`no-control-regex`) en el script de reporte |
| [4](https://github.com/estcaramirez-source/chronos/actions/runs/44430567473) | main | [70b987b](https://github.com/estcaramirez-source/chronos/commit/70b987b316aa68bfbddcac48f38555ba83d1195f) | ❌ | Ahora la anotación nombra la prueba fallida → diagnóstico |
| [5](https://github.com/estcaramirez-source/chronos/actions/runs/44430754291) | main | [2083dfc](https://github.com/estcaramirez-source/chronos/commit/2083dfceca69e53a4b05adbc8111ebead0dc7522) | ✅ | **Ejecución exitosa**: 74/74, cobertura 100 % líneas, staging OK |
| [6](https://github.com/estcaramirez-source/chronos/actions/runs/44430954143) | develop | [a07ee46](https://github.com/estcaramirez-source/chronos/commit/a07ee4686f20d402191029bfb21dcc8ca0dc1f9c) | ❌ | **Fallo provocado** (D6): pruebas de regresión de precios COP |
| [7](https://github.com/estcaramirez-source/chronos/actions/runs/44431413545) | develop | [7e76e12](https://github.com/estcaramirez-source/chronos/commit/7e76e128ecaec3e0bec07b03cdadfbf3233ef28c) | ✅ | **Corrección**: 84/84, cobertura 100 % / 88,8 % ramas |

**Fallo provocado y corrección (D6).** Al revisar `cart.js` se encontró que `getCartTotal()` hacía `parseFloat("23.999.000")`; JavaScript interpreta el punto como decimal y devuelve **23,999**, así que un Rolex de $23.999.000 sumaba 24 pesos al carrito. Además `processPurchase()` calculaba el total como `subtotal × 1,19`, sin el envío que sí mostraba el resumen. Se subió primero el commit `a07ee46` con tres pruebas de regresión **sin** corregir el código: el pipeline falló con `Expected: 23999000 / Received: 23.999` y staging no se ejecutó. El commit `7e76e12` agregó `parsePrice()` (solo dígitos) y `calculateSummary()` (IVA redondeado + envío) usados por el resumen y por la orden; la ejecución #7 volvió a verde en 3 min 37 s.

## 7. Métricas de builds (ejecuciones #1 a #7)

Datos de la API pública: `GET /repos/estcaramirez-source/chronos/actions/runs` (duración = `updated_at − run_started_at`).

| # | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Duración (s) | 31 | 28 | 24 | 29 | 41 | 22 | 34 |
| Resultado | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

- **Tasa de éxito** = 2 ÷ 7 × 100 = **28,6 %** (esperable en la puesta en marcha; incluye 1 fallo provocado).
- **Duración promedio** = (31+28+24+29+41+22+34) ÷ 7 = 209 ÷ 7 = **29,9 s**. Las verdes duran más (41 y 34 s) porque ejecutan staging; las rojas se detienen antes (*fail fast*).
- **MTTR** (fin del fallo → fin del siguiente build verde):
  #1→#5: 00:36:20→00:40:09 = 229 s · #2→#5: 00:36:17→00:40:09 = 232 s · #3→#5: 00:37:42→00:40:09 = 147 s · #4→#5: 00:38:32→00:40:09 = 97 s · #6→#7: 00:41:18→00:44:55 = 217 s.
  MTTR = (229+232+147+97+217) ÷ 5 = 922 ÷ 5 = **184,4 s ≈ 3 min 4 s**.
- **Tasa de pruebas inestables** = 0 ÷ 84 × 100 = **0 %**: cada fallo tuvo una causa determinista y se reprodujo igual en `main` y `develop` (#1 y #2 sobre el mismo commit dieron el mismo resultado).

## 8. Uso de asistentes de IA

Se usó **Claude Code (Anthropic)** como asistente para: escribir las pruebas Jest, el workflow, el Dockerfile, los scripts de reporte y humo, y redactar este documento.
**Verificación:** (1) todo se validó ejecutándose en el runner real de GitHub Actions; los resultados citados son los de la API pública de GitHub, no estimaciones; (2) los tres fallos no planeados del arranque (#1–#4) fueron errores del asistente que el propio pipeline detectó y que se corrigieron en commits separados; (3) los límites de los niveles gratuitos se contrastaron con la documentación oficial (fuentes abajo); (4) cada cambio quedó en un commit pequeño y separado para que el equipo pueda revisarlo en el historial.

## Fuentes

- GitHub Docs – *GitHub Actions billing*: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- GitHub Docs – *Product usage included with each plan*: https://docs.github.com/en/billing/reference/product-usage-included
- GitHub Changelog – *Update to GitHub Actions pricing* (dic. 2025): https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/
- GitLab Docs – *Compute minutes*: https://docs.gitlab.com/ci/pipelines/compute_minutes/
- GitLab – *Pricing*: https://about.gitlab.com/pricing/
- Jenkins – *Pipeline / Jenkinsfile*: https://www.jenkins.io/doc/book/pipeline/jenkinsfile/
