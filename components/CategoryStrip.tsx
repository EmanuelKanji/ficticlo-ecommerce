
'use client'; // Este componente se renderiza en el cliente


import Link from 'next/link'; // Navegación interna
import styles from './CategoryStrip.module.css'; // Estilos del strip de categorías


/* =============================================================================
   ICONOS SVG para cada categoría
   ============================================================================ */

// Icono para polera
function TshirtIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path fill="currentColor" d="M16 3l3 2l3 1l-3 5v9H5V11L2 6l3-1l3-2l3 3l3-3z"/>
    </svg>
  );
}

// Icono para jeans/pantalón
function JeansIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path fill="currentColor" d="M7 2h10v4H7zM7 6h10l-1 16H8zM9 9h2v2H9zm4 0h2v2h-2z"/>
    </svg>
  );
}

// Icono para zapatilla
function SneakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path fill="currentColor" d="M3 15h10l6 3h2v2H3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2m0 2v1h16l-4-2zM8 6l3 3l3 1v3H9a4 4 0 0 1-4-4V6z"/>
    </svg>
  );
}

// Icono para poleron
function HoodieIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path fill="currentColor" d="M12 2a6 6 0 0 0-6 6v2l-2 2v8h4v-6h8v6h4v-8l-2-2V8a6 6 0 0 0-6-6m0 2a4 4 0 0 1 4 4v1H8V8a4 4 0 0 1 4-4"/>
    </svg>
  );
}

// Icono alternativo para pantalón
function PantalonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path fill="currentColor" d="M19 4H5v16h14V4zm-2 14H7V6h10v12zm-8-8h2v2H9v-2zm6 0h-2v2h2v-2zm-6 4h2v2H9v-2zm6 0h-2v2h2v-2z"/>
    </svg>
  );
}


import React, { useEffect, useState } from 'react'; // Hooks para estado y efectos


// Tipado de la categoría
type Category = {
  id: string;
  name: string;
  slug?: string;
};


// Mapeo de slug/nombre a icono
const iconMap: Record<string, React.FC> = {
  polera: TshirtIcon,
  poleron: HoodieIcon,
  zapatilla: SneakerIcon,
  pantalon: PantalonIcon,
};


// Componente principal que muestra la tira de categorías
export default function CategoryStrip(): JSX.Element {
  // Estado local para las categorías
  const [categories, setCategories] = useState<Category[]>([]);

  // Efecto para cargar las categorías desde el backend al montar el componente
  useEffect(() => {
    fetch('http://localhost:4000/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  // Renderizado de la tira de categorías
  return (
    <nav className={styles.strip} aria-label="Categorías destacadas">
      {/* Iteramos sobre las categorías y renderizamos cada chip con su icono */}
      {categories.map(cat => {
        // Seleccionamos el icono según el slug o nombre
        const Icon = iconMap[cat.slug || cat.name.toLowerCase()] || TshirtIcon;
        return (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug || cat.name.toLowerCase()}`}
            className={styles.chip}
          >
            <Icon />
            <span>{cat.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}