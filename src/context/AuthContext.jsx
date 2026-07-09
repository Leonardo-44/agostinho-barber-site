import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api'; // ajusta o caminho se for diferente no seu projeto

// 1. Criamos o contexto
// ✅ CORRIGIDO: valor padrão null (era {} antes, o que fazia a checagem em useAuth nunca disparar)
export const AuthContext = createContext(null);

// 2. O Provedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // começa true até checar o localStorage

  // ✅ Ao carregar o app, restaura a sessão a partir do localStorage
  useEffect(() => {
    const restaurarSessao = async () => {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('userData');

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        // Valida o token no backend e busca dados atualizados do usuário
        const data = await api.fetchClienteLogado(savedToken);
        if (data.success && data.cliente) {
          setUser(data.cliente);
          setToken(savedToken);
        } else {
          throw new Error('Token inválido');
        }
      } catch (err) {
        // ✅ CORRIGIDO: só faz fallback pros dados salvos se for erro de rede
        // (backend fora do ar), nunca quando o token foi rejeitado de fato.
        // Ajuste "isNetworkError" conforme a lib que você usa (axios, fetch, etc.)
        const isNetworkError = !err.response && err.message !== 'Token inválido';

        if (isNetworkError && savedUser) {
          console.warn('⚠️ [AUTH] Falha de rede ao validar sessão, usando dados salvos localmente:', err);
          try {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
          } catch {
            // JSON corrompido: limpa tudo por segurança
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
          }
        } else {
          console.warn('⚠️ [AUTH] Sessão expirada ou inválida, limpando localStorage:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userRole');
        }
      } finally {
        setLoading(false);
      }
    };

    restaurarSessao();
  }, []);

  const login = (userData, authToken) => {
    console.log('✅ [AUTH] Usuário logado:', userData);
    setUser(userData);
    setToken(authToken);
    // ✅ Persiste no localStorage pra sobreviver a refresh/fechar aba
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('🚪 [AUTH] Logout realizado');
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
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