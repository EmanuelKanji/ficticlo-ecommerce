import { Router } from 'express';
import { CosmosClient } from '@azure/cosmos';
import { authenticate, authorizeRole } from '../middleware/auth'; 

const router = Router();

// Configuración Cosmos DB
const endpoint = process.env.COSMOS_DB_URL || '';
const key = process.env.COSMOS_DB_KEY || '';
const databaseId = 'ficticlo';
const containerId = 'notifications';

const client = new CosmosClient({ endpoint, key });

// GET /notifications - Obtiene notificaciones de stock y compras
// Endpoint con paginación
router.get('/', authenticate, authorizeRole('admin'), async (req, res) => {
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
    const container = client.database(databaseId).container(containerId);
    const notifications = await container.items.query(query).fetchAll();

    // Total de notificaciones (para frontend)
    const totalQuery = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
    const total = totalQuery.resources[0] || 0;

    res.json({
      notifications: notifications.resources,
      page,
      limit,
      total
    });
  } catch (error) {
  // Error obteniendo notificaciones (no mostrar en consola en producción)
    res.status(500).json({ error: 'Error obteniendo notificaciones' });
  }
});

export default router;
