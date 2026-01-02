import React from "react";
import "./Footer.css";

// ASSETS
import Tesoura from "../../assets/tesoura.svg";

const Footer = () => {

  return (
    <header className="footer">
          <div className="container-footer">
            <div className="gap16 d-flex alg-center jc-center">
              <div className="fundo-logo d-flex alg-center jc-center">
                <img src={Tesoura} alt="Tesoura" />
              </div>
              <h4>
                Agostinho <span className="destaque">Barber</span>
              </h4>
            </div>
            <p>© 2025 Agostinho Barber. Todos os direitos reservados.</p>
          </div>
        </header>
  );
};

export default Footer;
