import React from "react";
import "./Layout.css";
import { useNavigate } from "react-router-dom";

//ASSETS
import Agenda from "../assets/agenda.svg";
import Relogio from "../assets/relogio.svg";
import Medalha from "../assets/medalha.svg";
import Endereco from "../assets/endereco.svg";
import Telefone from "../assets/telefone.svg";
import RedesSociais from "../assets/redesSociais.svg";

import Instagram from "../assets/Redes Sociais/instagram.svg";
import Whatsapp from "../assets/Redes Sociais/whatsapp.svg";
import Youtube from "../assets/Redes Sociais/youtube.svg";

const Layout = () => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="fundo-apresentation d-flex jc-center alg-center fd-column"
        id="home"
      >
        <h1>
          Agostinho <span className="destaque">Barber</span>
        </h1>
        <p>
          Experiência clássica de barbearia com técnicas modernas. <br /> Agende
          seu horário e sinta a diferença de um atendimento exclusivo.
        </p>

        <div className="d-flex gap32">
          <button
            onClick={() => navigate("/agendamento")}
            className="btn btn-primary d-flex jc-center alg-center gap16"
            id="btnApres1"
          >
            <img src={Agenda} alt="Agenda" id="agenda" />
            Agende aqui
          </button>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-secondary"
            id="btnApres2"
          >
            Já tenho conta
          </button>
        </div>
      </div>

      {/*SESSÃO DIFERENCIAIS*/}

      <div className="fundo-diferenciais d-flex alg-center">
        <div className="container d-flex jc-between">
          <article className="card-diferenciais d-flex fd-column alg-center jc-center txt-left txt">
            <div>
              <div className="fundo-logo-diferenciais d-flex alg-center jc-center">
                <img src={Agenda} alt="Agenda" />
              </div>
              <div>
                <h4>Agendamentos Online</h4>
                <p>Escolha o melhor horário para você, direto do seu celular</p>
              </div>
            </div>
          </article>

          <article className="card-diferenciais d-flex fd-column alg-center jc-center txt-left txt">
            <div>
              <div className="fundo-logo-diferenciais d-flex alg-center jc-center">
                <img src={Relogio} alt="Agenda" />
              </div>
              <div>
                <h4>Sem Espera</h4>
                <p>Chegue no horário marcado e seja atendido imediatamente</p>
              </div>
            </div>
          </article>

          <article className="card-diferenciais d-flex fd-column alg-center jc-center txt-left txt">
            <div>
              <div className="fundo-logo-diferenciais d-flex alg-center jc-center">
                <img src={Medalha} alt="Agenda" />
              </div>
              <div>
                <h4>Profissionais Experientes</h4>
                <p>Anos de experiência em cortes clássicos e modernos</p>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/*SESSÃO CONTATO*/}
      <div className="fundo-contato" id="contato">
        <div className="container d-flex jc-center margin-h2">
          <div className="d-flex fd-column alg-center">
            <h2>Contato</h2>
            <p>Visite-nos ou entre em contato</p>
          </div>
        </div>

        <div className="d-flex jc-center alg-center">
          <div className="container d-flex alg-center jc-between container-contato">
            <article className="card-contato">
              <div className="d-flex fd-column gap16">
                <div className="d-flex alg-center gap8">
                  <div className="fundo-logo-contato d-flex alg-center jc-center">
                    <img src={Endereco} alt="Endereço" />
                  </div>
                  <h4>Endereço</h4>
                </div>
                <p>
                  Barro duro, 123 <br /> Atalho - São José do Piauí, PI <br />{" "}
                  CEP: 64625-000
                </p>
              </div>
            </article>

            <article className="card-contato">
              <div className="d-flex fd-column gap16">
                <div className="d-flex alg-center gap8">
                  <div className="fundo-logo-contato d-flex alg-center jc-center">
                    <img src={Telefone} alt="Telefone" />
                  </div>
                  <h4>Telefone</h4>
                </div>
                <p>(89) 98815-1035</p>
              </div>
            </article>

            <article className="card-contato">
              <div className="d-flex fd-column gap16">
                <div className="d-flex alg-center gap8">
                  <div className="fundo-logo-contato d-flex alg-center jc-center">
                    <img src={Relogio} alt="Relogio" />
                  </div>
                  <h4>Funcionamento</h4>
                </div>
                <p>
                  Terça a Sábado: 7h às 21h <br />
                  Domingo: 8h às 12h <br />
                  Segunda: Fechado
                </p>
              </div>
            </article>

            <article className="card-contato">
              <div className="d-flex fd-column gap16">
                <div className="d-flex alg-center gap8">
                  <div className="fundo-logo-contato d-flex alg-center jc-center">
                    <img src={RedesSociais} alt="Redes Sociais" />
                  </div>
                  <h4>Redes sociais</h4>
                </div>

                <div className="d-flex gap16">
                  <div className="fundo-logo-redes d-flex jc-center alg-center">
                    <a
                      href="https://www.instagram.com/agostinho_barber/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex"
                    >
                      <img src={Instagram} alt="Instagram" />
                    </a>
                  </div>

                  <div className="fundo-logo-redes d-flex jc-center alg-center">
                    <a
                      href="https://wa.me/558988151035?text=Olá"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex"
                    >
                      <img src={Whatsapp} alt="WhatsApp" />
                    </a>
                  </div>



                  <div className="fundo-logo-redes d-flex jc-center alg-center">
                    <a
                      href="https://www.youtube.com/channel/UCevV1jLRJtnvlP8cONzUlVA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex"
                    >
                      <img src={Youtube} alt="Youtube" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
