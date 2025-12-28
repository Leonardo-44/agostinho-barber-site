import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Register = () => {
  // Estados para os campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  // Estado para controlar a visibilidade da senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }
    console.log('Dados de cadastro:', formData);
    alert(`Cadastro realizado com sucesso para ${formData.nome}!`);
  };

  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-card cadastro-card">
        
        <div className="login-header">
          <div className="logo-icon">✂️</div>
          <h1>Crie sua <span>Conta</span></h1>
          <p>Junte-se ao Agostinho Barber</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="input-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              placeholder="Ex: João da Silva"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="exemplo@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo de Senha com botão de visualizar */}
          <div className="input-group password-group">
            <label htmlFor="senha">Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                placeholder="Crie uma senha forte"
                value={formData.senha}
                onChange={handleChange}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Campo de Confirmar Senha */}
          <div className="input-group password-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                id="confirmarSenha"
                placeholder="Repita a senha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                {mostrarConfirmarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login">
            Cadastrar
          </button>
        </form>

        <div className="login-footer">
          <p>Já tem uma conta? <a href="/login" className="highlight-link">Fazer Login</a></p>
        </div>
        <button onClick={() => navigate('/')} className="btn btn-secondary">Voltar</button>
      </div>
    </div>
  );
};

export default Register;