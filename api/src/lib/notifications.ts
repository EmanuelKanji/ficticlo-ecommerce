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

// Crea una notificación de compra en la base de datos
export async function createPurchaseNotification(order: any) {
  const container = client.database(databaseId).container(containerId); // Obtiene el contenedor de notificaciones
  const notification = {
    id: order.id, // ID de la notificación (igual al de la orden)
    type: 'purchase', // Tipo de notificación
    message: `Compra realizada por ${order.customerEmail || 'usuario desconocido'}`, // Mensaje descriptivo
    date: new Date().toISOString(), // Fecha de la notificación
  };
  await container.items.create(notification); // Guarda la notificación en la base de datos
}
