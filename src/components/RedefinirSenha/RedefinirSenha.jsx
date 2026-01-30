import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../Login.css";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const RedefinirSenha = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const token = query.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatusMessage({
        type: "error",
        message:
          "Link inválido. O token de redefinição está ausente. Por favor, solicite a redefinição novamente.",
      });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", message: "" });

    // Validação: senhas coincidem
    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: "error",
        message: "As senhas não coincidem. Tente novamente.",
      });
      return;
    }

    // Validação: tamanho mínimo
    if (newPassword.length < 8) {
      setStatusMessage({
        type: "error",
        message: "A nova senha deve ter no mínimo 8 caracteres.",
      });
      return;
    }

    // Validação: token presente
    if (!token) {
      setStatusMessage({
        type: "error",
        message: "Token de redefinição ausente. Não é possível continuar.",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await api.resetPassword(token, newPassword, confirmPassword);

      setStatusMessage({
        type: "success",
        message:
          "✅ Sua senha foi redefinida com sucesso! Você será redirecionado para o login.",
      });

      // Limpar campos de senha por segurança
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error?.error ||
        error?.message ||
        "Erro ao redefinir a senha. Tente novamente ou solicite um novo link.";
      setStatusMessage({ type: "error", message: errorMessage });
      console.error("Erro na redefinição de senha:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tela de carregamento inicial
  if (!token && statusMessage.type !== "error") {
    return (
      <div className="login-container">
        <div className="login-card">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">🔒</div>
          <h1>
            Nova <span>Senha</span>
          </h1>
          <p>Digite sua nova senha. O token é válido por 1 hora.</p>
        </div>

        {statusMessage.message && (
          <div
            className={`message ${
              statusMessage.type === "error" ? "error-message" : "success-message"
            }`}
          >
            <p>{statusMessage.message}</p>
          </div>
        )}

        {statusMessage.type !== "success" && token && (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  style={{ paddingRight: "40px" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#666",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirme a Nova Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirme a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  style={{ paddingRight: "40px" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#666",
                  }}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </button>
          </form>
        )}

        <div className="login-footer">
          <a href="/login">Voltar para o Login</a>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;