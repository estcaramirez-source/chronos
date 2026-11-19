// ==========================================
// PRODUCTOS - AGREGAR AL CARRITO
// ==========================================

// Base de datos de productos
const productsDatabase = {
    // Relojes Clásicos
    'elegance-master': {
        id: 'elegance-master',
        name: 'Elegance Master',
        brand: 'ROLEX',
        category: 'Clásicos',
        price: '$23.999.000',
        description: 'Movimiento mecánico suizo, caja de acero inoxidable con baño de oro de 18k',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    'seamaster-classic': {
        id: 'seamaster-classic',
        name: 'Seamaster Classic',
        brand: 'OMEGA',
        category: 'Clásicos',
        price: '$17.199.000',
        description: 'Resistente al agua 300m, movimiento Co-Axial',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    'heritage-collection': {
        id: 'heritage-collection',
        name: 'Heritage Collection',
        brand: 'PATEK PHILIPPE',
        category: 'Clásicos',
        price: '$50.000.000',
        description: 'Edición limitada, complicaciones múltiples',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    'prestige-gold': {
        id: 'prestige-gold',
        name: 'Prestige Gold',
        brand: 'TISSOT',
        category: 'Clásicos',
        price: '$11.199.000',
        description: 'Powermatic 80, reserva de marcha 80 horas',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    'royal-timepiece': {
        id: 'royal-timepiece',
        name: 'Royal Timepiece',
        brand: 'LONGINES',
        category: 'Clásicos',
        price: '$7.599.000',
        description: 'Cronógrafo clásico, movimiento suizo L688',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    'distinguished-gent': {
        id: 'distinguished-gent',
        name: 'Distinguished Gent',
        brand: 'SEIKO',
        category: 'Clásicos',
        price: '$3.599.000',
        description: 'Movimiento automático 4R36, dial texturizado',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    // Relojes Tecnológicos
    'watch-ultra-pro': {
        id: 'watch-ultra-pro',
        name: 'Watch Ultra Pro',
        brand: 'APPLE',
        category: 'Tecnológicos',
        price: '$3.599.000',
        description: 'GPS + Cellular, pantalla Retina siempre activa',
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'
    },
    'galaxy-watch-6-pro': {
        id: 'galaxy-watch-6-pro',
        name: 'Galaxy Watch 6 Pro',
        brand: 'SAMSUNG',
        category: 'Tecnológicos',
        price: '$2.199.000',
        description: 'Monitoreo de salud avanzado, batería de larga duración',
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'
    },
    'fenix-7x-solar': {
        id: 'fenix-7x-solar',
        name: 'Fenix 7X Solar',
        brand: 'GARMIN',
        category: 'Tecnológicos',
        price: '$3.999.000',
        description: 'Carga solar, mapas TopoActive precargados',
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'
    },
    'sense-2-advanced': {
        id: 'sense-2-advanced',
        name: 'Sense 2 Advanced',
        brand: 'FITBIT',
        category: 'Tecnológicos',
        price: '$1.399.000',
        description: 'Gestión del estrés, análisis de sueño ECG',
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'
    },
    'venu-3-elite': {
        id: 'venu-3-elite',
        name: 'Venu 3 Elite',
        brand: 'GARMIN',
        category: 'Tecnológicos',
        price: '$1.999.000',
        description: 'Llamadas telefónicas, entrenamientos animados',
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'
    },
    'versa-4-sport': {
        id: 'versa-4-sport',
        name: 'Versa 4 Sport',
        brand: 'FITBIT',
        category: 'Tecnológicos',
        price: '$919.000',
        description: '40+ modos deportivos, GPS integrado',
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'
    },
    // Relojes Deportivos
    'g-shock-mudmaster': {
        id: 'g-shock-mudmaster',
        name: 'G-Shock Mudmaster',
        brand: 'CASIO',
        category: 'Deportivos',
        price: '$1.599.000',
        description: 'Triple Sensor, resistencia a golpes y barro',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    },
    'carrera-chronograph': {
        id: 'carrera-chronograph',
        name: 'Carrera Chronograph',
        brand: 'TAG HEUER',
        category: 'Deportivos',
        price: '$13.199.000',
        description: 'Cronógrafo automático Calibre Heuer 02',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    },
    'suunto-9-peak-pro': {
        id: 'suunto-9-peak-pro',
        name: 'Suunto 9 Peak Pro',
        brand: 'SUUNTO',
        category: 'Deportivos',
        price: '$2.799.000',
        description: 'Batería de ultra-resistencia, GPS dual',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    },
    'rangeman-solar': {
        id: 'rangeman-solar',
        name: 'Rangeman Solar',
        brand: 'CASIO',
        category: 'Deportivos',
        price: '$1.799.000',
        description: 'Carga solar, brújula digital, altímetro',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    },
    'expedition-field': {
        id: 'expedition-field',
        name: 'Expedition Field',
        brand: 'TIMEX',
        category: 'Deportivos',
        price: '$639.000',
        description: 'Indiglo night-light, resistente al agua 100m',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    },
    'prospex-diver': {
        id: 'prospex-diver',
        name: 'Prospex Diver',
        brand: 'SEIKO',
        category: 'Deportivos',
        price: '$2.399.000',
        description: 'Certificación ISO de buceo, resistencia 200m',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    }
};

// Función para agregar al carrito con verificación de sesión
function handleAddToCart(productId) {
    // Verificar si hay sesión activa
    if (!window.authSystem.isLoggedIn()) {
        // Si no hay sesión, guardar la página actual y redirigir a login
        sessionStorage.setItem('returnTo', window.location.pathname);
        
        // Mostrar mensaje y redirigir
        if (confirm('Debes iniciar sesión para agregar productos al carrito. ¿Deseas iniciar sesión ahora?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Si hay sesión, agregar al carrito
    const product = productsDatabase[productId];
    
    if (product) {
        window.cartSystem.addToCart(product);
        
        // Mostrar notificación de éxito
        showAddToCartNotification(product.name);
    }
}

// Mostrar notificación cuando se agrega un producto
function showAddToCartNotification(productName) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span><strong>${productName}</strong> agregado al carrito</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Agregar estilos para la notificación
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .cart-notification {
        position: fixed;
        top: 100px;
        right: -400px;
        background: linear-gradient(135deg, rgba(0, 204, 0, 0.95), rgba(0, 153, 0, 0.95));
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 10px 0 0 10px;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 9999;
        transition: right 0.3s ease;
        max-width: 350px;
    }
    
    .cart-notification.show {
        right: 0;
    }
    
    .cart-notification i {
        font-size: 2rem;
    }
    
    .cart-notification span {
        font-size: 1rem;
        line-height: 1.4;
    }
`;
document.head.appendChild(notificationStyles);

// Exportar función
window.handleAddToCart = handleAddToCart;
