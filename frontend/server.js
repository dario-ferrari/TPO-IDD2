const express = require('express');
const path = require('path');
const app = express();

const PORT = 5500; // Usa este puerto específicamente

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar todas las solicitudes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
}); 