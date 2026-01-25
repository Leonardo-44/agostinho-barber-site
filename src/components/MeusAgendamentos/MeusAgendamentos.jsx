import React, { useState, useEffect } from 'react';
import './MeusAgendamentos.css';
import {
  Calendar,
  Clock,
  Scissors,
  AlertCircle,
  Home,
  Trash2,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

const MeusAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // ✅ Buscar agendamentos do cliente logado
  const fetchMeusAgendamentos = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError('Você precisa estar logado');
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/api/agendamentos/meus", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setAgendamentos(data.agendamentos || []);
        console.log("✅ Agendamentos carregados:", data.agendamentos);
      } else {
        setError(data.error || 'Erro ao carregar agendamentos');
      }
    } catch (err) {
      console.error("❌ Erro ao buscar agendamentos:", err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeusAgendamentos();
  }, []);

  // ✅ Cancelar agendamento
  const handleCancelAgendamento = async (id) => {
    if (!window.confirm("Deseja cancelar este agendamento?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:3001/api/agendamentos/${id}/cancelar`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setAgendamentos(prev => prev.filter(a => a.id !== id));
      } else {
        setError('Erro ao cancelar agendamento');
      }
    } catch (err) {
      console.error("❌ Erro ao cancelar:", err);
      setError('Erro ao cancelar agendamento');
    }
  };

  // ✅ Filtrar agendamentos
  const agendamentosFiltrados = agendamentos.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'completed') return a.status === 'completed';
    if (filter === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  // ✅ Ordenar por data (próximos primeiro)
  const agendamentosOrdenados = [...agendamentosFiltrados].sort((a, b) => {
    const dataA = new Date(a.data_agendamento);
    const dataB = new Date(b.data_agendamento);
    return dataA - dataB;
  });

  // ✅ Helpers
  const formatDate = (dateString) => {
    if (!dateString) return "--/--/--";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "--/--/--";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const isProximo = (dateString, status) => {
    if (status !== 'pending') return false;
    const data = new Date(dateString);
    const hoje = new Date();
    const proximos7Dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    return data >= hoje && data <= proximos7Dias;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader size={48} className="spin" />
        <p>Carregando seus agendamentos...</p>
      </div>
    );
  }

  return (
    <div className="agendamentos-container">
      {/* HEADER */}
      <header className="agendamentos-header">
        <button
          onClick={() => window.history.back()}
          className="btn-voltar"
          title="Voltar"
        >
          <Home size={24} />
        </button>

        <div className="header-content">
          <Scissors size={40} className="header-icon" />
          <div>
            <h1>Meus Agendamentos</h1>
            <p>Acompanhe seus cortes marcados</p>
          </div>
        </div>
      </header>

      {/* ERROR BANNER */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <p>{error}</p>
          <button onClick={() => setError('')} className="error-close">&times;</button>
        </div>
      )}

      {/* RESUMO */}
      <div className="resumo-stats">
        <div className="stat-box">
          <p className="stat-number">{agendamentos.filter(a => a.status === 'pending').length}</p>
          <p className="stat-label">Pendentes</p>
        </div>
        <div className="stat-box">
          <p className="stat-number">{agendamentos.filter(a => a.status === 'completed').length}</p>
          <p className="stat-label">Concluídos</p>
        </div>
        <div className="stat-box">
          <p className="stat-number">{agendamentos.filter(a => a.status === 'cancelled').length}</p>
          <p className="stat-label">Cancelados</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filtros-container">
        {[
          { id: 'all', label: '📋 Todos' },
          { id: 'pending', label: '⏳ Pendentes' },
          { id: 'completed', label: '✅ Concluídos' },
          { id: 'cancelled', label: '❌ Cancelados' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`filtro-btn ${filter === f.id ? 'ativo' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTA DE AGENDAMENTOS */}
      <div className="agendamentos-lista">
        {agendamentosOrdenados.length > 0 ? (
          agendamentosOrdenados.map(agendamento => (
            <div
              key={agendamento.id}
              className={`agendamento-item ${isProximo(agendamento.data_agendamento, agendamento.status) ? 'proximo' : ''}`}
            >
              {/* Badge de próximo */}
              {isProximo(agendamento.data_agendamento, agendamento.status) && (
                <div className="badge-proximo">🔔 Próximo!</div>
              )}

              {/* Status */}
              <div className="item-header">
                <span className={`status-badge ${getStatusColor(agendamento.status)}`}>
                  {getStatusLabel(agendamento.status)}
                </span>
              </div>

              {/* Serviço */}
              <div className="item-servico">
                <Scissors size={18} />
                <div>
                  <p className="servico-nome">{agendamento.servico_nome || 'Serviço'}</p>
                  {agendamento.observacoes && (
                    <p className="servico-obs">{agendamento.observacoes}</p>
                  )}
                </div>
              </div>

              {/* Data e Hora */}
              <div className="item-info">
                <div className="info-box">
                  <Calendar size={16} />
                  <div>
                    <p className="info-label">Data</p>
                    <p className="info-value">{formatDate(agendamento.data_agendamento)}</p>
                  </div>
                </div>

                <div className="info-box">
                  <Clock size={16} />
                  <div>
                    <p className="info-label">Horário</p>
                    <p className="info-value">{agendamento.horario_agendamento || '--:--'}</p>
                  </div>
                </div>
              </div>

              {/* Valor */}
              <div className="item-valor">
                <p className="valor-label">Valor</p>
                <p className="valor-amount">R$ {Number(agendamento.valor_total || 0).toFixed(2)}</p>
              </div>

              {/* Ações */}
              <div className="item-acoes">
                {agendamento.status === 'pending' && (
                  <button
                    onClick={() => handleCancelAgendamento(agendamento.id)}
                    className="btn-cancelar"
                    title="Cancelar agendamento"
                  >
                    <Trash2 size={16} />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>Você não tem agendamentos {filter !== 'all' ? 'nesta categoria' : 'no momento'}</p>
            <button
              onClick={() => window.location.href = '/agendamento'}
              className="btn-agendar"
            >
              ✂️ Fazer um Agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusAgendamentos;