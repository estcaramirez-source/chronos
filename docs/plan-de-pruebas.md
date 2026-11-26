# Plan de pruebas – CHRONOS XXI v2.2 (D1 – D4)

Estructura según **IEEE 829-2008** (*Master Test Plan*) / **ISO/IEC/IEEE 29119-3** (*Test Plan*). Características de calidad según **ISO/IEC 25010**.

## 1. Identificador e introducción

| Campo | Valor |
|---|---|
| Identificador | PP-CHRONOS-2.2 |
| Versión del plan | 1.0 – 25/11/2026 |
| Objeto de prueba | Tienda web CHRONOS XXI (HTML/CSS/JavaScript, sin *backend*), rama `main`, tag `v2.2.0` |
| Propósito | Verificar los requisitos funcionales RF01–RF11 y las características ISO 25010 de **adecuación funcional** (corrección de cálculos), **fiabilidad** (tolerancia a datos corruptos), **seguridad** (confidencialidad de credenciales) y **mantenibilidad** (complejidad, modularidad, capacidad de prueba) |
| Documentos relacionados | [diseño de casos](diseno-casos-de-prueba.md), [registro de defectos y matriz](registro-defectos.md), [calidad de código](calidad-codigo.md), [informe de CI](informe-ci-v1.0.md) |

## 2. Alcance: elementos y funcionalidades

**Se prueba:**

| Elemento | Funcionalidades | Niveles |
|---|---|---|
| `auth.js` | RF01, RF02, RF03, RF09 | Unidad, caja negra, integración, aceptación |
| `cart.js` | RF05, RF06, RF07, RF08 | Unidad, caja negra y blanca, integración, aceptación |
| `products.js` | RF04, RF05 | Unidad, caja blanca, integración, aceptación |
| `scripts.js` | RF10, RF11 | Unidad (DOM), aceptación (E2E-05) |
| Sitio desplegado (9 páginas, CSS, JS, imágenes) | Disponibilidad | Humo en staging (Docker) |

**No se prueba (y por qué):**

| Elemento excluido | Motivo |
|---|---|
| Pasarela de pagos, envío real de correos, inicio de sesión con Google/Facebook | No existen; son marcadores de posición (Roadmap v4.0) |
| Diseño visual, *responsive* y accesibilidad completa | Se revisa con inspección manual exploratoria; automatizarlo no compensa en esta versión (ver D4) |
| Rendimiento y carga | Sitio estático sin servidor de aplicación; fuera del alcance académico |
| Navegadores distintos de Chromium | Riesgo bajo (JS estándar); se agregaría Firefox/WebKit en Playwright si se necesitara |
| Script en línea de `index.html` (productos destacados) | Cubierto indirectamente por las pruebas de humo; se moverá a un módulo para probarlo |

## 3. Enfoque

| Nivel / tipo | Técnica | Herramienta | Automatizado |
|---|---|---|---|
| Análisis estático | Reglas de estilo, complejidad ≤ 10, secretos | ESLint 9, gitleaks | Sí, en cada *push* |
| Unidad | Basada en requisitos + TDD (rojo-verde-refactor) para cambios nuevos | Jest 29 + jsdom | Sí |
| Caja negra | Partición de equivalencia y valores límite | Jest | Sí |
| Caja blanca | Caminos base (V(G)), cobertura de sentencias y ramas | Jest + Istanbul | Sí |
| Integración | Ascendente (*bottom-up*) con módulos reales | Jest | Sí |
| Sistema / aceptación | Escenarios derivados de RF en navegador real | Playwright (Chromium) | Sí, contra staging |
| Humo post-despliegue | Disponibilidad de 17 recursos y contenido clave | `curl` (`smoke-test.sh`) | Sí |
| Regresión | Toda la suite en cada *push* / PR; cada defecto deja una prueba | GitHub Actions | Sí |
| Exploratoria | Recorrido libre de interfaz y *responsive* | Navegador | Manual, por *release* |

Criterio de aprobación y fallo de cada caso: el resultado obtenido es igual al esperado de la tabla de diseño. Cualquier diferencia es un fallo y abre un defecto `DEF-xx`.

## 4. Criterios de entrada, suspensión y salida

| Tipo | Criterio |
|---|---|
| **Entrada** | Código en una rama `feature/*` o `develop` con *push* en GitHub; dependencias instalables (`npm install`); lint sin errores (de lo contrario las pruebas no se ejecutan: *fail fast*) |
| **Suspensión** | El pipeline falla en instalación o lint, o el entorno de staging no levanta: se suspenden las pruebas posteriores hasta corregir |
| **Reanudación** | Nuevo *push* con la corrección; la ejecución completa se repite automáticamente |
| **Salida** | 100 % de pruebas aprobadas · cobertura ≥ 95 % (líneas, sentencias, funciones y ramas) · 0 defectos abiertos de severidad alta · 100 % de RF con al menos un caso aprobado · 5/5 escenarios E2E · complejidad ≤ 10 · 0 secretos |

## 5. Entregables

- Este plan.
- [Diseño de casos](diseno-casos-de-prueba.md).
- Código de pruebas en `tests/` y `e2e/`.
- Reportes por ejecución (artefactos `reportes-ci-N` y `reportes-e2e-N`: cobertura lcov/cobertura, JUnit, complejidad, gitleaks, capturas).
- [Registro de defectos y matriz](registro-defectos.md).
- [Informe técnico final](informe-tecnico-final.md).

## 6. Entorno, recursos y responsabilidades

| Recurso | Detalle |
|---|---|
| Entorno de CI | GitHub Actions, runner `ubuntu-latest`, Node.js 22 LTS |
| Entorno de staging | Contenedor `nginx:1.27-alpine` con la imagen del commit, puerto 8080, `APP_ENV=staging` |
| Datos de prueba | Cuenta demo sembrada por la app; usuarios generados en las pruebas (`cliente.<timestamp>@correo.com`); sin datos personales reales |
| Personal | 1 integrante (trabajo individual): planificación, diseño, automatización, ejecución y reporte. Asistente de IA (Claude Code) para generar código y borradores, con verificación en el CI |

## 7. Cronograma

| Actividad | Fecha |
|---|---|
| Línea base de CI y pruebas unitarias (Taller U3) | 18/11/2026 |
| TDD #1 y #2, corrección DEF-03 | 25/11/2026 |
| Caja negra, caja blanca, integración, calidad estática | 25/11/2026 |
| Aceptación E2E, seguridad (DEF-08), umbral 95 % | 25/11/2026 |
| Informe técnico y congelamiento (tag `v2.2.0`) | 25/11/2026 |
| Regresión continua | En cada *push* / PR |

## 8. Riesgos y contingencias

| Riesgo | Prob. | Impacto | Contingencia |
|---|---|---|---|
| Totales de dinero mal calculados | Alta (ocurrió: DEF-01/02) | Alto | Caja negra con valores límite + E2E del total; prioridad P1 |
| Datos corruptos en el navegador | Media | Alto | Lectura segura + pruebas TDD #1 |
| Pruebas E2E inestables (red, tiempos) | Media | Medio | `waitUntil: 'domcontentloaded'`, esperas por condición (no por tiempo), `workers: 1`, trazas en fallo; medir la tasa de pruebas inestables |
| Cuota de minutos o límite de la API de GitHub | Baja (repo público) | Medio | `concurrency` cancela ejecuciones obsoletas; caché de npm |
| Credenciales en texto plano (sin *backend*) | Alta | Alto | Riesgo aceptado y documentado; mitigación en v3.0 (hash + servidor) |
| Un solo integrante | Alta | Medio | Automatización total y documentación en el repositorio |

## 9. Aprobaciones

| Rol | Nombre | Fecha |
|---|---|---|
| Responsable de pruebas | [Nombre del estudiante] (`Yocam99`) | 25/11/2026 |
| Docente | | |

---

## D2. Estimación del esfuerzo y priorización

**Criterio explícito:** Prioridad = **Impacto** (1–3) × **Probabilidad de fallo** (1–3) × **Frecuencia de uso** (1–3). Puntaje ≥ 18 = **P1**, de 8 a 17 = **P2**, < 8 = **P3**. Regla adicional: si el grupo involucra seguridad, sube un nivel.

| Grupo de casos | RF | I | P | F | Puntaje | Prioridad | Casos | Horas estimadas | Horas reales |
|---|---|---|---|---|---|---|---|---|---|
| Cálculo de totales (precio, IVA, envío) | RF07 | 3 | 3 | 3 | 27 | **P1** | CN-11…17, cart › resumen, INT-01/03, E2E-01 | 3,0 | 0,5 |
| Agregar al carrito con sesión | RF05 | 3 | 2 | 3 | 18 | **P1** | products, CB-AC-1…5, INT-01/02, E2E-01 | 2,0 | 0,3 |
| Inicio de sesión | RF02 | 3 | 2 | 3 | 18 | **P1** | auth › login, CN-01…10, E2E-02 | 2,0 | 0,3 |
| Cantidades y límite (EV-01) | RF06 | 2 | 2 | 3 | 12 | P2 | TDD #2, CN-18…26, CB-UQ, INT-04, E2E-04 | 3,0 | 0,3 |
| Finalizar compra | RF08 | 3 | 2 | 2 | 12 | P2 | cart › checkout, INT-03/05 | 1,5 | 0,2 |
| Tolerancia a datos corruptos | RF03 | 3 | 1 | 3 | 9 | P2 | TDD #1 (6) | 2,0 | 0,2 |
| Registro | RF01 | 2 | 2 | 2 | 8 | P2 | auth › registro, CN-27…31, E2E-03 | 2,0 | 0,3 |
| Recuperar contraseña (seguridad) | RF09 | 3 | 2 | 1 | 6 | P3 → **P2** | auth (3), seguridad (2) | 1,0 | 0,2 |
| Garantías | RF10 | 2 | 3 | 1 | 6 | P3 | scripts › DEF-03, E2E-05 | 1,5 | 0,2 |
| Catálogo | RF04 | 2 | 1 | 3 | 6 | P3 | products › catálogo | 0,5 | 0,1 |
| Navegación y animaciones | RF11 | 1 | 2 | 3 | 6 | P3 | scripts (12) | 2,0 | 0,3 |
| Pipeline, staging, reportes, documentación | — | — | — | — | — | — | — | 12,0 | 3,5 |
| **Total** | | | | | | | | **32,5 h** | **≈ 6,4 h** |

**Cómo se obtuvieron las horas reales:** tiempo de reloj entre el primer y el último commit de cada bloque en `git log`, más el tiempo de espera de las ejecuciones de CI y de redacción.

La diferencia (−80 %) se explica porque la implementación se hizo **asistida por IA**: el asistente generaba el código y el CI lo verificaba. La estimación original suponía trabajo manual.

**Lección:** para la próxima estimación, separar el tiempo de generación del de verificación y revisión, que fue el que más pesó (esperar y analizar 30+ ejecuciones).

Los P1 se automatizaron primero y en todos los niveles. Los P3 tienen solo pruebas unitarias o un único escenario E2E.

## D3. Métricas y criterios de salida

| Métrica | Fórmula | Umbral de salida | Valor (versión evaluada) | Cumple |
|---|---|---|---|---|
| Cobertura de líneas | Istanbul | ≥ 95 % (meta del examen ≥ 80 %) | 100 % | ✅ |
| Cobertura de ramas | Istanbul | ≥ 95 % | ≥ 95 % (ver ejecución del umbral en el informe final) | ✅ |
| Tasa de aprobación | aprobadas ÷ ejecutadas × 100 | 100 % | 166/166 unitarias e integración · 5/5 E2E = **100 %** | ✅ |
| Densidad de defectos | defectos ÷ KLOC | Referencia < 10 def/KLOC en código nuevo | 7 defectos de código (DEF-01, 02, 03, 04, 06, 07, 08) ÷ 0,947 KLOC (líneas sin comentarios ni vacías de los 4 `.js`) = **7,4 def/KLOC** | ✅ |
| Defectos abiertos de severidad alta | conteo | 0 | 0 | ✅ |
| RF cubiertos | RF con ≥ 1 caso aprobado ÷ RF | 100 % | 11/11 | ✅ |
| Complejidad ciclomática máxima | ESLint | ≤ 10 | 7 | ✅ |
| Secretos en el historial | gitleaks | 0 | 0 | ✅ |
| Tasa de pruebas inestables | inestables ÷ total | ≤ 2 % | 1 (la espera de las pruebas de humo, DEF-09) ÷ 172 (166 Jest + 5 E2E + 1 script de humo) = **0,58 %**; corregida | ✅ |

**Decisión de "hasta cuándo probar".** Se detiene la prueba de esta versión y se libera `v2.2.0` a staging porque:

1. Se cumplen **todos** los criterios de salida de la tabla.
2. La **curva de descubrimiento de defectos se aplanó**. Cada técnica nueva encontró menos defectos:

   | Técnica | Defectos nuevos |
   |---|---|
   | Revisión y unitarias | 2 (DEF-01, DEF-02) |
   | Pruebas de `scripts.js` | 1 (DEF-03) |
   | Integración | 1 (DEF-07) |
   | Revisión de seguridad | 1 (DEF-08) |
   | Caja blanca, E2E y cobertura de ramas | 0 |

3. El costo marginal de seguir probando, por ejemplo con más navegadores o pruebas visuales, supera el riesgo residual, que es de prioridad P3.

Los riesgos que quedan, como las credenciales en texto plano por no tener *backend*, son limitaciones de arquitectura documentadas, no defectos que una prueba más pueda resolver. La regresión sigue activa en cada *push*.

## D4. Qué se automatiza y qué queda manual

| Actividad | Decisión | Costo | Mantenimiento | Retorno |
|---|---|---|---|---|
| Lint, complejidad y secretos | **Automatizar** | Muy bajo (configuración única) | Muy bajo | Alto: detectó 3 fallas antes de ejecutar pruebas |
| Unitarias, caja negra y blanca (Jest) | **Automatizar** | Bajo (~3 s por ejecución) | Bajo: pruebas aisladas del DOM real | Muy alto: 5 de 8 defectos se detectaron o fijaron aquí |
| Integración (Jest, módulos reales) | **Automatizar** | Bajo | Bajo | Alto: detectó DEF-07 |
| Aceptación E2E (Playwright) | **Automatizar los 5 flujos críticos** | Medio (~60 s, instala Chromium) | Medio: depende de selectores del HTML | Alto en P1/P2; se limita a 5 escenarios para controlar el costo |
| Humo post-despliegue (`curl`) | **Automatizar** | Muy bajo (< 1 s) | Muy bajo | Alto: valida cada imagen Docker |
| Diseño visual, *responsive*, usabilidad | **Manual** (exploratoria por *release*) | Bajo si es ocasional | Las pruebas visuales automatizadas se rompen con cada cambio de estilo | Bajo para un sitio que cambia de diseño a menudo |
| Accesibilidad completa | **Manual** + futura auditoría automática (axe/Lighthouse) | — | — | Medio; pendiente para v3.0 |

**Selección de herramientas:**

| Necesidad | Elegida | Alternativas | Criterio decisivo |
|---|---|---|---|
| Framework xUnit | **Jest** | Mocha + Chai, Vitest | Todo en uno (aserciones, *mocks*, cobertura Istanbul, jsdom); cero configuración para scripts de navegador; muy documentado |
| Aceptación en navegador | **Playwright** | Selenium, Cypress | Esperas automáticas (menos inestabilidad que Selenium); instala el navegador en CI con un comando; JUnit/HTML/capturas incluidos; gratuito. Cypress requiere servicio de pago para paralelizar y registrar. |
| CI | **GitHub Actions** | GitLab CI, Jenkins | Repositorio en GitHub; minutos ilimitados en repos públicos; sin servidor que mantener (ver Taller U3) |
| Análisis estático | **ESLint** | SonarLint/SonarQube | Corre en el pipeline sin servidor; regla de complejidad incluida |
| Secretos | **gitleaks** | trufflehog, GitHub secret scanning | Binario único, revisa todo el historial, sin cuenta |
