// Archivo principal de la API Express
// Importa dependencias y routers de cada módulo
import express from 'express';
import rateLimit from 'express-rate-limit'; // Rate limiting global
import cors from 'cors';
import categoriesRouter from './routes/categories.js'; // Rutas de categorías
import productsRouter from './routes/products.js'; // Rutas de productos
import ordersRouter from './routes/orders.js'; // Rutas de órdenes
import offersRouter from './routes/offers.js'; // Rutas de ofertas
import loginRouter from './routes/login'; // Rutas de login y registro
import webpayRouter from './routes/webpay.js'; // Rutas de pagos Webpay
import usersRouter from './routes/users'; // Rutas de usuarios
import notificationsRouter from './routes/notifications'; // Rutas de notificaciones
import lowStockRouter from './routes/lowStock'; // Rutas de productos con bajo stock
import multer from 'multer'; // Middleware para manejo de archivos
import { uploadImageToBlob } from './lib/blob.js'; // Función para subir imágenes a Azure Blob
import { authenticate, authorizeRole } from './middleware/auth'; // Middleware de autenticación y roles

// Inicializa la aplicación Express
const app = express();

// Rate limiting global: máximo 100 solicitudes por 15 minutos por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas solicitudes, intenta de nuevo más tarde.'
});
app.use(globalLimiter);
// Habilita CORS para permitir peticiones desde otros dominios
app.use(cors());
// Permite recibir JSON en las peticiones, hasta 10MB
app.use(express.json({ limit: '10mb' }));

// Configura multer para manejo de archivos
const upload = multer();

// Endpoint para subir imágenes al servidor (solo admin)
app.post('/upload-image', authenticate, authorizeRole('admin'), upload.single('image'), async (req, res) => {
  try {
    // Verifica que se haya subido un archivo
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Valida el tipo de archivo (solo imágenes permitidas)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo imágenes jpg, png, webp, gif.' });
    }
    // Valida el tamaño máximo (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'La imagen excede el tamaño máximo de 2MB.' });
    }
    // Sube la imagen a Azure Blob Storage
    const fileBuffer = req.file.buffer;
    const fileName = Date.now() + '-' + req.file.originalname;
    const mimeType = req.file.mimetype;
    const url = await uploadImageToBlob(fileBuffer, fileName, mimeType);
    // Devuelve la URL de la imagen subida
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Error uploading image', details: err });
  }
});

// Conecta cada router a su endpoint correspondiente
app.use('/categories', categoriesRouter); // Categorías
app.use('/products', productsRouter); // Productos
app.use('/orders', ordersRouter); // Órdenes
app.use('/offers', offersRouter); // Ofertas
app.use('/login', loginRouter); // Login y registro
app.use('/webpay', webpayRouter); // Pagos Webpay
app.use('/users', usersRouter); // Usuarios
app.use('/notifications', notificationsRouter); // Notificaciones
app.use('/low-stock', lowStockRouter); // Productos con bajo stock

// Inicia el servidor en el puerto configurado
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // Servidor iniciado (no mostrar en consola en producción)
});
