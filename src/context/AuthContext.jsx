// src/context/AuthContext.jsx (Revisado)

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Estado para o cliente (pode ser null se não estiver logado)
    const [cliente, setCliente] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null); // Armazena o token de autenticação

    useEffect(() => {
        const storedCliente = localStorage.getItem('cliente');
        const storedToken = localStorage.getItem('token');
        
        let initialCliente = null;
        let initialToken = null;
        
        // 1. Carregar Dados do Cliente
        if (storedCliente) {
            try {
                initialCliente = JSON.parse(storedCliente);
            } catch (error) {
                console.error('Erro ao parsear cliente do localStorage. Limpando dados.', error);
                localStorage.removeItem('cliente');
                // Se o cliente falhou, melhor limpar o token também para evitar inconsistência
                localStorage.removeItem('token'); 
            }
        }
        
        // 2. Carregar Token
        if (storedToken) {
            initialToken = storedToken;
        }

        // 3. Aplicar Estado
        // 🚨 OTIMIZAÇÃO: Se tivermos token mas os dados do cliente falharam, tratamos como deslogado
        if (initialCliente && initialToken) {
             setCliente(initialCliente);
             setToken(initialToken);
        } else {
             // Garante que o estado inicial seja limpo se houver inconsistência
             localStorage.removeItem('cliente');
             localStorage.removeItem('token');
        }
        
        setLoading(false);
    }, []);

    // Função para LOGIN
    const login = (clienteData, authToken) => { // Token agora é obrigatório no login
        if (!authToken) {
            console.error("ERRO: Token de autenticação faltando na chamada de login.");
            // Você pode forçar um erro ou simplesmente sair aqui.
            return;
        }

        setCliente(clienteData);
        setToken(authToken);
        
        localStorage.setItem('cliente', JSON.stringify(clienteData)); 
        localStorage.setItem('token', authToken);
    };

    // Função para LOGOUT
    const logout = () => {
        setCliente(null);
        setToken(null);
        localStorage.removeItem('cliente');
        localStorage.removeItem('token');
    };

    // Função para atualizar dados do cliente (útil após verificação de email)
    const updateCliente = (clienteData) => {
        setCliente(clienteData);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
    };

    // Função para obter o token (sempre retorna do estado ou do storage)
    const getAuthToken = () => {
        return token || localStorage.getItem('token');
    };
    
    // Indica que o usuário está logado e pode acessar rotas protegidas.
    // Agora, para o frontend renderizar como logado, exige cliente E token.
    const isUserLoggedIn = !!cliente && !!token; 
    
    // Indica que existe uma sessão iniciada/dados de usuário (útil para tela de validação)
    const hasClienteData = !!cliente; 

    return (
        <AuthContext.Provider value={{ 
            cliente, 
            isUserLoggedIn, 
            hasClienteData,
            token,
            login, 
            logout, 
            updateCliente,
            getAuthToken,
            loading 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};