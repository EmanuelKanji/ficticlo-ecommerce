import { Router, Request, Response } from 'express';
import { getContainer } from '../lib/cosmos';
import { User } from '../types/user';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html'; // Librería para sanitizar datos
import rateLimit from 'express-rate-limit'; // Rate limiting para proteger login
// Limita a 5 intentos de login por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: { error: 'Demasiados intentos de login, intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
const container = getContainer('users');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
// Actualizar perfil de usuario

// Actualizar perfil de usuario (PUT /:id)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let { name, email, password } = req.body;
    const { resource: user } = await container.item(id, id).read<User>();
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Sanitiza los campos name y email
    if (name !== undefined) {
      name = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
      if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres' });
      }
      user.name = name;
    }
    if (email !== undefined) {
      email = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }
      user.email = email;
    }
    if (password && password.length > 0) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }
  await container.items.upsert(user);
  // Elimina passwordHash antes de enviar el usuario en la respuesta
  const { passwordHash, ...safeUser } = user;
  res.json({ message: 'Perfil actualizado', user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// Registro de usuario
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Sanitiza los campos email y name para evitar inyección de código
    const emailSanitized = sanitizeHtml(req.body.email || '', { allowedTags: [], allowedAttributes: {} });
    const nameSanitized = sanitizeHtml(req.body.name || '', { allowedTags: [], allowedAttributes: {} });
    const { password, role } = req.body;

    // Validación de formato de email y longitud de contraseña
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(emailSanitized)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Verifica si el email ya está registrado
    const query = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: emailSanitized }],
    };
    const { resources } = await container.items.query<User>(query).fetchAll();
    if (resources.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = { id: uuidv4(), email: emailSanitized, passwordHash, name: nameSanitized, role: role || 'user' };
    const { resource } = await container.items.create(user);
    // Elimina passwordHash antes de enviar el usuario en la respuesta
    if (resource) {
      const { passwordHash, ...safeUser } = resource;
      res.status(201).json(safeUser);
    } else {
      res.status(201).json(resource);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login de usuario
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    // Sanitiza el campo email para evitar inyección de código
    const emailSanitized = sanitizeHtml(req.body.email || '', { allowedTags: [], allowedAttributes: {} });
    const { password } = req.body;
    const query = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: emailSanitized }],
    };
    const { resources } = await container.items.query<User>(query).fetchAll();
    const user = resources[0];
    // Respuesta genérica para credenciales inválidas
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener usuario por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { resource } = await container.item(id, id).read<User>();
    if (!resource) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario', details: error });
  }
});

// Eliminar usuario
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await container.item(id, id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: error });
  }
});

export default router;
