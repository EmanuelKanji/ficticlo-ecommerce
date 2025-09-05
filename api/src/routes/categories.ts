// Rutas para gestión de categorías
import { body, validationResult } from 'express-validator'; // Validación de datos
// Validaciones para crear/editar categoría
const categoryValidations = [
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('La descripción debe tener máximo 500 caracteres'),
];
import { authenticate, authorizeRole } from '../middleware/auth'; // Middleware de autenticación y roles
import { Router, Request, Response } from 'express'; // Express
import { getContainer } from '../lib/cosmos'; // Cosmos DB
import { Category } from '../types/category'; // Tipo de categoría
import sanitizeHtml from 'sanitize-html'; // Librería para sanitizar HTML

import { v4 as uuidv4 } from 'uuid'; // Generador de IDs únicos

const router = Router(); // Inicializa el router
const container = getContainer('categories'); // Contenedor de categorías

// GET / - Obtener todas las categorías
router.get('/', async (req: Request, res: Response) => {
  try {
    const { resources } = await container.items.readAll<Category>().fetchAll();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías', details: error });
  }
});

// POST / - Crear una nueva categoría (solo admin)
router.post('/', authenticate, authorizeRole('admin'), categoryValidations, async (req: Request, res: Response) => {
  // Valida los datos recibidos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Sanitiza y crea la categoría, luego la guarda en la base de datos
    const nameSanitized = sanitizeHtml(req.body.name || '', { allowedTags: [], allowedAttributes: {} });
    const descriptionSanitized = sanitizeHtml(req.body.description || '', { allowedTags: [], allowedAttributes: {} });
    const category: Category = { ...req.body, name: nameSanitized, description: descriptionSanitized, id: uuidv4() };
    const { resource } = await container.items.create(category);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría', details: error });
  }
});

// PUT /:id - Actualizar una categoría (solo admin)
router.put('/:id', authenticate, authorizeRole('admin'), categoryValidations, async (req: Request, res: Response) => {
  // Valida los datos recibidos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Busca la categoría existente y la actualiza
    const id = req.params.id;
    const { resource: existing } = await container.item(id, id).read<Category>();
    if (!existing) return res.status(404).json({ error: 'Categoría no encontrada' });
    const nameSanitized = sanitizeHtml(req.body.name || '', { allowedTags: [], allowedAttributes: {} });
    const descriptionSanitized = sanitizeHtml(req.body.description || '', { allowedTags: [], allowedAttributes: {} });
    const updated: Category = { ...existing, ...req.body, name: nameSanitized, description: descriptionSanitized };
    const { resource } = await container.item(id, id).replace(updated);
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría', details: error });
  }
});

// DELETE /:id - Eliminar una categoría (solo admin)
router.delete('/:id', authenticate, authorizeRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await container.item(id, id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría', details: error });
  }
});

export default router;
