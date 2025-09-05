'use client'; // Indica que este componente se renderiza en el cliente

import Image from 'next/image'; // Componente de imagen optimizada de Next.js
import Link from 'next/link'; // Componente de navegación de Next.js
import { useCart } from '@/context/CartContext'; // Contexto del carrito de compras
import type { Product } from '../api/src/types/product'; // Tipo de producto
import styles from './ProductGrid.module.css'; // Estilos CSS modularizados

// Props: recibe un array de productos para mostrar
type Props = { items: Product[] };

export default function ProductGrid({ items }: Props): JSX.Element {
  // Obtiene la función para agregar productos al carrito
  const { add } = useCart();

  return (
    // Grid principal de productos
    <div className={styles.grid}>
      {items.map((p) => (
        // Tarjeta de producto
        <div
          key={p.id}
          className={styles.card}
          aria-label={`Producto ${p.name}`}
        >
          {/* Imagen del producto */}
          <div className={styles.imgWrap}>
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 220px"
              className={styles.image}
              priority={false}
            />
          </div>

          {/* Contenido de la tarjeta */}
          <div className={styles.body}>
            {/* Nombre del producto con link a detalles */}
            <h3 className={styles.title}>
              <Link href={`/products/${p.slug}`} aria-label={`Ver más detalles de ${p.name}`}>{p.name}</Link>
            </h3>
            {/* Precio formateado para CLP */}
            <p className={styles.price}>${p.price.toLocaleString('es-CL')}</p>

            {/* Acciones: ver detalles y agregar al carrito */}
            <div className={styles.actions}>
              {/* Link a la página de detalles del producto */}
              <Link
                href={`/products/${p.slug}`}
                className={styles.detailsLink}
                aria-label={`Ver más detalles de ${p.name}`}
              >
                Más detalles
              </Link>

              {/* Botón para agregar el producto al carrito */}
              <button
                className={styles.addButton}
                aria-label={`Agregar ${p.name} al carrito`}
                onClick={() =>
                  add(
                    { id: p.id, name: p.name, slug: p.slug, price: p.price, image: p.image },
                    1 // cantidad
                  )
                }
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}