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
    
    if (!email || !password) {
      setError("❌ Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      console.log('📝 [FORM] Iniciando login para:', email);
      
      // ✅ CORRIGIDO: Passar objeto com { email, senha }
      const response = await loginClient({ 
        email: email,
        senha: password  // ⚠️ Backend espera "senha", não "password"
      });
      
      console.log('✅ [LOGIN] Resposta recebida:', response);
      
      // Verificar se login foi bem-sucedido
      if (!response.success) {
        throw { error: response.error || 'Erro ao fazer login' };
      }

      // Salvar token no localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        console.log('💾 Token salvo no localStorage');
      }
      
      // Salvar dados do usuário
      if (response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('userEmail', response.user.email);
        localStorage.setItem('userName', response.user.nome);
        localStorage.setItem('userRole', response.user.role);
        console.log('💾 Dados do usuário salvos');
      }
      
      // Mensagem de sucesso
      const nomeUsuario = response.user?.nome || 'usuário';
      setSuccess(`✅ Bem-vindo de volta, ${nomeUsuario}!`);
      
      // Redirecionar após 1.5 segundos
      setTimeout(() => {
        const userRole = response.user?.role;
        
        // Redirecionar baseado no role
        if (userRole === 'admin') {
          navigate('/');
        } else {
          navigate('/'); // ou '/cliente/dashboard'
        }
      }, 1500);
      
    } catch (err) {
      console.error("❌ Erro de Login:", err);
      
      // Extrair mensagem de erro
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      
      if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Mensagens específicas por status
      if (err?.status === 401) {
        errorMessage = 'E-mail ou senha incorretos.';
      } else if (err?.status === 403) {
        errorMessage = 'Conta não verificada. Por favor, verifique seu e-mail.';
      } else if (err?.status === 404) {
        errorMessage = 'Usuário não encontrado. Você já se cadastrou?';
      } else if (err?.status === 500) {
        errorMessage = 'Erro no servidor. Tente novamente em instantes.';
      }
      
      setError(`❌ ${errorMessage}`);
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
              marginBottom: '16px',
              fontWeight: '500'
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
              marginBottom: '16px',
              fontWeight: '500'
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
          style={{ marginTop: '16px' }}
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default Login;