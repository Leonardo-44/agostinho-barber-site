// components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // ⚠️ ESTA É APENAS A VERIFICAÇÃO FRONT-END.
  // O token real deve ser verificado e decodificado.
  const authToken = localStorage.getItem('authToken'); 
  const userRole = 'barbeiro'; // ⬅️ DEVE SER EXTRAÍDO DO TOKEN DECODIFICADO

  if (!authToken || userRole !== 'barbeiro') {
    // Redireciona para a página de login se não for autorizado
    return <Navigate to="/login" replace />;
  }

  // Renderiza os componentes filhos (PainelBarbeiro) se estiver autenticado e for barbeiro
  return children ? children : <Outlet />;
};

export default ProtectedRoute;