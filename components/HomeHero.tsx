'use client'; // Indica que este componente se renderiza en el cliente

import { useEffect, useState } from 'react'; // Hooks de React
import Link from 'next/link'; // Componente de navegación de Next.js
import styles from './HomeHero.module.css'; // Estilos CSS modularizados

// Hook personalizado para detectar si la pantalla es móvil según el breakpoint
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update(); // Actualiza el estado al montar
    mq.addEventListener('change', update); // Escucha cambios de tamaño
    return () => mq.removeEventListener('change', update); // Limpia el listener
  }, [breakpoint]);
  return isMobile;
}

export default function HomeHero(): JSX.Element {
  // Detecta si el usuario está en móvil
  const isMobile = useIsMobile();

  return (
    // Sección principal del hero
    <section className={styles.hero} aria-label="Hero principal">
      {/* Contenedor principal, cambia estilos según dispositivo */}
      <div className={isMobile ? styles.innerMobile : styles.innerDesktop}>
        {/* Columna de texto */}
        <div className={styles.colText}>
          {/* Texto superior tipo "eyebrow" */}
          <p className={styles.eyebrow}>Nueva temporada</p>

          {/* Título principal con acento */}
          <h1 className={styles.title}>
            Ropa ficticia, <span className={styles.titleAccent}>estilo real</span>.
          </h1>

          {/* Subtítulo descriptivo del proyecto */}
          <p className={styles.subtitle}>
            Minimalismo, buen calce y materiales cómodos. Diseñado para el día a día.
            Proyecto con <strong>Next.js + TypeScript</strong>, listo para backend en Azure.
          </p>

          {/* Botones de llamada a la acción (CTA) */}
          <div className={`${styles.ctas} ${isMobile ? styles.ctasCenter : styles.ctasStart}`}>
            <Link href="/products" className={styles.btnPrimary}>Ver catálogo</Link>
            <Link href="/offers" className={styles.btnGhost}>Ofertas</Link>
          </div>

          {/* Chips de ventajas del servicio */}
          <div 
            className={`${styles.chips} ${isMobile ? styles.chipsCenter : styles.chipsStart}`}
            aria-label="Ventajas"
          >
            <span className={styles.chip}>Despacho rápido</span>
            <span className={styles.chip}>Pagos seguros</span>
            <span className={styles.chip}>Devoluciones fáciles</span>
          </div>
        </div>

        {/* Columna de arte/imagen */}
        <div className={`${styles.colArt} ${isMobile ? styles.colArtMobile : styles.colArtDesktop}`} aria-hidden>
          {/* Tarjeta flotante con información de la colección */}
          <div className={styles.floatCard}>
            <strong className={styles.floatCardTitle}>Colección SS/25</strong>
            <span className={styles.floatCardSubtitle}>Nuevos básicos premium</span>
            <span className={styles.floatCardPrice}>
              {/* Precio formateado para CLP */}
              Desde ${new Intl.NumberFormat('es-CL').format(9990)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}