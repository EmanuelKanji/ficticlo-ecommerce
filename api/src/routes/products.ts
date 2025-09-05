// Importación de dependencias principales
import { Router, Request, Response } from 'express'; // Express para crear rutas
import { getContainer } from '../lib/cosmos'; // Función para obtener contenedores de Cosmos DB
import { Product } from '../types/product'; // Tipo de producto
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos
import { authenticate, authorizeRole } from '../middleware/auth'; // Middleware de autenticación y roles
import rateLimit from 'express-rate-limit'; // Rate limiting
// Limitar a 10 solicitudes por minuto por IP en endpoints sensibles
const productLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: 'Demasiadas solicitudes, intenta de nuevo en un minuto.'
});
import { body, validationResult } from 'express-validator'; // Validación y sanitización de datos
// Validaciones para producto (nombre, precio, stock, descripción)
const productValidations = [
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
  body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('La descripción debe tener máximo 500 caracteres'),
];

// Inicialización del router y contenedores de Cosmos DB
const router = Router(); // Router de Express
const container = getContainer('products'); // Contenedor de productos
const ordersContainer = getContainer('orders'); // Contenedor de órdenes

// Endpoint GET / - Obtener todos los productos o por slug
// Endpoint GET / - Obtener todos los productos o por slug, con paginación
router.get('/', async (req: Request, res: Response) => {
  try {
    // Si se pasa un slug por query, busca el producto por slug
    const { slug } = req.query;
    if (slug) {
      let slugStr = '';
      if (typeof slug === 'string') slugStr = slug;
      else if (Array.isArray(slug)) slugStr = String(slug[0]);
      else slugStr = '';
      // Consulta por slug
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.slug = @slug',
        parameters: [{ name: '@slug', value: slugStr }]
      };
      const { resources } = await container.items.query(querySpec).fetchAll();
      return res.json(resources);
    }
    // Si no hay slug, devuelve productos paginados
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Consulta paginada
    const query = {
      query: 'SELECT * FROM c ORDER BY c.name ASC OFFSET @offset LIMIT @limit',
      parameters: [
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      ]
    };
    const { resources: products } = await container.items.query(query).fetchAll();

    // Total de productos (para frontend)
    const totalQuery = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
    const total = totalQuery.resources[0] || 0;

    res.json({
      products,
      page,
      limit,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error });
  }
});

// Endpoint POST / - Crear un nuevo producto (solo admin)
router.post('/', productLimiter, authenticate, authorizeRole('admin'), productValidations, async (req: Request, res: Response) => {
  // Validar datos recibidos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Sanitiza los campos
    const sanitizedName = require('sanitize-html')(req.body.name || '');
    const sanitizedDescription = req.body.description ? require('sanitize-html')(req.body.description) : undefined;
    const rawSlug = req.body.slug || sanitizedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const sanitizedSlug = require('sanitize-html')(rawSlug);
    // Crear objeto producto y guardar en la base de datos
    const product: Product = { ...req.body, name: sanitizedName, description: sanitizedDescription, slug: sanitizedSlug, id: uuidv4() };
    const { resource } = await container.items.create(product);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto', details: error });
  }
});

// Endpoint PUT /:id - Actualizar un producto (solo admin)
router.put('/:id', productLimiter, authenticate, authorizeRole('admin'), productValidations, async (req: Request, res: Response) => {
  // Validar datos recibidos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Sanitiza los campos
    const sanitizedName = require('sanitize-html')(req.body.name || '');
    const sanitizedDescription = req.body.description ? require('sanitize-html')(req.body.description) : undefined;
    const rawSlug = req.body.slug || sanitizedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const sanitizedSlug = require('sanitize-html')(rawSlug);
    const id = req.params.id;
    // Buscar producto existente
    const { resource: existing } = await container.item(id, id).read<Product>();
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });
    // Actualizar producto y guardar
    const updated: Product = { ...existing, ...req.body, name: sanitizedName, description: sanitizedDescription, slug: sanitizedSlug };
    const { resource } = await container.item(id, id).replace(updated);
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto', details: error });
  }
});

// Endpoint DELETE /:id - Eliminar un producto (solo admin)
router.delete('/:id', productLimiter, authenticate, authorizeRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    // Eliminar producto por ID
    await container.item(id, id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto', details: error });
  }
});

// Endpoint GET /featured - Obtener productos destacados (más comprados)
router.get('/featured', async (req: Request, res: Response) => {
  try {
    // Obtener todas las órdenes
    const { resources: orders } = await ordersContainer.items.readAll().fetchAll();
    // Contar cuántas veces se ha comprado cada producto
    const productCount: Record<string, number> = {};
    orders.forEach((order: any) => {
      if (Array.isArray(order.products)) {
        order.products.forEach((p: any) => {
          productCount[p.id] = (productCount[p.id] || 0) + (p.quantity || 1);
        });
      }
    });
    // Obtener todos los productos
    const { resources: products } = await container.items.readAll<Product>().fetchAll();
    // Ordenar productos por cantidad comprada y tomar los top 8
    const sorted = products
      .map(p => ({ ...p, bought: productCount[p.id] || 0 }))
      .sort((a, b) => b.bought - a.bought)
      .slice(0, 8);
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos destacados', details: error });
  }
});

// Exportar el router para usarlo en la app principal
export default router;
