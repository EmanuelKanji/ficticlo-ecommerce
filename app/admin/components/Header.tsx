"use client";
// Componente Header para la barra superior del panel de administración
import React from 'react';
import styles from './Header.module.css';
import { useRouter } from 'next/navigation';
import { FaBell, FaUserCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';
import LoginModal from '@/app/login/LoginModal';
import NotificationsModal from './NotificationsModal';

const Header: React.FC = () => {
    const router = useRouter();
    const [adminName, setAdminName] = React.useState<string | null>(null);
    const [adminCode, setAdminCode] = React.useState<string | null>(null);
    const [adminAvatar, setAdminAvatar] = React.useState<string | null>(null);
    // Estado para controlar la apertura/cierre del menú
    const [menuOpen, setMenuOpen] = React.useState(false);
    // Estado para controlar la visualización de notificaciones
    const [showNotifications, setShowNotifications] = React.useState(false);
    // Estado para almacenar las notificaciones
    const [notifications, setNotifications] = React.useState<any[]>([]);
    // Estado para controlar la apertura del modal de login
    const [showLogin, setShowLogin] = React.useState(false);

    // Efecto para sincronizar el estado del administrador con el almacenamiento local
    React.useEffect(() => {
        setAdminName(localStorage.getItem('admin-name'));
        setAdminCode(localStorage.getItem('admin-code'));
        setAdminAvatar(localStorage.getItem('admin-avatar'));
        const onStorage = () => {
            setAdminName(localStorage.getItem('admin-name'));
            setAdminCode(localStorage.getItem('admin-code'));
            setAdminAvatar(localStorage.getItem('admin-avatar'));
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener('auth-change', onStorage);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('auth-change', onStorage);
        };
    }, []);

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('admin-auth');
        localStorage.removeItem('admin-name');
        router.push('/');
        window.dispatchEvent(new Event('auth-change'));
    };

    // Función para alternar la visibilidad de la barra lateral
    const toggleSidebar = () => {
        const event = new CustomEvent('toggle-sidebar');
        window.dispatchEvent(event);
    };

    // Efecto para obtener las notificaciones desde la API
    React.useEffect(() => {
        async function fetchNotifications() {
            try {
                const [notifRes, stockRes] = await Promise.all([
                    fetch(process.env.NEXT_PUBLIC_API_BASE + '/notifications'),
                    fetch(process.env.NEXT_PUBLIC_API_BASE + '/low-stock')
                ]);
                const notifData = await notifRes.json();
                const stockData = await stockRes.json();
                // Mapear productos de bajo stock a notificaciones tipo 'stock'
                const stockNotifications = stockData.map((product: any) => ({
                    id: product.id,
                    type: 'stock',
                    message: `Stock bajo: ${product.name} (${product.stock} unidades)`,
                    date: new Date().toISOString()
                }));
                setNotifications([...notifData, ...stockNotifications]);
            } catch {
                setNotifications([]);
            }
        }
        if (showNotifications) {
            fetchNotifications();
        }
    }, [showNotifications]);

    return (
        <>
            <header className={styles.header}>
                {/* Botón para abrir/cerrar sidebar en móvil */}
                <div className={styles.left}>
                    <button onClick={toggleSidebar} aria-label="Abrir menú" className={styles.menuButton}>
                        <FaBars />
                    </button>
                    <span className={styles.logo}>FictiClo</span>
                </div>

                <div className={styles.actions}>
                    {/* Notificaciones */}
                    <div style={{ position: 'relative' }}>
                        <button
                            title="Notificaciones"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FaBell />
                            <span style={{ marginLeft: 6, fontSize: 12, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 999 }}>{notifications.length}</span>
                        </button>
                        {showNotifications && (
                            <NotificationsModal notifications={notifications} onClose={() => setShowNotifications(false)} />
                        )}
                    </div>

                    {/* Usuario autenticado */}
                    <div className={styles.userMenu}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            title={adminName || 'Usuario'}
                            aria-expanded={menuOpen}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'inherit' }}
                        >
                            {adminAvatar ? (
                                <img src={adminAvatar || undefined} alt={adminName || 'Usuario'} className={styles.avatar} />
                            ) : (
                                <FaUserCircle size={28} />
                            )}
                        </button>
                        {menuOpen && (
                            <div className={styles.menuDropdown}>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 600 }}>{adminName ?? 'Usuario'}</div>
                                    {adminCode && <div style={{ fontSize: 12, color: '#666' }}>Código: {adminCode}</div>}
                                </div>
                                <hr />
                                <button onClick={handleLogout}>
                                    <FaSignOutAlt />
                                    <span>Cerrar sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </>
    );
};

export default Header;
