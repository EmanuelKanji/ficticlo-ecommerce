"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

// Tipos para el usuario y el contexto
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthRoleContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

// Contexto global para autenticación y roles
const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

// Provider que envuelve la app y gestiona el estado
export function AuthRoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Al montar, lee los datos de localStorage
  useEffect(() => {
    const token = localStorage.getItem('admin-auth');
    const id = localStorage.getItem('admin-id');
    const name = localStorage.getItem('admin-name');
    const email = localStorage.getItem('admin-email');
    const role = localStorage.getItem('admin-role') as 'admin' | 'user' | null;
    if (token && id && name && email && role) {
      setUser({ id, name, email, role });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Función para iniciar sesión (guarda en localStorage y contexto)
  const login = (userData: AuthUser, token: string) => {
    localStorage.setItem('admin-auth', token);
    localStorage.setItem('admin-id', userData.id);
    localStorage.setItem('admin-name', userData.name);
    localStorage.setItem('admin-email', userData.email);
    localStorage.setItem('admin-role', userData.role);
    setUser(userData);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('auth-change'));
  };

  // Función para actualizar el usuario en el contexto y localStorage
  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('admin-id', updated.id);
      localStorage.setItem('admin-name', updated.name);
      localStorage.setItem('admin-email', updated.email);
      localStorage.setItem('admin-role', updated.role);
      return updated;
    });
    window.dispatchEvent(new Event('auth-change'));
  };

  // Función para cerrar sesión
  const logout = () => {
  localStorage.removeItem('admin-auth');
  localStorage.removeItem('admin-id');
  localStorage.removeItem('admin-name');
  localStorage.removeItem('admin-email');
  localStorage.removeItem('admin-role');
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('auth-change'));
  };

  // Provee el contexto a los componentes hijos
  return (
  <AuthRoleContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthRoleContext.Provider>
  );
}

// Hook para consumir el contexto fácilmente
export function useAuthRole() {
  const ctx = useContext(AuthRoleContext);
  if (!ctx) throw new Error('useAuthRole debe usarse dentro de AuthRoleProvider');
  return ctx;
}

/*
  ¿Cómo usarlo?
  1. Envuelve tu app con <AuthRoleProvider> en el layout principal.
  2. Usa el hook useAuthRole() en cualquier componente para acceder a:
     - isAuthenticated: booleano si el usuario está logueado
     - user: datos del usuario (nombre, email, rol)
     - login(user, token): para iniciar sesión
     - logout(): para cerrar sesión
  3. Puedes mostrar/ocultar componentes según el rol:
     const { user } = useAuthRole();
     if (user?.role === 'admin') { ... }
*/
