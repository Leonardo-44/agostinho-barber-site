import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerClient } from "../../services/api";
import "../Login.css";

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

  // Função auxiliar para limpar o WhatsApp e garantir +55
  const getCleanWhatsappNumber = (formattedNumber) => {
    let cleaned = formattedNumber.replace(/\D/g, "");

    // Remove o 55 se estiver no início para evitar duplicação
    if (cleaned.startsWith("55")) {
      cleaned = cleaned.slice(2);
    }

    // Adiciona +55 no início
    return `+55${cleaned}`;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Tratamento especial para WhatsApp
    if (id === "whatsapp") {
      // Se o campo está vazio, deixa vazio
      if (value === "" || value === "+55") {
        setFormData({ ...formData, [id]: "" });
        return;
      }

      // Remove caracteres não numéricos
      let cleaned = value.replace(/\D/g, "");

      // Se já começa com 55, remove apenas UMA vez
      if (cleaned.startsWith("55")) {
        cleaned = cleaned.slice(2);
      }

      // Limita a 11 dígitos (DDD + número)
      cleaned = cleaned.slice(0, 11);

      let formatted = "";

      // Formata: +55 (XX) XXXXX-XXXX
      if (cleaned.length > 0) {
        formatted = "+55 (" + cleaned.slice(0, 2);
        
        if (cleaned.length > 2) {
          formatted += ") " + cleaned.slice(2, 7);
          
          if (cleaned.length > 7) {
            formatted += "-" + cleaned.slice(7, 11);
          }
        }
      }

      setFormData({ ...formData, [id]: formatted });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações básicas
    if (!formData.nome.trim()) {
      setError("❌ Nome é obrigatório!");
      return;
    }

    if (!formData.sobrenome.trim()) {
      setError("❌ Sobrenome é obrigatório!");
      return;
    }

    if (!formData.email.trim()) {
      setError("❌ Email é obrigatório!");
      return;
    }

    // Valida WhatsApp
    const cleanedWhatsapp = formData.whatsapp.replace(/\D/g, "");
    if (cleanedWhatsapp.length < 13) {
      setError("❌ WhatsApp inválido! Use o formato +55 (XX) XXXXX-XXXX");
      return;
    }

    // Validação de senhas
    if (formData.senha !== formData.confirmarSenha) {
      setError("❌ As senhas não coincidem!");
      return;
    }

    if (formData.senha.length < 6) {
      setError("❌ A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setLoading(true);

    try {
      // Prepara o número de WhatsApp limpo para envio
      const rawWhatsappNumber = getCleanWhatsappNumber(formData.whatsapp);

      // 🚀 CHAMA A API: Cadastra o usuário e o Back-end envia o código OTP
      await registerClient({
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        whatsapp: rawWhatsappNumber, // Envia no formato +55XXXXXXXXXXX
        email: formData.email,
        senha: formData.senha,
      });

      setSuccess(
        `✅ Cadastro realizado! Enviamos um código para ${formData.email}.`
      );

      // ➡️ REDIRECIONA PARA VALIDAÇÃO PASSANDO O EMAIL NA ROTA
      setTimeout(() => {
        navigate("/validacao-email", {
          state: { email: formData.email, whatsapp: rawWhatsappNumber },
        });
      }, 1500);
    } catch (err) {
      const errorMessage =
        err.error || "Erro ao cadastrar. Verifique os dados e tente novamente.";
      setError(`❌ ${errorMessage}`);
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
          {success && (
            <div className="success-message" style={{ marginBottom: "15px" }}>
              {success}
            </div>
          )}
          {error && (
            <div
              style={{
                color: "#dc3545",
                textAlign: "center",
                marginBottom: "15px",
              }}
            >
              {error}
            </div>
          )}

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
            <label htmlFor="whatsapp">WhatsApp (Com DDD)</label>
            <input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="+55 (11) 98765-4321"
              required
              maxLength={19}
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
                style={{ paddingRight: "40px", width: "100%" }}
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
            <label htmlFor="confirmarSenha">Confirme a senha</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmarSenha"
              placeholder="Repita a senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Já tem uma conta? <a href="/login">Fazer Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;