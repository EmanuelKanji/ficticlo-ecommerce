// Componente para gestionar ofertas en el panel de administración
'use client';

import React, { useState, useEffect } from 'react';
import styles from './OffersPanel.module.css';
import type { Product } from '@/api/src/types/product';

type Category = {
  id: string;
  name: string;
};

type Offer = {
  id: string;
  title: string;
  discount: number;
  productIds: string[];
};

export default function OffersPanel() {
  // Estado para la lista de ofertas
  const [offers, setOffers] = useState<Offer[]>([]);
  const [discount, setDiscount] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'offers' | 'products'>('offers');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hook para cargar las ofertas, productos y categorías al montar el componente
  useEffect(() => {
    fetch('http://localhost:4000/offers')
      .then(res => res.json())
      .then(setOffers);
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(setProducts);
    fetch('http://localhost:4000/categories')
      .then(res => res.json())
      .then(setCategories);
  }, []);

  // Función para agregar una nueva oferta
  const addOffer = () => {
    setError('');
    setSuccess('');
    if (!selectedProduct) {
      setError('Debes seleccionar un producto');
      return;
    }
    if (!discount || discount <= 0) {
      setError('El descuento debe ser mayor a 0');
      return;
    }
    fetch('http://localhost:4000/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${selectedProduct.name} (${discount}% OFF)`,
        discount: Number(discount),
        productIds: [selectedProduct.id]
      })
    })
      .then(res => res.json())
      .then(offer => {
        setOffers(prev => [...prev, offer]);
        setDiscount('');
        setSelectedProduct(null);
        setSearch('');
        setSuccess('Oferta agregada correctamente');
      })
      .catch(() => setError('Error al agregar la oferta'));
  };

  // Función para eliminar una oferta
  const removeOffer = (id: string) => {
    fetch(`http://localhost:4000/offers/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setOffers(offers.filter(offer => offer.id !== id));
        setSuccess('Oferta eliminada');
      })
      .catch(() => setError('Error al eliminar la oferta'));
  };

  // Renderiza el panel de ofertas
  return (
    <div className={styles.panel}>
      {/* Título del panel */}
      <div className={styles.title}>Ofertas</div>
      {/* Navegación entre pestañas */}
      <div className={styles.tabs}>
        <button
          className={activeTab === 'offers' ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
          onClick={() => setActiveTab('offers')}
        >Ofertas activas</button>
        <button
          className={activeTab === 'products' ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
          onClick={() => setActiveTab('products')}
        >Productos</button>
      </div>
      {/* Contenido de la pestaña de ofertas */}
      {activeTab === 'offers' && (
        <div className={styles.offersList}>
          {Array.isArray(offers) && offers.length === 0 && (
            <div style={{ color: '#888', marginBottom: 12 }}>No hay ofertas activas.</div>
          )}
          {Array.isArray(offers) && offers.map(offer => (
            <div key={offer.id} className={styles.offerItem}>
              <div>
                <span className={styles.offerTitle}>{offer.title}</span>
                <span className={styles.offerDiscount}>{offer.discount}% OFF</span>
              </div>
              <button className={styles.button} onClick={() => removeOffer(offer.id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Contenido de la pestaña de productos */}
      {activeTab === 'products' && (
        <div>
          <form
            className={styles.form}
            onSubmit={e => {
              e.preventDefault();
              addOffer();
            }}
          >
            <div className={styles.row}>
              <select
                className={styles.select}
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setSelectedProduct(null);
                  setSearch('');
                }}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                className={styles.input}
                type="text"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setSelectedProduct(null);
                }}
                placeholder="Buscar producto"
              />
            </div>
            <div className={styles.productList}>
              {products.filter(p =>
                (selectedCategory ? p.category === selectedCategory : true) &&
                (p.name.toLowerCase().includes(search.toLowerCase()) ||
                  (typeof p.slug === 'string' && p.slug.toLowerCase().includes(search.toLowerCase()))
                )
              ).slice(0, 8).map(p => (
                <button
                  type="button"
                  key={p.id}
                  className={selectedProduct?.id === p.id ? `${styles.productButton} ${styles.selected}` : styles.productButton}
                  onClick={() => setSelectedProduct(p)}
                >
                  {p.name} <span style={{ color: '#888', fontSize: 12 }}>(${p.price})</span>
                </button>
              ))}
            </div>
            {selectedProduct && (
              <div className={styles.selectedProduct}>
                <strong>Producto seleccionado:</strong>
                <div>{selectedProduct.name} <span style={{ color: '#888', fontSize: 12 }}>(${selectedProduct.price})</span></div>
                <input
                  className={styles.discountInput}
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Descuento (%)"
                  min={1}
                  max={100}
                />
                {discount && discount > 0 && (
                  <div className={styles.priceWithDiscount}>
                    Precio con descuento: ${
                      (selectedProduct.price * (1 - Number(discount) / 100)).toFixed(0)
                    }
                  </div>
                )}
              </div>
            )}
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <button className={styles.button} style={{ background: '#334155', color: '#fff', fontWeight: 500, borderRadius: 6, padding: '8px 18px', fontSize: 15, border: 'none', marginTop: 8 }} type="submit">Agregar Oferta</button>
          </form>
        </div>
      )}
    </div>
  );
}
