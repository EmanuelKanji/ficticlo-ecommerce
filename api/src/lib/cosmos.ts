import dotenv from 'dotenv';
dotenv.config();
import { CosmosClient } from "@azure/cosmos"; // Cliente de Cosmos DB

// Configuración de conexión usando variables de entorno
const endpoint = process.env.COSMOS_DB_URL || ""; // URL de Cosmos DB
const key = process.env.COSMOS_DB_KEY || ""; // Clave de Cosmos DB
const databaseId = process.env.COSMOS_DB_DATABASE || "ficticlo"; // ID de la base de datos
const defaultContainer = process.env.COSMOS_DB_CONTAINER || "users";

const client = new CosmosClient({ endpoint, key }); // Inicializa el cliente

// Devuelve el contenedor solicitado de la base de datos
export function getContainer(containerId?: string) {
  return client.database(databaseId).container(containerId || defaultContainer);
}
