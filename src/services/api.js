// src/services/api.js - FRONTEND

const API_URL = 
  import.meta.env.local.VITE_API_URL || "https://agostinho-barber-site-backend.onrender.com";
  
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

    // ✅ Tratamento de erro 403 - Token expirado
    if (response.status === 403) {
      console.warn("⚠️ Token inválido ou expirado");
      localStorage.removeItem("authToken");
      throw {
        error: "❌ Sua sessão expirou. Por favor, faça login novamente.",
        status: 403,
        details: "Token inválido ou expirado",
      };
    }

    let data;
    try {
      const textResponse = await response.text();
      data = textResponse ? JSON.parse(textResponse) : {};
    } catch (parseError) {
      console.error("❌ Erro ao parsear JSON:", parseError);
      throw {
        error: "❌ Resposta inválida do servidor",
        details: "Servidor retornou dados não-JSON",
      };
    }

    if (!response.ok) {
      throw {
        error: data.error || data.message || `❌ Erro ${response.status}`,
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
      error: error.message || "❌ Erro desconhecido",
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

export const updateClientPerfil = async (clientData, token) => {
  return apiCall("/clientes/perfil/atualizar", {
    method: "PUT",
    body: JSON.stringify(clientData),
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

export const fetchAllAgendamentos = async (adminToken) => {
  return apiCall("/admin/agendamentos", {
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const updateAgendamentoStatus = async (agendamentoId, status, adminToken) => {
  return apiCall(`/admin/agendamentos/${agendamentoId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const deleteAgendamento = async (agendamentoId, adminToken) => {
  return apiCall(`/admin/agendamentos/${agendamentoId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

// ==================== AGENDAMENTOS - CLIENTE ====================

export const criarAgendamentoCliente = async (payload, token) => {
  return apiCall("/agendamentos/cliente/criar", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchMeusAgendamentos = async (token) => {
  return apiCall("/agendamentos/cliente/meus", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const cancelarAgendamento = async (agendamentoId, token) => {
  return apiCall(`/agendamentos/cliente/${agendamentoId}/cancelar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ==================== AGENDAMENTOS - BARBEIRO ====================

export const criarAgendamentoManual = async (payload, token) => {
  return apiCall("/agendamentos/criar", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchAgendamentosDoBarbeiro = async (token) => {
  return apiCall("/agendamentos/barbeiro", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateAgendamentoBarbeiro = async (agendamentoId, payload, token) => {
  return apiCall(`/agendamentos/${agendamentoId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ==================== HORÁRIOS ====================

export const fetchHorariosOcupados = async (data) => {
  return apiCall(`/agendamentos/ocupados?data=${data}`, {
    method: "GET",
  });
};

// ==================== BARBEIRO ====================

export const loginBarbeiro = async (credentials) => {
  const payload = {
    email: credentials.email,
    senha: credentials.senha,
  };
  return apiCall("/barbeiro/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchBarbeiroLogado = async (token) => {
  return apiCall("/barbeiro/perfil", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateBarbeiroPerfil = async (barbeiroData, token) => {
  return apiCall("/barbeiro/perfil/atualizar", {
    method: "PUT",
    body: JSON.stringify(barbeiroData),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ==================== ADMIN - BARBEIRO ====================

export const fetchAllBarbeiros = async (adminToken) => {
  return apiCall("/admin/barbeiros", {
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const createBarbeiro = async (barbeiroData, adminToken) => {
  return apiCall("/admin/barbeiros", {
    method: "POST",
    body: JSON.stringify(barbeiroData),
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const updateBarbeiro = async (barbeiroId, barbeiroData, adminToken) => {
  return apiCall(`/admin/barbeiros/${barbeiroId}`, {
    method: "PUT",
    body: JSON.stringify(barbeiroData),
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const deleteBarbeiro = async (barbeiroId, adminToken) => {
  return apiCall(`/admin/barbeiros/${barbeiroId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

// ==================== ADMIN - SERVIÇOS ====================

export const createServico = async (servicoData, adminToken) => {
  return apiCall("/admin/servicos", {
    method: "POST",
    body: JSON.stringify(servicoData),
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const updateServico = async (servicoId, servicoData, adminToken) => {
  return apiCall(`/admin/servicos/${servicoId}`, {
    method: "PUT",
    body: JSON.stringify(servicoData),
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

export const deleteServico = async (servicoId, adminToken) => {
  return apiCall(`/admin/servicos/${servicoId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
};

// ==================== EXPORTS ====================

const api = {
  // Cliente
  registerClient,
  loginClient,
  fetchClienteLogado,
  updateClientPerfil,
  
  // Auth
  verifyEmailCode,
  resendEmailCode,
  requestPasswordReset,
  resetPassword,
  
  // Serviços
  fetchServicos,
  createServico,
  updateServico,
  deleteServico,
  
  // Admin
  fetchAdminDashboard,
  fetchAllClients,
  deleteClient,
  fetchAllAgendamentos,
  updateAgendamentoStatus,
  deleteAgendamento,
  fetchAllBarbeiros,
  createBarbeiro,
  updateBarbeiro,
  deleteBarbeiro,
  
  // Agendamentos - Cliente
  criarAgendamentoCliente,
  fetchMeusAgendamentos,
  cancelarAgendamento,
  
  // Agendamentos - Barbeiro
  criarAgendamentoManual,
  fetchAgendamentosDoBarbeiro,
  updateAgendamentoBarbeiro,
  
  // Horários
  fetchHorariosOcupados,
  
  // Barbeiro
  loginBarbeiro,
  fetchBarbeiroLogado,
  updateBarbeiroPerfil,
};

export default api;