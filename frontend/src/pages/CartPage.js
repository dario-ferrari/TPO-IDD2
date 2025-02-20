import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, checkout } from '../services/api';
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

            const response = await fetch(`${API_BASE_URL}/service/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar el carrito');
            }

            const data = await response.json();
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
        const tax = subtotal * 0.21; // TAX_RATE
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
            alert('¡Gracias por su compra!');
            navigate('/home');
        } catch (error) {
            alert('Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="cart-page">
                <div className="cart-error">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!cartData.items.length) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <p>{cartData.message || 'Tu carrito está vacío'}</p>
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
                        onRemove={handleDecrement}
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
                    >
                        <option value="">Seleccione método de pago</option>
                        <option value={PaymentMethods.DEBITO}>Tarjeta de Débito</option>
                        <option value={PaymentMethods.CREDITO}>Tarjeta de Crédito</option>
                        <option value={PaymentMethods.MERCADO_PAGO}>Mercado Pago</option>
                    </select>
                    <button 
                        className="checkout-btn"
                        onClick={handleCheckout}
                        disabled={!paymentMethod || loading}
                    >
                        {loading ? 'Procesando...' : 'PAGAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage; 