import React from 'react';
import './CartItem.css';

const CartItem = ({ item }) => {
    return (
        <div className="cart-item">
            <img 
                src={item.image || '/placeholder.png'} 
                alt={item.name} 
                className="cart-item-image"
            />
            <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-price">${item.price}</p>
            </div>
        </div>
    );
};

export default CartItem; 