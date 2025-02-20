import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import CartIcon from '../components/CartIcon';
import './HomePage.css';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');
    const userCategory = localStorage.getItem('userCategory');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="home-container">
            <div className="header">
                <h1>TiendaIDD2</h1>
                <div className="user-info">
                    <p>Hola {userName}, tu categoría es {userCategory}</p>
                    <CartIcon onClick={() => navigate('/cart')} />
                </div>
            </div>
            <ProductGrid products={products} />
        </div>
    );
};

export default HomePage; 