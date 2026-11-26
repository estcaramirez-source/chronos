# Registro de defectos, mantenimiento y trazabilidad (B7 – C7)

Repositorio: https://github.com/estcaramirez-source/chronos · Enlaces de ejecución: `…/actions/runs/<id>` · Enlaces de commit: `…/commit/<sha>`

## B7. Registro de defectos clasificados

Severidad: **Alta** = funcionalidad o datos incorrectos para el cliente · **Media** = falla parcial o riesgo · **Baja** = calidad interna.

| Id | Tipo de mantenimiento | Severidad | Descripción | Cómo se detectó | Corrección | Re-prueba |
|---|---|---|---|---|---|---|
| DEF-01 | **Correctivo** | Alta | `getCartTotal` hacía `parseFloat("23.999.000")` → 23,999: todos los totales del carrito estaban mal (un Rolex sumaba 24 pesos) | Revisión de código + prueba de regresión; build rojo [#6](https://github.com/estcaramirez-source/chronos/actions/runs/44430954143), commit [a07ee46](https://github.com/estcaramirez-source/chronos/commit/a07ee46) | `parsePrice()` – [7e76e12](https://github.com/estcaramirez-source/chronos/commit/7e76e12) | Verde [#7](https://github.com/estcaramirez-source/chronos/actions/runs/44431413545); CN-17, INT-01, E2E-01 |
| DEF-02 | **Correctivo** | Alta | La orden guardada calculaba `subtotal × 1,19` sin el envío; no coincidía con el resumen | Misma prueba de regresión (#6) | `calculateSummary()` compartido – [7e76e12](https://github.com/estcaramirez-source/chronos/commit/7e76e12) | #7; INT-03 |
| DEF-03 | **Correctivo** | Alta | `scripts.js` usaba `contactForm.addEventListener` sin verificar; en 8 de 9 páginas lanzaba `TypeError` y no se ejecutaba el resto (la **selección de garantías nunca funcionaba**) | Prueba de regresión, rojo [#19](https://github.com/estcaramirez-source/chronos/actions/runs/45723418409) – [34f9a80](https://github.com/estcaramirez-source/chronos/commit/34f9a80) | Guardas de existencia – [6a775c5](https://github.com/estcaramirez-source/chronos/commit/6a775c5) | Verde [#20](https://github.com/estcaramirez-source/chronos/actions/runs/45723596478); E2E-05 en navegador real |
| DEF-04 | **Preventivo** | Media | Un JSON corrupto en `localStorage` (`cart`, `orders`, `users`, `currentUser`) lanzaba `SyntaxError` y rompía la carga de la tienda | TDD #1, rojo [#10](https://github.com/estcaramirez-source/chronos/actions/runs/45722136400) – [dc839ee](https://github.com/estcaramirez-source/chronos/commit/dc839ee) | Lectura segura – [1559f1d](https://github.com/estcaramirez-source/chronos/commit/1559f1d), [f33bad6](https://github.com/estcaramirez-source/chronos/commit/f33bad6), [154e166](https://github.com/estcaramirez-source/chronos/commit/154e166) | Verde [#12](https://github.com/estcaramirez-source/chronos/actions/runs/45722405987) y [#13](https://github.com/estcaramirez-source/chronos/actions/runs/45722604471) |
| DEF-05 | **Adaptativo** | Media | Los runners de GitHub deprecaron Node 20 para las *actions* (`checkout@v4`, `setup-node@v4`, `upload-artifact@v4`) y Node 20 llegó al fin de soporte | Anotación de advertencia en [#1](https://github.com/estcaramirez-source/chronos/actions/runs/44430272616) | Actualización a `checkout@v5`, `setup-node@v5`, `upload-artifact@v6` y proyecto a Node 22 LTS – [52db852](https://github.com/estcaramirez-source/chronos/commit/52db852), [70b987b](https://github.com/estcaramirez-source/chronos/commit/70b987b) | Sin advertencias desde [#5](https://github.com/estcaramirez-source/chronos/actions/runs/44430754291) |
| DEF-06 | **Perfectivo** | Baja | Código muerto: variable `formData` sin uso en `scripts.js`; número mágico `10` repetido en tres lugares; `if` anidados en `updateQuantity` | ESLint (`no-unused-vars`) y revisión en el refactor del TDD #2 | [b914de5](https://github.com/estcaramirez-source/chronos/commit/b914de5), [dbf32f0](https://github.com/estcaramirez-source/chronos/commit/dbf32f0) | Lint en verde; [#17](https://github.com/estcaramirez-source/chronos/actions/runs/45723133056) |
| DEF-07 | **Correctivo** | Media | Al intentar la unidad 11, `handleAddToCart` mostraba "agregado al carrito" aunque el carrito la rechazaba | Prueba de integración INT-04, rojo [#22](https://github.com/estcaramirez-source/chronos/actions/runs/45723911353) – [dc9935c](https://github.com/estcaramirez-source/chronos/commit/dc9935c) | Aviso de límite – [16d4982](https://github.com/estcaramirez-source/chronos/commit/16d4982) | Verde [#23](https://github.com/estcaramirez-source/chronos/actions/runs/45724032457); CB-AC-5 |
| DEF-08 | **Correctivo (seguridad)** | Alta | "Olvidé mi contraseña" mostraba la **contraseña en texto plano** y respondía distinto si el correo existía (enumeración de cuentas) | Revisión de seguridad (B4) + prueba de regresión, rojo [#31](https://github.com/estcaramirez-source/chronos/actions/runs/45725622702) – [4101c45](https://github.com/estcaramirez-source/chronos/commit/4101c45) | Mensaje neutro – [893f3fe](https://github.com/estcaramirez-source/chronos/commit/893f3fe) | Verde [#32](https://github.com/estcaramirez-source/chronos/actions/runs/45725803491); `seguridad.test.js` |
| DEF-09 | **Preventivo (infraestructura de pruebas)** | Media | Prueba de humo **inestable**: la espera inicial terminaba con `curl` exit 56 (conexión reiniciada mientras nginx arrancaba) y `--retry-connrefused` no reintenta ese error | Falla sin cambio de código en [#33](https://github.com/estcaramirez-source/chronos/actions/runs/45726101649) (el mismo código pasó en #32) | `--retry-all-errors`, 20 intentos – [0d98c36](https://github.com/estcaramirez-source/chronos/commit/0d98c36) | Job de staging en verde en las ejecuciones siguientes |

**Totales:** 9 defectos.

| Tipo | Cantidad | Defectos |
|---|---|---|
| Correctivo | 5 | DEF-01, 02, 03, 07, 08 |
| Preventivo | 2 | DEF-04, DEF-09 |
| Adaptativo | 1 | DEF-05 |
| Perfectivo | 1 | DEF-06 |

Además, durante la construcción de la suite se corrigieron 3 fallas de las propias pruebas: #1/#2, #11 y INT-01 en #22. No se cuentan como defectos del producto.

### Cambio evolutivo implementado: EV-01 – Límite de 10 unidades por referencia (RF06)

| Campo | Detalle |
|---|---|
| Motivo | Regla de negocio para relojes de alto valor: una orden no puede incluir más de 10 unidades de la misma referencia; la cantidad debe ser entera |
| Diseño | `MAX_UNITS_PER_PRODUCT = 10` + `isAllowedQuantity()`; `addToCart`/`updateQuantity` devuelven `true`/`false`; botón **+** deshabilitado en el máximo; aviso en el catálogo (DEF-07) |
| Trazabilidad | Rama `feature/tdd-limite-unidades`: RED [0e402e8](https://github.com/estcaramirez-source/chronos/commit/0e402e8) ([#15](https://github.com/estcaramirez-source/chronos/actions/runs/45722794128) ❌) → GREEN [f0e7d77](https://github.com/estcaramirez-source/chronos/commit/f0e7d77) ([#16](https://github.com/estcaramirez-source/chronos/actions/runs/45722948240) ✅) → REFACTOR [dbf32f0](https://github.com/estcaramirez-source/chronos/commit/dbf32f0) ([#17](https://github.com/estcaramirez-source/chronos/actions/runs/45723133056) ✅) → merge [0ed27cd](https://github.com/estcaramirez-source/chronos/commit/0ed27cd) |
| Pruebas | `tdd-limite-unidades.test.js` (9), CN-18 a CN-26, CB-UQ-1 a 4, INT-04, E2E-04 |

## C7. Matriz de trazabilidad RF ↔ casos de prueba ↔ resultado

Resultado de la versión evaluada: todos aprobados (unidad e integración en el job `build`; E2E en el job de staging).

| RF | Unitarias | Caja negra / blanca | Integración | Aceptación | Resultado |
|---|---|---|---|---|---|
| RF01 Registro | `auth.test` › registro (6 inválidos + éxito) | CN-01…10, CN-27…31 | — | E2E-03 | ✅ |
| RF02 Inicio de sesión | `auth.test` › inicio de sesión (5) | CN-01…10 | — | E2E-01, 02, 03 | ✅ |
| RF03 Sesión / cierre | `auth.test` › utilidades y sesión; `tdd-almacenamiento` (sesión) | — | INT-05 | — | ✅ |
| RF04 Catálogo | `products.test` › catálogo (4) | — | INT-01 | E2E-01 | ✅ |
| RF05 Agregar al carrito | `products.test` › handleAddToCart; `cart.test` › operaciones | CB-AC-1…5 | INT-01, 02 | E2E-01, 04 | ✅ |
| RF06 Cantidades (EV-01) | `cart.test`; `tdd-limite-unidades` (9) | CN-18…26, CB-UQ-1…4 | INT-04 | E2E-04 | ✅ |
| RF07 Resumen IVA/envío | `cart.test` › resumen; precios COP | CN-11…17 | INT-01 | E2E-01 | ✅ |
| RF08 Finalizar compra | `cart.test` › processPurchase, checkout | — | INT-03, 05 | — | ✅ |
| RF09 Recuperar contraseña | `auth.test` (3); `seguridad.test` (2) | — | — | — | ✅ |
| RF10 Garantías | `scripts.test` › regresión DEF-03 (2) | — | — | E2E-05 | ✅ |
| RF11 Navegación común | `scripts.test` › navegación y animaciones (12) | — | — | Pruebas de humo (17 recursos) | ✅ |

### Bitácora de defectos con re-ejecución

| Defecto | Ejecución que lo detectó (❌) | Corrección | Re-ejecución (✅) | Prueba que impide su regreso |
|---|---|---|---|---|
| DEF-01 / DEF-02 | #6 – 3 pruebas fallidas: `Expected: 23999000, Received: 23.999` | 7e76e12 | #7 | `cart.test` › precios reales del catálogo; CN-17; INT-01 |
| DEF-03 | #19 – 4 fallidas: `TypeError ... reading 'addEventListener'` (`scripts.js:75`) | 6a775c5 | #20 | `scripts.test` › regresión DEF-03; E2E-05 |
| DEF-04 | #10 – 6 fallidas: `SyntaxError ... is not valid JSON` | 1559f1d / f33bad6 | #12 | `tdd-almacenamiento.test.js` |
| DEF-07 | #22 – INT-04: `Received: "G-Shock Mudmaster agregado al carrito"` | 16d4982 | #23 | INT-04; CB-AC-5 |
| DEF-08 | #31 – 2 fallidas en `seguridad.test.js` | 893f3fe | #32 | `seguridad.test.js` |
| DEF-09 | #33 – humo: `Process completed with exit code 56` | 0d98c36 | ejecuciones siguientes de `develop` | La propia espera con `--retry-all-errors` |
