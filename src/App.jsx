import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Header from "./components/Header";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Agendamento from './pages/Agendamento.jsx';
import EsqueciSenha from "./pages/EsqueciSenha.jsx";
import PainelBarbeiro from './pages/PainelBarbeiro.jsx';


function App() {
  return (
    <>
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/agendamento" element={<Agendamento/>} />
        <Route path="/esqueci-senha" element={<EsqueciSenha/>} />
        <Route path="painel" element={<PainelBarbeiro/>} />
      </Routes> 
    </BrowserRouter>
    
    </>
  )
}

export default App;
