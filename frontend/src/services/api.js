const API_URL = 'http://localhost:3000/service';

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    return response.json();
};

export const getProducts = async () => {
    const token = localStorage.getItem('token');
    console.log('Haciendo petición a productos...');
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Respuesta recibida:', response.status);

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        return data;
    } catch (error) {
        console.error('Error en getProducts:', error);
        throw error;
    }
};

export const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
        throw new Error('Failed to add to cart');
    }

    return response.json();
};

export const checkout = async (paymentMethod) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    const response = await fetch(`${API_URL}/cart/${userId}/checkout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod }),
    });

    if (!response.ok) {
        throw new Error('Checkout failed');
    }

    return response.json();
};

export const getCart = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    const response = await fetch(`${API_URL}/cart/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch cart');
    }

    return response.json();
}; 