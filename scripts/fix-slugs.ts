// scripts/fix-slugs.ts
// Script para actualizar productos y asegurar que todos tengan un slug válido en la base de datos



// Carga variables de entorno desde .env
import * as dotenv from 'dotenv';
dotenv.config();

// Cliente de Azure Cosmos DB
import { CosmosClient } from '@azure/cosmos';
// Tipo de producto
import { Product } from '../api/src/types/product';


// Obtiene credenciales y configuración desde variables de entorno
const endpoint = process.env.COSMOS_DB_URL || '';
const key = process.env.COSMOS_DB_KEY || '';
const databaseId = process.env.COSMOS_DB_DATABASE || 'ficticlo';
const containerId = 'products';


// Inicializa el cliente y el contenedor de Cosmos DB
const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

/**
 * Genera un slug válido a partir del nombre del producto
 * Convierte a minúsculas, reemplaza espacios por guiones y elimina caracteres no permitidos
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}


/**
 * Función principal: recorre todos los productos y actualiza el slug si es necesario
 */
async function main() {
  // Obtiene todos los productos del contenedor
  const { resources: products } = await container.items.readAll<Product>().fetchAll();
  let updated = 0;

  for (const p of products) {
    // Si el producto no tiene slug o es 'undefined', lo genera y actualiza
    if (!p.slug || p.slug === 'undefined') {
      const slug = generateSlug(p.name || '');
      await container.item(p.id, p.id).replace({ ...p, slug });
      console.log(`Producto actualizado: ${p.name} → slug: ${slug}`);
      updated++;
    }
  }

  // Muestra resumen de la operación
  console.log(`Actualización completa. Productos modificados: ${updated}`);
}

// Ejecuta la función principal y maneja errores
main().catch(err => {
  console.error('Error al actualizar slugs:', err);
  process.exit(1);
});
