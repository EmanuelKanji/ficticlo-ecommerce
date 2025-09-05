// Rutas para gestión de órdenes de compra
import { body, validationResult } from 'express-validator'; // Validación de datos
// Validaciones para crear/editar orden
const orderValidations = [
  body('lines').isArray({ min: 1 }).withMessage('Debe haber al menos una línea de productos'),
  body('lines.*.productId').isString().withMessage('ID de producto inválido'),
  body('lines.*.qty').isInt({ min: 1 }).withMessage('Cantidad debe ser al menos 1'),
];
import { authenticate, authorizeRole } from '../middleware/auth'; // Middleware de autenticación y roles
import sanitizeHtml from 'sanitize-html'; // Sanitización de datos
import rateLimit from 'express-rate-limit'; // Rate limiting
// Limitar a 10 solicitudes por minuto por IP en endpoints sensibles
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: 'Demasiadas solicitudes, intenta de nuevo en un minuto.'
});
import { Router, Request, Response } from 'express'; // Express
import { getContainer } from '../lib/cosmos'; // Cosmos DB
import { Order } from '../types/order'; // Tipo de orden
import { Product } from '../types/product'; // Tipo de producto
import { v4 as uuidv4 } from 'uuid'; // Generador de IDs únicos
import { createPurchaseNotification } from '../lib/notifications'; // Notificación de compra

const router = Router(); // Inicializa el router
const container = getContainer('orders'); // Contenedor de órdenes

// GET / - Obtener todas las órdenes
// Endpoint con paginación
router.get('/', async (req: Request, res: Response) => {
  try {
    // Obtener parámetros de paginación
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Consulta paginada
    const query = {
      query: 'SELECT * FROM c ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit',
      parameters: [
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      ]
    };
    const { resources: orders } = await container.items.query(query).fetchAll();

    // Total de órdenes (para frontend)
    const totalQuery = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
    const total = totalQuery.resources[0] || 0;

    res.json({
      orders,
      page,
      limit,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes', details: error });
  }
});

// POST / - Crear una nueva orden (solo admin)
router.post('/', orderLimiter, authenticate, authorizeRole('admin'), orderValidations, async (req: Request, res: Response) => {
  // Sanitiza las líneas de productos
  const sanitizedLines = Array.isArray(req.body.lines)
    ? (req.body.lines as Array<{ productId: string; qty: number }>).
        map((line: { productId: string; qty: number }) => ({
          productId: sanitizeHtml(line.productId),
          qty: line.qty
        }))
    : [];
  // Valida los datos recibidos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Crea la orden y la guarda en la base de datos
  const order: Order = { ...req.body, lines: sanitizedLines, id: uuidv4(), createdAt: new Date().toISOString() };
    // Descuenta el stock de los productos comprados
    const productsContainer = getContainer('products');
    if (Array.isArray(order.lines)) {
      for (const line of order.lines) {
        if (!line.productId || typeof line.qty !== 'number') continue;
        // Lee el producto y actualiza el stock
        const { resource: product } = await productsContainer.item(line.productId, line.productId).read<Product>();
        if (product && typeof product.stock === 'number') {
          const newStock = Math.max(0, product.stock - line.qty);
          await productsContainer.item(line.productId, line.productId).replace({ ...product, stock: newStock });
        }
      }
    }
    // Guarda la orden y crea la notificación de compra
    const { resource } = await container.items.create(order);
    await createPurchaseNotification(order);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear orden', details: error });
  }
});

// PUT /:id - Actualizar una orden (solo admin)
router.put('/:id', orderLimiter, authenticate, authorizeRole('admin'), orderValidations, async (req: Request, res: Response) => {
  // Sanitiza las líneas de productos
  const sanitizedLines = Array.isArray(req.body.lines)
    ? (req.body.lines as Array<{ productId: string; qty: number }>).
        map((line: { productId: string; qty: number }) => ({
          productId: sanitizeHtml(line.productId),
          qty: line.qty
        }))
    : [];
  // Valida los datos recibidos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Busca la orden existente y la actualiza
    const id = req.params.id;
    const { resource: existing } = await container.item(id, id).read<Order>();
    if (!existing) return res.status(404).json({ error: 'Orden no encontrada' });
  const updated: Order = { ...existing, ...req.body, lines: sanitizedLines };
    const { resource } = await container.item(id, id).replace(updated);
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar orden', details: error });
  }
});

// Eliminar una orden
router.delete('/:id', orderLimiter, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await container.item(id, id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar orden', details: error });
  }
});

export default router;
