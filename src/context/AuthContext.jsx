import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Criamos o contexto
export const AuthContext = createContext({});

// 2. O Provedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta recuperar os dados salvos ao atualizar a página
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');

    if (recoveredUser && token) {
      try {
        setUser(JSON.parse(recoveredUser));
      } catch (error) {
        console.error("Erro ao ler usuário do localStorage", error);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', token); // Usei authToken para bater com seu ProtectedRoute
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      authenticated: !!user, 
      user, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. O Hook useAuth (Garanta que isso esteja no final do arquivo)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};