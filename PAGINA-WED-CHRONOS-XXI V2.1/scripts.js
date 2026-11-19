// Menú hamburguesa
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active') ? 'true' : 'false');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar transparente al hacer scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.98)';
    } else {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
    }
    
    lastScroll = currentScroll;
});

// Animación de entrada para las cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.producto-card, .servicio-card, .feature-card, .category-detail, .commitment-item, .stat-box').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// Formulario de contacto
const contactForm = document.querySelector('.contacto-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // El envío real del formulario se implementará cuando exista backend (ver Roadmap v3.0).
    
    // Aquí puedes agregar la lógica para enviar el formulario
    alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
    contactForm.reset();
});

// Animación del logo
const logo = document.querySelector('.logo h1');
logo.addEventListener('mouseenter', () => {
    logo.style.transform = 'scale(1.05)';
    logo.style.transition = 'transform 0.3s ease';
});

logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'scale(1)';
});

// Contador animado para estadísticas
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (element.dataset.suffix || '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (element.dataset.suffix || '');
        }
    }, 30);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const statBoxes = entry.target.querySelectorAll('.stat-box h3');
            statBoxes.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                const suffix = text.replace(/[0-9]/g, '');
                stat.dataset.suffix = suffix;
                animateCounter(stat, number);
            });
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Animación de aparición para tags
document.querySelectorAll('.category-tags').forEach(tagContainer => {
    const tags = tagContainer.querySelectorAll('.tag');
    tags.forEach((tag, index) => {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(20px)';
        setTimeout(() => {
            tag.style.transition = 'all 0.4s ease';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Efecto hover en números de compromiso
document.querySelectorAll('.commit-number').forEach(number => {
    number.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2) rotate(5deg)';
    });
    
    number.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0)';
    });
});

// Sistema de selección de garantías
let selectedPlan = null;

const warrantyButtons = document.querySelectorAll('.btn-select-warranty');
const selectedPlanSection = document.getElementById('selected-plan');
const changePlanBtn = document.querySelector('.btn-change-plan');

warrantyButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const planName = this.getAttribute('data-plan');
        const planPrice = this.getAttribute('data-price');
        const card = this.closest('.warranty-card');
        
        // Remover selección previa
        document.querySelectorAll('.selectable-warranty').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Agregar selección actual
        card.classList.add('selected');
        
        // Actualizar información del plan seleccionado
        updateSelectedPlan(planName, planPrice, card);
        
        // Mostrar sección de plan seleccionado
        selectedPlanSection.style.display = 'block';
        
        // Scroll suave a la sección
        selectedPlanSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Cambiar texto del botón
        this.innerHTML = '<i class="fas fa-check"></i> Plan Seleccionado';
        this.style.background = 'linear-gradient(135deg, #00cc00, #009900)';
        
        // Restaurar otros botones
        warrantyButtons.forEach(btn => {
            if (btn !== this) {
                btn.innerHTML = '<i class="fas fa-cart-plus"></i> Seleccionar Plan';
                btn.style.background = 'linear-gradient(135deg, var(--color-secondary), var(--color-gold-dark))';
            }
        });
        
        selectedPlan = {
            name: planName,
            price: planPrice
        };
    });
});

function updateSelectedPlan(planName, planPrice, card) {
    const planTitle = card.querySelector('h3').textContent;
    const planDuration = card.querySelector('.warranty-duration').textContent;
    
    // Formatear precio colombiano
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(planPrice);
    
    // Actualizar DOM
    document.querySelector('.plan-name').textContent = planTitle;
    document.querySelector('.plan-description').textContent = planDuration;
    document.querySelector('.price-amount').textContent = formattedPrice.replace('COP', '').trim();
}

if (changePlanBtn) {
    changePlanBtn.addEventListener('click', function() {
        // Ocultar sección de plan seleccionado
        selectedPlanSection.style.display = 'none';
        
        // Remover todas las selecciones
        document.querySelectorAll('.selectable-warranty').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Restaurar todos los botones
        warrantyButtons.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-cart-plus"></i> Seleccionar Plan';
            btn.style.background = 'linear-gradient(135deg, var(--color-secondary), var(--color-gold-dark))';
        });
        
        // Scroll a la sección de garantías
        document.querySelector('.warranty-types').scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        selectedPlan = null;
    });
}
