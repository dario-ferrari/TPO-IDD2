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

export const getUserData = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    return response.json();
};

export const downloadBillPDF = async (billId) => {
    const token = localStorage.getItem('token');
    
    try {
        console.log('Iniciando descarga de PDF para factura:', billId);
        const response = await fetch(`${API_URL}/bills/${billId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al descargar la factura');
        }

        // Crear blob desde la respuesta
        const blob = await response.blob();
        if (blob.size === 0) {
            throw new Error('PDF generado está vacío');
        }

        // Crear URL del blob y forzar la descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `factura-${billId}.pdf`;

        // Agregar al DOM, hacer clic y limpiar
        document.body.appendChild(a);
        a.click();
        
        // Pequeño delay antes de limpiar
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);

        console.log('PDF descargado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en downloadBillPDF:', error);
        throw error;
    }
};

export const checkout = async (paymentMethod) => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/cart/checkout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentMethod }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en el checkout');
        }

        const result = await response.json();
        console.log('Resultado del checkout:', result);

        // Asegurarse de que tenemos el ID de la factura y descargar el PDF
        if (result.bill && result.bill._id) {
            console.log('Factura creada con ID:', result.bill._id);
            try {
                await downloadBillPDF(result.bill._id);
            } catch (pdfError) {
                console.error('Error al descargar PDF:', pdfError);
                alert('La compra se realizó correctamente pero hubo un error al descargar la factura. Por favor, contacte al soporte.');
            }
        } else {
            console.error('No se recibió ID de factura en la respuesta:', result);
            throw new Error('Error al generar la factura');
        }

        return result;
    } catch (error) {
        console.error('Error en checkout:', error);
        throw error;
    }
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