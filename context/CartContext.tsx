'use client'; // Indica que este archivo se ejecuta en el cliente

import React, {
  createContext, // Para crear el contexto
  useContext,   // Para consumir el contexto
  useEffect,    // Para efectos secundarios (persistencia)
  useMemo,      // Para cálculos derivados (count, subtotal)
  useState,     // Para estado local
  type PropsWithChildren, // Para tipar el provider
} from 'react';

/**
 * Representa un producto dentro del carrito
 */
export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  qty: number; // cantidad
}

/**
 * API pública del contexto (métodos y datos que expone el provider)
 */
export interface CartState {
  items: CartItem[]; // Productos en el carrito
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void; // Agregar producto
  remove: (id: string) => void; // Quitar producto
  setQty: (id: string, qty: number) => void; // Cambiar cantidad
  clear: () => void; // Vaciar carrito
  count: number; // Total de ítems
  subtotal: number; // Suma total
  isCartOpen: boolean; // Estado del modal
  openCart: () => void; // Abrir modal
  closeCart: () => void; // Cerrar modal
  toggleCart: () => void; // Alternar modal
}

/**
 * Creamos el contexto (arranca en undefined para obligar uso del provider)
 */
const CartCtx = createContext<CartState | undefined>(undefined);

/**
 * Clave para guardar el carrito en localStorage
 */
const STORAGE_KEY = 'ficticlo.cart.v1';

/**
 * Proveedor del contexto del carrito
 */
export function CartProvider({ children }: PropsWithChildren): JSX.Element {
  // Estado de productos en el carrito
  const [items, setItems] = useState<CartItem[]>([]);
  // Estado para mostrar/ocultar el modal del carrito
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Al montar, hidrata el carrito desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {/* noop */}
  }, []);

  // Persiste el carrito en localStorage cada vez que cambia
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {/* noop */}
  }, [items]);

  // Agrega un producto al carrito (o suma cantidad si ya existe)
  const add: CartState['add'] = (item, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === item.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  };

  // Elimina un producto del carrito
  const remove: CartState['remove'] = (id) =>
    setItems(prev => prev.filter(x => x.id !== id));

  // Cambia la cantidad de un producto (mínimo 1)
  const setQty: CartState['setQty'] = (id, qty) =>
    setItems(prev => prev.map(x => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x)));

  // Vacía el carrito
  const clear: CartState['clear'] = () => setItems([]);

  // Abre el modal del carrito
  const openCart = () => setIsCartOpen(true);
  // Cierra el modal del carrito
  const closeCart = () => setIsCartOpen(false);
  // Alterna el estado del modal
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // Calcula el total de productos
  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  // Calcula el subtotal del carrito
  const subtotal = useMemo(() => items.reduce((a, b) => a + b.qty * b.price, 0), [items]);

  // Valor que se expone en el contexto
  const value: CartState = { 
    items, 
    add, 
    remove, 
    setQty, 
    clear, 
    count, 
    subtotal,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart
  };

  // Renderiza el provider con el valor
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

/**
 * Hook para consumir el contexto del carrito
 * Lanza error si se usa fuera del provider
 */
export function useCart(): CartState {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}