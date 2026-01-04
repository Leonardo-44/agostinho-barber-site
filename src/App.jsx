import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Agendamento from './pages/Agendamento.jsx';
import EsqueciSenha from "./pages/EsqueciSenha.jsx";
import PainelBarbeiro from './pages/PainelBarbeiro.jsx';
import ValidacaoEmail from "./pages/ValidacaoEmail.jsx";
import ValidacaoWhatsapp from "./pages/ValidacaoWhatsapp.jsx";

// 🚨 NOVO: Importe o componente de proteção de rota
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'; // ⬅️ Ajuste o caminho conforme sua estrutura

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/agendamento" element={<Agendamento/>} />
          <Route path="/esqueci-senha" element={<EsqueciSenha/>} />
          <Route path="/validacao-email" element={<ValidacaoEmail/>} />
          <Route path="/validacao-whatsapp" element={<ValidacaoWhatsapp/>} />
          
          {/* 🚨 ROTA PROTEGIDA: Apenas Barbeiros */}
          <Route 
            path="/painel" 
            element={
              // Envolva o PainelBarbeiro no ProtectedRoute
              <ProtectedRoute>
                <PainelBarbeiro/>
              </ProtectedRoute>
            } 
          />
          
        </Routes> 
      </BrowserRouter>
    </>
  )
}

export default App;