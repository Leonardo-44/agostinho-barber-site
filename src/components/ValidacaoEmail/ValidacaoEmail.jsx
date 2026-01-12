import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Login.css";

// Importa as funções de API para validação de e-mail
import { verifyEmailCode, resendEmailCode } from "../../services/api.js";

const ValidacaoEmail = () => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState(false);
  const [mensagemReenvio, setMensagemReenvio] = useState("");
  const [tempoRestante, setTempoRestante] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Pega apenas o e-mail passado na rota de cadastro
  const emailUsuario = location.state?.email;

  // Contador regressivo para rate limit
  useEffect(() => {
    if (tempoRestante > 0) {
      const timer = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [tempoRestante]);

  // Redireciona se não houver email (proteção de rota)
  useEffect(() => {
    console.log("--- DEBUG ValidacaoEmail ---");
    console.log("E-mail Recebido:", emailUsuario);
    console.log("----------------------------");

    if (!emailUsuario) {
      console.warn("Email ausente. Redirecionando para cadastro.");
      alert("Email não foi passado. Você precisa se cadastrar primeiro.");
      navigate("/cadastro", { replace: true });
    }
  }, [emailUsuario, navigate]);

  const handleInputChange = (e) => {
    const valor = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setCodigo(valor);
    setMensagemErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (codigo.length !== 6) {
      setMensagemErro("Por favor, digite o código de 6 dígitos.");
      return;
    }

    if (!emailUsuario) {
      setMensagemErro(
        "Dados de usuário ausentes. Por favor, reinicie o cadastro."
      );
      return;
    }

    setIsLoading(true);
    setMensagemErro("");

    try {
      // Chamada à API para validar o código
      const response = await verifyEmailCode(emailUsuario, codigo);

      if (response.success) {
        setMensagemSucesso(true);

        // Sucesso: Redireciona para a página principal ou dashboard
        setTimeout(() => {
          navigate("/"); // ou qualquer rota que você desejar após a validação
        }, 2500);
      }
    } catch (error) {
      const erroMsg =
        error.error ||
        error.message ||
        "Erro ao validar o código. Verifique se o código está correto ou tente reenviar.";
      setMensagemErro(erroMsg);
      console.error("Erro ao validar código:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviar = async (e) => {
    e.preventDefault();

    if (!emailUsuario) {
      setMensagemErro("E-mail ausente para reenvio.");
      return;
    }

    // Verificar se ainda está no rate limit
    if (tempoRestante > 0) {
      setMensagemErro(
        `Aguarde ${tempoRestante} segundos antes de solicitar novo código.`
      );
      return;
    }

    setMensagemReenvio("📧 Enviando novo código...");
    setMensagemErro("");

    try {
      // Chamada à API para reenviar código
      const response = await resendEmailCode(emailUsuario);

      // Verificar se o backend retornou rate limit
      if (response.tempoRestante) {
        setTempoRestante(response.tempoRestante);
        setMensagemErro(
          `Aguarde ${response.tempoRestante} segundos antes de solicitar novo código.`
        );
        setMensagemReenvio("");
        return;
      }

      setMensagemReenvio("✅ Um novo código foi enviado para seu e-mail!");

      // Mostrar código em DEV (se o backend retornar)
      if (response.codigo) {
        console.log("🔐 CÓDIGO DE DEV:", response.codigo);
        setMensagemReenvio(`✅ Código enviado! (DEV: ${response.codigo})`);
      }

      setTimeout(() => setMensagemReenvio(""), 5000);
    } catch (error) {
      console.error("❌ Erro ao reenviar código:", error);

      // Tratar erro de rate limit
      if (error.tempoRestante) {
        setTempoRestante(error.tempoRestante);
        setMensagemErro(
          `Aguarde ${error.tempoRestante} segundos antes de solicitar novo código.`
        );
      } else {
        const erroMsg =
          error.error ||
          error.message ||
          "Erro ao tentar reenviar o código. Tente novamente mais tarde.";
        setMensagemErro(erroMsg);
      }

      setMensagemReenvio("");
    }
  };

  // Não renderiza nada se o email estiver faltando
  if (!emailUsuario) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{ textAlign: "center", padding: "30px" }}>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">📩</div>
          <h1>
            Confirme seu <span>E-mail</span>
          </h1>
          <p>
            Enviamos o código para <strong>{emailUsuario}</strong>.
          </p>
        </div>

        {mensagemSucesso ? (
          <div className="success-message">
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>✅</div>
            <h3>E-mail Confirmado!</h3>
            <p>Validação concluída com sucesso! Redirecionando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="codigo">Código de Verificação</label>
              <input
                type="text"
                id="codigo"
                placeholder="000000"
                value={codigo}
                onChange={handleInputChange}
                style={{
                  letterSpacing: "8px",
                  textAlign: "center",
                  fontSize: "1.2rem",
                }}
                required
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            {mensagemErro && (
              <p
                style={{
                  color: "#dc3545",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  marginBottom: "10px",
                }}
              >
                ❌ {mensagemErro}
              </p>
            )}

            {mensagemReenvio && (
              <p
                style={{
                  color: "#28a745",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  marginBottom: "10px",
                }}
              >
                {mensagemReenvio}
              </p>
            )}

            <button
              type="submit"
              className="btn-login"
              disabled={codigo.length !== 6 || isLoading}
            >
              {isLoading ? "Validando..." : "Validar Código"}
            </button>

            <div
              style={{
                marginTop: "15px",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              <p>
                Não recebeu?
                <a
                  href="#!"
                  onClick={handleReenviar}
                  style={{
                    fontWeight: "bold",
                    marginLeft: "5px",
                    cursor: tempoRestante > 0 ? "not-allowed" : "pointer",
                    opacity: tempoRestante > 0 ? 0.5 : 1,
                    pointerEvents: tempoRestante > 0 ? "none" : "auto",
                  }}
                >
                  {tempoRestante > 0
                    ? `Reenviar em ${tempoRestante}s`
                    : "Reenviar Código"}
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ValidacaoEmail;
