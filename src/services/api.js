// src/services/api.js - FRONTEND

const API_URL = 
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:3001/api"
    : "https://agostinho-barber-site-backend.onrender.com/api";

console.log("🔍 API_URL configurada:", API_URL);

// ==================== FUNÇÃO BASE DE CHAMADA ====================

export const apiCall = async (endpoint, options = {}) => {
  try {
    console.log(`🌐 [API] Chamando: ${API_URL}${endpoint}`);

    // ✅ Corrigido: 'fetch' escrito corretamente
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    console.log(`📊 [API] Status da resposta: ${response.status}`);

    let data;
    try {
      const textResponse = await response.text();
      data = textResponse ? JSON.parse(textResponse) : {};
    } catch (parseError) {
      console.error("❌ Erro ao parsear JSON:", parseError);
      throw {
        error: "Resposta inválida do servidor",
        details: "Servidor retornou dados não-JSON",
      };
    }

    if (!response.ok) {
      throw {
        error: data.error || data.message || `Erro ${response.status}`,
        status: response.status,
        ...data,
      };
    }

    return data;
  } catch (error) {
    console.error(`❌ [API] Erro em ${endpoint}:`, error);

    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw {
        error: "🔴 Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
        details: "ERR_CONNECTION_REFUSED",
      };
    }

    if (error.error) throw error;

    throw {
      error: error.message || "Erro desconhecido",
      originalError: error,
    };
  }
};

// ==================== CLIENTES ====================

export const registerClient = async (clientData) => {
  return apiCall("/clientes/cadastro", {
    method: "POST",
    body: JSON.stringify(clientData),
  });
};

export const loginClient = async (credentials) => {
  const payload = {
    email: credentials.email,
    senha: credentials.senha,
  };
  return apiCall("/clientes/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchClienteLogado = async (token) => {
  return apiCall("/clientes/perfil", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ==================== EMAIL & SENHA ====================

export const verifyEmailCode = async (email, code) => {
  return apiCall("/auth/email/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
};

export const resendEmailCode = async (email) => {
  return apiCall("/auth/email/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const requestPasswordReset = async (email) => {
  return apiCall("/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
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

// ==================== SERVIÇOS ====================

export const fetchServicos = async () => {
  return apiCall("/servicos", { method: "GET" });
};

// ==================== ADMIN ====================

export const fetchAdminDashboard = async (adminToken) => {
  return apiCall("/admin/dashboard", {
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const fetchAllClients = async (adminToken) => {
  return apiCall("/admin/clientes", {
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const deleteClient = async (clientId, adminToken) => {
  return apiCall(`/admin/clientes/${clientId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

// ==================== AGENDAMENTOS ====================

export const criarAgendamentoCliente = async (payload, token) => {
  return apiCall("/agendamentos/cliente/criar", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchHorariosOcupados = async (data) => {
  return apiCall(`/agendamentos/ocupados?data=${data}`, {
    method: "GET",
  });
};

// ==================== EXPORTS ====================

const api = {
  registerClient,
  loginClient,
  fetchClienteLogado,
  verifyEmailCode,
  resendEmailCode,
  requestPasswordReset,
  resetPassword,
  fetchServicos,
  fetchAdminDashboard,
  fetchAllClients,
  deleteClient,
  criarAgendamentoCliente,
  fetchHorariosOcupados
};

export default api;