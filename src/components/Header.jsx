import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// ASSETS
import Tesoura from "../assets/tesoura.svg";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
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
            <button onClick={() => handleNavigation('/login')} className="btn btn-primary">
              Entrar
            </button>
            <button onClick={() => handleNavigation('/cadastro')} className="btn btn-secondary">
              Cadastre-se
            </button>
            <button onClick={() => handleNavigation('/painel')} className="btn btn-secondary">
              Ver horários
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;