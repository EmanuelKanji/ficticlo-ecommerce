// Layout principal del panel de administración
"use client";

import React, { useState } from 'react';
import { useAuthRole } from '@/context/AuthRoleContext'; // Hook para obtener el usuario y rol
import { AuthRoleProvider } from '@/context/AuthRoleContext';
// ...existing code...
import Sidebar from './components/Sidebar'; // Componente de menú lateral
import Header from './components/Header'; // Componente de barra superior

import OrdersPanel from './components/OrdersPanel'; // Panel de órdenes
import CategoriesPanel from './components/CategoriesPanel'; // Panel de categorías
import OffersPanel from './components/OffersPanel'; // Panel de ofertas
import ProductsPanel from './components/ProductsPanel'; // Panel de productos
import AdminPage from './page'; // Página principal del admin

import styles from './components/AdminLayout.module.css'; // Estilos del layout

// Paneles disponibles en el admin, cada uno con su clave, etiqueta y componente
const PANELS = [
  { key: 'home', label: 'Inicio', component: <AdminPage /> },
  { key: 'orders', label: 'Órdenes', component: <OrdersPanel /> },
  { key: 'categories', label: 'Categorías', component: <CategoriesPanel /> },
  { key: 'offers', label: 'Ofertas', component: <OffersPanel /> },
  { key: 'products', label: 'Productos', component: <ProductsPanel /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Obtiene el usuario y estado de autenticación
  const { user, isAuthenticated } = useAuthRole();
  // Estado para el panel activo
  const [activePanel, setActivePanel] = useState<string | null>('home');
  // Estado para mostrar/ocultar el sidebar en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Función para renderizar el panel seleccionado
  const renderPanel = () => {
    if (activePanel && activePanel !== 'home') {
      const panel = PANELS.find((p) => p.key === activePanel);
      return panel ? panel.component : null;
    }
    return null;
  };

  // Efecto para escuchar el evento de toggle-sidebar (móvil)
  React.useEffect(() => {
    const handler = () => setSidebarOpen((open) => !open);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  // Loader mientras se verifica el rol y autenticación
  if (!isAuthenticated || user?.role !== 'admin') {
    if (!isAuthenticated || user == null) {
      return <div style={{ padding: 40, textAlign: 'center' }}>Cargando...</div>;
    }
    // Si es cliente, redirige fuera del admin
    if (user.role !== 'admin') {
      if (typeof window !== 'undefined') window.location.href = '/';
      return null;
    }
  }

  // Renderiza el layout principal del admin
  return (
  <div className={styles.container}>
        {/* Sidebar de navegación */}
        <Sidebar
          activePanel={activePanel}
          onSelectPanel={(key) => {
            setActivePanel(key);
            setSidebarOpen(false); // Cierra el sidebar al seleccionar
          }}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className={styles.mainArea}>
          {/* Header superior */}
          <header className={styles.header}>
            <Header />
          </header>

          {/* Contenido principal, muestra el panel activo o la página de inicio */}
          <main className={styles.content}>
            {(!activePanel || activePanel === 'home') ? <AdminPage /> : renderPanel()}
            {/* children se pueden renderizar si necesitas contenido adicional */}
          </main>

          {/* Footer del admin */}
          <footer className={styles.footer}>
            <div className={styles.footerInner}>© FictiClo</div>
          </footer>
        </div>
      </div>
  // ...existing code...
  );
}
