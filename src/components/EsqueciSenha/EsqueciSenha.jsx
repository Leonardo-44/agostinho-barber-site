import React, { useState } from 'react';
import '../Login.css'; 

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulação do envio do link/código por e-mail
    console.log(`Solicitação de redefinição para: ${email}`);
    
    // Define a mensagem de sucesso após a simulação
    setMensagemSucesso(`Perfeito! Se encontrarmos este e-mail, enviamos as instruções para ${email}. Verifique sua caixa de entrada.`);
    
    // Limpar o campo de email opcionalmente:
    // setEmail('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="login-header">
          <div className="logo-icon">🔑</div> {/* Ícone de chave para redefinição */}
          <h1>Esqueceu a <span>Senha?</span></h1>
          <p>Informe seu e-mail para receber o link de recuperação.</p>
        </div>

        {mensagemSucesso ? (
          // Exibe a mensagem de sucesso se a solicitação foi enviada
          <div className="success-message">
            <p>{mensagemSucesso}</p>
            <p className="highlight-link" style={{ marginTop: '15px' }}>
              <a href="/login">Voltar para o Login</a>
            </p>
          </div>
        ) : (
          // Formulário de envio de email
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

            <button type="submit" className="btn-login">
              Enviar Link de Redefinição
            </button>
          </form>
        )}

        <div className="login-footer">
          <a href="/login">Lembrei minha senha! Fazer Login</a>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;