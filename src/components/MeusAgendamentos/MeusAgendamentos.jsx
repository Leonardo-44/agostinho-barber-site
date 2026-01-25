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
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError('Você precisa estar logado');
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/api/agendamentos/cliente/meus", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setAgendamentos(data.agendamentos || []);
      } else {
        setError(data.error || 'Erro ao carregar agendamentos');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
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
      const response = await fetch(`http://localhost:3001/api/agendamentos/cliente/${id}/cancelar`, {
        method: "PUT", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response.ok) {
        setAgendamentos(prev => prev.map(a => 
          a.id === id ? { ...a, status: 'cancelled' } : a
        ));
        alert("Agendamento cancelado com sucesso!");
      } else {
        setError('Erro ao cancelar agendamento');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
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

  if (loading) return <div className="loading-screen"><Loader className="spin" /></div>;

  return (
    <div className="agendamentos-container">
      <header className="agendamentos-header">
        <button onClick={() => window.history.back()} className="btn-voltar"><Home size={24} /></button>
        <h1>Meus Agendamentos</h1>
      </header>

      <div className="filtros-container">
        {['all', 'pending', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filtro-btn ${filter === f ? 'ativo' : ''}`}>
            {f === 'all' ? 'Todos' : getStatusLabel(f)}
          </button>
        ))}
      </div>

      <div className="agendamentos-lista">
        {agendamentosOrdenados.map(agendamento => (
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
        ))}
      </div>
    </div>
  );
};

export default MeusAgendamentos;