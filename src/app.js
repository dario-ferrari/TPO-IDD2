const cors = require('cors');

// Agregar esto antes de las rutas
app.use(cors({
    origin: 'http://localhost:3001', // URL de tu frontend
    credentials: true
})); 