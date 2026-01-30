// src/services/api.js - FRONTEND

// 1. Configuração da URL Base (Remove barra final se houver)
const BASE_URL = (import.meta.env.VITE_API_URL || "https://agostinho-barber-site-backend.onrender.com").replace(/\/$/, "");

// 2. Garantimos o prefixo /api (Evita duplicidade api/api)
const API_URL = BASE_URL.includes('/api') ? BASE_URL : `${BASE_URL}/api`;

console.log("🚀 URL DE CHAMADA ATUAL:", API_URL);

// ==================== FUNÇÃO BASE DE CHAMADA ====================

export const apiCall = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_URL}${cleanEndpoint}`;

  try {
    console.log(`📡 [API] Enviando ${options.method || 'GET'} para: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    console.log(`📊 [API] Status da resposta: ${response.status}`);

    // ✅ Tratamento de erro 403 - Token expirado ou sem permissão
    if (response.status === 403) {
      console.warn("⚠️ Acesso negado ou Token expirado");
      // Opcional: localStorage.removeItem("authToken");
      throw {
        error: "❌ Sessão inválida ou sem permissão. Por favor, refaça o login.",
        status: 403
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
        details: "O servidor não retornou um JSON válido.",
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

    // Erros de conexão/rede
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw {
        error: "🔴 Não foi possível conectar ao servidor. Verifique se o backend está rodando no Render.",
        details: "ERR_CONNECTION_REFUSED ou CORS",
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
  return apiCall("/clientes/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      senha: credentials.senha,
    }),
  });
};

export const fetchClienteLogado = async (token) => {
  return apiCall("/clientes/perfil", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateClientPerfil = async (clientData, token) => {
  return apiCall("/clientes/perfil/atualizar", {
    method: "PUT",
    body: JSON.stringify(clientData),
    headers: { Authorization: `Bearer ${token}` },
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
  return apiCall("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({
      token,
      nova_senha: newPassword,
      confirmar_senha: confirmPassword,
    }),
  });
};

// ==================== SERVIÇOS ====================

export const fetchServicos = async () => {
  return apiCall("/servicos", { method: "GET" });
};

// ==================== ADMIN GERAL ====================

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
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchMeusAgendamentos = async (token) => {
  return apiCall("/agendamentos/cliente/meus", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const cancelarAgendamento = async (agendamentoId, token) => {
  return apiCall(`/agendamentos/cliente/${agendamentoId}/cancelar`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ==================== AGENDAMENTOS - BARBEIRO ====================

export const criarAgendamentoManual = async (payload, token) => {
  return apiCall("/agendamentos/criar", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchAgendamentosDoBarbeiro = async (token) => {
  return apiCall("/agendamentos/barbeiro", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateAgendamentoBarbeiro = async (agendamentoId, payload, token) => {
  return apiCall(`/agendamentos/${agendamentoId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ==================== HORÁRIOS ====================

export const fetchHorariosOcupados = async (data) => {
  return apiCall(`/agendamentos/ocupados?data=${data}`, { method: "GET" });
};

// ==================== BARBEIRO PERFIL ====================

export const loginBarbeiro = async (credentials) => {
  return apiCall("/barbeiro/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      senha: credentials.senha,
    }),
  });
};

export const fetchBarbeiroLogado = async (token) => {
  return apiCall("/barbeiro/perfil", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateBarbeiroPerfil = async (barbeiroData, token) => {
  return apiCall("/barbeiro/perfil/atualizar", {
    method: "PUT",
    body: JSON.stringify(barbeiroData),
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ==================== ADMIN - GERENCIAR BARBEIROS ====================

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

// ==================== ADMIN - GERENCIAR SERVIÇOS ====================

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
  registerClient,
  loginClient,
  fetchClienteLogado,
  updateClientPerfil,
  verifyEmailCode,
  resendEmailCode,
  requestPasswordReset,
  resetPassword,
  fetchServicos,
  fetchAdminDashboard,
  fetchAllClients,
  deleteClient,
  fetchAllAgendamentos,
  updateAgendamentoStatus,
  deleteAgendamento,
  criarAgendamentoCliente,
  fetchMeusAgendamentos,
  cancelarAgendamento,
  criarAgendamentoManual,
  fetchAgendamentosDoBarbeiro,
  updateAgendamentoBarbeiro,
  fetchHorariosOcupados,
  loginBarbeiro,
  fetchBarbeiroLogado,
  updateBarbeiroPerfil,
  fetchAllBarbeiros,
  createBarbeiro,
  updateBarbeiro,
  deleteBarbeiro,
  createServico,
  updateServico,
  deleteServico,
};

export default api;