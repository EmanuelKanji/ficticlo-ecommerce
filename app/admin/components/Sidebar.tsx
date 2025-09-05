// Componente Sidebar para navegación lateral en el panel de administración
'use client';

import React from 'react';
import { FaClipboardList, FaTags, FaGift, FaBoxOpen } from 'react-icons/fa';
import styles from './Sidebar.module.css';

// Elementos de navegación con etiqueta, clave e ícono
const navItems = [
  { label: 'Órdenes', key: 'orders', icon: <FaClipboardList /> },
  { label: 'Categorías', key: 'categories', icon: <FaTags /> },
  { label: 'Ofertas', key: 'offers', icon: <FaGift /> },
  { label: 'Productos', key: 'products', icon: <FaBoxOpen /> },
];

// Sidebar recibe el panel activo, función para seleccionar panel, estado abierto y función para cerrar
export default function Sidebar({ activePanel, onSelectPanel, open = false, onClose }: {
  activePanel: string | null,
  onSelectPanel: (key: string) => void,
  open?: boolean,
  onClose?: () => void
}) {
  return (
    <>
      {/* Overlay para móvil */}
      <div 
        style={{ position: 'fixed', inset: 0, background: open ? 'rgba(0,0,0,0.2)' : 'transparent', zIndex: 10, display: open ? 'block' : 'none' }}
        onClick={onClose}
      />
      <aside className={open ? `${styles.sidebar} ${styles.open}` : styles.sidebar}>
        <nav className={styles.menu}>
          {/* Mapeo de elementos de navegación a botones en el menú */}
          {navItems.map(item => (
            <button
              key={item.key}
              className={
                activePanel === item.key
                  ? `${styles.menuButton} ${styles.menuButtonActive}`
                  : styles.menuButton
              }
              onClick={() => {
                onSelectPanel(item.key);
                onClose && onClose(); // Cierra el sidebar en móvil
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
