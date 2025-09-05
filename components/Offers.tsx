'use client'; // Indica que este componente se renderiza en el cliente

import Image from 'next/image'; // Componente de imagen optimizada de Next.js
import React, { useEffect, useState } from 'react'; // React y hooks
import { useAuthRole } from '@/context/AuthRoleContext'; // Contexto de autenticación y rol
import { useCart } from '@/context/CartContext'; // Contexto del carrito de compras
import styles from './Offers.module.css'; // Estilos CSS modularizados

// Tipo para la oferta, incluye datos del producto si están disponibles
type Offer = {
  id: string;
  title: string;
  discount: number;
  productIds: string[];
  // Opcional: si el backend ya incluye producto
  product?: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    category: string;
  };
};
export default function Offers(): JSX.Element {
  // Obtiene funciones del contexto del carrito
  const { add, openCart } = useCart();
  // Estado para almacenar las ofertas
  const [offers, setOffers] = useState<Offer[]>([]);
  // Obtiene estado de autenticación y usuario
  const { isAuthenticated, user } = useAuthRole();

  // Al montar el componente, obtiene las ofertas desde el backend
  useEffect(() => {
    fetch('http://localhost:4000/offers')
      .then(res => res.json())
      .then(data => setOffers(Array.isArray(data) ? data : []));
  }, []);

  // Maneja la acción de agregar un producto al carrito
  const handleAddToCart = (p: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    category: string;
  }) => {
    add(
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.image,
      },
      1 // cantidad
    );
    openCart(); // Abre el modal del carrito
  };

  // Solo usuarios registrados con rol "user" pueden ver las ofertas
  if (!isAuthenticated || user?.role !== 'user') {
    return (
      <section className={styles.wrap}>
        <header className={styles.header}>
          <h1 className={styles.title}>Ofertas exclusivas</h1>
          <p className={styles.subtitle}>
            Regístrate o inicia sesión para ver las mejores promociones y descuentos solo para clientes.
          </p>
        </header>
      </section>
    );
  }

  // Renderiza las ofertas para usuarios registrados
  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ofertas para clientes</h1>
        <p className={styles.subtitle}>
          Estas promociones son exclusivas para usuarios registrados.
        </p>
      </header>

      <div className={styles.grid}>
        {/* Muestra cada oferta en una tarjeta */}
        {offers.map((offer) => (
          <article key={offer.id} className={styles.card}>
            <div className={styles.thumb}>
              {/* Imagen del producto si está disponible */}
              {offer.product?.image ? (
                <Image
                  src={offer.product.image}
                  alt={offer.product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 320px"
                  className={styles.img}
                />
              ) : (
                // Placeholder si no hay imagen
                <div className={styles.img} style={{ background: '#eee', width: '100%', height: '100%' }} />
              )}
              {/* Badge de descuento */}
              <span className={styles.badge}>{offer.discount}% OFF</span>
            </div>

            <div className={styles.info}>
              {/* Nombre del producto o título de la oferta */}
              <h3 className={styles.name}>{offer.product?.name || offer.title}</h3>
              <div className={styles.prices}>
                {/* Precio con formato CLP si está disponible */}
                <span className={styles.sale}>
                  {offer.product?.price
                    ? `$${offer.product.price.toLocaleString('es-CL')}`
                    : 'Precio no disponible'}
                </span>
              </div>
              <div className={styles.actions}>
                {/* Botones de acción si el producto está disponible */}
                {offer.product ? (
                  <>
                    <button
                      className={styles.btnPrimary}
                      onClick={() => offer.product && handleAddToCart(offer.product)}
                    >
                      Agregar al carrito
                    </button>
                    <a className={styles.btnGhost} href={`/products/${offer.product.slug}`}>
                      Más detalles
                    </a>
                  </>
                ) : (
                  // Mensaje si el producto no está disponible
                  <span style={{ color: '#888', fontSize: 12 }}>Producto no disponible</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
