// Utilidad para subir imágenes a Azure Blob Storage
import { BlobServiceClient } from '@azure/storage-blob'; // Cliente de Azure Blob

// Configuración de conexión usando variables de entorno
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || ''; // Cadena de conexión
const CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER || 'products-image'; // Nombre del contenedor

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error('Azure Storage connection string not set');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING); // Inicializa el cliente
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME); // Obtiene el contenedor

// Sube una imagen al contenedor de Azure Blob y retorna la URL
export async function uploadImageToBlob(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType }
  });
  return blockBlobClient.url;
}
