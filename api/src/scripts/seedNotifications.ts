// Importa el cliente de Cosmos DB y dotenv para variables de entorno
import { CosmosClient } from '@azure/cosmos'; // Cliente de Cosmos DB
import dotenv from 'dotenv'; // Manejo de variables de entorno

dotenv.config(); // Carga las variables de entorno

// Configuración de conexión a Cosmos DB usando variables de entorno
const endpoint = process.env.COSMOS_DB_URL || ''; // URL de Cosmos DB
const key = process.env.COSMOS_DB_KEY || ''; // Clave de Cosmos DB
const databaseId = process.env.COSMOS_DB_DATABASE || 'ficticlo'; // ID de la base de datos
const containerId = 'notifications'; // Nombre del contenedor de notificaciones

const client = new CosmosClient({ endpoint, key }); // Inicializa el cliente de Cosmos DB

// Función para insertar notificaciones de ejemplo en la base de datos
export async function seedNotifications() {
  const container = client.database(databaseId).container(containerId); // Obtiene el contenedor de notificaciones
  const notifications = [
    {
      id: '1',
      type: 'stock',
      message: 'Stock bajo en producto X',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'purchase',
      message: 'Compra realizada por usuario Juan',
      date: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'stock',
      message: 'Stock bajo en producto Y',
      date: new Date().toISOString(),
    },
  ];
  // Inserta cada notificación en la base de datos
  for (const notification of notifications) {
    await container.items.create(notification);
  }
  // Notificaciones de ejemplo insertadas (no mostrar en consola en producción)
}

// Ejecuta la función solo si el script es llamado directamente
if (require.main === module) {
  seedNotifications();
}
