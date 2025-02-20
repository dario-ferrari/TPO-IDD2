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
            <h2>Carrito de Compras</h2>
            <div class="cart-content">
                <div class="cart-items-section">
                    <div id="cart-items" class="cart-items">
                        <!-- Items del carrito se cargarán aquí -->
                    </div>
                </div>
                <div class="cart-summary">
                    <h3>Resumen de la Compra</h3>
                    <div id="cart-totals" class="cart-totals">
                        <!-- Totales se cargarán aquí -->
                    </div>
                    <div class="payment-section">
                        <div class="payment-method">
                            <label>Medio de pago:</label>
                            <select id="paymentMethod" class="payment-select">
                                <option value="">Seleccione un medio de pago</option>
                                <option value="DEBITO">Tarjeta de Débito</option>
                                <option value="CREDITO">Tarjeta de Crédito</option>
                                <option value="MERCADO_PAGO">Mercado Pago</option>
                            </select>
                        </div>
                        <button 
                            onclick="handleCheckout()"
                            class="checkout-btn"
                        >
                            Finalizar Compra
                        </button>
                    </div>
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
        console.log('Respuesta del servidor:', result);

        if (result.success) {
            alert(result.message || 'Producto agregado al carrito');
            // Opcional: actualizar el contador del carrito si lo tienes
            updateCartCount(result.cart.items.length);
        } else {
            throw new Error(result.error || 'Error al agregar al carrito');
        }
    } catch (error) {
        console.error('Error detallado:', error);
        alert(error.message || 'Error al agregar al carrito');
    }
}

// Función auxiliar para actualizar el contador del carrito (si lo tienes)
function updateCartCount(count) {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
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
            const checkoutButton = document.querySelector('.checkout-btn');

            if (!cartData.items || cartData.items.length === 0) {
                cartItems.innerHTML = `
                    <p class="empty-cart">${cartData.message || 'Tu carrito está vacío'}</p>
                `;
                cartTotals.innerHTML = '';
                // Deshabilitar el botón si el carrito está vacío
                checkoutButton.disabled = true;
                checkoutButton.classList.add('disabled');
                checkoutButton.textContent = 'CARRITO VACÍO';
                return;
            }

            // Renderizar items con los botones de control
            cartItems.innerHTML = cartData.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-controls">
                                ${item.quantity > 1 ? `
                                    <button 
                                        class="quantity-btn"
                                        onclick="handleDecrement(${item.productId})"
                                        title="Reducir cantidad"
                                    >
                                        -
                                    </button>
                                ` : ''}
                                <span class="quantity">${item.quantity}</span>
                                <button 
                                    class="quantity-btn"
                                    onclick="handleIncrement(${item.productId})"
                                    title="Aumentar cantidad"
                                >
                                    +
                                </button>
                            </div>
                            <button 
                                class="remove-btn"
                                onclick="${item.quantity > 1 ? 
                                    `handleRemoveAll(${item.productId})` : 
                                    `handleDecrement(${item.productId})`}"
                                title="${item.quantity > 1 ? 'Eliminar todos' : 'Eliminar del carrito'}"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="item-subtotal">
                        <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
            
            // Calcular totales
            const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * TAX_RATE;
            const total = subtotal + tax;

            cartTotals.innerHTML = `
                <p>Subtotal: $${subtotal.toFixed(2)}</p>
                <p>Impuestos: $${tax.toFixed(2)}</p>
                <p>Total: $${total.toFixed(2)}</p>
            `;

            // Habilitar el botón si el carrito tiene elementos
            checkoutButton.disabled = false;
            checkoutButton.classList.remove('disabled');
            checkoutButton.textContent = 'FINALIZAR COMPRA';

        } catch (error) {
            console.error('Error detallado al cargar carrito:', error);
            alert(error.message || 'Error al cargar el carrito');
        }
    }
}

async function handleIncrement(productId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/service/cart/increment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        if (!response.ok) {
            throw new Error('Error al incrementar cantidad');
        }

        // Recargar el carrito para mostrar los cambios
        loadCart();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

async function handleDecrement(productId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/service/cart/decrement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        if (!response.ok) {
            throw new Error('Error al decrementar cantidad');
        }

        // Recargar el carrito para mostrar los cambios
        loadCart();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

async function handleRemoveAll(productId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/service/cart/remove-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        if (!response.ok) {
            throw new Error('Error al eliminar producto');
        }

        // Recargar el carrito para mostrar los cambios
        loadCart();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

async function handleCheckout() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!paymentMethod) {
        alert('Por favor seleccione un método de pago');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        // Crear la factura
        const response = await fetch(`${API_BASE_URL}/service/cart/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                paymentMethod
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al procesar el pago');
        }

        // Generar y descargar PDF
        if (result.bill) {
            await generateAndDownloadPDF(result.bill);
        }

        // Mostrar mensaje de éxito
        alert(result.message || '¡Gracias por su compra!');
        
        // Redirigir a la página principal
        window.location.href = '/home';
    } catch (error) {
        console.error('Error en checkout:', error);
        alert(error.message || 'Error al procesar la compra');
    }
}

async function generateAndDownloadPDF(billData) {
    try {
        const response = await fetch(`${API_BASE_URL}/service/bills/${billData.id}/pdf`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Error al generar PDF');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${billData.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('Error generando PDF:', error);
    }
}

// Inicialización
window.addEventListener('popstate', () => {
    renderView(window.location.pathname);
});

// Renderizar vista inicial
renderView(window.location.pathname); 