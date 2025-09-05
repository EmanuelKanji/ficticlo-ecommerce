
// app/page.tsx
// ============================================================================
// Página principal (Home) como Server Component usando App Router.
// Renderiza los componentes principales de la portada y no contiene lógica ni hooks.
// El <main className="container"> ya lo aporta el RootLayout, por eso aquí solo se devuelve el fragmento.
// ============================================================================

// Importamos el encabezado principal
import Header from '@/components/Header';
// Importamos el hero principal con llamada a la acción
import HomeHero from '@/components/HomeHero';
// Importamos los chips de categorías
import CategoryStrip from '@/components/CategoryStrip';
// Importamos la vitrina de productos destacados
import FeaturedGrid from '@/components/FeaturedGrid';
// Importamos el footer (solo para la página global)
import Footer from '@/components/Footer';

// Nota: El Footer ya viene desde el layout, pero aquí se incluye para la home.

// Componente principal de la página Home
export default function Home(): JSX.Element {
  return (
    <>
      {/* Encabezado principal */}
      <Header />
      {/* Hero principal con llamada a la acción */}
      <HomeHero />

      {/* Chips de categorías para navegación rápida */}
      <CategoryStrip />

      {/* Vitrina de productos destacados (usa ProductGrid internamente) */}
      <FeaturedGrid />

      {/* Footer solo en la página global */}
      <Footer />
    </>
  );
}
