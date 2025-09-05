// Rutas para gestión de usuarios
import { authenticate, authorizeRole } from '../middleware/auth'; // Middleware de autenticación y roles
import rateLimit from 'express-rate-limit'; // Rate limiting
// Limitar a 10 solicitudes por minuto por IP en endpoints sensibles
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: 'Demasiadas solicitudes, intenta de nuevo en un minuto.'
});
import { changeUserPassword, getAllUsers, getUserById, updateUser, deleteUser as deleteUserDb } from '../lib/users'; // Funciones de usuario
import { Router, Request, Response } from 'express'; // Express
import { body, validationResult } from 'express-validator'; // Validación de datos
import sanitizeHtml from 'sanitize-html'; // Sanitización de datos

const router = Router(); // Inicializa el router

// Validaciones para actualizar usuario
const updateUserValidations = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email').optional().isEmail().withMessage('Debe ser un email válido'),
  body('password').optional().isString().isLength({ min: 6, max: 100 }).withMessage('La contraseña debe tener entre 6 y 100 caracteres'),
];

// PATCH /:id - Actualiza parcialmente un usuario por ID (solo admin)
router.patch('/:id', userLimiter, authenticate, authorizeRole('admin'), updateUserValidations, async (req: Request, res: Response) => {
  try {
    // Valida los datos recibidos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Obtiene el ID y los datos a actualizar
    const id = req.params.id;
    const updates = { ...req.body };
    if (updates.name) updates.name = sanitizeHtml(updates.name);
    if (updates.email) updates.email = sanitizeHtml(updates.email);
    // Actualiza el usuario en la base de datos
    const user = await updateUser(id, updates);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Devuelve el usuario actualizado sin el hash de contraseña
    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ message: 'Perfil actualizado', user: userWithoutPassword });
  } catch (error) {
  // Error patching user (no mostrar en consola en producción)
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});
// GET /:id - Obtiene un usuario por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Obtiene el ID del usuario
    const id = req.params.id;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Devuelve el usuario encontrado
    res.json(user);
  } catch (error) {
  // [GET /users/:id] Error (no mostrar en consola en producción)
    res.status(500).json({ error: 'Error al obtener usuario', details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error) });
  }
});

// PUT /:id - Actualiza completamente un usuario por ID (solo admin)
router.put('/:id', userLimiter, authenticate, authorizeRole('admin'), updateUserValidations, async (req: Request, res: Response) => {
  try {
    // Valida los datos recibidos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    const { current, newPass, ...updates } = req.body;
    if (updates.name) updates.name = sanitizeHtml(updates.name);
    if (updates.email) updates.email = sanitizeHtml(updates.email);
    // Si se envía current y newPass, realiza cambio de contraseña
    if (current && newPass) {
      const result = await changeUserPassword(id, current, newPass);
      if (result === 'notfound') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      if (result === 'invalid') {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }
      return res.json({ message: 'Contraseña cambiada correctamente' });
    }
    // Si no, actualiza el perfil normalmente
    const user = await updateUser(id, updates);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Devuelve el usuario actualizado sin el hash de contraseña
    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ message: 'Perfil actualizado', user: userWithoutPassword });
  } catch (error) {
  // Error updating user (no mostrar en consola en producción)
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// DELETE /:id - Elimina un usuario por ID
router.delete('/:id', userLimiter, async (req: Request, res: Response) => {
  try {
    // Obtiene el ID del usuario
    const id = req.params.id;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Elimina el usuario de la base de datos
    await deleteUserDb(id);
    res.status(204).send();
  } catch (error) {
  // Error deleting user (no mostrar en consola en producción)
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;