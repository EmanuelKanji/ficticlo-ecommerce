
// Archivo de la página de ofertas
// Este archivo define la página principal de ofertas y utiliza componentes reutilizables

'use client'; // Indicamos que este componente se renderiza del lado del cliente

// Importamos el encabezado principal de la aplicación
import Header from '@/components/Header';
// Importamos el componente que muestra las ofertas disponibles
import Offers from '@/components/Offers';

// Componente principal de la página de ofertas
export default function OffersPage(): JSX.Element {
  return (
    <>
      {/* Encabezado de la página */}
      <Header />
      {/* Listado de ofertas */}
      <Offers />
    </>
  );
}
