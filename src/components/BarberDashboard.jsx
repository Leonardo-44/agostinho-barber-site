import React, { useState } from 'react';
import "./BarberDashboard.css";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  FileText, 
  AlertCircle,
  Scissors
} from 'lucide-react';

const initialAppointments = [
  {
    id: 1,
    clientName: "Carlos Eduardo",
    service: "Corte Degradê + Barba",
    date: "2025-12-31",
    time: "14:30",
    status: "pending",
    notes: "Cliente pede para não baixar muito em cima. Urgente!"
  },
  {
    id: 2,
    clientName: "Roberto Justus",
    service: "Barba Terapia",
    date: "2025-12-30",
    time: "15:00",
    status: "completed",
    notes: ""
  },
  {
    id: 3,
    clientName: "Manoel Gomes",
    service: "Corte Simples",
    date: "2025-12-30",
    time: "16:00",
    status: "pending",
    notes: "Atraso de 10 min avisado. Ligar antes de iniciar."
  },
  {
    id: 4,
    clientName: "Maria Oliveira",
    service: "Hidratação Capilar",
    date: "2025-12-30",
    time: "16:45",
    status: "cancelled",
    notes: "Cancelado pelo cliente ontem à noite."
  }
];

const BarberDashboard = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filter, setFilter] = useState('pending');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleStatusChange = (id, newStatus) => {
    const updatedList = appointments.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    setAppointments(updatedList);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja APAGAR este agendamento?")) {
      const updatedList = appointments.filter(app => app.id !== id);
      setAppointments(updatedList);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') {
      return app.date === selectedDate;
    }
    return app.status === filter && app.date === selectedDate;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-icon">
          <Scissors size={40} />
        </div>
        <h1>
          Painel do <span>Barbeiro</span>
        </h1>
        <p>Gerencie os agendamentos de hoje</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Pendentes</p>
          <p className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Concluídos</p>
          <p className="stat-value" style={{ color: '#22c55e' }}>{stats.completed}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Cancelados</p>
          <p className="stat-value" style={{ color: '#ef4444' }}>{stats.cancelled}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-container">
        <div className="filter-button-group">
          {["pending", "completed", "cancelled", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-button ${filter === f ? 'active' : ''}`}
            >
              {f === "all"
                ? "Todos"
                : f === "pending"
                ? "Pendentes"
                : f === "completed"
                ? "Concluídos"
                : "Cancelados"}
            </button>
          ))}
        </div>
        
        {/* Calendário para filtro "Todos" */}
        {filter === "all" && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              backgroundColor: '#292524', 
              border: '1px solid #44403c',
              borderRadius: '0.75rem',
              padding: '1rem',
              maxWidth: '320px'
            }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#d1d5db'
              }}>
                Selecione a data:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1c1a19',
                  border: '1px solid #44403c',
                  borderRadius: '0.5rem',
                  color: '#f3f4f6',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid de Agendamentos */}
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
                  disabled={app.status === "completed"}
                  title="Deletar"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Client Info */}
              <div className="card-title">
                <User size={18} />
                {app.clientName}
              </div>
              <p className="card-subtitle">{app.service}</p>

              {/* Date and Time */}
              <div className="card-info">
                <div className="card-info-item">
                  <Calendar size={16} />
                  <span>{app.date.split("-").reverse().join("/")}</span>
                </div>
                <div className="card-info-item">
                  <Clock size={16} />
                  <span className="font-bold">{app.time}</span>
                </div>
              </div>

              {/* Notes */}
              {app.notes && (
                <div className="appointment-notes">
                  <FileText size={14} style={{ display: "inline", marginRight: "5px" }} />
                  {app.notes}
                </div>
              )}

              {/* Actions */}
              {app.status !== "cancelled" ? (
                <div className="card-actions">
                  {app.status !== "completed" && (
                    <button
                      onClick={() => handleStatusChange(app.id, "completed")}
                      className="btn-status btn-complete"
                    >
                      <CheckCircle size={16} />
                      <span className="hidden sm:inline">Concluir</span>
                    </button>
                  )}
                  {app.status !== "pending" && (
                    <button
                      onClick={() => handleStatusChange(app.id, "pending")}
                      className="btn-status btn-pending"
                    >
                      <Clock size={16} />
                      <span className="hidden sm:inline">Pendente</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(app.id, "cancelled")}
                    className="btn-status btn-delete-action"
                    title="Cancelar"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ) : (
                <div className="card-actions cancelled">
                  Serviço Cancelado
                </div>
              )}
            </div>
          ))
        ) : (
          /* Empty State */
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>Nenhum agendamento encontrado para este filtro.</p>
            </div>
          </div>
        )}
      </div>

      {/* Botão Voltar */}
      <div className="btn-back-container">
        <button
          onClick={() => window.history.back()}
          className="btn-back"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
};

export default BarberDashboard;