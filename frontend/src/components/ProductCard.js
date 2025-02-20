import React from 'react';
import { addToCart } from '../services/api';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const handleAddToCart = async () => {
        try {
            await addToCart(product.id);
            alert('Producto agregado con éxito');
        } catch (error) {
            alert('Error al agregar al carrito');
        }
    };

    return (
        <div className="product-card">
            <img 
                src={product.image || '/placeholder.png'} 
                alt={product.name}
                className="product-image"
            />
            <h3>{product.name}</h3>
            <p className="description">{product.description}</p>
            <p className="price">${product.price}</p>
            <button onClick={handleAddToCart} className="add-to-cart-btn">
                Agregar al Carrito
            </button>
        </div>
    );
};

export default ProductCard; 