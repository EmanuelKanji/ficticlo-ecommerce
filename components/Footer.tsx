
/* =============================================================================
   Componente Footer
   Pie de página simple para toda la aplicación
============================================================================ */
export default function Footer() {
  // Renderiza el pie de página con estilos en línea y año dinámico
  return (
    <footer
      style={{
        marginTop: 32, // Separación superior
        padding: '16px 20px', // Espaciado interno
        borderTop: '1px solid #eee', // Línea superior
        color: '#666', // Color de texto
        fontSize: 14 // Tamaño de fuente
      }}
    >
      {/* Texto legal y créditos, año dinámico */}
      © {new Date().getFullYear()} FictiClo — Proyecto de portafolio. Desarrollado por Emanuel Aguilera. 2025
    </footer>
  );
}
