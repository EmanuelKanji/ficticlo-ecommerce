
// ===========================================================
// Detalle de producto (Server Component):
// Este archivo implementa la página de detalle de producto usando Next.js.
// Incluye SEO dinámico, generación de rutas estáticas y renderizado seguro.
// Los eventos de cliente (agregar al carrito, guardar) se implementarán luego
// en un Client Component o usando el CartContext.
// ===========================================================


// Importamos el componente de imagen optimizada de Next.js
import Image from 'next/image';
// Importamos la función para mostrar página 404 si no existe el producto
import { notFound } from 'next/navigation';
// Importamos el tipo Product para tipar los datos recibidos
import type { Product } from '../../../api/src/types/product';

// Importamos los estilos CSS para el detalle de producto
import styles from './ProductDetail.module.css';
// Importamos el encabezado principal
import Header from '@/components/Header';


// Tipado de las props que recibe la página (el slug del producto)
type Props = { params: { slug: string } };

// —— SEO dinámico por producto ——
// Esta función genera los metadatos para SEO y redes sociales según el producto
export async function generateMetadata({ params }: Props) {
  // Consultamos el producto por slug
  const resMeta = await fetch(`http://localhost:4000/products?slug=${params.slug}`, { next: { revalidate: 10 } });
  const productsMeta: Product[] = await resMeta.json();
  const productMeta = productsMeta[0];
  // Si no existe el producto, devolvemos metadatos genéricos
  if (!productMeta) return { title: 'Producto no encontrado • FictiClo' };

  // Retornamos los metadatos personalizados para el producto
  return {
    title: `${productMeta.name} • FictiClo`,
    description: productMeta.description ?? `${productMeta.name} — ${productMeta.category}`,
    openGraph: {
      title: `${productMeta.name} • FictiClo`,
      description: productMeta.description ?? `${productMeta.name} — ${productMeta.category}`,
      images: [{ url: productMeta.image }],
    },
  };
}

// —— Pre-generar rutas estáticas (SSG) ——
// Esta función genera los parámetros estáticos para cada producto (SSG)
export async function generateStaticParams() {
  // Consultamos todos los productos
  const resStatic = await fetch('http://localhost:4000/products', { next: { revalidate: 60 } });
  const productsStatic: Product[] = await resStatic.json();
  // Retornamos un array de objetos con el slug de cada producto
  return productsStatic.map(p => ({ slug: p.slug }));
}

// —— Página de detalle por slug ——
// Componente principal de la página de detalle de producto
export default async function ProductDetailPage({ params }: Props) {
  // Consultamos el producto por slug
  const res = await fetch(`http://localhost:4000/products?slug=${params.slug}`, { next: { revalidate: 10 } });
  const products: Product[] = await res.json();
  const p = products[0];
  // Si no existe el producto, mostramos la página 404
  if (!p) return notFound();

  // Manejo seguro de stock: el mock puede no tener 'stock'
  const inStock = typeof p.stock === 'number' ? p.stock : 0;
  const agotado = inStock <= 0;

  // Renderizado de la página de detalle
  return (
    <>
      {/* Encabezado principal */}
      <Header />
      <main className={styles.main}>
        {/* Imagen principal del producto */}
        <div className={styles.imageWrapper}>
          <Image
            src={p.image}
            alt={p.name}
            width={1200}
            height={1200}
            className={styles.productImage}
            priority
          />
        </div>

        <section>
          {/* Título del producto */}
          <h1 className={styles.title}>{p.name}</h1>

          {/* Precio del producto, formateado para CLP */}
          <div className={styles.price}>
            ${p.price.toLocaleString('es-CL')}
          </div>

          {/* Descripción del producto */}
          <p className={styles.description}>
            {p.description ?? 'Producto de gran calidad.'}
          </p>

          {/* Tallas disponibles, si existen */}
          {p.sizes?.length ? (
            <div className={styles.sizes}>
              {p.sizes.map((s: string, index: number) => (
                <span key={index} className={styles.size}>
                  {s}
                </span>
              ))}
            </div>
          ) : null}

          {/* Estado de stock, muestra si está agotado o disponible */}
          <div
            className={
              agotado
                ? `${styles.stock} ${styles.stockAgotado}`
                : `${styles.stock} ${styles.stockDisponible}`
            }
          >
            {agotado ? 'Sin stock' : `En stock: ${inStock}`}
          </div>

          {/* Botones de acción: agregar al carrito y guardar
              No tienen funcionalidad aquí porque es un Server Component.
              Se conectarán al CartContext/AddToCart en el cliente más adelante. */}
          <div className={styles.buttons}>
            <button
              className="btn-primary"
              disabled={agotado}
              style={{ opacity: agotado ? 0.6 : 1 }}
              title={agotado ? 'Sin stock' : 'Agregar al carrito'}
              type="button"
            >
              Agregar al carrito
            </button>
            <button className="btn-ghost" type="button">Guardar</button>
          </div>

          {/* Separador visual */}
          <hr className={styles.divider} />

          {/* Detalles adicionales del producto */}
          <dl className={styles.detailsList}>
            <dt className={styles.detailsTerm}>Categoría</dt>
            <dd>{p.category}</dd>
            <dt className={styles.detailsTerm}>Color</dt>
            <dd>{p.color ?? '—'}</dd>
            <dt className={styles.detailsTerm}>SKU</dt>
            <dd>{p.id}</dd>
          </dl>
        </section>
      </main>
    </>
  );
}