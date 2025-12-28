import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // ← ADICIONE ESTA LINHA
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você colocaria a lógica de autenticação (API)
    console.log("Login efetuado:", { email, password });
    alert(`Bem-vindo de volta ao Agostinho Barber! \nEmail: ${email}`);
  };

  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Cabeçalho com Logo inspirada na imagem */}
        <div className="login-header">
          <div className="logo-icon">✂️</div> {/* Ícone de tesoura simples */}
          <h1>
            Agostinho <span>Barber</span>
          </h1>
          <p>Entre para agendar seu estilo</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <a href="/esqueci-senha">Esqueci minha senha</a>
          <p>
            Ainda não tem conta?{" "}
            <a href="/cadastro" className="highlight-link">
              Cadastre-se
            </a>
          </p>
        </div>

        <button onClick={() => navigate('/')} className="btn btn-secondary">Voltar</button>
      </div>
    </div>
  );
};

export default Login;