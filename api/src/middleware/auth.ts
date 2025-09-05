// Importa los tipos necesarios de Express y la librería JWT
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Clave secreta para firmar y verificar los tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware para autenticar usuarios usando JWT
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization; // Obtiene el header de autorización
  if (!authHeader) return res.status(401).json({ error: 'No token provided' }); // Si no hay token, rechaza

  // Validación: el header debe comenzar con 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Invalid authorization scheme' });
  }

  // Extrae el token del header
  const token = authHeader.split(' ')[1];
  try {
    // Verifica y decodifica el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validación: el token debe tener los campos esperados
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded) || !('role' in decoded)) {
      return res.status(401).json({ error: 'Token missing required fields' });
    }

    // Agrega el usuario decodificado al request
    (req as any).user = decoded;
    next(); // Continúa con la siguiente función
  } catch (err: any) {
    // Validación: si el token está expirado, responde con error específico
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    // Otros errores de token
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware para autorizar por rol
export function authorizeRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; // Obtiene el usuario del request
    if (!user || user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' }); // Si no tiene el rol, rechaza
    }
    next(); // Continúa si el rol es correcto
  };
}
