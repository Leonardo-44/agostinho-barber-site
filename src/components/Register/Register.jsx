import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Certifique-se que o caminho para 'registerClient' está correto
import { registerClient } from "../../services/api"; 
import '../Login.css'; 

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
    const { id, value } = e.target;

    if (id === "whatsapp") {
      let cleanValue = value.replace(/\D/g, "");
      let maskedValue = "";

      if (cleanValue.length > 0) maskedValue += "(" + cleanValue.substring(0, 2);
      if (cleanValue.length > 2) maskedValue += ") " + cleanValue.substring(2, 7);
      if (cleanValue.length > 7) maskedValue += "-" + cleanValue.substring(7, 11);

      setFormData({ ...formData, [id]: maskedValue.substring(0, 15) });
    } else {
      setFormData({ ...formData, [id]: value });
    }
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
      // 🚀 CHAMA A API: Cadastra o usuário e o Back-end envia o código OTP
      await registerClient({
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        whatsapp: formData.whatsapp,
        email: formData.email,
        senha: formData.senha,
      });

      setSuccess(`✅ Cadastro realizado! Enviamos um código para ${formData.email}.`);

      // ➡️ REDIRECIONA PARA VALIDAÇÃO PASSANDO O EMAIL NA ROTA
      setTimeout(() => {
        navigate("/validacao-email", { state: { email: formData.email } });
      }, 1500); 

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
          {success && <div className="success-message" style={{marginBottom: '15px'}}>{success}</div>}
          {error && <div style={{color: '#dc3545', textAlign: 'center', marginBottom: '15px'}}>{error}</div>}

          <div className="input-group">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu primeiro nome"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="sobrenome">Sobrenome</label>
            <input
              id="sobrenome"
              value={formData.sobrenome}
              placeholder="Seu sobrenome"
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
              placeholder="(00) 00000-0000"
              required
              maxLength={15}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemplo@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="senha"
                placeholder="Mínimo 6 caracteres"
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
                  position: "absolute", right: "10px", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", fontSize: "18px",
                  color: "#666"
                }}
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
                placeholder="Repita a senha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingRight: "40px" }}
              />
            </div>
          </div>

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Já tem uma conta?{" "}
            <a href="/login">Fazer Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;