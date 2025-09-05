
'use client'; // Habilita el modo cliente en Next.js para este componente


// Importaciones principales:
// - Hooks de Next.js para navegación y rutas
// - Hooks de React para estado y efectos
// - Contextos de autenticación y carrito
// - Componentes de modales y estilos
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import { useAuthRole } from '@/context/AuthRoleContext';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import LoginModal from '@/app/login/LoginModal';
import ProfileModal from './ProfileModal';
import { createPortal } from 'react-dom';
import styles from './Header.module.css';


// Iconos SVG inline para carrito, usuario, menú, búsqueda y cerrar
function CartIcon() { 
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className={styles.cartIcon} aria-hidden="true">
      <path fill="currentColor" d="M7 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4m10 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4M7.16 14h9.92a2 2 0 0 0 1.94-1.52l1.56-6.24A1 1 0 0 0 19.62 5H6.21l-.3-1.2A2 2 0 0 0 4 2H2v2h2l3.6 14.4A2 2 0 0 0 9.5 20H19v-2H9.5l-.34-1.36l-.2-.64z"/>
    </svg>
  ); 
}
function UserIcon() { 
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={styles.userIcon} aria-hidden="true">
      <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-5.33 0-8 2.67-8 6v2h16v-2c0-3.33-2.67-6-8-6"/>
    </svg>
  ); 
}
function MenuIcon() { 
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={styles.menuIcon} aria-hidden="true">
      <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>
    </svg>
  ); 
}
function SearchIcon() { 
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className={styles.searchIcon} aria-hidden="true">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 1 0-.71.71l.27.28v.79l5 5l1.5-1.5zM10 15a5 5 0 1 1 0-10a5 5 0 0 1 0 10"/>
    </svg>
  ); 
}
function CloseIcon() { 
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={styles.closeIcon} aria-hidden="true">
      <path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
    </svg>
  ); 
}


// Hook personalizado para detectar si la pantalla es móvil
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);
  return isMobile;
}


/* =============================================================================
   Componente Header
   Encabezado principal con navegación, búsqueda, carrito y modales
============================================================================ */
export default function Header(): JSX.Element {
  // Hooks de navegación y rutas
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile(768);

  // Estados locales para UI y modales
  const [mobileOpen, setMobileOpen] = useState(false); // Menú móvil abierto
  const [query, setQuery] = useState(''); // Búsqueda
  const [searchFocused, setSearchFocused] = useState(false); // Input enfocado
  const [showMobileSearch, setShowMobileSearch] = useState(false); // Búsqueda móvil
  const [mounted, setMounted] = useState(false); // Componente montado
  const [showClientMenu, setShowClientMenu] = useState(false); // Menú usuario
  const [showLogin, setShowLogin] = useState(false); // Modal login
  const [showProfile, setShowProfile] = useState(false); // Modal perfil
  const { user, isAuthenticated, logout } = useAuthRole(); // Contexto de usuario

  // Contexto del carrito
  const { count = 0, openCart } = useCart();

  // Detecta si el componente está montado (para portales y efectos)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determina si una ruta está activa
  const isActive = (href: string) => pathname === href;

  // Maneja el submit de búsqueda
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
    if (isMobile) setMobileOpen(false);
  };

  // Cierra menú móvil y desenfoca búsqueda al cambiar de ruta
  useEffect(() => { 
    setMobileOpen(false); 
    setSearchFocused(false);
  }, [pathname]);

  // Alterna menú móvil
  const toggleMobile = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);

  // Abre modal de carrito
  const handleCartClick = () => {
    openCart();
    if (isMobile) closeMobile();
  };

  /* --------------------------------------------------------------------------
     Renderizado principal:
     - Header sticky con navegación, búsqueda y carrito
     - Adaptación para desktop y móvil
     - Menús y modales condicionales
  -------------------------------------------------------------------------- */
  return (
    <>
      <header className={styles.header}>
        <div className={isMobile ? styles.innerMobile : styles.innerDesktop}>
          {/* Logo desktop */}
          {!isMobile && (
            <div className={styles.left}>
              <Link href="/" className={styles.brand}>FictiClo</Link>
            </div>
          )}
          {/* Búsqueda desktop */}
          {!isMobile && (
            <form 
              onSubmit={onSubmit} 
              className={`${styles.searchForm} ${searchFocused ? styles.searchFormFocused : ''}`}
              role="search"
              aria-label="Buscar productos"
            >
              <SearchIcon />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos, marcas…"
                className={styles.searchInput}
                name="q"
                autoComplete="off"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </form>
          )}
          {/* Header móvil: menú, logo, búsqueda y carrito */}
          {isMobile && (
            <div className={styles.mobileHeader}>
              {/* Botón menú hamburguesa */}
              <button
                type="button"
                className={styles.mobileMenu}
                onClick={toggleMobile}
                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                title={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
              {/* Logo móvil */}
              <Link href="/" className={styles.mobileBrand}>
                <span>FictiClo</span>
              </Link>
              {/* Búsqueda móvil */}
              <div className={styles.searchContainer}>
                <button
                  type="button"
                  className={styles.searchIconButton}
                  aria-label="Buscar"
                  title="Buscar"
                  onClick={() => setShowMobileSearch((v) => !v)}
                >
                  <SearchIcon />
                  {showMobileSearch && (
                    <span className={styles.rippleEffect}></span>
                  )}
                </button>
                {showMobileSearch && (
                  <form
                    onSubmit={onSubmit}
                    className={`${styles.mobileSearchInput} ${showMobileSearch ? styles.active : ''}`}
                    role="search"
                    aria-label="Buscar productos"
                  >
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar productos, marcas…"
                      className={styles.searchInput}
                      name="q"
                      autoComplete="off"
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                    />
                  </form>
                )}
              </div>
              {/* Botón carrito móvil */}
              <button
                type="button"
                className={styles.mobileCart}
                onClick={handleCartClick}
                aria-label="Abrir carrito"
                title="Carrito"
              >
                <CartIcon />
                {mounted && count > 0 && (
                  <span className={styles.mobileCartBadge}>{count > 99 ? '99+' : count}</span>
                )}
              </button>
            </div>
          )}
          {/* Navegación y usuario desktop */}
          {!isMobile && (
            <nav className={styles.right} aria-label="Navegación principal">
              {/* Botón carrito desktop */}
              <button
                type="button"
                className={styles.navlink}
                aria-label="Abrir carrito"
                title="Carrito"
                onClick={handleCartClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
              >
                <CartIcon />
                {mounted && count > 0 && (
                  <span className={styles.mobileCartBadge}>{count > 99 ? '99+' : count}</span>
                )}
              </button>
              {/* Menú usuario desktop (solo cliente autenticado) */}
              {isAuthenticated && user?.role === 'user' ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    className={styles.navlink}
                    style={{ fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setShowClientMenu(v => !v)}
                  >
                    <UserIcon /> {user?.name ? user.name : 'Mi cuenta'}
                  </button>
                  {showClientMenu && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', minWidth: 160, zIndex: 10 }}>
                      <button
                        style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => {
                          logout();
                          setShowClientMenu(false);
                          router.push('/');
                        }}
                      >Cerrar sesión</button>
                      <button
                        style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => {
                          setShowClientMenu(false);
                          setShowProfile(true);
                        }}
                      >Editar perfil</button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.navlink}
                  onClick={() => setShowLogin(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <UserIcon /> Iniciar sesión
                </button>
              )}
            </nav>
          )}
        </div>

        {/* Panel móvil: menú lateral y navegación */}
        {isMobile && mobileOpen && (
          <div id="mobile-menu" className={styles.mobilePanel}>
            <div className={styles.mobilePanelHeader}>
              <h3 className={styles.mobilePanelTitle}>Menú</h3>
            </div>
            
            <nav className={styles.mobileNav} aria-label="Navegación móvil">
              <Link 
                href="/products" 
                className={`${styles.mobileItem} ${isActive('/products') ? styles.mobileItemActive : ''}`}
                onClick={closeMobile}
              >
                Productos
              </Link>
              
              <Link 
                href="/offers" 
                className={`${styles.mobileItem} ${isActive('/offers') ? styles.mobileItemActive : ''}`}
                onClick={closeMobile}
              >
                Ofertas
              </Link>
              {/* Menú usuario móvil (solo cliente autenticado) */}
              {isAuthenticated && user?.role === 'user' ? (
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={styles.mobileItem}
                    onClick={() => setShowClientMenu(v => !v)}
                  >
                    <UserIcon /> {user?.name ? user.name : 'Mi cuenta'}
                  </button>
                  {showClientMenu && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', minWidth: 160, zIndex: 10 }}>
                      <button
                        style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => {
                          logout();
                          setShowClientMenu(false);
                          closeMobile();
                          router.push('/');
                        }}
                      >Cerrar sesión</button>
                      <button
                        style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => {
                          setShowClientMenu(false);
                          closeMobile();
                          setShowProfile(true);
                        }}
                      >Editar perfil</button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.mobileItem}
                  onClick={() => setShowLogin(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <UserIcon /> Iniciar sesión
                </button>
              )}
              {/* Botón carrito móvil en menú lateral */}
              <button
                type="button"
                className={styles.mobileItem}
                onClick={() => {
                  closeMobile();
                  openCart();
                }}
              >
                Carrito {mounted && count > 0 && `(${count > 99 ? '99+' : count})`}
              </button>
            </nav>
            
            <div className={styles.mobilePanelFooter}>
              <button 
                onClick={closeMobile}
                className={styles.mobileCloseButton}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Overlay móvil para cerrar menú al hacer click fuera */}
        {isMobile && mobileOpen && (
          <div className={styles.mobileOverlay} onClick={closeMobile} />
        )}
      </header>
      {/* Modal de login (portal) */}
      {showLogin && typeof window !== 'undefined' && createPortal(
        <LoginModal onClose={() => setShowLogin(false)} />,
        document.body
      )}
      {/* Modal de perfil (portal) */}
      {showProfile && typeof window !== 'undefined' && createPortal(
        <ProfileModal onClose={() => setShowProfile(false)} />,
        document.body
      )}
    </>
  );
}
