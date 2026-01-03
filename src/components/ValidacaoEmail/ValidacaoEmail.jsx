import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import '../Login.css';

// Importa as funções de API para validação de e-mail
import { verifyCode, resendVerification } from '../../services/api.js'; 

const ValidacaoEmail = () => {
    const [codigo, setCodigo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState(false);
    const [mensagemReenvio, setMensagemReenvio] = useState('');
    
    const location = useLocation(); 
    const navigate = useNavigate();

    // ➡️ PEGA O EMAIL E O WHATSAPP PASSADOS NA ROTA DE CADASTRO
    // Aceita tanto 'whatsappNumber' quanto 'whatsapp' para compatibilidade
    const emailUsuario = location.state?.email;
    const whatsappUsuario = location.state?.whatsappNumber || location.state?.whatsapp; 

    // Redireciona se não houver email ou whatsapp (proteção de rota)
    useEffect(() => {
        // 🚨 DEBUG: Verifica os valores que estão chegando
        console.log('--- DEBUG ValidacaoEmail ---');
        console.log('E-mail Recebido:', emailUsuario);
        console.log('WhatsApp Recebido:', whatsappUsuario);
        console.log('Location State:', location.state);
        console.log('----------------------------');
        
        // Checa se as informações essenciais foram passadas via state
        if (!emailUsuario) {
            console.warn("Email ausente. Redirecionando para cadastro.");
            alert("Email não foi passado. Você precisa se cadastrar primeiro.");
            navigate('/cadastro', { replace: true });
        }
    }, [emailUsuario, whatsappUsuario, navigate, location.state]); // Dependências corretas

    const handleInputChange = (e) => {
        // Permite apenas dígitos e limita a 6 caracteres
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
        
        // Proteção extra: não tenta validar se as variáveis essenciais sumiram
        if (!emailUsuario) {
             setMensagemErro("Dados de usuário ausentes. Por favor, reinicie o cadastro.");
             return;
        }

        setIsLoading(true);
        setMensagemErro('');

        try {
            // 🚀 CHAMADA REAL À API PARA VALIDAR O CÓDIGO
            const response = await verifyCode(emailUsuario, codigo);

            if (response.success) {
                setMensagemSucesso(true);
                
                // ➡️ SUCESSO: Redireciona para a validação do WhatsApp, passando o número
                setTimeout(() => {
                    navigate('/validacao-whatsapp', { 
                        state: { 
                            whatsappNumber: whatsappUsuario, // Passa o número para a próxima tela
                            email: emailUsuario
                        } 
                    });
                }, 2500); // Dá tempo para o usuário ler a mensagem de sucesso
                
            }
        } catch (error) {
            // O erro é o objeto { error: 'mensagem', status: 400 } que a api.js lança
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
        
        // Proteção extra
        if (!emailUsuario) {
             setMensagemErro("E-mail ausente para reenvio.");
             setMensagemReenvio(''); 
             return;
        }

        try {
            // 💡 CHAMADA REAL À API PARA REENVIAR CÓDIGO
            await resendVerification(emailUsuario); 

            setMensagemReenvio('✅ Um novo código foi enviado para seu e-mail!');
            setTimeout(() => setMensagemReenvio(''), 4000);

        } catch (error) {
            const erroMsg = error.error || 'Erro ao tentar reenviar o código. Tente novamente mais tarde.';
            setMensagemErro(erroMsg);
            setMensagemReenvio(''); // Limpa a mensagem de carregamento/sucesso
        }
    };

    // Não renderiza nada se o email estiver faltando até o redirecionamento
    if (!emailUsuario) {
        return <div className="login-container">Carregando...</div>; 
    }

    return (
        <div className="login-container">
            <div className="login-card">
                
                <div className="login-header">
                    <div className="logo-icon">📩</div>
                    <h1>Confirme seu <span>E-mail</span></h1>
                    <p>Enviamos o código para <strong>{emailUsuario}</strong>.</p>
                    <p style={{fontSize: '0.85rem', color: '#666', marginTop: '5px'}}>
                        Passo 1 de 2: Verificação de E-mail
                    </p>
                </div>

                {mensagemSucesso ? (
                    <div className="success-message">
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                        <h3>E-mail Confirmado!</h3>
                        <p>Validação concluída. Redirecionando para a confirmação do WhatsApp.</p>
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
                                // Estilo para centralizar os 6 dígitos
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
                                <a href="#!" onClick={handleReenviar} style={{ fontWeight: 'bold', marginLeft: '5px' }} disabled={isLoading}>
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