import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BarberDashboard.css";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  User,
  AlertCircle,
  Scissors,
  DollarSign,
  Home,
  Plus,
  CreditCard,
} from "lucide-react";
import api from "../../services/api";

// ✅ Helper de data SEM conversão de timezone
// Extrai apenas a parte "YYYY-MM-DD" da string sem passar pelo construtor Date
const toLocalDate = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0]; // "2026-03-17T03:00:00Z" → "2026-03-17"
};

// ✅ Data de hoje no horário local (sem UTC)
const getTodayLocal = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
};

const BarberDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selectedDate, setSelectedDate] = useState(getTodayLocal()); // ✅ Sem UTC
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("❌ Você precisa estar logado");
        setLoading(false);
        return;
      }

      const data = await api.fetchAgendamentosDoBarbeiro(token);

      if (data.success) {
        setAppointments(data.agendamentos || []);
      } else {
        setError(data.error || "❌ Erro ao carregar agendamentos");
      }
    } catch (err) {
      console.error("❌ Erro ao buscar agendamentos:", err);
      setError(err.error || "❌ Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) { setError("❌ Você precisa estar logado"); return; }

      const data = await api.updateAgendamentoBarbeiro(id, { status: newStatus }, token);

      if (data.success) {
        setAppointments((prev) =>
          prev.map((app) => app.id === id ? { ...app, status: newStatus } : app)
        );
        setError("");
      } else {
        setError(data.error || "❌ Erro ao atualizar status");
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao atualizar status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja apagar este registro permanentemente?")) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) { setError("❌ Você precisa estar logado"); return; }

      const data = await api.deletarAgendamentoBarbeiro(id, token);

      if (data.success) {
        setAppointments((prev) => prev.filter((app) => app.id !== id));
        setError("");
        alert("✅ Agendamento deletado com sucesso!");
      } else {
        setError(data.error || "❌ Erro ao deletar agendamento");
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao deletar agendamento");
    }
  };

  // ✅ Filtro usando toLocalDate — sem UTC
  const filteredAppointments = appointments.filter((app) => {
    const appDate = toLocalDate(app.data_agendamento);
    const matchesDate = appDate === selectedDate;
    const statusLimpo = app.status?.toLowerCase() || "";
    const filtroLimpo = filter.toLowerCase();
    const matchesFilter =
      filtroLimpo === "all" ||
      (filtroLimpo === "pending" &&
        (statusLimpo === "pending" || statusLimpo === "pendente" || statusLimpo === "confirmado")) ||
      statusLimpo === filtroLimpo;
    return matchesDate && matchesFilter;
  });

  // ✅ Stats usando toLocalDate — sem UTC
  const stats = {
    pending: appointments.filter((a) => {
      const s = a.status?.toLowerCase();
      return (
        (s === "pending" || s === "pendente" || s === "confirmado") &&
        toLocalDate(a.data_agendamento) === selectedDate
      );
    }).length,
    completed: appointments.filter((a) => {
      const s = a.status?.toLowerCase();
      return (
        (s === "completed" || s === "concluído") &&
        toLocalDate(a.data_agendamento) === selectedDate
      );
    }).length,
    totalToday: appointments
      .filter((a) => {
        const s = a.status?.toLowerCase();
        return (
          (s === "completed" || s === "concluído") &&
          toLocalDate(a.data_agendamento) === selectedDate
        );
      })
      .reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0),
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed" || s === "concluído") return "status-completed";
    if (s === "cancelled" || s === "cancelado") return "status-cancelled";
    return "status-pending";
  };

  // ✅ formatDate sem UTC
  const formatDate = (dateString) => {
    if (!dateString) return "--/--/--";
    const part = dateString.split("T")[0];
    const [year, month, day] = part.split("-");
    return `${day}/${month}/${year}`;
  };

  const getStatusLabel = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed" || s === "concluído") return "Concluído";
    if (s === "cancelled" || s === "cancelado") return "Cancelado";
    if (s === "confirmado") return "Confirmado (Manual)";
    return "Pendente";
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
        <button onClick={() => navigate("/")} className="btn-home" title="Voltar">
          <Home size={28} />
        </button>

        <div className="header-content">
          <div className="logo-icon"><Scissors size={40} /></div>
          <div>
            <h1>Painel do <span>Barbeiro</span></h1>
            <p>Gestão de Clientes e Serviços</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => navigate("/fiados")}
            className="btn-fiados"
            title="Fiados"
          >
            <CreditCard size={20} />
            <span>Fiados</span>
          </button>

          <button
            onClick={() => navigate("/agendamento-barbeiro")}
            className="btn-novo-agendamento"
            title="Novo agendamento"
          >
            <Plus size={24} />
            <span>Novo</span>
          </button>
        </div>
      </header>

      {/* ERROR BANNER */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <p>{error}</p>
          <button onClick={() => setError("")} className="error-close">&times;</button>
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
            { id: "pending", label: "⏳ Pendentes" },
            { id: "completed", label: "✅ Concluídos" },
            { id: "all", label: "📋 Todos" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`filter-button ${filter === f.id ? "active" : ""}`}
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
              <div className="card-header">
                <span className={`status-tag ${getStatusClass(app.status)}`}>
                  {getStatusLabel(app.status)}
                </span>
                <button onClick={() => handleDelete(app.id)} className="btn-delete" title="Excluir permanentemente">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="card-title">
                <User size={16} />
                <span>{app.cliente_nome || "Cliente"}</span>
              </div>
              <p className="card-subtitle">{app.servico_nome || "Serviço"}</p>

              {app.cliente_whatsapp && (
                <p className="card-whatsapp">📱 {app.cliente_whatsapp}</p>
              )}

              <div className="card-info">
                <div className="card-info-item">
                  <Calendar size={14} />
                  <span>{formatDate(app.data_agendamento)}</span>
                </div>
                <div className="card-info-item">
                  <Clock size={14} />
                  <span className="time-bold">{app.horario_agendamento || "--:--"}</span>
                </div>
              </div>

              <div className="price-tag">
                <DollarSign size={14} />
                <span>R$ {Number(app.valor_total || 0).toFixed(2)}</span>
              </div>

              <div className={`card-actions ${app.status !== "pending" ? "disabled" : ""}`}>
                {app.status === "pending" ? (
                  <>
                    <button onClick={() => handleStatusChange(app.id, "completed")} className="btn-status btn-complete" title="Marcar como concluído">
                      <CheckCircle size={14} />
                      <span>Concluir</span>
                    </button>
                    <button onClick={() => handleStatusChange(app.id, "cancelled")} className="btn-status btn-cancel" title="Cancelar agendamento">
                      <XCircle size={14} />
                      <span>Cancelar</span>
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleStatusChange(app.id, "pending")} className="btn-status btn-pending" title="Voltar para pendente">
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
            <button onClick={fetchAppointments} className="btn-retry">Tentar novamente</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarberDashboard;