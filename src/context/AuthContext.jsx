import React, { createContext, useState, useContext } from 'react';

// 1. Criamos o contexto
export const AuthContext = createContext({});

// 2. O Provedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = (userData, authToken) => {
    console.log('✅ [AUTH] Usuário logado:', userData);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    console.log('🚪 [AUTH] Logout realizado');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      authenticated: !!user, 
      user, 
      token,
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. O Hook useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};