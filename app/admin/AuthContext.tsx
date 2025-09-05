// Contexto de autenticación para el panel de administración
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Tipo para el contexto de autenticación
// isAuthenticated: indica si el usuario está autenticado
// login/logout: funciones para cambiar el estado de autenticación
type AuthContextType = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

// Crea el contexto con valores por defecto
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Proveedor de autenticación para envolver la app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado local para saber si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Al montar, revisa el estado en localStorage
  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('admin-auth') === 'true');
  }, []);

  // Función para iniciar sesión (marca autenticado en localStorage)
  const login = () => {
    localStorage.setItem('admin-auth', 'true');
    setIsAuthenticated(true);
  };

  // Función para cerrar sesión (elimina autenticación de localStorage)
  const logout = () => {
    localStorage.removeItem('admin-auth');
    setIsAuthenticated(false);
  };

  // Provee el contexto a los componentes hijos
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir el contexto de autenticación
export function useAuth() {
  return useContext(AuthContext);
}