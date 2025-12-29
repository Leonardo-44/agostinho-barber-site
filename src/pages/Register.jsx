import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerClient } from "../services/api";
import "./Login.css";

const Register = () => {
  // ✅ CORREÇÃO 1: navigate deve vir ANTES de ser usado
  const navigate = useNavigate();

  // Estados para os campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
    
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    
  // Estado para controlar a visibilidade da senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    // ✅ CORREÇÃO 2: Validação de senhas melhorada
    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem!");
      return;
    }

    // ✅ CORREÇÃO 3: Validação de senha forte (opcional)
    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setLoading(true);

    try {
        const dataToSubmit = {
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email,
            senha: formData.senha,
        };

        await registerClient(dataToSubmit);

        setSuccess(`✅ Cadastro de ${formData.nome} realizado! Redirecionando para login...`);
        
        // Limpar formulário
        setFormData({ nome: '', telefone: '', email: '', senha: '', confirmarSenha: '' });
        
        // Redireciona para o login após 2 segundos
        setTimeout(() => {
            navigate('/login');
        }, 2000);
        
    } catch (err) {
        // ✅ CORREÇÃO 4: Tratamento de erro mais robusto
        const errorMessage = err?.response?.data?.error || err?.message || 'Erro ao cadastrar. Tente novamente.';
        setError(`❌ ${errorMessage}`);
        console.error("Erro de Cadastro:", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card cadastro-card">
        
        <div className="login-header">
          <div className="logo-icon">✂️</div>
          <h1>Crie sua <span>Conta</span></h1>
          <p>Junte-se ao Agostinho Barber</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
            {/* ✅ CORREÇÃO 5: Mensagens com melhor acessibilidade */}
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
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              placeholder="Ex: João da Silva"
              value={formData.nome}
              onChange={handleChange}
              required
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="input-group password-group">
            <label htmlFor="senha">Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                placeholder="Crie uma senha forte (mín. 6 caracteres)"
                value={formData.senha}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
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
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

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
                disabled={loading}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
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
                aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarConfirmarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>Já tem uma conta? <a href="/login" className="highlight-link">Fazer Login</a></p>
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

export default Register;