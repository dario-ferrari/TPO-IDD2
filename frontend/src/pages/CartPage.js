import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, checkout } from '../services/api';
import CartItem from '../components/CartItem';
import { PaymentMethods, TAX_RATE } from '../constants';
import './CartPage.css';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const data = await getCart();
            setCartItems(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price, 0);
    };

    const calculateTaxes = (subtotal) => {
        return subtotal * TAX_RATE;
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

    const subtotal = calculateSubtotal();
    const taxes = calculateTaxes(subtotal);
    const total = subtotal + taxes;

    return (
        <div className="cart-page">
            <div className="cart-items">
                <h2>Tu Carrito</h2>
                {cartItems.map(item => (
                    <CartItem key={item.id} item={item} />
                ))}
            </div>
            <div className="cart-summary">
                <div className="price-details">
                    <div className="subtotal">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="taxes">
                        <span>Impuestos ({(TAX_RATE * 100)}%):</span>
                        <span>${taxes.toFixed(2)}</span>
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