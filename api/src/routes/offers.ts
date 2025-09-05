// Rutas para gestión de ofertas
import { body, validationResult } from 'express-validator'; // Validación de datos
// Validaciones para crear/editar oferta
const offerValidations = [
  body('title').isString().trim().isLength({ min: 2, max: 100 }).withMessage('El título debe tener entre 2 y 100 caracteres'),
  body('discount').isFloat({ min: 0, max: 100 }).withMessage('El descuento debe ser un número entre 0 y 100'),
  body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('La descripción debe tener máximo 500 caracteres'),
];
import { authenticate, authorizeRole } from '../middleware/auth'; // Middleware de autenticación y roles
import rateLimit from 'express-rate-limit'; // Rate limiting
// Limitar a 10 solicitudes por minuto por IP en endpoints sensibles
const offerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: 'Demasiadas solicitudes, intenta de nuevo en un minuto.'
});
import sanitizeHtml from 'sanitize-html'; // Sanitización de datos
import { Router, Request, Response } from 'express'; // Express
import { getContainer } from '../lib/cosmos'; // Cosmos DB
import { Offer } from '../types/offer'; // Tipo de oferta
import { v4 as uuidv4 } from 'uuid'; // Generador de IDs únicos

const router = Router(); // Inicializa el router
const container = getContainer('offers'); // Contenedor de ofertas

// GET / - Obtener todas las ofertas
// Endpoint con paginación
router.get('/', async (req: Request, res: Response) => {
  try {
    // Obtener parámetros de paginación
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Consulta paginada
    const query = {
      query: 'SELECT * FROM c ORDER BY c.date DESC OFFSET @offset LIMIT @limit',
      parameters: [
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      ]
    };
    const { resources: offers } = await container.items.query(query).fetchAll();

    // Total de ofertas (para frontend)
    const totalQuery = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
    const total = totalQuery.resources[0] || 0;

    res.json({
      offers,
      page,
      limit,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas', details: error });
  }
});

// POST / - Crear una nueva oferta (solo admin)
router.post('/', offerLimiter, authenticate, authorizeRole('admin'), offerValidations, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Sanitiza los campos
    const sanitizedTitle = sanitizeHtml(req.body.title);
    const sanitizedDescription = req.body.description ? sanitizeHtml(req.body.description) : undefined;
    // Crea la oferta y la guarda en la base de datos
    const offer: Offer = { ...req.body, title: sanitizedTitle, description: sanitizedDescription, id: uuidv4() };
    const { resource } = await container.items.create(offer);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear oferta', details: error });
  }
});

// PUT /:id - Actualizar una oferta (solo admin)
router.put('/:id', offerLimiter, authenticate, authorizeRole('admin'), offerValidations, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Sanitiza los campos
    const sanitizedTitle = sanitizeHtml(req.body.title);
    const sanitizedDescription = req.body.description ? sanitizeHtml(req.body.description) : undefined;
    // Busca la oferta existente y la actualiza
    const id = req.params.id;
    const { resource: existing } = await container.item(id, id).read<Offer>();
    if (!existing) return res.status(404).json({ error: 'Oferta no encontrada' });
    const updated: Offer = { ...existing, ...req.body, title: sanitizedTitle, description: sanitizedDescription };
    const { resource } = await container.item(id, id).replace(updated);
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar oferta', details: error });
  }
});

// DELETE /:id - Eliminar una oferta (solo admin)
router.delete('/:id', offerLimiter, authenticate, authorizeRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await container.item(id, id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar oferta', details: error });
  }
});

export default router;
