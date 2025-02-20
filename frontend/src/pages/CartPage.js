import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, checkout, getUserData } from '../services/api';
import CartItem from '../components/CartItem';
import { PaymentMethods, TAX_RATE } from '../constants';
import { API_BASE_URL } from '../config';
import './CartPage.css';

const CartPage = () => {
    const [cartData, setCartData] = useState({ items: [] });
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa');
            }

            const data = await getCart();
            console.log('Cart data loaded:', data); // Debug
            setCartData(data);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleIncrement = async (productId) => {
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

            const updatedCart = await response.json();
            setCartData(updatedCart);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDecrement = async (productId) => {
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

            const updatedCart = await response.json();
            setCartData(updatedCart);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleRemoveAll = async (productId) => {
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

            const updatedCart = await response.json();
            setCartData(updatedCart);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const calculateTotals = () => {
        const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const handleCheckout = async () => {
        if (!paymentMethod) {
            alert('Por favor seleccione un método de pago');
            return;
        }

        setLoading(true);
        try {
            await checkout(paymentMethod);
            const updatedUserData = await getUserData();
            localStorage.setItem('userCategory', updatedUserData.categoria);
            localStorage.setItem('userName', updatedUserData.nombre);
            
            alert('¡Gracias por su compra!');
            navigate('/home', { state: { forceUpdate: true } });
        } catch (error) {
            alert('Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    const cartIsEmpty = !cartData.items || cartData.items.length === 0;

    if (error) {
        return (
            <div className="cart-page">
                <div className="cart-error">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (cartIsEmpty) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <h2>Tu Carrito</h2>
                    <p className="empty-cart-message">{cartData.message || 'Tu carrito está vacío'}</p>
                    <div className="cart-summary">
                        <div className="payment-section">
                            <select 
                                className="payment-select disabled"
                                disabled={true}
                            >
                                <option value="">Seleccione método de pago</option>
                            </select>
                            <button 
                                className="checkout-btn disabled"
                                disabled={true}
                            >
                                CARRITO VACÍO
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { subtotal, tax, total } = calculateTotals();

    return (
        <div className="cart-page">
            <div className="cart-items">
                <h2>Tu Carrito</h2>
                {cartData.items.map(item => (
                    <CartItem
                        key={item.productId}
                        item={item}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                        onRemoveAll={handleRemoveAll}
                    />
                ))}
            </div>
            <div className="cart-summary">
                <h3>Resumen del Carrito</h3>
                <div className="price-details">
                    <div className="subtotal">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="taxes">
                        <span>Impuestos (21%):</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="total">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
                <div className="payment-section">
                    <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="payment-select"
                        disabled={loading}
                    >
                        <option value="">Seleccione método de pago</option>
                        <option value={PaymentMethods.DEBITO}>Tarjeta de Débito</option>
                        <option value={PaymentMethods.CREDITO}>Tarjeta de Crédito</option>
                        <option value={PaymentMethods.MERCADO_PAGO}>Mercado Pago</option>
                    </select>
                    <button 
                        className={`checkout-btn ${cartIsEmpty || !paymentMethod ? 'disabled' : ''}`}
                        onClick={handleCheckout}
                        disabled={cartIsEmpty || !paymentMethod || loading}
                    >
                        {loading ? 'Procesando...' : 'FINALIZAR COMPRA'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage; 