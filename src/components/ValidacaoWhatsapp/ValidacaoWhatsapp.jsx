import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import '../Login.css';

// 🔑 NOVAS FUNÇÕES: Verificação e Reenvio via Twilio/WhatsApp
import { verifyWhatsappCode, resendWhatsappCode } from '../../services/api.js'; 

const ValidacaoWhatsapp = () => {
    const [codigo, setCodigo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemStatus, setMensagemStatus] = useState(''); 
    const [mensagemSucesso, setMensagemSucesso] = useState(false);
    const [codigoEnviado, setCodigoEnviado] = useState(false); // 🆕 Controla se o código foi enviado
    
    const location = useLocation(); 
    const navigate = useNavigate();

    // ➡️ PEGA O NÚMERO PASSADO NA ROTA ANTERIOR
    const whatsappNumber = location.state?.whatsappNumber; // Ex: "+5511987654321"
    
    // Função para formatar o número exibido (opcional)
    const formatNumberDisplay = (number) => {
        if (!number) return '';
        const digits = number.replace(/\D/g, ''); 
        
        if (digits.length < 13) return number; 
        
        const ddi = digits.substring(0, 2); // 55
        const ddd = digits.substring(2, 4); // 11
        const part1 = digits.substring(4, 9); // 98765
        const part2 = digits.substring(9); // 4321

        return `+${ddi} (${ddd}) ${part1} - ${part2}`;
    };

    // Funções de envio e reenvio centralizadas
    // Usamos useCallback para que a função não mude desnecessariamente
    const handleSendCode = useCallback(async () => {
        // Proteção: só envia se tiver número
        if (!whatsappNumber) {
            setMensagemErro('Número de WhatsApp inválido.');
            return;
        }

        setMensagemErro('');
        setMensagemStatus('Enviando código de verificação via WhatsApp...');
        setIsLoading(true);
        
        try {
            // 💡 CHAMADA PARA A API DO WHATSAPP REENVIAR/INICIAR CÓDIGO
            await resendWhatsappCode(whatsappNumber); 

            setMensagemStatus('✅ Código enviado para seu WhatsApp!');
            setCodigoEnviado(true); // 🆕 Marca como enviado
            setTimeout(() => setMensagemStatus(''), 4000);

        } catch (error) {
            const erroMsg = error.error || 'Erro ao tentar enviar o código. Tente novamente mais tarde.';
            setMensagemErro(erroMsg);
            setMensagemStatus(''); // Limpa o status de carregamento
        } finally {
            setIsLoading(false);
        }
    }, [whatsappNumber]);

    // 🚨 CORREÇÃO PRINCIPAL: Envio automático ao carregar a página
    useEffect(() => {
        // Verifica se já está na página corretamente
        if (!whatsappNumber) {
            console.warn('WhatsApp não encontrado. Redirecionando para cadastro.');
            alert("Informação de WhatsApp faltando. Retornando ao cadastro.");
            navigate('/cadastro', { replace: true });
            return;
        }
        
        // 🚀 Dispara o envio do código apenas UMA VEZ ao montar
        let isMounted = true; // Flag para evitar múltiplas chamadas
        
        if (isMounted) {
            handleSendCode();
        }
        
        return () => {
            isMounted = false; // Cleanup
        };
        
    }, ); // ⚠️ Array vazio = executa apenas uma vez

    const handleInputChange = (e) => {
        const valor = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setCodigo(valor);
        setMensagemErro('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (codigo.length !== 6) {
            setMensagemErro("Por favor, digite o código de 6 dígitos.");
            return;
        }

        if (!whatsappNumber) {
            setMensagemErro("Número de WhatsApp inválido. Retorne ao cadastro.");
            return;
        }

        setIsLoading(true);
        setMensagemErro('');

        try {
            // 🚀 CHAMADA PARA A API DO WHATSAPP (Verifica o código)
            // ⚠️ IMPORTANTE: O código foi enviado via WhatsApp pelo backend
            // Aqui apenas validamos o código digitado contra o BD
            const response = await verifyWhatsappCode(whatsappNumber, codigo);

            // ✅ Se a API retornar sucesso, é porque o código está correto no BD
            if (response && response.success) {
                setMensagemSucesso(true);
                // 🚀 FLUXO COMPLETO: Redirecionar para o Login
                setTimeout(() => navigate('/login'), 2500);
            } else {
                // Se não retornar sucesso, mostra erro
                setMensagemErro("Código inválido. Verifique o código recebido no WhatsApp.");
            }
        } catch (error) {
            // ⚠️ O erro vem do backend quando o código não coincide
            const erroMsg = error.error || 'Código inválido. Verifique se está correto ou solicite um novo código.';
            setMensagemErro(erroMsg);
            console.error('Erro ao validar código:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Função para o clique no link Reenviar
    const handleReenviarClick = (e) => {
        e.preventDefault();
        handleSendCode();
    };

    // 🆕 Proteção: não renderiza se faltar whatsapp
    if (!whatsappNumber) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div style={{ textAlign: 'center', padding: '30px' }}>
                        <p>Carregando...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                
                <div className="login-header">
                    <div className="logo-icon">💬</div> 
                    <h1>Confirme seu <span>WhatsApp</span></h1>
                    <p>Enviamos o código para <strong>{formatNumberDisplay(whatsappNumber)}</strong>.</p>
                    <p style={{fontSize: '0.85rem', color: '#666', marginTop: '5px'}}>
                        Passo 2 de 2: Verificação de WhatsApp
                    </p>
                </div>

                {mensagemSucesso ? (
                    <div className="success-message">
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                        <h3>Whatsapp Confirmado!</h3>
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
                                ❌ {mensagemErro}
                            </p>
                        )}

                        {mensagemStatus && (
                            <p style={{ color: '#28a745', fontSize: '0.9rem', textAlign: 'center', marginBottom: '10px' }}>
                                {mensagemStatus}
                            </p>
                        )}

                        <button 
                            type="submit" 
                            className="btn-login" 
                            disabled={codigo.length !== 6 || isLoading || !codigoEnviado}
                            title={!codigoEnviado ? "Aguardando envio do código..." : ""}
                        >
                            {isLoading ? 'Validando...' : 'Validar Código'}
                        </button>

                        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                            <p>Não recebeu? 
                                <a 
                                    href="#!" 
                                    onClick={handleReenviarClick} 
                                    style={{ fontWeight: 'bold', marginLeft: '5px', cursor: 'pointer' }}
                                >
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

export default ValidacaoWhatsapp;