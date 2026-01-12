import React, { useState } from 'react';
import api from '../../services/api';
import '../Login.css';

const EsqueciSenha = () => {
    const [email, setEmail] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' }); // Para sucesso/erro
    const [loading, setLoading] = useState(false); // Para botão de carregamento

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', message: '' }); // Limpa mensagens anteriores

        if (!email) {
            setStatusMessage({ type: 'error', message: 'Por favor, digite seu e-mail.' });
            return;
        }

        setLoading(true); // Inicia o carregamento

        try {
            // Chamada REAL ao endpoint do backend: /auth/password/forgot
            const response = await api.requestPasswordReset(email);

            // O backend retorna sucesso genérico (por segurança) se encontrar ou não o email.
            setStatusMessage({
                type: 'success',
                message: response.message || `Perfeito! Se encontrarmos este e-mail, enviamos as instruções para ${email}. Verifique sua caixa de entrada.`
            });

            // Limpa o campo após o envio
            setEmail('');

        } catch (error) {
            console.error("Erro ao solicitar redefinição:", error);

            // Se houver erro de conexão ou outro erro interno, exibe a mensagem
            const errorMessage = error.error || 'Erro interno ao tentar enviar o e-mail. Tente novamente.';
            setStatusMessage({ type: 'error', message: errorMessage });

        } finally {
            setLoading(false);
        }
    };

    // Define a classe da mensagem
    const messageClass = statusMessage.type === 'error' ? 'error-message' : 'success-message';

    return (
        <div className="login-container">
            <div className="login-card">

                <div className="login-header">
                    <div className="logo-icon">🔑</div>
                    <h1>Esqueceu a <span>Senha?</span></h1>
                    <p>Informe seu e-mail para receber o link de recuperação.</p>
                </div>

                {/* Exibe a mensagem de status (sucesso/erro) */}
                {statusMessage.message && (
                    <div className={`message ${messageClass}`}>
                        <p>{statusMessage.message}</p>
                    </div>
                )}

                {/* Mostra o formulário apenas se não houver mensagem de sucesso final */}
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
                            />
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
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