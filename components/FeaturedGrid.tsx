
'use client'; // Habilita el modo cliente en Next.js para este componente



// Importaciones principales:
// - React y hooks para estado y efectos
// - ProductGrid: componente para mostrar productos
// - Product: tipo de producto
// - Link: navegación interna Next.js
// - styles: módulo CSS para estilos locales
import React, { useEffect, useState } from 'react';
import ProductGrid from '@/components/ProductGrid';
import type { Product } from '@/api/src/types/product';
import Link from 'next/link';
import styles from './FeaturedGrid.module.css';

/* =============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================ */

/* =============================================================================
   COMPONENTE PRINCIPAL: FeaturedGrid
   Muestra una sección de productos destacados con diseño responsivo y botón "Ver más"
============================================================================ */
export default function FeaturedGrid(): JSX.Element {
  // Estado local para almacenar los productos destacados
  const [featured, setFeatured] = useState<Product[]>([]);

  /* --------------------------------------------------------------------------
     Efecto para cargar productos destacados al montar el componente
     - Realiza una petición fetch a la API local
     - Actualiza el estado con los productos recibidos
  -------------------------------------------------------------------------- */
  useEffect(() => {
    fetch('http://localhost:4000/products/featured')
      .then(res => res.json())
      .then(data => setFeatured(Array.isArray(data) ? data : []));
  }, []);

  // Limita la visualización a los primeros 8 productos
  const limited = featured.slice(0, 8);

  /* --------------------------------------------------------------------------
     Renderizado principal:
     - Sección con título "Destacados"
     - Grid de productos destacados
     - Botón "Ver más" si hay más de 8 productos
  -------------------------------------------------------------------------- */
  return (
    <section aria-labelledby="destacados" className={styles.section}>
      <div className={styles.inner}>
        {/* Título de la sección */}
        <h2 id="destacados" className={styles.title}>
          Destacados
        </h2>
        {/* Grid de productos destacados */}
        <ProductGrid items={limited} />
        {/* Botón "Ver más" solo si hay más de 8 productos */}
        {featured.length > 8 && (
          <Link href="/products" className={styles.btnMore}>
            Ver más
          </Link>
        )}
      </div>
    </section>
  );
}