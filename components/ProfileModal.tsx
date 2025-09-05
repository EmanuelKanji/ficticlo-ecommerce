import React, { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import { useAuthRole } from '@/context/AuthRoleContext';
import styles from './ProfileModal.module.css';

// Props que recibe el modal de perfil
interface ProfileModalProps {
    onClose: () => void;
}

// Estructura del perfil de usuario
interface UserProfile {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: string;
}

// Componente principal del modal de perfil
export default function ProfileModal({ onClose }: ProfileModalProps) {
    const [showChangePassword, setShowChangePassword] = useState(false);
    // Obtiene el usuario autenticado desde el contexto
    const { user } = useAuthRole();
    const { updateUser } = useAuthRole();
    // Estado para almacenar el perfil del usuario
    const [profile, setProfile] = useState<UserProfile | null>(null);
    // Estado para manejar errores
    const [error, setError] = useState('');
    // Estado para mostrar mensaje de éxito
    const [success, setSuccess] = useState('');
    // Estado para mostrar indicador de carga
    const [loading, setLoading] = useState(false);
    // Estado para edición
    const [isEditing, setIsEditing] = useState(false);
    // Estado para los campos editables
    const [editFields, setEditFields] = useState<{ name: string; email: string }>({ name: '', email: '' });

    // Efecto para cargar el perfil del usuario cuando cambia el usuario autenticado
    useEffect(() => {
        // Si no hay usuario, muestra error
        if (!user?.id) {
            setError('Usuario no identificado');
            return;
        }
    // ...eliminado para producción
        setLoading(true);
        // Solicita los datos del usuario al backend
        fetch(`http://localhost:4000/users/${user.id}`)
            .then(async res => {
                // Si la respuesta no es exitosa, lanza error
                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                // Guarda los datos del perfil en el estado
                setProfile({
                    id: data.id || '',
                    name: data.name || '',
                    email: data.email || '',
                    passwordHash: data.passwordHash || '',
                    role: data.role || ''
                });
                setEditFields({ name: data.name || '', email: data.email || '' });
                setError('');
            })
            .catch(err => {
                // Maneja errores de carga
                setError('No se pudo cargar el perfil');
                // ...eliminado para producción
            })
            .finally(() => {
                // Finaliza el indicador de carga
                setLoading(false);
            });
    }, [user]);

    // Lógica para guardar cambios de perfil
    const handleSave = async () => {
        if (!user?.id) {
            setError('Usuario no identificado');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Solo enviar los campos que realmente cambiaron
            const body: any = {};
            if (editFields.name !== profile?.name) body.name = editFields.name;
            if (editFields.email !== profile?.email) body.email = editFields.email;
            if (Object.keys(body).length === 0) {
                setError('No hay cambios para guardar');
                setLoading(false);
                return;
            }
            const res = await fetch(`http://localhost:4000/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    setError(data.errors.map((e: any) => e.msg).join(' | '));
                } else {
                    setError(data.error || 'Error al actualizar el perfil');
                }
                setSuccess('');
            } else {
                setProfile(p => p ? { ...p, ...body } : p);
                updateUser(body);
                setIsEditing(false);
                setSuccess('Perfil actualizado correctamente');
                setTimeout(() => setSuccess(''), 2000);
            }
        } catch (err) {
            setError('No se pudo conectar al servidor');
        } finally {
            setLoading(false);
        }
    };

    // Renderiza el modal con la información del perfil
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>Mi perfil</span>
                    <button className={styles.close} onClick={onClose} disabled={loading}>&times;</button>
                </div>
                <div className={styles.modalContent}>
                    {loading ? (
                        <div className={styles.loading}>Cargando...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
                    ) : success ? (
                        <div className={styles.success}>{success}</div>
                    ) : profile ? (
                        <form className={styles.form} autoComplete="off" onSubmit={e => { e.preventDefault(); }}>
                            <div className={styles.avatarSection} style={{alignItems: 'center', marginBottom: 16}}>
                                <div className={styles.avatarIcon}>
                                    <span role="img" aria-label="user" style={{fontSize: '3rem'}}>👤</span>
                                </div>
                                <div className={styles.name}>{profile.name}</div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Nombre</label>
                                {isEditing ? (
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={editFields.name}
                                        onChange={e => setEditFields(f => ({ ...f, name: e.target.value.replace(/[<>"'`]/g, '').trim() }))}
                                        disabled={loading}
                                    />
                                ) : (
                                    <span>{profile.name}</span>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email</label>
                                {isEditing ? (
                                    <input
                                        className={styles.input}
                                        type="email"
                                        value={editFields.email}
                                        onChange={e => setEditFields(f => ({ ...f, email: e.target.value.replace(/[<>"'`]/g, '').trim() }))}
                                        disabled={loading}
                                    />
                                ) : (
                                    <span>{profile.email}</span>
                                )}
                            </div>
                        </form>
                    ) : null}
                </div>
                <div className={styles.modalFooter}>
                    {!isEditing ? (
                        <button
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            type="button"
                            onClick={() => setIsEditing(true)}
                            disabled={loading}
                        >
                            Editar
                        </button>
                    ) : (
                        <button
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            Guardar
                        </button>
                    )}
                    <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={onClose}
                        type="button"
                        disabled={loading}
                    >
                        Cerrar
                    </button>
                    <button
                        className={`${styles.button} ${styles.passwordButton}`}
                        type="button"
                        onClick={() => setShowChangePassword(true)}
                        disabled={loading}
                    >
                        Cambiar contraseña
                    </button>
                </div>
                {showChangePassword && (
                    <ChangePasswordModal
                        onClose={() => setShowChangePassword(false)}
                        onSuccess={() => setShowChangePassword(false)}
                    />
                )}
            </div>
        </div>
    );
}