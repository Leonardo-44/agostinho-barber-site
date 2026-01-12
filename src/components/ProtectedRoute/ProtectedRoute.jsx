import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Aqui você verifica se o usuário está autenticado
  // Por exemplo, verificando um token no localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Se não tiver token, redireciona para login
    return <Navigate to="/login" replace />;
  }
  
  // Se tiver token, renderiza o componente protegido
  return children;
}

export default ProtectedRoute;