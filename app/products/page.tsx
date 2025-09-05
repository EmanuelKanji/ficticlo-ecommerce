// app/products/page.tsx
// ===================================================================================
// Página de CATÁLOGO (App Router / Server Component por defecto)
// - Lee los parámetros de búsqueda desde la URL (?q=... & category=...)
// - Filtra el mock en memoria (products) y renderiza la grilla (ProductGrid)
// - Preparado para que luego reemplacemos el mock por Azure Functions + Cosmos DB
// ===================================================================================
import Header from '@/components/Header';
import Link from 'next/link';                 // Navegación interna optimizada (prefetch)
import ProductGrid from '@/components/ProductGrid'; // Grilla cliente (botón "Agregar" usa useCart)
// import { products } from '@/data/products';   // Mock local de productos
import type { Product } from '@/api/src/types/product'; // Tipo compartido de producto

// -----------------------------------------------------------
// Helper: normaliza texto para búsqueda "robusta"
// - Pasa a minúsculas, recorta espacios y elimina tildes/diacríticos.
// - Permite que "polera" == "pólera" y mejora el matching.
// -----------------------------------------------------------
function normalize(s: string): string {
  return s
    .normalize('NFD')                // separa letras de diacríticos
    .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
    .toLowerCase()
    .trim();
}

// -----------------------------------------------------------
// Tipado explícito de los searchParams que entrega el App Router.
// - q: término de búsqueda libre
// - category: categoría exacta (polera | pantalon | zapatilla | poleron)
// -----------------------------------------------------------
interface ProductsPageProps {
  searchParams?: { q?: string; category?: string };
}

// ===========================================================
// Componente principal (Server Component)
// - No usa hooks → se renderiza en servidor (mejor SEO y performance).
// - Puede renderizar componentes cliente (ProductGrid) sin problemas.
// ===========================================================
export default async function ProductsPage({ searchParams }: ProductsPageProps): Promise<JSX.Element> {
  // 1) Fetch productos desde el backend
  const res = await fetch('http://localhost:4000/products', { next: { revalidate: 10 } });
  const products: Product[] = await res.json();

  // 2) Tomamos los parámetros y los normalizamos
  const q = normalize(searchParams?.q ?? '');
  const cat = normalize(searchParams?.category ?? '');

  // 3) Partimos del total y vamos filtrando
  let filtered: Product[] = products;

  // 3.a) Filtro por término libre (?q=)
  if (q) {
    filtered = filtered.filter(p => {
      const blob = normalize(`${p.name} ${p.slug} ${p.category} ${p.color ?? ''}`);
      return blob.includes(q);
    });
  }

  // 3.b) Filtro por categoría exacta (?category=)
  if (cat) {
    filtered = filtered.filter(p => normalize(p.category) === cat);
  }

  // 4) Construimos la lista única de categorías para los chips
  const categories = Array.from(new Set(products.map(p => p.category)));

  // 5) Render
  return (
    <>
      <Header />
      <h1 style={{ marginTop: 0 }}>Catálogo</h1>
      <p style={{ color: '#666', marginTop: -8 }}>
        {q
          ? `Resultados para “${searchParams?.q ?? ''}”`
          : cat
          ? `Categoría: ${searchParams?.category ?? ''}`
          : 'Explora todos nuestros productos'}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0 16px' }}>
        <Link
          className="btn-ghost"
          href="/products"
          aria-current={!cat ? 'page' : undefined}
        >
          Todas
        </Link>
        {categories.map(c => (
          <Link
            key={c}
            className="btn-ghost"
            href={`/products?category=${encodeURIComponent(c)}`}
            aria-current={cat === normalize(c) ? 'page' : undefined}
          >
            {c}
          </Link>
        ))}
      </div>
      <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
        {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
      </div>
      {filtered.length === 0 ? (
        <p>No encontramos resultados. Prueba con otra búsqueda o cambia la categoría.</p>
      ) : (
        <ProductGrid items={filtered} />
      )}
    </>
  );
}
