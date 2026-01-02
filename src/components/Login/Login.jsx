import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginClient } from "../../services/api";
import '../Login.css'; 

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    setLoading(true);

    try {
      const response = await loginClient(email, password);
      
      // Salvar token ou dados do usuário no localStorage (se o backend retornar)
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      if (response.cliente) {
        localStorage.setItem('clienteData', JSON.stringify(response.cliente));
      }
      
      setSuccess(`✅ Bem-vindo de volta, ${response.cliente?.nome || 'usuário'}!`);
      
      // Redirecionar após 1 segundo
      setTimeout(() => {
        navigate('/'); // ou '/dashboard' dependendo da sua rota
      }, 1000);
      
    } catch (err) {
      const errorMessage = err?.error || err?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(`❌ ${errorMessage}`);
      console.error("Erro de Login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="login-header">
          <div className="logo-icon">✂️</div>
          <h1>
            Agostinho <span>Barber</span>
          </h1>
          <p>Entre para agendar seu estilo</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {success && (
            <div style={{ 
              color: '#22c55e', 
              backgroundColor: '#dcfce7', 
              padding: '12px', 
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              {success}
            </div>
          )}
          
          {error && (
            <div style={{ 
              color: '#ef4444', 
              backgroundColor: '#fee2e2', 
              padding: '12px', 
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
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

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
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

        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary"
          disabled={loading}
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default Login;