import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import './CartIcon.css';

const CartIcon = ({ onClick }) => {
    return (
        <div className="cart-icon" onClick={onClick}>
            <FaShoppingCart size={24} />
        </div>
    );
};

export default CartIcon; 