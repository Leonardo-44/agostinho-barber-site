import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerClient } from "../services/api";
import "./Login.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    whatsapp: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem!");
      return;
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setLoading(true);

    try {
      await registerClient({
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        telefone: formData.whatsapp,
        email: formData.email,
        senha: formData.senha,
      });

      setSuccess(`✅ Cadastro de ${formData.nome} realizado!`);

      setFormData({
        nome: "",
        sobrenome: "",
        whatsapp: "",
        email: "",
        senha: "",
        confirmarSenha: "",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("❌ Erro ao cadastrar. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card cadastro-card">
        <div className="login-header">
          <div className="logo-icon">✂️</div>
          <h1>
            Criar <span>Conta</span>
          </h1>
          <p>Agostinho Barber</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {success && <p className="success-msg">{success}</p>}
          {error && <p className="error-msg">{error}</p>}

          <div className="input-group">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="sobrenome">Sobrenome</label>
            <input
              id="sobrenome"
              value={formData.sobrenome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="whatsapp">WhatsApp</label>
            <input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="senha"
                placeholder="Sua senha"
                value={formData.senha}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "18px",
                }}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmarSenha">Confirme a senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmarSenha"
                placeholder="Confirme sua senha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingRight: "40px" }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "18px",
                }}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <div className="login-footer">
          {" "}
          <p>
            Já tem uma conta?{" "}
            <a href="/login" className="highlight-link">
              Fazer Login
            </a>
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => navigate("/")}
          className="btn btn-secondary"
          disabled={loading}
        >
          {" "}
          Voltar{" "}
        </button>
      </div>
    </div>
  );
};

export default Register;
 