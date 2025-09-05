
// Componente para cambiar la contraseña del usuario
import React, { useEffect, useState } from 'react'; // Hooks de React
import { useAuthRole } from '@/context/AuthRoleContext'; // Contexto de autenticación y roles
import styles from './ProfileModal.module.css'; // Estilos del modal


export default function ChangePasswordModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  // Obtenemos el usuario actual del contexto
  const { user } = useAuthRole();
  // Estados para los campos y mensajes
  const [passwordHash, setPasswordHash] = useState(''); // Hash actual (solo para validación extra)
  const [current, setCurrent] = useState(''); // Contraseña actual
    const [newPass, setNewPass] = useState(''); // Nueva contraseña
    // Sanitiza la contraseña actual eliminando espacios al inicio/fin
    const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrent(e.target.value.trim());
    };
  const [confirm, setConfirm] = useState(''); // Confirmación de nueva contraseña
  const [error, setError] = useState(''); // Mensaje de error
  const [loading, setLoading] = useState(false); // Estado de carga
  const [success, setSuccess] = useState(false); // Estado de éxito
  const [passwordStrength, setPasswordStrength] = useState(0); // Fortaleza de la nueva contraseña

  // Al montar, obtenemos el hash de la contraseña actual del usuario
  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:4000/users/${user.id}`)
      .then(async res => {
        if (!res.ok) return;
        const data = await res.json();
        setPasswordHash(data.passwordHash || '');
      });
  }, [user]);

  // Calcula la fortaleza de la nueva contraseña cada vez que cambia
  useEffect(() => {
    if (!newPass) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (newPass.length >= 8) strength += 20;
    if (/\d/.test(newPass)) strength += 20;
    if (/[a-z]/.test(newPass) && /[A-Z]/.test(newPass)) strength += 20;
    if (/[^A-Za-z0-9]/.test(newPass)) strength += 20;
    if (newPass.length >= 12) strength += 20;
    setPasswordStrength(strength);
  }, [newPass]);

  // Devuelve el color según la fortaleza
  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#ef4444'; // Rojo
    if (passwordStrength < 80) return '#f59e0b'; // Naranja
    return '#10b981'; // Verde
  };
  // Devuelve el texto según la fortaleza
  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength < 40) return 'Débil';
    if (passwordStrength < 80) return 'Media';
    return 'Fuerte';
  };

  // Maneja el envío del formulario para cambiar la contraseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validación de campos
    if (!current || !newPass || !confirm) {
      setError('Completa todos los campos');
      return;
    }
    if (newPass !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (passwordStrength < 40) {
      setError('La contraseña es demasiado débil');
      return;
    }
    setLoading(true);
    try {
      if (!user?.id) {
        setLoading(false);
        setError('Usuario no identificado');
        return;
      }
      // Petición al backend para cambiar la contraseña
      const res = await fetch(`http://localhost:4000/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current, newPass })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || 'Error al cambiar la contraseña');
        setSuccess(false);
      } else {
        setSuccess(true);
        setError('');
        // Mensaje de éxito y cierre automático
        setTimeout(() => {
          setSuccess(false);
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      }
    } catch {
      setLoading(false);
      setError('No se pudo conectar al servidor');
    }
  };

  // Renderizado del modal de cambio de contraseña
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Cabecera del modal */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Cambiar contraseña</h2>
          <button className={styles.close} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalContent}>
          {/* Mensaje de éxito si la contraseña fue cambiada */}
          {success ? (
            <div className={styles.successMessage}>
              <h3 className={styles.successTitle}>¡Contraseña cambiada correctamente!</h3>
              <p className={styles.successText}>Tu nueva contraseña ha sido guardada.</p>
            </div>
          ) : (
            // Formulario para cambiar la contraseña
            <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
              {/* Campo de contraseña actual */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contraseña actual</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={current}
                    onChange={handleCurrentChange}
                  autoFocus
                />
              </div>
              {/* Campo de nueva contraseña */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nueva contraseña</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Crea una nueva contraseña"
                  value={newPass}
                    onChange={e => setNewPass(e.target.value.trim())}
                />
                {/* Indicador de fortaleza de contraseña */}
                {newPass && (
                  <>
                    <div className={styles.passwordStrength}>
                      <div
                        className={styles.strengthIndicator}
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor()
                        }}
                      />
                    </div>
                    <div className={styles.strengthText}>{getStrengthText()}</div>
                  </>
                )}
              </div>
              {/* Campo de confirmación de nueva contraseña */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirmar contraseña</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={confirm}
                    onChange={e => setConfirm(e.target.value.trim())}
                />
              </div>
              {/* Botón para enviar el formulario */}
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
              {/* Mensaje de error si existe */}
              {error && <div className={styles.error}>{error}</div>}
            </form>
          )}
        </div>
        {/* Pie del modal con botón cancelar */}
        <div className={styles.modalFooter}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
