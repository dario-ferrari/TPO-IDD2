import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, getUserData } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import CartIcon from '../components/CartIcon';
import './HomePage.css';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState({
        nombre: '',
        categoria: ''
    });
    const navigate = useNavigate();
    const location = useLocation();

    const fetchUserData = async () => {
        try {
            const userData = await getUserData();
            setUserData(userData);
            localStorage.setItem('userCategory', userData.categoria);
            localStorage.setItem('userName', userData.nombre);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productsData = await getProducts();
                setProducts(productsData);
                await fetchUserData();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [location.state?.forceUpdate]); // Se ejecutará cuando cambie forceUpdate

    return (
        <div className="home-container">
            <div className="header">
                <h1>TiendaIDD2</h1>
                <div className="user-info">
                    <p>Hola {userData.nombre}, tu categoría es {userData.categoria}</p>
                    <CartIcon onClick={() => navigate('/cart')} />
                </div>
            </div>
            <ProductGrid products={products} />
        </div>
    );
};

export default HomePage; 