// Componente para gestionar productos en el panel de administración
'use client';

import React, { useState, useEffect } from 'react';
import styles from './ProductsPanel.module.css';

// Definición del tipo Product
interface Product {
  id: string;
  name: string;
  // Puedes agregar más campos según tu modelo
}

export default function ProductsPanel() {
  // Estado para la lista de productos, tipado correctamente
  const [products, setProducts] = useState<Product[]>([]);

  // Hook para cargar los productos al montar el componente
  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []));
  }, []);

  // Renderiza el panel de productos
  return (
    <div className={styles.panel}>
      {/* Título del panel */}
      <div className={styles.title}>Productos</div>
      {/* Lista de productos */}
      <ul className={styles.list}>
        {Array.isArray(products) && products.map(product => (
          <li key={product.id} className={styles.listItem}>
            <span className={styles.productName}>{product.name}</span>
            {/* Aquí podrían ir botones para editar/eliminar */}
          </li>
        ))}
      </ul>
    </div>
  );
}
