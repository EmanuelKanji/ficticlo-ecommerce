
'use client'; // Este componente se renderiza en el cliente (Client Component)


import { useEffect } from 'react'; // Hook para efectos secundarios
import Image from 'next/image';    // Componente de imagen optimizada
import Link from 'next/link';      // Navegación interna
import { useCart } from '@/context/CartContext'; // Contexto global del carrito
import styles from './CartModal.module.css';     // Estilos del modal


export default function CartModal(): JSX.Element | null {
  // Extraemos el estado y acciones del contexto del carrito
  const { items, setQty, remove, clear, subtotal, isCartOpen, closeCart } = useCart();

  // Efecto para bloquear el scroll y permitir cerrar con Escape cuando el modal está abierto
  useEffect(() => {
    if (!isCartOpen) return;

    // Handler para cerrar el modal con la tecla Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);

    // Guardamos el estado previo del overflow y lo bloqueamos
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup: restauramos el overflow y removemos el handler
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow || 'unset';
    };
  }, [isCartOpen, closeCart]);

  // Si el carrito no está abierto, no renderizamos nada
  if (!isCartOpen) return null;

  // Renderizado del modal del carrito
  return (
    <>
      {/* Capa oscura, cierra el modal al hacer click */}
      <div className={styles.overlay} onClick={closeCart} />

      {/* Panel lateral del carrito */}
      <aside
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Cabecera con título y botón cerrar */}
        <header className={styles.header}>
          <h2 id="cart-title" className={styles.title}>Tu carrito</h2>
          <button
            className={styles.iconButton}
            onClick={closeCart}
            aria-label="Cerrar carrito"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </header>

        {/* Contenido del carrito */}
        <div className={styles.content}>
          {/* Si el carrito está vacío, mostramos mensaje y enlace */}
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon} aria-hidden="true">🛒</div>
              <p className={styles.emptyText}>Tu carrito está vacío</p>
              <Link href="/products" className={styles.linkGhost} onClick={closeCart}>
                Ver productos
              </Link>
            </div>
          ) : (
            // Si hay productos, los listamos
            <>
              <div className={styles.items}>
                {items.map((it) => (
                  <article key={it.id} className={styles.item}>
                    {/* Imagen del producto */}
                    <div className={styles.itemImage}>
                      <Image
                        src={it.image}
                        alt={it.name}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, 150px"
                      />
                    </div>

                    {/* Información del producto */}
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemName}>{it.name}</h3>
                      <p className={styles.itemPrice}>${it.price.toLocaleString('es-CL')}</p>

                      {/* Selector de cantidad */}
                      <label className={styles.quantity}>
                        <span className={styles.quantityLabel}>Cantidad</span>
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) => setQty(it.id, Math.max(1, Number(e.target.value)))}
                          className={styles.quantityInput}
                          inputMode="numeric"
                        />
                      </label>
                    </div>

                    {/* Acciones por item: total y eliminar */}
                    <div className={styles.itemActions}>
                      <span className={styles.itemTotal}>
                        ${(it.qty * it.price).toLocaleString('es-CL')}
                      </span>
                      <button
                        className={styles.linkDanger}
                        onClick={() => remove(it.id)}
                        aria-label={`Eliminar ${it.name}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Resumen y acciones del carrito */}
              <footer className={styles.summary}>
                <div className={styles.row}>
                  <span>Subtotal</span>
                  <strong>${subtotal.toLocaleString('es-CL')}</strong>
                </div>

                <div className={styles.actions}>
                  <Link href="/checkout" className={styles.btnPrimary} onClick={closeCart}>
                    Ir a pagar
                  </Link>
                  <button className={styles.btnGhost} onClick={clear}>
                    Vaciar
                  </button>
                </div>
              </footer>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
