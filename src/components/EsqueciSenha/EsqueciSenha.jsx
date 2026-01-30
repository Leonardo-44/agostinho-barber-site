import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../Login.css';

const EsqueciSenha = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', message: '' });

        if (!email.trim()) {
            setStatusMessage({ type: 'error', message: '❌ Por favor, digite seu e-mail.' });
            return;
        }

        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatusMessage({ type: 'error', message: '❌ Por favor, digite um e-mail válido.' });
            return;
        }

        setLoading(true);

        try {
            const response = await api.requestPasswordReset(email);

            setStatusMessage({
                type: 'success',
                message: response.message || 
                    `✅ Perfeito! Se encontrarmos este e-mail, enviamos as instruções para ${email}. Verifique sua caixa de entrada e spam.`
            });

            // Limpa o campo após o envio
            setEmail('');

        } catch (error) {
            console.error("❌ Erro ao solicitar redefinição:", error);

            const errorMessage = error?.error || 
                'Erro ao tentar enviar o e-mail. Verifique sua conexão e tente novamente.';
            setStatusMessage({ type: 'error', message: `❌ ${errorMessage}` });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <div className="login-header">
                    <div className="logo-icon">🔑</div>
                    <h1>Esqueceu a <span>Senha?</span></h1>
                    <p>Informe seu e-mail para receber o link de recuperação.</p>
                </div>

                {statusMessage.message && (
                    <div className={`message ${statusMessage.type === 'error' ? 'error-message' : 'success-message'}`}>
                        <p>{statusMessage.message}</p>
                    </div>
                )}

                {statusMessage.type !== 'success' && (
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
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                        </button>
                    </form>
                )}

                <div className="login-footer">
                    <a href="/login">Lembrei minha senha! Fazer Login</a>
                    <p style={{ marginTop: '10px' }}>
                        Não tem conta? <a href="/cadastro" className="highlight-link">Cadastre-se</a>
                    </p>
                </div>

                <button 
                    onClick={() => navigate('/')} 
                    className="btn btn-secondary"
                    disabled={loading}
                    style={{ marginTop: '16px' }}
                >
                    Voltar para Home
                </button>
            </div>
        </div>
    );
};

export default EsqueciSenha;