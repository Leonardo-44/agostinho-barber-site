import React, { useState, useEffect } from 'react';
import './BarberDashboard.css';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  FileText, 
  AlertCircle,
  Scissors,
  DollarSign,
  Home
} from 'lucide-react';

const BarberDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Buscar agendamentos do backend
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setError('Você precisa estar logado');
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/api/agendamentos/lista", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.agendamentos || []);
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
    fetchAppointments();
    // Recarregar a cada 30 segundos
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Atualizar status do agendamento
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:3001/api/agendamentos/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setAppointments(prev => prev.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        ));
      } else {
        setError('Erro ao atualizar status');
      }
    } catch (err) {
      console.error("❌ Erro ao atualizar status:", err);
      setError('Erro ao atualizar status');
    }
  };

  // ✅ Deletar agendamento
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja apagar este registro permanentemente?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:3001/api/agendamentos/${id}/cancelar`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setAppointments(prev => prev.filter(app => app.id !== id));
      } else {
        setError('Erro ao deletar agendamento');
      }
    } catch (err) {
      console.error("❌ Erro ao deletar:", err);
      setError('Erro ao deletar agendamento');
    }
  };

  // ✅ Filtrar agendamentos por data e status
  const filteredAppointments = appointments.filter(app => {
    const appDate = app.data_agendamento 
      ? new Date(app.data_agendamento).toISOString().split('T')[0] 
      : "";
    
    const matchesDate = appDate === selectedDate;
    const matchesFilter = filter === 'all' || app.status === filter;
    
    return matchesDate && matchesFilter;
  });

  // ✅ Calcular estatísticas
  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    totalToday: appointments
      .filter(a => a.status === 'completed' && 
        (a.data_agendamento ? new Date(a.data_agendamento).toISOString().split('T')[0] : "") === selectedDate)
      .reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0)
  };

  // ✅ Helpers
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--/--/--";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return "--/--/--";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando painel de controle...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <button 
          onClick={() => window.history.back()}
          className="btn-home"
          title="Voltar"
        >
          <Home size={28} />
        </button>
        
        <div className="header-content">
          <div className="logo-icon">
            <Scissors size={40} />
          </div>
          <div>
            <h1>Painel do <span>Barbeiro</span></h1>
            <p>Gestão de Clientes e Serviços</p>
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

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">⏳ Pendentes</p>
          <p className="stat-value stat-pending">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">✅ Concluídos</p>
          <p className="stat-value stat-completed">{stats.completed}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">💰 Faturamento</p>
          <p className="stat-value stat-revenue">R$ {stats.totalToday.toFixed(2)}</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filter-container">
        <div className="date-picker-wrapper">
          <label className="date-label">📅 Selecione a Data:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker-input"
          />
        </div>

        <div className="filter-button-group">
          {[
            { id: 'pending', label: '⏳ Pendentes' },
            { id: 'completed', label: '✅ Concluídos' },
            { id: 'all', label: '📋 Todos' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`filter-button ${filter === f.id ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* APPOINTMENTS GRID */}
      <div className="appointments-grid">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => (
            <div key={app.id} className="appointment-card">
              {/* Card Header */}
              <div className="card-header">
                <span className={`status-tag ${getStatusClass(app.status)}`}>
                  {getStatusLabel(app.status)}
                </span>
                <button 
                  onClick={() => handleDelete(app.id)} 
                  className="btn-delete" 
                  title="Excluir permanentemente"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Client Info */}
              <div className="card-title">
                <User size={16} />
                <span>{app.cliente_nome || 'Cliente'}</span>
              </div>
              <p className="card-subtitle">{app.servico_nome || 'Serviço'}</p>
              
              {/* WhatsApp */}
              {app.cliente_whatsapp && (
                <p className="card-whatsapp">
                  📱 {app.cliente_whatsapp}
                </p>
              )}

              {/* Date & Time */}
              <div className="card-info">
                <div className="card-info-item">
                  <Calendar size={14} />
                  <span>{formatDate(app.data_agendamento)}</span>
                </div>
                <div className="card-info-item">
                  <Clock size={14} />
                  <span className="time-bold">{app.horario_agendamento || '--:--'}</span>
                </div>
              </div>

              {/* Notes */}
              {app.observacoes && (
                <div className="appointment-notes">
                  <FileText size={12} />
                  <span>{app.observacoes}</span>
                </div>
              )}

              {/* Price */}
              <div className="price-tag">
                <DollarSign size={14} />
                <span>R$ {Number(app.valor_total || 0).toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className={`card-actions ${app.status !== 'pending' ? 'disabled' : ''}`}>
                {app.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleStatusChange(app.id, 'completed')} 
                      className="btn-status btn-complete"
                      title="Marcar como concluído"
                    >
                      <CheckCircle size={14} />
                      <span>Concluir</span>
                    </button>
                    <button 
                      onClick={() => handleStatusChange(app.id, 'cancelled')} 
                      className="btn-status btn-cancel"
                      title="Cancelar agendamento"
                    >
                      <XCircle size={14} />
                      <span>Cancelar</span>
                    </button>
                  </>
                ) : app.status === 'completed' ? (
                  <button 
                    onClick={() => handleStatusChange(app.id, 'pending')} 
                    className="btn-status btn-pending"
                    title="Voltar para pendente"
                  >
                    <Clock size={14} />
                    <span>Voltar para Pendente</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStatusChange(app.id, 'pending')} 
                    className="btn-status btn-pending"
                    title="Voltar para pendente"
                  >
                    <Clock size={14} />
                    <span>Voltar para Pendente</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>Nenhum agendamento encontrado para este dia ou filtro.</p>
            <button onClick={fetchAppointments} className="btn-retry">
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarberDashboard;