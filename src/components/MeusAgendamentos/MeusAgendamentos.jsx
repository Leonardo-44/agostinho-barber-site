import React, { useState, useEffect } from 'react';
import './MeusAgendamentos.css';
import {
  Calendar,
  Clock,
  Scissors,
  AlertCircle,
  Home,
  Trash2,
  Loader
} from 'lucide-react';

const MeusAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchMeusAgendamentos = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError('❌ Você precisa estar logado');
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/api/agendamentos/cliente/meus", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 403) {
        console.warn("⚠️ Token inválido ou expirado");
        localStorage.removeItem("authToken");
        setError('❌ Sua sessão expirou. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAgendamentos(data.agendamentos || []);
        } else {
          setError('❌ ' + (data.error || 'Erro ao carregar agendamentos'));
        }
      } else {
        setError('❌ Erro ao conectar com o servidor');
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setError('❌ Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeusAgendamentos();
  }, []);

  const handleCancelAgendamento = async (id) => {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;

    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setError('❌ Você precisa estar logado');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/agendamentos/cliente/${id}/cancelar`, {
        method: "PUT", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response.status === 403) {
        console.warn("⚠️ Token inválido ou expirado");
        localStorage.removeItem("authToken");
        setError('❌ Sua sessão expirou. Por favor, faça login novamente.');
        return;
      }

      if (response.ok) {
        setAgendamentos(prev => prev.map(a => 
          a.id === id ? { ...a, status: 'cancelled' } : a
        ));
        setError('');
        alert("✅ Agendamento cancelado com sucesso!");
      } else {
        const data = await response.json();
        setError('❌ ' + (data.error || 'Erro ao cancelar agendamento'));
      }
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      setError('❌ Erro ao conectar com o servidor');
    }
  };

  // ✅ Função para padronizar a verificação de status (evita erro de maiúsculas/minúsculas)
  const compararStatus = (statusOriginal, statusAlvo) => {
    return statusOriginal?.toLowerCase() === statusAlvo.toLowerCase();
  };

  const agendamentosFiltrados = agendamentos.filter(a => {
    if (filter === 'all') return true;
    return compararStatus(a.status, filter);
  });

  const agendamentosOrdenados = [...agendamentosFiltrados].sort((a, b) => 
    new Date(a.data_agendamento) - new Date(b.data_agendamento)
  );

  const formatDate = (dateString) => {
    if (!dateString) return "--/--/--";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    if (compararStatus(status, 'pending')) return 'Pendente';
    if (compararStatus(status, 'completed')) return 'Concluído';
    if (compararStatus(status, 'cancelled')) return 'Cancelado';
    return status;
  };

  if (loading) return (
    <div className="loading-screen">
      <Loader className="spin" size={48} />
      <p>Carregando agendamentos...</p>
    </div>
  );

  return (
    <div className="agendamentos-container">
      <header className="agendamentos-header">
        <button onClick={() => window.history.back()} className="btn-voltar" title="Voltar">
          <Home size={24} />
        </button>
        <h1>Meus Agendamentos</h1>
      </header>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            className="error-close"
            onClick={() => setError('')}
            aria-label="Fechar alerta"
          >
            ×
          </button>
        </div>
      )}

      {agendamentos.length > 0 ? (
        <>
          <div className="filtros-container">
            {['all', 'pending', 'completed', 'cancelled'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`filtro-btn ${filter === f ? 'ativo' : ''}`}
              >
                {f === 'all' ? 'Todos' : getStatusLabel(f)}
              </button>
            ))}
          </div>

          <div className="agendamentos-lista">
            {agendamentosOrdenados.length > 0 ? (
              agendamentosOrdenados.map(agendamento => (
                <div key={agendamento.id} className="agendamento-item">
                  <div className="item-header">
                    <span className={`status-badge ${agendamento.status?.toLowerCase()}`}>
                      {getStatusLabel(agendamento.status)}
                    </span>
                  </div>

                  <div className="item-servico">
                    <Scissors size={18} />
                    <p>{agendamento.servico_nome}</p>
                  </div>

                  <div className="item-info">
                    <span><Calendar size={14} /> {formatDate(agendamento.data_agendamento)}</span>
                    <span><Clock size={14} /> {agendamento.horario_agendamento}</span>
                  </div>

                  <div className="item-acoes">
                    {/* ✅ MUDANÇA AQUI: Aceita 'pending' ou 'Pendente' */}
                    {(compararStatus(agendamento.status, 'pending')) && (
                      <button
                        onClick={() => handleCancelAgendamento(agendamento.id)}
                        className="btn-cancelar"
                      >
                        <Trash2 size={16} /> Cancelar Corte
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-agendamentos">
                <AlertCircle size={48} />
                <p>Nenhum agendamento encontrado para este filtro.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-agendamentos">
          <AlertCircle size={48} />
          <p>Você ainda não possui agendamentos.</p>
          <p className="subtitle">Clique em "Agendar" para criar seu primeiro agendamento!</p>
        </div>
      )}
    </div>
  );
};

export default MeusAgendamentos;