import React, { useState, useEffect } from "react";
import "./Header.css";
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, Calendar } from 'lucide-react';

// ASSETS
import Tesoura from "../../assets/tesoura.svg";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  // Verifica se o usuário está logado ao carregar o componente
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const name = localStorage.getItem("userName");
      const role = localStorage.getItem("userRole");
      
      // console.log('🔍 [Header] Verificando auth:', { token: !!token, name, role });
      
      if (token) {
        setIsLoggedIn(true); 
        setUserName(name || "Usuário");
        setUserRole(role || "");
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
      }
    };
    
    checkAuth();
    
    // Verificar a cada 500ms se o localStorage mudou
    const interval = setInterval(checkAuth, 500);
    return () => clearInterval(interval);
  }, []);

  // Sincroniza entre abas do navegador
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      const name = localStorage.getItem("userName");
      const role = localStorage.getItem("userRole");
      
      if (token) {
        setIsLoggedIn(true);
        setUserName(name || "Usuário");
        setUserRole(role || "");
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    // Remove todos os dados do localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    
    setIsLoggedIn(false);
    setUserName("");
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container-header">
        <div className="gap16 d-flex alg-center jc-center">
          <div className="fundo-logo d-flex alg-center jc-center">
            <img src={Tesoura} alt="Tesoura" />
          </div>
          <h4>
            Agostinho <span className="destaque">Barber</span>
          </h4>
        </div>

        {/* Menu Hambúrguer */}
        <button 
          className="hamburger-btn" 
          onClick={toggleMenu}
          aria-label="Menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Menu Desktop e Mobile */}
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''} d-flex gap16`}>
          <ul className="d-flex gap16">
            <li><a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li><a href="#contato" onClick={() => setIsMenuOpen(false)}>Contato</a></li>
          </ul>

          <div className="btn-group d-flex gap16">
            {isLoggedIn ? (
              /* --- O QUE APARECE QUANDO ESTÁ LOGADO --- */
              <>
                {/* Botão "Meus Agendamentos" só aparece para clientes */}
                {userRole === "cliente" && (
                  <button onClick={() => handleNavigation('/meus-agendamentos')} className="btn btn-secondary d-flex alg-center gap8" title="Ver seus agendamentos">
                    <Calendar size={18} /> Meus Agendamentos
                  </button>
                )}

                {/* Botão "Painel" só aparece para admin */}
                {userRole === "admin" && (
                  <button onClick={() => handleNavigation('/painel')} className="btn btn-secondary d-flex alg-center gap8" title="Painel do barbeiro">
                    <Calendar size={18} /> Painel
                  </button>
                )}

                <button onClick={() => handleNavigation('/painel')} className="btn btn-primary d-flex alg-center gap8">
                  <User size={18} /> {userName}
                </button>
                
                <button onClick={handleLogout} className="btn btn-secondary">
                  Sair
                </button>
              </>
            ) : (
              /* --- O QUE APARECE QUANDO NÃO ESTÁ LOGADO --- */
              <>
                <button onClick={() => handleNavigation('/login')} className="btn btn-primary">
                  Entrar
                </button>
                <button onClick={() => handleNavigation('/cadastro')} className="btn btn-secondary">
                  Cadastre-se
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;