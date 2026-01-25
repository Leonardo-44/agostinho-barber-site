// src/services/api.js - FRONTEND
// ✅ Configuração correta com variável de ambiente

const API_URL = 
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:3001/api"
    : "https://agostinho-barber-api.onrender.com/api";

console.log("🔍 API_URL configurada:", API_URL);
console.log("🌍 Hostname:", window.location.hostname);

// ==================== FUNÇÃO BASE DE CHAMADA ====================

export const apiCall = async (endpoint, options = {}) => {
  try {
    console.log(`🌐 [API] Chamando: ${API_URL}${endpoint}`);
    console.log(
      `📤 [API] Dados enviados:`,
      options.body ? JSON.parse(options.body) : "Sem body"
    );

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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
      console.error("❌ Erro ao parsear JSON:", parseError);
      throw {
        error: "Resposta inválida do servidor",
        details: "Servidor retornou dados não-JSON",
      };
    }

    // Se não for sucesso, lança erro com a mensagem do backend
    if (!response.ok) {
      console.error(`❌ [API] Erro ${response.status}:`, data);

      // Garante que sempre lance um objeto com a propriedade 'error'
      throw {
        error: data.error || data.message || `Erro ${response.status}`,
        status: response.status,
        ...data,
      };
    }

    console.log(`✅ [API] Sucesso em ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ [API] Erro em ${endpoint}:`, error);

    // Se for erro de conexão (servidor não está rodando)
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw {
        error:
          "🔴 Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
        details: "ERR_CONNECTION_REFUSED",
      };
    }

    // Se já for um objeto de erro estruturado, apenas repassa
    if (error.error) {
      throw error;
    }

    // Caso contrário, estrutura o erro
    throw {
      error: error.message || "Erro desconhecido",
      originalError: error,
    };
  }
};

// ==================== CLIENTES ====================

export const registerClient = async (clientData) => {
  console.log("📝 [REGISTER] Registrando cliente:", {
    ...clientData,
    senha: "***",
  });
  return apiCall("/clientes/cadastro", {
    method: "POST",
    body: JSON.stringify(clientData),
  });
};

export const loginClient = async (credentials) => {
  console.log("🔐 [LOGIN] Fazendo login:", {
    email: credentials.email,
    senha: "***",
    objetoCompleto: credentials,
  });

  // ✅ Garantir que está enviando objeto correto
  const payload = {
    email: credentials.email,
    senha: credentials.senha,
  };

  console.log("📦 [LOGIN] Payload sendo enviado:", JSON.stringify(payload));

  return apiCall("/clientes/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// ✅ NOVO: Buscar dados do cliente logado
export const fetchClienteLogado = async (token) => {
  console.log("👤 [CLIENTE] Buscando dados do cliente logado");
  return apiCall("/clientes/perfil", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ==================== EMAIL ====================

export const verifyEmailCode = async (email, code) => {
  console.log("✉️ [EMAIL] Verificando código:", { email, code });
  return apiCall("/auth/email/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
};

export const resendEmailCode = async (email) => {
  console.log("🔄 [EMAIL] Reenviando código para:", email);
  return apiCall("/auth/email/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

// ==================== SENHA ====================

export const requestPasswordReset = async (email) => {
  console.log("📧 [RESET] Solicitando redefinição de senha para:", email);
  return apiCall("/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
  console.log("🔑 [RESET] Redefinindo senha com token. Senhas: ***");
  const payload = {
    token,
    nova_senha: newPassword,
    confirmar_senha: confirmPassword,
  };

  return apiCall("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// ==================== SERVIÇOS ✅ ====================

export const fetchServicos = async () => {
  console.log("🔧 [SERVICOS] Buscando todos os serviços");
  return apiCall("/servicos", {
    method: "GET",
  });
};

export const fetchServicoById = async (servicoId) => {
  console.log("🔧 [SERVICOS] Buscando serviço:", servicoId);
  return apiCall(`/servicos/${servicoId}`, {
    method: "GET",
  });
};

// ==================== ADMIN ====================

export const fetchAdminDashboard = async (adminToken) => {
  console.log("👑 [ADMIN] Buscando dashboard");
  return apiCall("/admin/dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};

export const fetchAllClients = async (adminToken) => {
  console.log("👥 [ADMIN] Buscando todos os clientes");
  return apiCall("/admin/clientes", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};

export const deleteClient = async (clientId, adminToken) => {
  console.log("🗑️ [ADMIN] Deletando cliente:", clientId);
  return apiCall(`/admin/clientes/${clientId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};

export const updateClientRole = async (clientId, newRole, adminToken) => {
  console.log("🔄 [ADMIN] Atualizando role do cliente:", { clientId, newRole });
  return apiCall(`/admin/clientes/${clientId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role: newRole }),
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};

// ==================== EXPORTS ====================

export default {
  registerClient,
  loginClient,
  fetchClienteLogado,
  verifyEmailCode,
  resendEmailCode,
  requestPasswordReset,
  resetPassword,
  fetchServicos,
  fetchServicoById,
  fetchAdminDashboard,
  fetchAllClients,
  deleteClient,
  updateClientRole,
};