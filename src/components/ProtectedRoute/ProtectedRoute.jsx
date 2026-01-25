import { Navigate } from 'react-router-dom';

// Adicionamos a prop 'adminOnly' para decidir quando exigir ser admin ou não
function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  // 1. Ninguém entra sem token
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // 2. Se a rota for só para admin e o cara não for admin, barra ele
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  // 3. Se for uma rota comum (agendamento) ou se ele passou no teste de admin
  return children;
}

export default ProtectedRoute;