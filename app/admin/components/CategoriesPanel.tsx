// Componente de panel para gestionar categorías en el admin
'use client';

import React, { useState, useEffect } from 'react'; // Importa React y hooks
import styles from './CategoriesPanel.module.css'; // Importa los estilos del panel

// Tipo para las categorías
type Category = {
  id: string;
  name: string;
};

export default function CategoriesPanel() {
  // Estado para la lista de categorías
  const [categories, setCategories] = useState<Category[]>([]);
  // Estado para el input de nueva categoría
  const [newCategory, setNewCategory] = useState('');

  // Hook para cargar las categorías al montar el componente
  useEffect(() => {
    fetch('http://localhost:4000/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  // Función para agregar una nueva categoría
  const addCategory = () => {
    if (newCategory.trim().length === 0) return;
    fetch('http://localhost:4000/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory.trim() })
    })
      .then(res => res.json())
      .then(category => {
        setCategories(prev => [...prev, category]); // Actualiza el estado
        setNewCategory(''); // Limpia el input
      });
  };

  // Función para eliminar una categoría
  const removeCategory = (id: string) => {
    fetch(`http://localhost:4000/categories/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setCategories(categories.filter(cat => cat.id !== id)); // Elimina del estado
      });
  };

  // Renderiza el panel de categorías
  return (
    <div className={styles.panel}>
      {/* Título del panel */}
      <div className={styles.title}>Categorías</div>
      {/* Lista de categorías */}
      <ul className={styles.list}>
        {Array.isArray(categories) && categories.map(cat => (
          <li key={cat.id} className={styles.listItem}>
            <span className={styles.categoryName}>{cat.name}</span>
            {/* Botón para eliminar categoría */}
            <button className={styles.button} onClick={() => removeCategory(cat.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      {/* Formulario para agregar nueva categoría */}
      <form
        className={styles.form}
        onSubmit={e => {
          e.preventDefault();
          addCategory();
        }}
      >
        <input
          className={styles.input}
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Nueva categoría"
        />
        <button className={styles.button} type="submit">Agregar</button>
      </form>
    </div>
  );
}