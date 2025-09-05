// OrdersPanel.tsx
// Panel de administración de órdenes y resumen financiero
// Muestra pestañas horizontales para alternar entre la tabla de órdenes y el resumen financiero

'use client';

import React, { useState, useEffect } from 'react';
import styles from './OrdersPanel.module.css';

// Tipo de datos para una orden
// Incluye información del cliente, productos, estado y pago
// Se usa para tipar el estado y las funciones

type Order = {
  id: string;
  customer?: string;
  customerEmail?: string;
  createdAt?: string;
  status: string;
  currency?: string;
  subtotal?: number;
  total?: number;
  lines?: Array<{
    name?: string;
    unitPrice?: number;
    qty?: number;
  }>;
  payment?: {
    provider?: string;
    sessionId?: string;
    paymentIntentId?: string;
    chargeId?: string;
  };
};

// Componente principal del panel de órdenes
export default function OrdersPanel() {
  // Estado para las órdenes obtenidas del backend
  const [orders, setOrders] = useState<Order[]>([]);
  // Estado para el filtro de fecha
  const [dateFilter, setDateFilter] = useState<string>('');
  // Estado para la pestaña activa ('orders' o 'resumen')
  const [activeTab, setActiveTab] = useState<'orders' | 'resumen'>('orders');

  // Cálculos financieros y agrupaciones
  // Obtiene el mes y año actual
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Filtra las órdenes del mes actual o por fecha seleccionada
  const monthlyOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const d = new Date(order.createdAt);
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toLocaleDateString('es-CL');
      return d.toLocaleDateString('es-CL') === filterDate;
    }
    return d.getMonth() === month && d.getFullYear() === year;
  });

  // Calcula el total de ventas del mes
  const totalVentas = monthlyOrders.reduce((acc, o) => {
    if (!o.lines) return acc;
    return acc + o.lines.reduce((sum, line) => sum + ((line.unitPrice ?? 0) * (line.qty ?? 1)), 0);
  }, 0);

  // Calcula el total de ventas del mes anterior
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const d = new Date(order.createdAt);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });
  const totalVentasPrev = prevMonthOrders.reduce((acc, o) => {
    if (!o.lines) return acc;
    return acc + o.lines.reduce((sum, line) => sum + ((line.unitPrice ?? 0) * (line.qty ?? 1)), 0);
  }, 0);

  // Calcula el crecimiento porcentual respecto al mes anterior
  const crecimiento = totalVentasPrev > 0 ? ((totalVentas - totalVentasPrev) / totalVentasPrev) * 100 : 0;

  // Agrupa productos vendidos y obtiene el top 5
  const productosVendidos: Record<string, { name: string; qty: number }> = {};
  monthlyOrders.forEach(o => {
    o.lines?.forEach(line => {
      const key = line.name ?? 'Sin nombre';
      if (!productosVendidos[key]) {
        productosVendidos[key] = { name: key, qty: 0 };
      }
      productosVendidos[key].qty += line.qty ?? 0;
    });
  });
  const topProductos = Object.values(productosVendidos).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Agrupa clientes y obtiene el top 5 por monto
  const clientes: Record<string, number> = {};
  monthlyOrders.forEach(o => {
    if (o.customerEmail) {
      clientes[o.customerEmail] = (clientes[o.customerEmail] ?? 0) + (o.subtotal ?? 0);
    }
  });
  const topClientes = Object.entries(clientes).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Agrupa ventas por categoría de producto
  const ventasPorCategoria: Record<string, number> = {};
  monthlyOrders.forEach(o => {
    o.lines?.forEach(line => {
      const key = line.name ?? 'Sin nombre';
      ventasPorCategoria[key] = (ventasPorCategoria[key] ?? 0) + ((line.unitPrice ?? 0) * (line.qty ?? 0));
    });
  });

  // Margen de ganancia simulado (costo = 70% del precio)
  const margenGanancia = totalVentas - (totalVentas * 0.7);

  // Alerta si las ventas son inusuales respecto al mes anterior
  const alertaVentas = totalVentasPrev > 0
    ? (totalVentas > 2 * totalVentasPrev
      ? '¡Ventas muy altas este mes!'
      : (totalVentas < 0.5 * totalVentasPrev
        ? '¡Ventas bajas este mes!'
        : ''))
    : '';

  // Agrupa ventas por fecha
  const ventasPorFecha: Record<string, number> = {};
  monthlyOrders.forEach(o => {
    if (!o.createdAt || !o.lines) return;
    const fecha = new Date(o.createdAt).toLocaleDateString('es-CL');
    const venta = o.lines.reduce((sum, line) => sum + ((line.unitPrice ?? 0) * (line.qty ?? 1)), 0);
    ventasPorFecha[fecha] = (ventasPorFecha[fecha] ?? 0) + venta;
  });

  // Cantidad de órdenes y ticket promedio
  const orderCount = monthlyOrders.length;
  const avgTicket = orderCount > 0 ? totalVentas / orderCount : 0;

  // Agrupa ventas por método de pago
  const byPayment = monthlyOrders.reduce((acc, o) => {
    const key = o.payment?.provider || 'Otro';
    acc[key] = (acc[key] ?? 0) + (o.total ?? 0);
    return acc;
  }, {} as Record<string, number>);

  // Obtiene las órdenes del backend al montar el componente
  useEffect(() => {
    fetch('http://localhost:4000/orders')
      .then(res => res.json())
      .then(setOrders);
  }, []);

  // Actualiza el estado de una orden
  const updateStatus = (id: string, status: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const updated = { ...order, status };
    fetch(`http://localhost:4000/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
      .then(res => res.json())
      .then((data) => {
        setOrders(orders.map(o => o.id === id ? data : o));
      });
  };

  // Elimina una orden
  const removeOrder = (id: string) => {
    fetch(`http://localhost:4000/orders/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setOrders(orders.filter(o => o.id !== id));
      });
  };

  // Renderiza el panel con pestañas y tablas
  return (
    <div className={styles.panel}>
      <div className={styles.title}>Órdenes</div>
      {/* Pestañas horizontales para alternar entre órdenes y resumen */}
      <div className={styles.tabs}>
        <button
          className={activeTab === 'orders' ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
          onClick={() => setActiveTab('orders')}
        >Órdenes</button>
        <button
          className={activeTab === 'resumen' ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
          onClick={() => setActiveTab('resumen')}
        >Resumen</button>
      </div>
      {/* Tabla de órdenes */}
      {activeTab === 'orders' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Fecha</th>
                <th>Email cliente</th>
                <th>Método de pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {/* Muestra cada línea de cada orden */}
              {Array.isArray(orders) && orders.map(order => (
                (order.lines ?? []).map((line: { name?: string; unitPrice?: number; qty?: number }, idx: number) => (
                  <tr key={order.id + '-' + idx}>
                    <td>{line.name || '-'}</td>
                    <td>${(line.unitPrice ?? 0).toLocaleString('es-CL')}</td>
                    <td>{line.qty ?? 1}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleString('es-CL') : '-'}</td>
                    <td>{order.customerEmail || '-'}</td>
                    <td>{order.payment?.provider ? order.payment.provider.toUpperCase() : '-'}</td>
                    <td><span>{order.status}</span></td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Tabla de resumen financiero */}
      {activeTab === 'resumen' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {/* Indicadores principales */}
              <tr>
                <td className={styles.indicator}>Total de ventas</td>
                <td className={styles.value}>${Number(totalVentas).toLocaleString('es-CL')}</td>
              </tr>
              <tr>
                <td className={styles.indicator}>Cantidad de órdenes</td>
                <td className={styles.value}>{orderCount}</td>
              </tr>
              <tr>
                <td className={styles.indicator}>Ticket promedio</td>
                <td className={styles.value}>${Number(avgTicket).toLocaleString('es-CL', { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr>
                <td className={styles.indicator}>Margen de ganancia (simulado)</td>
                <td className={styles.value}>${Number(margenGanancia).toLocaleString('es-CL')}</td>
              </tr>
              <tr>
                <td className={styles.indicator}>Comparativa con mes anterior</td>
                <td className={styles.value}>{Number(crecimiento).toFixed(1)}%</td>
              </tr>
              {/* Alerta si aplica */}
              {alertaVentas && (
                <tr>
                  <td colSpan={2} className={styles.alert}>{alertaVentas}</td>
                </tr>
              )}
              {/* Listados agrupados */}
              <tr>
                <td className={styles.indicator}>Por método de pago</td>
                <td>
                  <ul className={styles.list}>
                    {Object.entries(byPayment).map(([method, amount]) => (
                      <li key={method}>
                        {String(method).toUpperCase()}: <span className={styles.value}>${Number(amount).toLocaleString('es-CL')}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td className={styles.indicator}>Ventas por fecha</td>
                <td>
                  <ul className={styles.list}>
                    {Object.entries(ventasPorFecha).map(([fecha, monto]) => (
                      <li key={fecha}>
                        {fecha}: <span className={styles.value}>${Number(monto).toLocaleString('es-CL')}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td className={styles.indicator}>Ventas por categoría</td>
                <td>
                  <ul className={styles.list}>
                    {Object.entries(ventasPorCategoria).map(([cat, monto]) => (
                      <li key={cat}>
                        {cat}: <span className={styles.value}>${Number(monto).toLocaleString('es-CL')}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td className={styles.indicator}>Top productos vendidos</td>
                <td>
                  <ul className={styles.list}>
                    {topProductos.map((prod: { name: string; qty: number }, idx: number) => (
                      <li key={prod.name + idx}>
                        {prod.name}: <span className={styles.value}>{prod.qty} unidades</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td className={styles.indicator}>Top clientes</td>
                <td>
                  <ul className={styles.list}>
                    {topClientes.map(([email, monto]: [string, number]) => (
                      <li key={email}>
                        {email}: <span className={styles.value}>${Number(monto).toLocaleString('es-CL')}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td className={styles.indicator}>Gráfica de ventas por día</td>
                <td>
                  <div className={styles.graph}>
                    {Object.entries(ventasPorFecha).map(([fecha, monto]) => (
                      <div key={fecha} className={styles.bar} style={{ height: `${Math.max(10, Number(monto) / 10000)}px` }} title={fecha}>
                        <span className={styles.barLabel}>{Number(monto) > 0 ? '|' : ''}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}