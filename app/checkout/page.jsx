// Página de checkout para finalizar la compra
'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext'; // Hook para acceder al carrito
import Header from '@/components/Header'; // Header de la web

export default function CheckoutPage() {
  // Obtiene los items del carrito, subtotal y función para limpiar el carrito
  const { items, subtotal, clear } = useCart();
  // Estado para mostrar loader durante el pago
  const [loading, setLoading] = useState(false);
  // Estado para mostrar mensaje de éxito
  const [successMsg, setSuccessMsg] = useState('');
  // Estado para mostrar mensaje de error
  const [errorMsg, setErrorMsg] = useState('');

  // Función para procesar el pago y crear la orden
  const pay = async () => {
    try {
      setLoading(true);
      // Prepara las líneas de productos para la orden
      const lines = items.map(it => ({
        productId: it.id,
        name: it.name,
        unitPrice: it.price,
        image: it.image,
        qty: it.qty,
      }));

      // Llama al backend para crear la orden
      const res = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: '', // Puedes agregar email si lo tienes
          lines,
          subtotal,
          status: 'paid', // Simula pago exitoso
          currency: 'clp',
        }),
      });
      const data = await res.json();
      if (data && data.id) {
        clear(); // Limpia el carrito
        setSuccessMsg('Compra realizada con éxito. Orden: ' + data.id);
        // Redirige al home después de 5 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 5000);
      } else {
        setErrorMsg('No se pudo crear la orden');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>Checkout</h1>
        {/* Mensaje de éxito */}
        {successMsg && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: 8, marginBottom: 16, textAlign: 'center', fontWeight: 700 }}>
            {successMsg} <br />Redirigiendo al inicio...
          </div>
        )}
        {/* Mensaje de error */}
        {errorMsg && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 8, marginBottom: 16, textAlign: 'center', fontWeight: 700 }}>
            {errorMsg}
          </div>
        )}
        {/* Tabla de productos en el carrito */}
        <table style={{ width: '100%', marginBottom: 24, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Imagen</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Producto</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Cantidad</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Precio unitario</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                {/* Imagen del producto */}
                {item.image && (
                  <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                )}
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <div style={{ fontWeight: 700 }}>{item.name}</div>
                {/* Muestra detalles adicionales si existen */}
                {item.category && (
                  <div style={{ fontSize: 13, color: '#666' }}>Categoría: {item.category}</div>
                )}
                {item.slug && (
                  <div style={{ fontSize: 13, color: '#666' }}>Slug: {item.slug}</div>
                )}
                {item.description && (
                  <div style={{ fontSize: 13, color: '#666' }}>Descripción: {item.description}</div>
                )}
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{item.qty}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>${item.price.toLocaleString('es-CL')}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>${(item.price * item.qty).toLocaleString('es-CL')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Total de la compra */}
      <p style={{ fontWeight: 700, fontSize: 18 }}>Total: ${subtotal.toLocaleString('es-CL')}</p>
      {/* Botón para pagar */}
      <button
        onClick={pay}
        disabled={loading || items.length === 0}
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          background: '#2563eb',
          color: '#fff',
          fontWeight: 700,
          border: '1px solid transparent',
          marginTop: 16,
        }}
      >
        {loading ? 'Redirigiendo…' : 'Pagar con Webpay (test)'}
      </button>
    </div>
    </>
  );
}
