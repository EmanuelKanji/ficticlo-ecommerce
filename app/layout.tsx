
// app/layout.tsx
// Layout raíz de la aplicación. Aquí se definen los providers globales y el contenedor principal.

import './globals.css'; // Importa los estilos globales
import type { Metadata } from 'next'; // Tipado para metadatos de Next.js
import CartModal from '@/components/CartModal'; // Modal global del carrito
import { CartProvider } from '@/context/CartContext'; // Contexto global del carrito
import { AuthRoleProvider } from '@/context/AuthRoleContext'; // Contexto global de autenticación y roles

// Metadatos globales para la aplicación (SEO y descripción)
export const metadata: Metadata = {
  title: 'Ficticlo — E-commerce Next.js',
  description: 'E-commerce rápido con Next.js + TypeScript, listo para Azure.',
};

// Componente layout raíz. Envuelve toda la app con los providers y el modal de carrito.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Provider de autenticación y roles */}
        <AuthRoleProvider>
          {/* Provider del carrito de compras */}
          <CartProvider>
            {/* Contenedor principal de la app */}
            <main className="container" style={{ paddingBlock: 24 }}>
              {children}
            </main>
            {/* Modal global del carrito */}
            <CartModal />
          </CartProvider>
        </AuthRoleProvider>
      </body>
    </html>
  );
}
