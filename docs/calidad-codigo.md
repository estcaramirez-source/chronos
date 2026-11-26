# Calidad de código y mantenimiento (B1 – B4)

Proyecto: CHRONOS XXI · Repositorio: https://github.com/estcaramirez-source/chronos

## B1. Estándar de codificación, analizador estático y depuración

| Elemento | Evidencia |
|---|---|
| Estándar adoptado | JavaScript ES2022 para navegador. No existe una guía de estilo "oficial" única de JavaScript; se adopta **ESLint `recommended`** (reglas oficiales del proyecto ESLint) más las convenciones de las [guías de estilo de código JavaScript de MDN](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript): `camelCase` para funciones y variables, `UPPER_SNAKE_CASE` para constantes de negocio (`MAX_UNITS_PER_PRODUCT`, `IVA_RATE`), `const`/`let` (nunca `var`), igualdad estricta. |
| Analizador estático | ESLint 9 – [`eslint.config.js`](../eslint.config.js): `recommended` + `eqeqeq`, `no-var`, `no-unused-vars` y **`complexity: ['error', 10]`** |
| Cómo se aplica | `npm run lint` (`eslint . --max-warnings 0`) en el paso 4 del pipeline: **cualquier error o advertencia hace fallar el build** |
| Reporte con cero errores críticos | Paso "Análisis estático" en verde en todas las ejecuciones exitosas, p. ej. [#30](https://github.com/estcaramirez-source/chronos/actions/runs/45725277828) |
| El analizador detectó fallas reales | [#3](https://github.com/estcaramirez-source/chronos/actions/runs/44430471598): `no-control-regex`; [#11](https://github.com/estcaramirez-source/chronos/actions/runs/45722321196): `'error' is defined but never used`; commit [b914de5](https://github.com/estcaramirez-source/chronos/commit/b914de5): variable `formData` sin uso en `scripts.js` |
| Entornos de depuración | [`.vscode/launch.json`](../.vscode/launch.json): depurar pruebas Jest (archivo actual o todas) con puntos de interrupción y depurar la tienda en Edge. [`.vscode/extensions.json`](../.vscode/extensions.json) recomienda ESLint, Jest y Playwright. En CI, las trazas de Playwright se conservan cuando una prueba falla (`trace: 'retain-on-failure'`). |

## B2. Legibilidad y complejidad ciclomática

**Herramienta:** regla `complexity` de ESLint ([`scripts/complexity-report.js`](../scripts/complexity-report.js)). Calcula V(G) para **todas** las funciones y publica `reports/complexity.md` / `complexity.json` en el artefacto `reportes-ci-N` y en el resumen del job. El umbral ≤ 10 lo hace cumplir `npm run lint`.

Resultado ([#29](https://github.com/estcaramirez-source/chronos/actions/runs/45724970482), anotación *Complejidad*): **99 funciones, promedio 1,67, máxima 7, ninguna supera 10.**

| # | Función | V(G) | Por qué es aceptable / acción |
|---|---|---|---|
| 1 | `auth.js:111` manejador de *submit* del registro | 7 | Seis validaciones secuenciales con retorno temprano (nombre, correo, contraseña, confirmación, términos, duplicado). Es lineal y legible. Mejora prevista: extraer `validateRegistration()` para dejarla en 2. |
| 2 | `cart.js:144` `renderCart` | 7 | Dos estados (vacío / con ítems) y guardas para elementos opcionales del DOM. |
| 3 | `cart.js:197` `updateCartSummary` | 6 | Una guarda por cada elemento del resumen (`#subtotal`, `#tax`, `#shipping`, `#total`) más el texto "Gratis". |
| 4 | `auth.js:188` manejador del *login* | 5 | Validaciones de correo, contraseña y credenciales; elección entre `localStorage` y `sessionStorage`. |
| 5 | `products.js:175` `handleAddToCart` | 5 | Sesión, confirmación, producto existente y resultado del carrito. Se analiza en caja blanca (V(G) = 5). |

**Ninguna función supera el umbral**, por lo que no hay excepciones que justificar.

**Legibilidad:**
- Nombres que expresan intención: `parsePrice`, `calculateSummary`, `readStoredList`, `isAllowedQuantity`, `showCartLimitNotification`.
- Funciones cohesivas, de una sola tarea, de 3 a 15 líneas.
- Los comentarios explican el porqué (formato COP, la regla de negocio RF06, el defecto que evita una guarda), no el qué.
- Las refactorizaciones de los TDD eliminaron números mágicos (`10` → `MAX_UNITS_PER_PRODUCT`) y `if` anidados (cláusulas de guarda en `updateQuantity`).

## B3. Modularidad y principios SOLID

La aplicación está dividida en cuatro módulos con responsabilidades separadas:

| Módulo | Responsabilidad |
|---|---|
| `auth.js` | Usuarios y sesión |
| `cart.js` | Carrito y cálculo de la compra |
| `products.js` | Catálogo y acción "agregar" |
| `scripts.js` | Comportamiento visual común |

Se comunican solo mediante dos interfaces públicas: `window.authSystem` y `window.cartSystem`.

**1. Responsabilidad única (S).** Antes, el cálculo del precio, del IVA y del envío estaba repetido dentro de `updateCartSummary` y `processPurchase`, mezclado con el DOM, y estaba mal (DEF-01, DEF-02). Ahora cada función tiene una sola razón para cambiar:

```js
// cart.js – solo interpreta el formato de precio del catálogo
function parsePrice(price) {
    return Number(String(price).replace(/\D/g, '')) || 0;
}

// cart.js – solo reglas fiscales y de envío; no toca el DOM ni el almacenamiento
function calculateSummary(subtotal) {
    const tax = Math.round(subtotal * IVA_RATE);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}

// cart.js – solo lectura segura del almacenamiento
function readStoredList(key) { /* try/catch + Array.isArray */ }
```

Por eso `calculateSummary` se prueba con valores límite (CN-11 a CN-17) sin DOM, y el resumen en pantalla y la orden guardada ya no pueden divergir.

**2. Inversión de dependencias (D).** `products.js` (alto nivel) no conoce cómo se implementan la sesión ni el carrito; depende de las abstracciones `isLoggedIn()` y `addToCart()`:

```js
// products.js
function handleAddToCart(productId) {
    if (!window.authSystem.isLoggedIn()) { /* ... */ return; }   // abstracción de sesión
    const product = productsDatabase[productId];
    if (product) {
        if (window.cartSystem.addToCart(product)) {                // abstracción de carrito
            showAddToCartNotification(product.name);
        } else {
            showCartLimitNotification(product.name);
        }
    }
}
```

Esto permite inyectar en las pruebas un *stub* de sesión y un *mock* de carrito (caja blanca CB-AC-1 a CB-AC-5) o los módulos reales (integración INT-01 a INT-05) sin cambiar el código.

**3. Abierto/cerrado (O).** El catálogo es de datos (`productsDatabase`): se agrega un reloj sin modificar funciones. Las notificaciones se extienden por variante sin tocar la lógica común:

```js
function showNotification(icon, message, variant = '') { /* crea, anima y retira el aviso */ }
function showAddToCartNotification(name) { showNotification('fa-check-circle', `<strong>${name}</strong> agregado al carrito`); }
function showCartLimitNotification(name) { showNotification('fa-exclamation-triangle', `<strong>${name}</strong>: máximo 10 unidades por producto`, 'warning'); }
```

**Limitación honesta:** los módulos son *scripts* clásicos que comparten el ámbito global del navegador. Por eso los *helpers* tienen nombres distintos por archivo (`readStoredList` en `cart.js`, `readStorageJSON` en `auth.js`) y hay un acoplamiento implícito al orden de carga (`cart.js` requiere que `auth.js` se haya cargado antes). La mejora recomendada es migrar a módulos ES (`import`/`export`) en la v3.0.

## B4. Codificación defensiva y seguridad

### Entradas validadas

| # | Entrada | Regla | Respuesta ante error |
|---|---|---|---|
| 1 | Nombre (registro) | `trim()`, longitud ≥ 3 | Mensaje "El nombre debe tener al menos 3 caracteres"; no se registra |
| 2 | Correo (registro, login) | `trim().toLowerCase()`, regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` | "Por favor ingresa un correo electrónico válido" |
| 3 | Contraseña (registro) | longitud ≥ 6 | "La contraseña debe tener al menos 6 caracteres" |
| 4 | Confirmación de contraseña | igual a la contraseña | "Las contraseñas no coinciden" |
| 5 | Términos y condiciones | casilla marcada | "Debes aceptar los términos y condiciones" |
| 6 | Correo duplicado | no existe en `users` | "Este correo electrónico ya está registrado" |
| 7 | Contraseña (login) | no vacía; credenciales coinciden | "Por favor ingresa tu contraseña" / "Correo o contraseña incorrectos" (mensaje genérico, no indica cuál falló) |
| 8 | Cantidad en el carrito | entero y ≤ 10; ≤ 0 elimina | `updateQuantity` devuelve `false` y conserva la cantidad; el botón **+** se deshabilita; aviso "máximo 10 unidades" |
| 9 | Precio del catálogo | solo dígitos (`parsePrice`); si no hay, 0 | Nunca produce `NaN` en los totales |
| 10 | Datos en `localStorage` (`cart`, `orders`, `users`, `currentUser`) | JSON válido y del tipo esperado | `try/catch` → se usa `[]` o `null` y la página sigue funcionando; los usuarios demo se restauran (TDD #1) |
| 11 | Elementos del DOM en `scripts.js` | existencia antes de usarlos | El bloque se omite; antes lanzaba `TypeError` (DEF-03) |
| 12 | Correo en "Olvidé mi contraseña" | — | Respuesta neutra e idéntica; no revela la contraseña ni si la cuenta existe (DEF-08) |

### Manejo de excepciones

`readStoredList` (`cart.js`) y `readStorageJSON` (`auth.js`) encapsulan el único punto donde puede ocurrir una excepción en tiempo de ejecución (`JSON.parse`). Están probados en [`tests/tdd-almacenamiento.test.js`](../tests/tdd-almacenamiento.test.js).

### Credenciales y escaneo de secretos

- **gitleaks 8.21.2** se ejecuta sobre **todo el historial** en cada *push* (paso 2 del pipeline, `fetch-depth: 0`). Resultado: **0 hallazgos en 32 commits** ([#29](https://github.com/estcaramirez-source/chronos/actions/runs/45724970482), anotación *Secretos*; reporte `reports/gitleaks.json`).
- El pipeline no usa secretos propios; solo el `GITHUB_TOKEN` automático con permisos mínimos.

**Riesgos residuales (por eso el ítem queda en Parcial):**
- `auth.js` siembra una **cuenta de demostración** (`demo@chronosxxi.com` / `demo123`) documentada en el README. No es un secreto de infraestructura y gitleaks no la marca, pero es una credencial en el código.
- Las contraseñas de los usuarios se guardan **en texto plano** en `localStorage` del navegador, porque el sitio no tiene *backend*.
- Mitigación planificada (Roadmap v3.0): *backend* con *hash* bcrypt/Argon2, sesiones del lado del servidor y eliminación de la cuenta demo en el build de producción.
