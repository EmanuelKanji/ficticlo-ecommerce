// Importamos los hooks necesarios de React y Next.js
import { useState } from 'react';
// Importamos el contexto de autenticación personalizado
import { useAuthRole } from '@/context/AuthRoleContext';
// Importamos el hook para navegación de Next.js
import { useRouter } from 'next/navigation';
// Importamos los estilos CSS para el modal de login
import styles from './login.module.css';

// Componente principal del modal de login y registro
export default function LoginModal({ onClose }: { onClose: () => void }) {
  // Obtenemos la función de login del contexto de autenticación
  const { login } = useAuthRole();
  // Hook para redireccionar entre páginas
  const router = useRouter();
  // Estado para mostrar el formulario de registro o login
  const [showRegister, setShowRegister] = useState(false);
  // Estados para el formulario de login
  const [email, setEmail] = useState(''); // Email del usuario
  const [password, setPassword] = useState(''); // Contraseña del usuario
  const [error, setError] = useState(''); // Mensaje de error en login
  const [loading, setLoading] = useState(false); // Estado de carga en login
  // Estados para el formulario de registro
  const [regName, setRegName] = useState(''); // Nombre completo
  const [regEmail, setRegEmail] = useState(''); // Email para registro
  const [regPassword, setRegPassword] = useState(''); // Contraseña para registro
  const [regConfirm, setRegConfirm] = useState(''); // Confirmación de contraseña
  const [regRole, setRegRole] = useState('user'); // Rol del usuario (user/admin)
  const [regError, setRegError] = useState(''); // Mensaje de error en registro
  const [regLoading, setRegLoading] = useState(false); // Estado de carga en registro

  // Función para manejar el envío del formulario de login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario
    setError(''); // Limpiamos errores previos
    setLoading(true); // Activamos el estado de carga
    // Validación básica de campos
    if (!email || !password) {
      setError('Completa todos los campos');
      setLoading(false);
      return;
    }
    try {
      // Realizamos la petición al backend para iniciar sesión
      const res = await fetch('http://127.0.0.1:4000/login/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      // Intentamos obtener la respuesta en formato JSON
      let data;
      try {
        data = await res.json();
      } catch {
        setError('Error inesperado del servidor');
        setLoading(false);
        return;
      }
      setLoading(false);
      if (!res.ok) {
        // Si la respuesta no es exitosa, mostramos el error del backend o uno genérico
        setError(data?.error || 'Credenciales incorrectas');
        return;
      }
      // Validamos que el backend envíe el token y el usuario
      if (!data.token || !data.user) {
        setError('Respuesta inválida del servidor');
        return;
      }
      // Usamos el contexto para guardar los datos del usuario y el token
      login({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role }, data.token);
      // Cerramos el modal y redirigimos al panel de administración
      onClose();
      router.push('/admin');
    } catch (err) {
      setLoading(false);
      setError('No se pudo conectar al servidor');
    }
  };

  // Función para manejar el envío del formulario de registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario
    setRegError(''); // Limpiamos errores previos
    // Validación de campos obligatorios
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setRegError('Completa todos los campos');
      return;
    }
    // Validación de coincidencia de contraseñas
    if (regPassword !== regConfirm) {
      setRegError('Las contraseñas no coinciden');
      return;
    }
    setRegLoading(true); // Activamos el estado de carga
    try {
      // Realizamos la petición al backend para registrar usuario
      const res = await fetch('http://localhost:4000/login/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole })
      });
      const data = await res.json();
      setRegLoading(false);
      if (!res.ok) {
        // Si hay error, mostramos el mensaje del backend o uno genérico
        setRegError(data.error || 'Error al registrar usuario');
      } else {
        // Si el registro es exitoso, volvemos al login y mostramos mensaje
        setShowRegister(false);
        setEmail(regEmail);
        setPassword('');
        setError('Usuario creado, ahora inicia sesión');
      }
    } catch (err) {
      setRegLoading(false);
      setRegError('Error de conexión');
    }
  };

  // Renderizado del modal, muestra el formulario de login o registro según el estado
  return (
    <div className={styles.overlay}>
      {/* Contenedor principal del modal */}
      <div className={styles.modal}>
        {/* Botón para cerrar el modal */}
        <button className={styles.close} onClick={onClose}>&times;</button>
        {/* Título dinámico según el formulario */}
        <div className={styles.title}>{showRegister ? 'Crear cuenta' : 'Iniciar sesión'}</div>
        {/* Formulario de login */}
        {!showRegister ? (
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Campo de email */}
            <input
              className={styles.input}
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            {/* Campo de contraseña */}
            <input
              className={styles.input}
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {/* Botón para enviar el formulario de login */}
            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            {/* Mensaje de error si existe */}
            {error && <div className={styles.error}>{error}</div>}
            {/* Botón para cambiar al formulario de registro */}
            <button
              type="button"
              className={styles.button}
              style={{ background: '#334155', marginTop: 8 }}
              onClick={() => setShowRegister(true)}
            >
              Crear cuenta
            </button>
          </form>
        ) : (
          // Formulario de registro
          <form className={styles.form} onSubmit={handleRegister}>
            {/* Campo de nombre completo */}
            <input
              className={styles.input}
              type="text"
              placeholder="Nombre completo"
              value={regName}
              onChange={e => setRegName(e.target.value)}
              autoFocus
            />
            {/* Campo de email para registro */}
            <input
              className={styles.input}
              type="email"
              placeholder="Correo electrónico"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
            />
            {/* Campo de contraseña para registro */}
            <input
              className={styles.input}
              type="password"
              placeholder="Contraseña"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
            />
            {/* Campo para confirmar contraseña */}
            <input
              className={styles.input}
              type="password"
              placeholder="Confirmar contraseña"
              value={regConfirm}
              onChange={e => setRegConfirm(e.target.value)}
            />
            {/* Selector de rol de usuario */}
            <select
              className={styles.input}
              value={regRole}
              onChange={e => setRegRole(e.target.value)}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
            {/* Botón para enviar el formulario de registro */}
            <button className={styles.button} type="submit" disabled={regLoading}>
              {regLoading ? 'Creando...' : 'Crear cuenta'}
            </button>
            {/* Mensaje de error si existe */}
            {regError && <div className={styles.error}>{regError}</div>}
            {/* Botón para volver al formulario de login */}
            <button
              type="button"
              className={styles.button}
              style={{ background: '#334155', marginTop: 8 }}
              onClick={() => setShowRegister(false)}
            >
              Volver a iniciar sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
