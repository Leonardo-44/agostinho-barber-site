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
  Repeat,
} from "lucide-react";
import api from "../../services/api";
import ModalClientesFixos from "../ModalClientesFixos/ModalClientesFixos";

// ─── Helpers ────────────────────────────────────────────────────────────────

const toLocalDate = (d) => (d ? d.split("T")[0] : "");

const getTodayLocal = () => {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
};

const getDiaSemana = (dateString) => {
  if (!dateString) return -1;
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
};

const formatDate = (dateString) => {
  if (!dateString) return "--/--/--";
  const [y, m, d] = dateString.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

// ✅ converte "YYYY-MM-DD" (ou algo que comece com isso) em nº de dias desde a
// época, sempre em UTC puro — evita qualquer bug de timezone/DST
const paraDiasDesdeEpoch = (dataString) => {
  const [y, m, d] = dataString.split("T")[0].split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};

// ✅ Um cliente fixo só "existe" numa data específica se:
//    - for semanal (sempre existe no dia da semana correspondente), ou
//    - for quinzenal E a data cair exatamente no ciclo de 14 em 14 dias
//      a partir de data_referencia.
// Essa é a MESMA regra usada no backend (listarHorariosBloqueados), para os
// cards do painel baterem com os horários realmente bloqueados no agendamento.
const clienteFixoAtivoNaData = (cliente, dataString) => {
  if (cliente.frequencia !== "quinzenal") return true;
  if (!cliente.data_referencia) return true; // sem referência: mostra por segurança

  const diasRef = paraDiasDesdeEpoch(cliente.data_referencia);
  const diasAlvo = paraDiasDesdeEpoch(dataString);
  const diff = diasAlvo - diasRef;

  return diff >= 0 && diff % 14 === 0;
};

const getStatusClass = (status) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "concluído") return "status-completed";
  if (s === "cancelled" || s === "cancelado") return "status-cancelled";
  return "status-pending";
};

const getStatusLabel = (status) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "concluído") return "Concluído";
  if (s === "cancelled" || s === "cancelado") return "Cancelado";
  if (s === "confirmado") return "Confirmado (Manual)";
  return "Pendente";
};

// ─── Chave para identificar fixo + dia ──────────────────────────────────────
// fixoAgIds: { "clienteId_YYYY-MM-DD": agendamentoId }
// Guarda o ID do agendamento criado no banco para cada fixo por dia
const fixoKey = (clienteId, date) => `${clienteId}_${date}`;

const loadStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
};

// ─── Componente ─────────────────────────────────────────────────────────────

const BarberDashboard = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [clientesFixos, setClientesFixos] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selectedDate, setSelectedDate] = useState(getTodayLocal());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalFixos, setModalFixos] = useState(false);

  // { "clienteId_YYYY-MM-DD": "pending" | "completed" | "cancelled" }
  const [statusFixos, setStatusFixos] = useState(() =>
    loadStorage("statusFixos", {}),
  );

  // { "clienteId_YYYY-MM-DD": agendamentoId } — ID do agendamento criado no banco
  const [fixoAgIds, setFixoAgIds] = useState(() =>
    loadStorage("fixoAgIds", {}),
  );

  // Set de chaves ocultas naquele dia: ["clienteId_YYYY-MM-DD"]
  const [fixosOcultos, setFixosOcultos] = useState(
    () => new Set(loadStorage("fixosOcultos", [])),
  );

  const [diasExcecao, setDiasExcecao] = useState([]);
  const [novaExcecao, setNovaExcecao] = useState("");
  const [loadingExc, setLoadingExc] = useState(false);
  const [excecaoError, setExcecaoError] = useState("");
  const [mostrarExc, setMostrarExc] = useState(false);

  // Persiste no localStorage
  useEffect(() => {
    localStorage.setItem("statusFixos", JSON.stringify(statusFixos));
  }, [statusFixos]);
  useEffect(() => {
    localStorage.setItem("fixoAgIds", JSON.stringify(fixoAgIds));
  }, [fixoAgIds]);
  useEffect(() => {
    localStorage.setItem("fixosOcultos", JSON.stringify([...fixosOcultos]));
  }, [fixosOcultos]);

  // ── Fetches ───────────────────────────────────────────────────────────────

  const fetchAppointments = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
        setError("");
      }
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("❌ Você precisa estar logado");
        if (showLoading) setLoading(false);
        return;
      }
      const data = await api.fetchAgendamentosDoBarbeiro(token);
      if (data.success) {
        setAppointments((prev) => {
          const next = JSON.stringify(data.agendamentos || []);
          return next !== JSON.stringify(prev) ? data.agendamentos || [] : prev;
        });
      } else {
        setError(data.error || "❌ Erro ao carregar agendamentos");
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao conectar com o servidor");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchClientesFixos = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const data = await api.fetchClientesFixos(token);
      if (data.success)
        setClientesFixos(
          data.clientes.map((c) => ({
            ...c,
            dia_semana: String(c.dia_semana),
          })),
        );
    } catch (err) {
      console.error("Erro ao buscar clientes fixos:", err);
    }
  };

  const fetchDiasExcecao = async () => {
    try {
      const data = await api.fetchDiasExcecao();
      if (data.success) setDiasExcecao(data.dias || []);
    } catch (err) {
      console.error("Erro ao buscar dias de exceção:", err);
    }
  };

  useEffect(() => {
    fetchAppointments(true);
    fetchClientesFixos();
    fetchDiasExcecao();
    const interval = setInterval(() => fetchAppointments(false), 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Ações de agendamentos normais ─────────────────────────────────────────

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("❌ Você precisa estar logado");
        return;
      }
      const data = await api.updateAgendamentoBarbeiro(
        id,
        { status: newStatus },
        token,
      );
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
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
      if (!token) {
        setError("❌ Você precisa estar logado");
        return;
      }
      const data = await api.deletarAgendamentoBarbeiro(id, token);
      if (data.success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        setError("");
        alert("✅ Agendamento deletado com sucesso!");
      } else {
        setError(data.error || "❌ Erro ao deletar agendamento");
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao deletar agendamento");
    }
  };

  // ── Ações de clientes fixos ───────────────────────────────────────────────

  const getStatusFixo = (clienteId) =>
    statusFixos[fixoKey(clienteId, selectedDate)] || "pending";

  // Concluir ou cancelar um fixo — cria agendamento real no banco
  const handleStatusFixo = async (cliente, novoStatus) => {
    const token = localStorage.getItem("authToken");
    const key = fixoKey(cliente.id, selectedDate);

    try {
      // Se já existe agendamento no banco para este fixo neste dia, atualiza o status
      const agIdExistente = fixoAgIds[key];
      if (agIdExistente) {
        const data = await api.updateAgendamentoBarbeiro(
          agIdExistente,
          { status: novoStatus },
          token,
        );
        if (!data.success) throw new Error(data.error);
        setStatusFixos((prev) => ({ ...prev, [key]: novoStatus }));
        // Recarrega para refletir nos stats
        await fetchAppointments(false);
        return;
      }

      // Se não existe, cria um agendamento novo no banco
      const payload = {
        cliente_nome: cliente.nome,
        cliente_whatsapp: cliente.whatsapp || "",
        servico_nome: cliente.servico,
        valor_total: 0,
        data_agendamento: selectedDate,
        horario_agendamento: cliente.horario,
        status: novoStatus,
        observacoes: cliente.observacao || "",
      };

      const data = await api.criarAgendamentoFixo(payload, token);
      if (!data.success) throw new Error(data.error);

      // Salva o ID do agendamento criado para poder atualizar/deletar depois
      setFixoAgIds((prev) => ({ ...prev, [key]: data.agendamento.id }));
      setStatusFixos((prev) => ({ ...prev, [key]: novoStatus }));

      // Recarrega agendamentos para refletir nos stats e na lista
      await fetchAppointments(false);
    } catch (err) {
      setError(err.message || "❌ Erro ao salvar status do cliente fixo");
    }
  };

  // Voltar para pendente — deleta o agendamento criado no banco
  const handleVoltarPendente = async (clienteId) => {
    const token = localStorage.getItem("authToken");
    const key = fixoKey(clienteId, selectedDate);
    const agId = fixoAgIds[key];

    try {
      if (agId) {
        const data = await api.deletarAgendamentoFixo(agId, token);
        if (!data.success) throw new Error(data.error);
        // Remove o ID salvo e volta o status local para pending
        setFixoAgIds((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
        await fetchAppointments(false);
      }
      setStatusFixos((prev) => ({ ...prev, [key]: "pending" }));
    } catch (err) {
      setError(err.message || "❌ Erro ao voltar para pendente");
    }
  };

  // Ocultar fixo só do dia (sem criar agendamento)
  const ocultarFixoDia = (clienteId) => {
    if (
      !window.confirm(
        "Remover do dia de hoje? O cliente continuará aparecendo nos próximos dias.",
      )
    )
      return;
    setFixosOcultos(
      (prev) => new Set([...prev, fixoKey(clienteId, selectedDate)]),
    );
  };

  // ── Dias de exceção ───────────────────────────────────────────────────────

  const adicionarExcecao = async () => {
    if (!novaExcecao) return;
    const dia = new Date(novaExcecao.replace(/-/g, "/")).getDay();
    if (dia !== 0 && dia !== 1) {
      setExcecaoError(
        "⚠️ Só é possível adicionar Domingos ou Segundas-feiras.",
      );
      return;
    }
    setLoadingExc(true);
    setExcecaoError("");
    try {
      const token = localStorage.getItem("authToken");
      const data = await api.adicionarDiaExcecao(novaExcecao, token);
      if (data.success) {
        setDiasExcecao((prev) => [...new Set([...prev, novaExcecao])].sort());
        setNovaExcecao("");
      } else setExcecaoError(data.error || "❌ Erro ao salvar dia");
    } catch {
      setExcecaoError("❌ Erro ao salvar dia");
    } finally {
      setLoadingExc(false);
    }
  };

  const removerExcecao = async (data) => {
    try {
      const token = localStorage.getItem("authToken");
      const resp = await api.removerDiaExcecao(data, token);
      if (resp.success)
        setDiasExcecao((prev) => prev.filter((d) => d !== data));
    } catch {
      setExcecaoError("❌ Erro ao remover dia");
    }
  };

  // ── Dados derivados ───────────────────────────────────────────────────────

  const filteredAppointments = appointments.filter((app) => {
    const key = Object.entries(fixoAgIds).find(([, id]) => id === app.id)?.[0];
    if (key) return false;

    const matchDate = toLocalDate(app.data_agendamento) === selectedDate;
    if (!matchDate) return false;

    const s = app.status?.toLowerCase() || "";

    // Se não está pendente, sempre mostra para permitir reverter
    if (
      s === "completed" ||
      s === "concluído" ||
      s === "cancelled" ||
      s === "cancelado"
    ) {
      return true;
    }

    // Se está pendente, respeita o filtro
    if (filter === "completed") return false;
    return true; // "pending" e "all"
  });

  const diaSemanaSelected = String(getDiaSemana(selectedDate));

  const clientesFixosFiltrados = clientesFixos.filter((c) => {
    if (c.dia_semana !== diaSemanaSelected) return false;
    // ✅ respeita a cadência quinzenal — não mostra o card fora do ciclo de 14 dias
    if (!clienteFixoAtivoNaData(c, selectedDate)) return false;
    if (fixosOcultos.has(fixoKey(c.id, selectedDate))) return false;
    const status = getStatusFixo(c.id);
    if (filter === "pending") return status === "pending";
    if (filter === "completed") return status === "completed";
    return true; // "all"
  });

  const todosOsCards = [
    ...filteredAppointments.map((a) => ({ tipo: "agendamento", ...a })),
    ...clientesFixosFiltrados.map((c) => ({ tipo: "fixo", ...c })),
  ].sort((a, b) => {
    const hA = a.horario_agendamento || a.horario || "00:00";
    const hB = b.horario_agendamento || b.horario || "00:00";
    return hA.localeCompare(hB);
  });

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
      .reduce((acc, cur) => acc + (Number(cur.valor_total) || 0), 0),
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Carregando painel de controle...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ── HEADER ── */}
      <header className="dashboard-header">
        <div className="header-top">
          <button
            onClick={() => navigate("/")}
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
              <h1>
                Painel do <span>Barbeiro</span>
              </h1>
              <p>Gestão de Clientes e Serviços</p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setModalFixos(true)}
            className="btn-fixos"
            title="Clientes Fixos"
          >
            <Repeat size={18} />
            <span>Fixos</span>
            {clientesFixos.length > 0 && (
              <span className="excecao-badge">{clientesFixos.length}</span>
            )}
          </button>
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
          >
            <Plus size={24} />
            <span>Novo</span>
          </button>
        </div>
      </header>

      {/* ── MODAL CLIENTES FIXOS ── */}
      {modalFixos && (
        <ModalClientesFixos
          onClose={() => setModalFixos(false)}
          clientesFixos={clientesFixos}
          setClientesFixos={setClientesFixos}
        />
      )}

      {/* ── ERRO ── */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <p>{error}</p>
          <button onClick={() => setError("")} className="error-close">
            &times;
          </button>
        </div>
      )}

      {/* ── STATS ── */}
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
          <p className="stat-value stat-revenue">
            R$ {stats.totalToday.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ── FILTROS ── */}
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

      {/* ── DIAS DE EXCEÇÃO ── */}
      <div className="excecao-container">
        <button
          className="excecao-toggle"
          onClick={() => setMostrarExc((p) => !p)}
        >
          <Calendar size={16} />
          <span>Abrir dia fechado (Dom/Seg)</span>
          <span className="excecao-badge">{diasExcecao.length}</span>
          <span className="excecao-chevron">{mostrarExc ? "▲" : "▼"}</span>
        </button>

        {mostrarExc && (
          <div className="excecao-body">
            {excecaoError && <p className="excecao-error">{excecaoError}</p>}
            <div className="excecao-input-row">
              <input
                type="date"
                value={novaExcecao}
                onChange={(e) => {
                  setNovaExcecao(e.target.value);
                  setExcecaoError("");
                }}
                className="date-picker-input"
              />
              <button
                onClick={adicionarExcecao}
                className="btn-novo-agendamento"
                disabled={loadingExc || !novaExcecao}
              >
                <Plus size={16} />
                {loadingExc ? "Salvando..." : "Adicionar"}
              </button>
            </div>
            {diasExcecao.length === 0 ? (
              <p className="excecao-vazio">Nenhum dia de exceção cadastrado.</p>
            ) : (
              <ul className="excecao-list">
                {diasExcecao.map((d) => (
                  <li key={d} className="excecao-item">
                    <span>📆 {d.split("-").reverse().join("/")}</span>
                    <button
                      onClick={() => removerExcecao(d)}
                      className="btn-delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── GRADE DE CARDS ── */}
      <div className="appointments-grid">
        {todosOsCards.length > 0 ? (
          todosOsCards.map((item) => {
            /* ── Card FIXO ── */
            if (item.tipo === "fixo") {
              const statusFixo = getStatusFixo(item.id);
              return (
                <div
                  key={`fixo-${item.id}`}
                  className="appointment-card appointment-card-fixo"
                >
                  <div className="card-header">
                    <span
                      className={`status-tag ${getStatusClass(statusFixo)}`}
                    >
                      {getStatusLabel(statusFixo)}
                      <span className="fixo-tag-badge"> · Fixo</span>
                    </span>
                    <button
                      onClick={() => ocultarFixoDia(item.id)}
                      className="btn-delete"
                      title="Remover do dia"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="card-title">
                    <User size={16} />
                    <span>{item.nome || "Cliente"}</span>
                  </div>
                  <p className="card-subtitle">{item.servico || "Serviço"}</p>
                  {item.whatsapp && (
                    <p className="card-whatsapp">📱 {item.whatsapp}</p>
                  )}

                  <div className="card-info">
                    <div className="card-info-item">
                      <Calendar size={14} />
                      <span>{selectedDate.split("-").reverse().join("/")}</span>
                    </div>
                    <div className="card-info-item">
                      <Clock size={14} />
                      <span className="time-bold">
                        {item.horario || "--:--"}
                      </span>
                    </div>
                  </div>

                  {item.observacao && (
                    <p className="card-obs">💬 {item.observacao}</p>
                  )}

                  <div className="card-actions">
                    {statusFixo === "pending" ? (
                      <>
                        <button
                          onClick={() => handleStatusFixo(item, "completed")}
                          className="btn-status btn-complete"
                        >
                          <CheckCircle size={14} />
                          <span>Concluir</span>
                        </button>
                        <button
                          onClick={() => handleStatusFixo(item, "cancelled")}
                          className="btn-status btn-cancel"
                        >
                          <XCircle size={14} />
                          <span>Cancelar</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleVoltarPendente(item.id)}
                        className="btn-status btn-pending"
                      >
                        <Clock size={14} />
                        <span>Voltar para Pendente</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            /* ── Card NORMAL ── */
            return (
              <div key={`ag-${item.id}`} className="appointment-card">
                <div className="card-header">
                  <span className={`status-tag ${getStatusClass(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-delete"
                    title="Excluir permanentemente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="card-title">
                  <User size={16} />
                  <span>{item.cliente_nome || "Cliente"}</span>
                </div>
                <p className="card-subtitle">
                  {item.servico_nome || "Serviço"}
                </p>
                {item.cliente_whatsapp && (
                  <p className="card-whatsapp">📱 {item.cliente_whatsapp}</p>
                )}

                <div className="card-info">
                  <div className="card-info-item">
                    <Calendar size={14} />
                    <span>{formatDate(item.data_agendamento)}</span>
                  </div>
                  <div className="card-info-item">
                    <Clock size={14} />
                    <span className="time-bold">
                      {item.horario_agendamento || "--:--"}
                    </span>
                  </div>
                </div>

                <div className="price-tag">
                  <DollarSign size={14} />
                  <span>R$ {Number(item.valor_total || 0).toFixed(2)}</span>
                </div>

                <div className={`card-actions`}>
                  {item.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(item.id, "completed")}
                        className="btn-status btn-complete"
                      >
                        <CheckCircle size={14} />
                        <span>Concluir</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, "cancelled")}
                        className="btn-status btn-cancel"
                      >
                        <XCircle size={14} />
                        <span>Cancelar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(item.id, "pending")}
                      className="btn-status btn-pending"
                    >
                      <Clock size={14} />
                      <span>Voltar para Pendente</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>Nenhum agendamento encontrado para este dia ou filtro.</p>
            <button
              onClick={() => fetchAppointments(false)}
              className="btn-retry"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarberDashboard;