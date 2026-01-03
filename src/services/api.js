// src/services/api.js (ou index.js)

const API_URL = 'http://localhost:3000/api';

// ==================== FUNÇÃO AUXILIAR CENTRALIZADA ==================== //

/**
 * Função utilitária para fazer chamadas à API com tratamento de erro consistente.
 * @param {string} endpoint - O caminho da rota (ex: 'clientes', 'whatsapp/verify-code').
 * @param {object} data - O corpo da requisição JSON (opcional, para POST/PUT/PATCH).
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE).
 * @returns {Promise<object>} O resultado JSON da API.
 */
const apiCall = async (endpoint, data = null, method = 'GET') => {
    
    // Tenta pegar o token para usar em chamadas autenticadas
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        // Adiciona Authorization se o token estiver presente
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    
    // Configuração da requisição
    const config = {
        method: method,
        headers: headers,
        // Adiciona body apenas se o método for POST, PUT ou PATCH
        ...(data && (method === 'POST' || method === 'PUT' || method === 'PATCH') && { body: JSON.stringify(data) })
    };

    try {
        const response = await fetch(`${API_URL}/${endpoint}`, config);
        const result = await response.json();

        if (!response.ok) {
            // Garante que o erro retorne a mensagem do backend e o status
            throw {
                error: result.error || result.message || `Erro ao processar ${endpoint}`,
                status: response.status,
            }; 
        }

        return result;

    } catch (error) {
        console.error(`API Error em ${endpoint}:`, error);
        // Propaga o erro
        throw error; 
    }
};

// ==================== CLIENTES ==================== //

export const registerClient = async (data) => {
    return apiCall('clientes', data, 'POST');
};

export const loginClient = async (email, senha) => {
    return apiCall('clientes/login', { email, senha }, 'POST');
};

export const getClients = async () => {
    return apiCall('clientes', null, 'GET');
};

// ==================== AGENDAMENTOS ==================== //

export const createAppointment = async (data) => {
    return apiCall('agendamentos', data, 'POST');
};

export const getAppointments = async () => {
    return apiCall('agendamentos', null, 'GET');
};

export const updateAppointment = async (id, data) => {
    return apiCall(`agendamentos/${id}`, data, 'PUT');
};

export const deleteAppointment = async (id) => {
    // Passa null para data (sem body)
    return apiCall(`agendamentos/${id}`, null, 'DELETE');
};

// ==================== SERVIÇOS ==================== //

export const getServices = async () => {
    return apiCall('servicos', null, 'GET');
};


// ==================== CLIENTES (VALIDAÇÃO E-MAIL) ==================== //

export const verifyCode = async (email, code) => {
    // Esta função usará o token de login para autenticação se ele existir
    return apiCall('clientes/verify', { email, code }, 'POST');
};

export const resendVerification = async (email) => {
    return apiCall('clientes/resend-verification', { email }, 'POST');
};

// ==================== CLIENTES (VALIDAÇÃO WHATSAPP) ==================== //

/**
 * 1. 💬 Função para VALIDAR o código recebido (Verifica o código Twilio).
 * @param {string} whatsappNumber - O número no formato +55DDDNUMERO.
 * @param {string} code - O código de 6 dígitos.
 */
export const verifyWhatsappCode = async (whatsappNumber, code) => {
    return apiCall('whatsapp/verify-code', {
        whatsappNumber,
        code
    }, 'POST');
};


/**
 * 2. 🔁 Função para REENVIAR o código (Solicita um novo código Twilio).
 * @param {string} whatsappNumber - O número no formato +55DDDNUMERO.
 */
export const resendWhatsappCode = async (whatsappNumber) => {
    return apiCall('whatsapp/resend-code', {
        whatsappNumber
    }, 'POST');
};