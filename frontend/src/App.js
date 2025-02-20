import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route 
                        path="/home" 
                        element={
                            <PrivateRoute>
                                <HomePage />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/cart" 
                        element={
                            <PrivateRoute>
                                <CartPage />
                            </PrivateRoute>
                        } 
                    />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App; 