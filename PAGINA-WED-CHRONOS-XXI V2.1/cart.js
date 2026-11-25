// ==========================================
// SISTEMA DE CARRITO DE COMPRAS - CHRONOS XXI
// ==========================================

// Inicializar carrito
function initCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

initCart();

// ==========================================
// FUNCIONES DEL CARRITO
// ==========================================

// Lee una lista JSON de localStorage. Si la clave no existe, está corrupta o no
// contiene una lista, devuelve [] para que la tienda siga funcionando.
function readStoredList(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function getCart() {
    return readStoredList('cart');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(product) {
    const cart = getCart();
    
    // Verificar si el producto ya existe
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        if (existingProduct.quantity >= 10) {
            return false;
        }
        existingProduct.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart(cart);
    return true;
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

function updateQuantity(productId, quantity) {
    const cart = getCart();
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        if (!Number.isInteger(quantity) || quantity > 10) {
            return false;
        }
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            product.quantity = quantity;
            saveCart(cart);
        }
        return true;
    }
    return false;
}

function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartBadge();
}

// Los precios del catálogo vienen en formato COP ("$23.999.000"): el punto es separador
// de miles y no hay decimales, así que se conservan solo los dígitos.
function parsePrice(price) {
    return Number(String(price).replace(/\D/g, '')) || 0;
}

const IVA_RATE = 0.19;
const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_COST = 15000;

function calculateSummary(subtotal) {
    const tax = Math.round(subtotal * IVA_RATE);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (parsePrice(item.price) * item.quantity), 0);
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// ==========================================
// ACTUALIZAR BADGE DEL CARRITO
// ==========================================

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = getCartCount();
    
    badges.forEach(badge => {
        badge.textContent = count;
        if (count > 0) {
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

// ==========================================
// RENDERIZAR CARRITO
// ==========================================

function renderCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'flex';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'flex';
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-brand">${item.brand}</p>
                <p class="cart-item-category">${item.category}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn minus" onclick="changeQuantity('${item.id}', -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" value="${item.quantity}" min="1" readonly>
                <button class="qty-btn plus" onclick="changeQuantity('${item.id}', 1)" ${item.quantity >= 10 ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-price">
                <p class="price">${item.price}</p>
                <p class="subtotal">Subtotal: ${formatPrice(parsePrice(item.price) * item.quantity)}</p>
            </div>
            <button class="cart-item-remove" onclick="removeItem('${item.id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
    
    updateCartSummary();
}

// ==========================================
// ACTUALIZAR RESUMEN
// ==========================================

function updateCartSummary() {
    const { subtotal, tax, shipping, total } = calculateSummary(getCartTotal());

    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (shippingEl) {
        shippingEl.textContent = shipping === 0 ? 'Gratis' : formatPrice(shipping);
    }
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
}

function changeQuantity(productId, change) {
    const cart = getCart();
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        const newQuantity = product.quantity + change;
        updateQuantity(productId, newQuantity);
        renderCart();
    }
}

function removeItem(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
        removeFromCart(productId);
        renderCart();
    }
}

// ==========================================
// CHECKOUT
// ==========================================

const checkoutBtn = document.getElementById('checkoutBtn');

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        // Verificar si hay sesión activa
        if (!window.authSystem.isLoggedIn()) {
            showLoginModal();
            return;
        }
        
        // Verificar que haya productos
        const cart = getCart();
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Procesar compra
        processPurchase();
    });
}

function showLoginModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

function redirectToLogin() {
    sessionStorage.setItem('returnTo', 'carrito.html');
    window.location.href = 'login.html';
}

function processPurchase() {
    const user = window.authSystem.getCurrentUser();
    const cart = getCart();
    // Mismo cálculo que el resumen del carrito: subtotal + IVA + envío
    const summary = calculateSummary(getCartTotal());

    // Generar número de orden
    const orderNumber = 'CHR-' + Date.now().toString(36).toUpperCase();
    
    // Crear orden
    const order = {
        orderNumber: orderNumber,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        items: cart,
        subtotal: summary.subtotal,
        tax: summary.tax,
        shipping: summary.shipping,
        total: summary.total,
        date: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Guardar orden en historial
    const orders = readStoredList('orders');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Limpiar carrito
    clearCart();
    
    // Mostrar modal de confirmación
    document.getElementById('orderNumber').textContent = orderNumber;
    document.getElementById('purchaseModal').style.display = 'flex';
}

function closeModalAndRedirect() {
    closeModal();
    window.location.href = 'index.html';
}

// ==========================================
// INICIALIZACIÓN DE LA PÁGINA
// ==========================================

// Actualizar saludo del usuario
const userGreeting = document.getElementById('userGreeting');
if (userGreeting) {
    const user = window.authSystem.getCurrentUser();
    if (user) {
        userGreeting.textContent = `Hola, ${user.name}`;
    }
}

// Renderizar carrito si estamos en la página del carrito
if (document.getElementById('cartItems')) {
    renderCart();
}

// Actualizar badge al cargar la página
updateCartBadge();

// Cerrar modales al hacer click fuera
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

window.cartSystem = {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCart,
    getCartTotal,
    getCartCount,
    updateCartBadge
};

// Exportación para pruebas automatizadas (Node/Jest). En el navegador `module` no existe y se ignora.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initCart,
        readStoredList,
        parsePrice,
        calculateSummary,
        getCart,
        saveCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        updateCartBadge,
        renderCart,
        updateCartSummary,
        formatPrice,
        changeQuantity,
        removeItem,
        showLoginModal,
        closeModal,
        redirectToLogin,
        processPurchase,
        closeModalAndRedirect
    };
}
