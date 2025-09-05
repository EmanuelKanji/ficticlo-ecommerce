import { body, validationResult } from 'express-validator';
const payValidations = [
  body('amount').isFloat({ min: 1 }).withMessage('El monto debe ser un número positivo'),
  body('buyOrder').isString().trim().isLength({ min: 1, max: 100 }).withMessage('buyOrder es requerido'),
  body('sessionId').isString().trim().isLength({ min: 1, max: 100 }).withMessage('sessionId es requerido'),
  body('returnUrl').isURL().withMessage('returnUrl debe ser una URL válida'),
];
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit'; // Rate limiting
// Limitar a 10 solicitudes por minuto por IP en el endpoint de pago
const payLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: 'Demasiadas solicitudes, intenta de nuevo en un minuto.'
});
import sanitizeHtml from 'sanitize-html'; // Sanitización de datos
import { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } from 'transbank-sdk';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configuración de Webpay Plus (modo integración)
const options = new Options(
  IntegrationCommerceCodes.WEBPAY_PLUS,
  IntegrationApiKeys.WEBPAY,
  Environment.Integration
);
const tx = new WebpayPlus.Transaction(options);

// Endpoint para iniciar pago Webpay
router.post('/pay', payLimiter, payValidations, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Sanitiza los campos
    const amount = req.body.amount;
    const buyOrder = sanitizeHtml(req.body.buyOrder || uuidv4());
    const sessionId = sanitizeHtml(req.body.sessionId || uuidv4());
    const returnUrl = sanitizeHtml(req.body.returnUrl);
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar pago Webpay', details: error });
  }
});

export default router;
