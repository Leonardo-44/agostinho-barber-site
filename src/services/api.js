const API_URL = 'http://localhost:3000/api';

// ==================== CLIENTES ====================

export const registerClient = async (data) => {
  try {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Lança erro com a mensagem do backend
      throw { 
        error: result.error || result.message || 'Erro ao cadastrar cliente',
        status: response.status
      };
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao registrar cliente:', error);
    throw error;
  }
};

export const loginClient = async (email, senha) => {
  try {
    const response = await fetch(`${API_URL}/clientes/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw { 
        error: result.error || 'Erro ao fazer login',
        status: response.status
      };
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

export const getClients = async () => {
  try {
    const response = await fetch(`${API_URL}/clientes`);
    if (!response.ok) throw new Error('Erro ao buscar clientes');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};

// ==================== AGENDAMENTOS ====================

export const createAppointment = async (data) => {
  try {
    const response = await fetch(`${API_URL}/agendamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar agendamento');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};

export const getAppointments = async () => {
  try {
    const response = await fetch(`${API_URL}/agendamentos`);
    if (!response.ok) throw new Error('Erro ao buscar agendamentos');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};

export const updateAppointment = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/agendamentos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Erro ao atualizar agendamento');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};

export const deleteAppointment = async (id) => {
  try {
    const response = await fetch(`${API_URL}/agendamentos/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Erro ao deletar agendamento');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};

// ==================== SERVIÇOS ====================

export const getServices = async () => {
  try {
    const response = await fetch(`${API_URL}/servicos`);
    if (!response.ok) throw new Error('Erro ao buscar serviços');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};