// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importe o hook

// Este componente usa o Outlet do React Router v6 para renderizar as rotas filhas
const ProtectedRoute = () => {
    const { isUserLoggedIn, loading } = useAuth();
    
    // Se ainda estiver carregando, mostra um loader (opcional)
    if (loading) {
        return <div>Carregando...</div>; 
    }

    // 🚨 REGRA PRINCIPAL: Se não estiver logado, redireciona para a página de login
    if (!isUserLoggedIn) {
        // Redireciona para o caminho da sua rota de login
        return <Navigate to="/login" replace />;
    }

    // Se estiver logado, renderiza o componente da rota (ex: Agendamento)
    return <Outlet />;
};

export default ProtectedRoute;