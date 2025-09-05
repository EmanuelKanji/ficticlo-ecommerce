// Componente modal para mostrar notificaciones en el panel de administración
'use client';

import React from 'react';
import styles from './NotificationsModal.module.css';

export interface Notification {
  id: string;
  type: 'stock' | 'purchase';
  message: string;
  date: string;
}

interface NotificationsModalProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ notifications, onClose }) => {
  // Ordenar notificaciones por fecha descendente (más nuevas primero)
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Botón para cerrar el modal */}
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2>Notificaciones</h2>
        {/* Lista de notificaciones */}
        {sortedNotifications.length === 0 ? (
          <p>No hay notificaciones.</p>
        ) : (
          <ul className={styles.list}>
            {sortedNotifications.map((n) => (
              <li key={n.id} className={styles[n.type]}>
                <span className={styles.message}>{n.message}</span>
                <span className={styles.date}>{new Date(n.date).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsModal;
