// Rutas para gestión de productos con bajo stock
import { Router, Request, Response } from 'express'; // Express
import { CosmosClient } from '@azure/cosmos'; // Cliente de Cosmos DB
import { authenticate, authorizeRole } from '../middleware/auth'; // Middleware de autenticación y roles

const router = Router(); // Inicializa el router

const endpoint = process.env.COSMOS_DB_URL || ''; // URL de Cosmos DB
const key = process.env.COSMOS_DB_KEY || ''; // Clave de Cosmos DB
const databaseId = process.env.COSMOS_DB_DATABASE || 'ficticlo'; // ID de la base de datos
const containerId = 'products'; // ID del contenedor

const client = new CosmosClient({ endpoint, key }); // Inicializa el cliente de Cosmos DB

// GET / - Obtener productos con bajo stock (menos de 10)
router.get('/', authenticate, authorizeRole('admin'), async (req: Request, res: Response) => {
  try {
    const container = client.database(databaseId).container(containerId); // Obtiene el contenedor de productos
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.stock < 10 ORDER BY c.stock ASC', // Consulta para obtener productos con stock bajo
    };
    const { resources: products } = await container.items.query(querySpec).fetchAll();
    res.json(products); // Devuelve los productos
  } catch (error) {
  // Error obteniendo productos con bajo stock (no mostrar en consola en producción)
    res.status(500).json({ error: 'Error obteniendo productos con bajo stock' }); // Respuesta de error
  }
});

export default router; // Exporta el router
