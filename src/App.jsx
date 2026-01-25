import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Agendamento from './pages/Agendamento.jsx';
import EsqueciSenha from "./pages/EsqueciSenha.jsx";
import PainelBarbeiro from './pages/PainelBarbeiro.jsx';
import ValidacaoEmail from "./pages/ValidacaoEmail.jsx";
import RedefinirSenhaUser from "./pages/RedefinirSenha.jsx";
import MeusAgendamentos from "./pages/MeusAgendamentos.jsx";

// 1. Importe o AuthProvider que criamos no passo anterior
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';

function App() {
  return (
    <AuthProvider> {/* 2. Envolva todo o conteúdo com o AuthProvider */}
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha/>} />
          <Route path="/validacao-email" element={<ValidacaoEmail/>} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaUser/>}/>
          <Route path="/meus-agendamentos" element={<MeusAgendamentos/>}/>
          
          {/* 3. AGORA PROTEGIDA: A pessoa só agenda se estiver logada */}
          <Route 
            path="/agendamento" 
            element={
              <ProtectedRoute>
                <Agendamento/>
              </ProtectedRoute>
            } 
          />

          {/* ROTA PROTEGIDA: Apenas Admin/Barbeiro */}
          <Route 
            path="/painel" 
            element={
              <ProtectedRoute adminOnly={true}> {/* Use a prop adminOnly aqui */}
                <PainelBarbeiro/>
              </ProtectedRoute>
            } 
          />       
        </Routes> 
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;