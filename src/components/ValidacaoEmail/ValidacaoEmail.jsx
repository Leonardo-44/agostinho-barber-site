import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import '../Login.css';

// 🔑 IMPORTAÇÃO CORRETA: Importe as funções específicas com chaves {}
import { verifyCode, resendVerification } from '../../services/api.js'; // Ajuste o caminho conforme sua estrutura

const ValidacaoEmail = () => {
    const [codigo, setCodigo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState(false);
    const [mensagemReenvio, setMensagemReenvio] = useState('');
    
    const location = useLocation(); 
    const navigate = useNavigate();

    // ➡️ PEGA O EMAIL PASSADO NA ROTA DE CADASTRO
    const emailUsuario = location.state?.email;

    // Redireciona se não houver email (proteção de rota)
    useEffect(() => {
        if (!emailUsuario) {
            alert("Você precisa se cadastrar primeiro para acessar esta página.");
            navigate('/cadastro', { replace: true });
        }
    }, [emailUsuario, navigate]);

    const handleInputChange = (e) => {
        const valor = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setCodigo(valor);
        setMensagemErro(''); // Limpa erro ao digitar
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (codigo.length !== 6) {
            setMensagemErro("Por favor, digite o código de 6 dígitos.");
            return;
        }

        setIsLoading(true);
        setMensagemErro('');

        try {
            // 🚀 CHAMADA REAL À API PARA VALIDAR O CÓDIGO
            const response = await verifyCode(emailUsuario, codigo);

            if (response.success) {
                setMensagemSucesso(true);
                // 🚀 SE SUCESSO: Redirecionar para o Login
                setTimeout(() => navigate('/login'), 2500);
            }
        } catch (error) {
            const erroMsg = error.error || 'Erro ao validar o código. Verifique se o código está correto ou tente reenviar.';
            setMensagemErro(erroMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReenviar = async (e) => {
        e.preventDefault();
        setMensagemReenvio('Enviando novo código...');
        setMensagemErro('');
        
        try {
            // 💡 CHAMADA REAL À API PARA REENVIAR CÓDIGO
            await resendVerification(emailUsuario); 

            setMensagemReenvio('✅ Um novo código foi enviado para seu e-mail!');
            setTimeout(() => setMensagemReenvio(''), 4000);

        } catch (error) {
            const erroMsg = error.error || 'Erro ao tentar reenviar o código. Tente novamente mais tarde.';
            setMensagemErro(erroMsg);
            setMensagemReenvio(''); 
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                
                <div className="login-header">
                    <div className="logo-icon">📩</div>
                    <h1>Confirme seu <span>E-mail</span></h1>
                    <p>Enviamos o código para <strong>{emailUsuario}</strong>.</p>
                </div>

                {mensagemSucesso ? (
                    <div className="success-message">
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                        <h3>E-mail Confirmado!</h3>
                        <p>Seu cadastro foi validado. Redirecionando para o Login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="codigo">Código de Verificação</label>
                            <input
                                type="text"
                                id="codigo"
                                placeholder="000000"
                                value={codigo}
                                onChange={handleInputChange}
                                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.2rem' }}
                                required
                                maxLength={6}
                                disabled={isLoading}
                            />
                        </div>

                        {mensagemErro && (
                            <p style={{ color: '#dc3545', fontSize: '0.9rem', textAlign: 'center', marginBottom: '10px' }}>
                                {mensagemErro}
                            </p>
                        )}

                        {mensagemReenvio && (
                            <p style={{ color: '#28a745', fontSize: '0.9rem', textAlign: 'center', marginBottom: '10px' }}>
                                {mensagemReenvio}
                            </p>
                        )}

                        <button type="submit" className="btn-login" disabled={codigo.length !== 6 || isLoading}>
                            {isLoading ? 'Validando...' : 'Validar Código'}
                        </button>

                        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                            <p>Não recebeu? 
                                <a href="#!" onClick={handleReenviar} style={{ fontWeight: 'bold' }} disabled={isLoading}>
                                    Reenviar Código
                                </a>
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ValidacaoEmail;