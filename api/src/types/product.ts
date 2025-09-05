// types/product.ts
// Tipo compartido para que todo hable el mismo idioma: data, grids, páginas.
export interface Product {
  id: string;                      // Identificador único
  slug: string;                    // Slug para URL amigable
  name: string;                    // Nombre del producto
  price: number;                   // Precio en CLP
  image: string;                   // URL de imagen
  category: string; // Categoría
  color?: string;                  // Color principal
  description?: string;            // Descripción breve
  sizes?: string[];                // Tallas disponibles (ej: ['S','M','L','XL'])
  stock?: number;                  // Cantidad en inventario
  featured?: boolean;              // ¿Es destacado? (para FeaturedGrid)
  tags?: string[];                 // Etiquetas opcionales ("nuevo", "oferta")
}
