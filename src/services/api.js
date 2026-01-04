// src/services/api.js - FRONTEND
// ⚠️ IMPORTANTE: Verifique se a porta está correta!

const API_URL = 'http://localhost:3001/api'; // ✅ Backend roda na porta 3001

// ==================== FUNÇÃO BASE DE CHAMADA ====================

export const apiCall = async (endpoint, options = {}) => {
  try {
    console.log(`🌐 [API] Chamando: ${API_URL}${endpoint}`);
    console.log(`📤 [API] Dados enviados:`, options.body ? JSON.parse(options.body) : 'Sem body');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`📊 [API] Status da resposta: ${response.status}`);

    // Tenta parsear a resposta
    let data;
    try {
      const textResponse = await response.text();
      console.log(`📥 [API] Resposta bruta:`, textResponse);
      
      data = textResponse ? JSON.parse(textResponse) : {};
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      throw { 
        error: 'Resposta inválida do servidor',
        details: 'Servidor retornou dados não-JSON' 
      };
    }

    // Se não for sucesso, lança erro com a mensagem do backend
    if (!response.ok) {
      console.error(`❌ [API] Erro ${response.status}:`, data);
      
      // Garante que sempre lance um objeto com a propriedade 'error'
      throw { 
        error: data.error || data.message || `Erro ${response.status}`,
        status: response.status,
        ...data 
      };
    }

    console.log(`✅ [API] Sucesso em ${endpoint}:`, data);
    return data;

  } catch (error) {
    console.error(`❌ [API] Erro em ${endpoint}:`, error);
    
    // Se for erro de conexão (servidor não está rodando)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw {
        error: '🔴 Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.',
        details: 'ERR_CONNECTION_REFUSED'
      };
    }
    
    // Se já for um objeto de erro estruturado, apenas repassa
    if (error.error) {
      throw error;
    }
    
    // Caso contrário, estrutura o erro
    throw { 
      error: error.message || 'Erro desconhecido',
      originalError: error 
    };
  }
};

// ==================== CLIENTES ====================

export const registerClient = async (clientData) => {
  console.log('📝 [REGISTER] Registrando cliente:', { ...clientData, senha: '***' });
  return apiCall('/clientes/cadastro', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
};

export const loginClient = async (credentials) => {
  console.log('🔐 [LOGIN] Fazendo login:', { 
    email: credentials.email, 
    senha: '***',
    objetoCompleto: credentials 
  });
  
  // ✅ Garantir que está enviando objeto correto
  const payload = {
    email: credentials.email,
    senha: credentials.senha
  };
  
  console.log('📦 [LOGIN] Payload sendo enviado:', JSON.stringify(payload));
  
  return apiCall('/clientes/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ==================== EMAIL ====================

export const verifyEmailCode = async (email, code) => {
  console.log('✉️ [EMAIL] Verificando código:', { email, code });
  return apiCall('/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
};

export const resendEmailCode = async (email) => {
  console.log('🔄 [EMAIL] Reenviando código para:', email);
  return apiCall('/auth/email/resend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

// ==================== WHATSAPP ====================

export const resendWhatsappCode = async (whatsappNumber) => {
  console.log('📱 [WHATSAPP] Enviando código para:', whatsappNumber);
  return apiCall('/auth/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify({ whatsappNumber }),
  });
};

export const verifyWhatsappCode = async (whatsappNumber, code) => {
  console.log('📱 [WHATSAPP] Verificando código:', { whatsappNumber, code });
  return apiCall('/auth/whatsapp/verify', {
    method: 'POST',
    body: JSON.stringify({ whatsappNumber, code }),
  });
};

// ==================== VALIDAÇÃO DE TELEFONE ====================

export const validarTelefone = async (telefone) => {
  console.log('📞 [TELEFONE] Validando:', telefone);
  return apiCall('/auth/telefone/validar', {
    method: 'POST',
    body: JSON.stringify({ telefone }),
  });
};

// ==================== ADMIN ====================

export const fetchAdminDashboard = async (adminToken) => {
  console.log('👑 [ADMIN] Buscando dashboard');
  return apiCall('/admin/dashboard', {
    method: 'GET', // ⚠️ CORRIGIDO: Dashboard geralmente é GET, não POST
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
};

export const fetchAllClients = async (adminToken) => {
  console.log('👥 [ADMIN] Buscando todos os clientes');
  return apiCall('/admin/clientes', {
    method: 'GET', // ⚠️ CORRIGIDO: Buscar dados geralmente é GET, não POST
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
};

export const deleteClient = async (clientId, adminToken) => {
  console.log('🗑️ [ADMIN] Deletando cliente:', clientId);
  return apiCall(`/admin/clientes/${clientId}`, {
    method: 'DELETE', // ⚠️ CORRIGIDO: Usar DELETE ao invés de POST com /delete
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
};

export const updateClientRole = async (clientId, newRole, adminToken) => {
  console.log('🔄 [ADMIN] Atualizando role do cliente:', { clientId, newRole });
  return apiCall(`/admin/clientes/${clientId}/role`, {
    method: 'PUT', // ⚠️ CORRIGIDO: Usar PUT para atualização ao invés de POST
    body: JSON.stringify({ role: newRole }), // ⚠️ CORRIGIDO: propriedade 'role' ao invés de 'newRole'
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
};

// ==================== EXPORTS ====================

export default {
  registerClient,
  loginClient,
  verifyEmailCode,
  resendEmailCode,
  resendWhatsappCode,
  verifyWhatsappCode,
  validarTelefone,
  fetchAdminDashboard,
  fetchAllClients,
  deleteClient,
  updateClientRole,
};