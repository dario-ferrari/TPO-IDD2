import React from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import './CartItem.css';

const CartItem = ({ item, onRemove, onIncrement, onDecrement, onRemoveAll }) => {
    return (
        <div className="cart-item">
            <div className="cart-item-image">
                <img src={item.image || '/images/placeholder.jpg'} alt={item.name} />
            </div>
            <div className="cart-item-details">
                <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-actions">
                    <div className="quantity-controls">
                        {item.quantity > 1 ? (
                            <>
                                <button 
                                    className="quantity-btn"
                                    onClick={() => onDecrement(item.productId)}
                                    title="Reducir cantidad"
                                >
                                    <FaMinus />
                                </button>
                                <span className="quantity">{item.quantity}</span>
                                <button 
                                    className="quantity-btn"
                                    onClick={() => onIncrement(item.productId)}
                                    title="Aumentar cantidad"
                                >
                                    <FaPlus />
                                </button>
                            </>
                        ) : (
                            <span className="quantity">1</span>
                        )}
                    </div>
                    <button 
                        className="remove-btn"
                        onClick={() => item.quantity > 1 ? onRemoveAll(item.productId) : onRemove(item.productId)}
                        title={item.quantity > 1 ? "Eliminar todos" : "Eliminar del carrito"}
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItem; 