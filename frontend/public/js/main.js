// Agregar al inicio del archivo
const TAX_RATE = 0.21; // 21% de impuesto

// Manejo de rutas básico
const routes = {
    '/': loginView,  // Cambiado para que el login sea la vista principal
    '/home': homeView,
    '/products': productsView,
    '/cart': cartView
};

function navigateTo(path) {
    window.history.pushState({}, '', path);
    renderView(path);
}

function renderView(path) {
    const view = routes[path] || notFoundView;
    const app = document.getElementById('app');
    app.innerHTML = view();
    
    // Cargar datos después de renderizar
    loadProducts();
    loadCart();
}

// Manejadores de vistas
function loginView() {
    return `
        <div class="login-container">
            <h1>Tienda IDD2</h1>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <input type="text" id="username" placeholder="Usuario" required>
                <input type="password" id="password" placeholder="Contraseña" required>
                <button type="submit">Ingresar</button>
            </form>
        </div>
    `;
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Intentando login con:', { username, password });
    
    try {
        const response = await fetch('http://localhost:3000/service/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (response.ok) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.nombre);
            localStorage.setItem('userCategory', data.user.categoria);
            navigateTo('/home');
        } else {
            alert('Credenciales incorrectas');
        }
    } catch (error) {
        alert('Error al intentar iniciar sesión');
    }
}

function logout() {
    localStorage.clear();
    navigateTo('/');
}

function homeView() {
    const token = localStorage.getItem('token');
    if (!token) {
        navigateTo('/');
        return '';
    }

    const userName = localStorage.getItem('userName');
    const userCategory = localStorage.getItem('userCategory');

    return `
        <div class="home-container">
            <header class="main-header">
                <h1>TiendaIDD2</h1>
                <div class="user-info">
                    <p>Hola ${userName}, tu categoría es ${userCategory}</p>
                    <div class="cart-icon" onclick="navigateTo('/cart')">🛒</div>
                </div>
            </header>
            <div id="products-grid" class="products-grid">
                <!-- Los productos se cargarán aquí -->
            </div>
            <div class="logout-container">
                <button onclick="logout()" class="logout-btn">Cerrar Sesión</button>
            </div>
        </div>
    `;
}

function productsView() {
    // Aquí puedes hacer fetch a tu API de productos
    return `<h1>Productos</h1>`;
}

function cartView() {
    return `
        <div class="cart-container">
            <div class="cart-content">
                <h2>Carrito de Compras</h2>
                <div id="cart-items" class="cart-items">
                    <!-- Items del carrito se cargarán aquí -->
                </div>
            </div>
            <div class="cart-summary">
                <h3>Resumen de la Compra</h3>
                <div id="cart-totals">
                    <!-- Totales se cargarán aquí -->
                </div>
            </div>
        </div>
    `;
}

// Agregar una constante para la URL base
const API_BASE_URL = 'http://localhost:3000';

// Función para cargar productos después de renderizar homeView
async function loadProducts() {
    if (window.location.pathname === '/home') {
        try {
            console.log('Iniciando carga de productos...');
            const token = localStorage.getItem('token');
            console.log('Token encontrado:', token ? 'Sí' : 'No');

            const response = await fetch(`${API_BASE_URL}/service/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Agregar más logs para debug
            console.log('URL de la petición:', `${API_BASE_URL}/service/products`);
            console.log('Estado de la respuesta:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const products = await response.json();
            console.log('Productos recibidos:', products);
            
            const productsGrid = document.getElementById('products-grid');
            if (!productsGrid) {
                console.error('No se encontró el elemento products-grid');
                return;
            }
            
            if (!Array.isArray(products)) {
                console.error('Los productos no son un array:', products);
                throw new Error('Formato de productos inválido');
            }
            
            productsGrid.innerHTML = products.map(product => {
                console.log('Procesando producto:', product);
                return `
                    <div class="product-card">
                        <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-footer">
                            <span class="product-price">$${product.price.toFixed(2)}</span>
                            <button onclick="addToCart(${product.id})" class="add-to-cart-btn">
                                Añadir al carrito
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            console.log('Productos renderizados exitosamente');
        } catch (error) {
            console.error('Error detallado al cargar productos:', error);
            console.error('Stack trace:', error.stack);
            document.getElementById('products-grid').innerHTML = `
                <p class="error">Error al cargar los productos: ${error.message}</p>
            `;
        }
    }
}

async function addToCart(productId) {
    try {
        console.log('Agregando producto al carrito:', productId);
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${API_BASE_URL}/service/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        console.log('Respuesta del servidor:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al agregar al carrito');
        }

        const result = await response.json();
        console.log('Producto agregado exitosamente:', result);
        alert('Producto agregado al carrito');
    } catch (error) {
        console.error('Error detallado:', error);
        alert(error.message || 'Error al agregar al carrito');
    }
}

// Función para cargar el contenido del carrito
async function loadCart() {
    if (window.location.pathname === '/cart') {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa');
            }

            console.log('Cargando carrito...');
            const response = await fetch(`${API_BASE_URL}/service/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar el carrito');
            }

            const cartData = await response.json();
            console.log('Datos del carrito:', cartData);
            
            const cartItems = document.getElementById('cart-items');
            const cartTotals = document.getElementById('cart-totals');
            
            if (!cartData.items || cartData.items.length === 0) {
                cartItems.innerHTML = `
                    <p class="empty-cart">${cartData.message || 'Tu carrito está vacío'}</p>
                `;
                cartTotals.innerHTML = '';
                return;
            }

            // Renderizar items
            cartItems.innerHTML = cartData.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p class="item-quantity">Cantidad: ${item.quantity}</p>
                    </div>
                    <div class="cart-item-price">
                        <p>$${item.price.toFixed(2)}</p>
                        <p class="item-subtotal">Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
            
            // Calcular totales
            const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * TAX_RATE;
            const total = subtotal + tax;
            
            cartTotals.innerHTML = `
                <div class="cart-summary-details">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row tax">
                        <span>Impuestos (${(TAX_RATE * 100)}%):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                <button id="checkout-btn" class="checkout-btn">
                    Proceder al pago
                </button>
            `;
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            document.getElementById('cart-items').innerHTML = `
                <p class="error">Error al cargar el carrito: ${error.message}</p>
            `;
        }
    }
}

// Inicialización
window.addEventListener('popstate', () => {
    renderView(window.location.pathname);
});

// Renderizar vista inicial
renderView(window.location.pathname); 