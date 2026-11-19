# 🕐 CHRONOS XXI - E-Commerce de Relojes Premium


**Sistema de E-Commerce Completo con Autenticación y Carrito de Compras**

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Demo Rápida](#-demo-rápida)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Páginas](#-páginas)
- [Productos Disponibles](#-productos-disponibles)
- [Sistema de Autenticación](#-sistema-de-autenticación)
- [Sistema de Carrito](#-sistema-de-carrito)
- [API JavaScript](#-api-javascript)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Seguridad](#-seguridad)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

## 📖 Descripción

**CHRONOS XXI** es una plataforma de e-commerce completa especializada en la venta de relojes premium. El proyecto incluye:

✨ **Sistema de Autenticación** - Registro, login y gestión de usuarios  
🛒 **Carrito de Compras** - Funcional con cálculo de IVA y envío  
💰 **18 Productos** - En 3 categorías (Clásicos, Tecnológicos, Deportivos)  
💳 **Precios en Pesos Colombianos** - Formato COP  
📱 **100% Responsive** - Diseño adaptable a todos los dispositivos  
🎨 **Diseño Elegante** - Minimalista negro y dorado  

---

## 🎬 Demo Rápida

### Credenciales de Prueba

```
Email: demo@chronosxxi.com
Contraseña: demo123
```

### Flujo de Uso

1. Abrir `index.html`
2. Navegar a cualquier categoría
3. Click en "Agregar al Carrito"
4. Iniciar sesión con las credenciales demo
5. Ver carrito (🛒)
6. Proceder al pago
7. ¡Orden confirmada!

---

## ✨ Características

### 🔐 Sistema de Autenticación
- Registro de usuarios con validación
- Inicio de sesión (localStorage/sessionStorage)
- Recuperación de contraseña
- Persistencia de sesión (Remember Me)
- Protección de rutas

### 🛒 Carrito de Compras
- Agregar/eliminar productos
- Actualizar cantidades
- Cálculo automático de IVA (19%)
- Envío gratis >$200.000
- Checkout completo
- Generación de número de orden

### 📦 Catálogo de Productos
- **18 productos** en 3 categorías
- Precios en COP ($639.000 - $50.000.000)
- Descripciones detalladas
- Badges especiales (NUEVO, EXCLUSIVO, OFERTA)
- Imágenes de productos

### 🛠️ Servicios
- Reparación con precios
- 3 planes de mantenimiento
- Sistema de garantías seleccionables
- Procesos detallados

### 🎨 Interfaz de Usuario
- Navbar delgado y elegante (~60px)
- Animaciones suaves
- Notificaciones visuales
- Modales interactivos
- 100% responsive

---

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive con Flexbox/Grid
- **JavaScript (Vanilla)** - Sin frameworks
- **LocalStorage** - Almacenamiento de datos
- **Font Awesome 6.4.0** - Iconos

---

## 🚀 Instalación

### Opción 1: Descarga Directa

1. Descargar todos los archivos
2. Mantener la estructura de carpetas
3. Abrir `index.html` en navegador

### Opción 2: Live Server (Recomendado)

```bash
# 1. Abrir proyecto en VSCode
# 2. Instalar extensión "Live Server"
# 3. Click derecho en index.html → Open with Live Server
```

### Opción 3: Python Server

```bash
python -m http.server 8000
# Abrir: http://localhost:8000
```

### Estructura Requerida

```
chronos-xxi/
├── index.html
├── login.html
├── carrito.html
├── clasicos.html
├── tecnologicos.html
├── deportivos.html
├── reparacion.html
├── mantenimiento.html
├── garantia.html
├── style.css
├── scripts.js
├── auth.js
├── cart.js
├── products.js
└── imagenes/
    ├── Banner_clasico.jpg
    ├── Banner_tecnologico.jpg
    └── Banner_deportivo.jpg
```

---

## 📁 Estructura del Proyecto

```
CHRONOS-XXI/
│
├── 📄 PÁGINAS (10)
│   ├── index.html              # Principal
│   ├── login.html              # Autenticación
│   ├── carrito.html            # Carrito
│   ├── clasicos.html           # 6 productos
│   ├── tecnologicos.html       # 6 productos
│   ├── deportivos.html         # 6 productos
│   ├── reparacion.html         # Servicio
│   ├── mantenimiento.html      # Servicio
│   └── garantia.html           # Servicio
│
├── 🎨 ESTILOS
│   └── style.css               # 4500+ líneas
│
├── ⚙️ SCRIPTS
│   ├── scripts.js              # General
│   ├── auth.js                 # Autenticación
│   ├── cart.js                 # Carrito
│   └── products.js             # BD Productos
│
└── 🖼️ IMÁGENES
    └── imagenes/               # Banners
```

---

## 📄 Páginas

### 1. index.html
- Hero con imagen de fondo
- Productos destacados
- Servicios
- Información de empresa
- Estadísticas animadas
- Formulario de contacto

### 2. login.html
- Tab Login / Registro
- Validación de formularios
- Mensajes de error/éxito
- Remember Me

### 3. carrito.html
- Lista de productos
- Controles de cantidad
- Resumen de compra
- Modales de confirmación

### 4-6. Categorías (clasicos, tecnologicos, deportivos)
- 6 productos cada una
- Precios en COP
- Botón "Agregar al Carrito"
- Hero temático

### 7-9. Servicios (reparacion, mantenimiento, garantia)
- Información detallada
- Precios y planes
- Procesos explicados
- FAQ

---

## 📦 Productos Disponibles

### 🎩 Relojes Clásicos (6)
- Elegance Master (Rolex) - **$23.999.000**
- Seamaster Classic (Omega) - **$17.199.000**
- Heritage Collection (Patek Philippe) - **$50.000.000**
- Prestige Gold (Tissot) - **$11.199.000**
- Royal Timepiece (Longines) - **$7.599.000**
- Distinguished Gent (Seiko) - **$3.599.000**

### 💻 Smartwatches (6)
- Watch Ultra Pro (Apple) - **$3.599.000**
- Galaxy Watch 6 Pro (Samsung) - **$2.199.000**
- Fenix 7X Solar (Garmin) - **$3.999.000**
- Sense 2 Advanced (Fitbit) - **$1.399.000**
- Venu 3 Elite (Garmin) - **$1.999.000**
- Versa 4 Sport (Fitbit) - **$919.000**

### ⚡ Relojes Deportivos (6)
- G-Shock Mudmaster (Casio) - **$1.599.000**
- Carrera Chronograph (Tag Heuer) - **$13.199.000**
- Suunto 9 Peak Pro (Suunto) - **$2.799.000**
- Rangeman Solar (Casio) - **$1.799.000**
- Expedition Field (Timex) - **$639.000**
- Prospex Diver (Seiko) - **$2.399.000**

**Total: 18 productos | Rango: $639.000 - $50.000.000 COP**

---

## 🔐 Sistema de Autenticación

### API

```javascript
// Verificar sesión
window.authSystem.isLoggedIn()

// Obtener usuario
window.authSystem.getCurrentUser()

// Cerrar sesión
window.authSystem.logout()
```

### Almacenamiento

```javascript
// users - localStorage
[{
    id, name, email, password, createdAt
}]

// currentUser - localStorage/sessionStorage
{
    id, name, email, loginTime
}
```

---

## 🛒 Sistema de Carrito

### API

```javascript
// Agregar producto
window.cartSystem.addToCart(product)

// Obtener carrito
window.cartSystem.getCart()

// Actualizar cantidad
window.cartSystem.updateQuantity(id, qty)

// Eliminar producto
window.cartSystem.removeFromCart(id)

// Obtener total
window.cartSystem.getCartTotal()

// Obtener cantidad
window.cartSystem.getCartCount()
```

### Cálculos

- **Subtotal**: Suma de productos
- **IVA**: 19% del subtotal
- **Envío**: 
  - Gratis si subtotal >$200.000
  - $15.000 si subtotal <$200.000
- **Total**: Subtotal + IVA + Envío

---

## 🔌 API JavaScript

### auth.js

```javascript
window.authSystem = {
    isLoggedIn(),
    getCurrentUser(),
    logout(),
    checkSession()
}
```

### cart.js

```javascript
window.cartSystem = {
    addToCart(product),
    removeFromCart(productId),
    updateQuantity(productId, qty),
    clearCart(),
    getCart(),
    getCartTotal(),
    getCartCount(),
    updateCartBadge()
}
```

### products.js

```javascript
window.handleAddToCart(productId)

const productsDatabase = { ... }
```

---

## ⚙️ Configuración

### Colores CSS

```css
--color-primary: #0a0a0a;      /* Negro */
--color-secondary: #c9a227;     /* Dorado */
--color-text: #f5f5f5;          /* Blanco */
```

### Configuración Carrito

```javascript
const IVA_RATE = 0.19;                    // 19%
const FREE_SHIPPING_THRESHOLD = 200000;   // $200K
const SHIPPING_COST = 15000;              // $15K
```

---

## 🎮 Uso

### Usuario Final

1. **Registrarse**: Login → Tab Registro → Llenar formulario
2. **Iniciar Sesión**: Login → Ingresar credenciales
3. **Comprar**: Categoría → Agregar al Carrito → Carrito → Checkout

### Desarrollador

**Agregar Producto:**
```javascript
// En products.js
'id-producto': {
    id: 'id-producto',
    name: 'Nombre',
    brand: 'MARCA',
    category: 'Categoría',
    price: '$X.XXX.XXX',
    description: '...',
    image: 'url'
}
```

**Cambiar Colores:**
```css
/* En style.css */
:root {
    --color-secondary: #tu-color;
}
```

---

## 🔒 Seguridad

### ⚠️ SOLO PARA DESARROLLO

Este proyecto usa localStorage con contraseñas en texto plano.

**NO usar en producción.**

### Para Producción Requiere:

1. **Backend** (Node.js, PHP, Python)
2. **Base de Datos** (MySQL, MongoDB)
3. **Encriptación** (Bcrypt, Argon2)
4. **JWT** o sesiones seguras
5. **HTTPS** obligatorio
6. **Validación server-side**

---

## 🗺️ Roadmap

### v2.2 (Próximo)
- [ ] Imágenes reales de productos
- [ ] Sistema de búsqueda
- [ ] Filtros de productos
- [ ] Wishlist

### v3.0 (Futuro)
- [ ] Backend con API REST
- [ ] Base de datos
- [ ] Autenticación JWT
- [ ] Panel admin

### v4.0 (Largo Plazo)
- [ ] Pasarela de pagos
- [ ] App móvil
- [ ] Reviews y ratings
- [ ] Chat en vivo

---

## 📊 Estadísticas

- **Líneas de código**: ~9,000
- **Páginas**: 10
- **Productos**: 18
- **Funcionalidades**: 3 sistemas completos
- **Responsive**: 100%

---

## 📄 Licencia

MIT License - Uso libre con atribución

---


---

## 🙏 Agradecimientos

- Font Awesome por los iconos
- Unsplash por las imágenes
- Comunidad Open Source

---


---

<div align="center">

**🕐 CHRONOS XXI**

*Elegancia y Precisión en Cada Momento*

**Versión 2.1** | Noviembre 2025

---

⭐ Si te fue útil, considera dar una estrella



</div>
