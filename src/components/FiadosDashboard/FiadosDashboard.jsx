import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scissors,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  DollarSign,
  Calendar,
  X,
  ArrowLeft,
  User,
} from "lucide-react";
import api from "../../services/api";
import "./FiadosDashboard.css";

// ─── Helper de data SEM conversão de timezone ─────────────────────────────────
// Problema: new Date("2025-07-17") interpreta como UTC → no Brasil vira 16/07
// Solução: parsear a string manualmente, sem passar pelo construtor Date
const formatDate = (dateString) => {
  if (!dateString) return "--";
  const part = dateString.split("T")[0]; // "2025-07-17T03:00:00Z" → "2025-07-17"
  const [year, month, day] = part.split("-");
  if (!year || !month || !day) return "--";
  return `${day}/${month}/${year}`; // "17/07/2025" ✅
};

// Dias restantes também sem problema de timezone
const diasRestantes = (dateString) => {
  if (!dateString) return null;
  const part = dateString.split("T")[0];
  const [year, month, day] = part.split("-").map(Number);
  // new Date(year, month-1, day) → cria no horário LOCAL (sem UTC)
  const vencimento = new Date(year, month - 1, day);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diff = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d em atraso`;
  if (diff === 0) return "Vence hoje";
  return `Vence em ${diff}d`;
};

// Verifica atraso sem problema de timezone
const isAtrasado = (fiado) => {
  if (fiado.status === "pago") return false;
  if (!fiado.data_vencimento) return false;
  const part = fiado.data_vencimento.split("T")[0];
  const [year, month, day] = part.split("-").map(Number);
  const vencimento = new Date(year, month - 1, day);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return vencimento < hoje;
};

const FiadosDashboard = () => {
  const navigate = useNavigate();
  const [fiados, setFiados] = useState([]);
  const [filter, setFilter] = useState("pendente");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [barbeiroNome, setBarbeiroNome] = useState("");
  const [form, setForm] = useState({
    cliente_nome: "",
    cliente_whatsapp: "",
    servico_nome: "",
    valor: "",
    data_vencimento: "",
    observacao: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ─── Buscar nome do barbeiro logado ────────────────────────────────────────
  useEffect(() => {
    const fetchBarbeiro = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const data = await api.fetchBarbeiroLogado(token);
        setBarbeiroNome(data.nome || data.barbeiro?.nome || "");
      } catch {
        // silencioso
      }
    };
    fetchBarbeiro();
  }, []);

  // ─── Buscar fiados ──────────────────────────────────────────────────────────
  const fetchFiados = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      if (!token) { setError("❌ Você precisa estar logado"); return; }
      const data = await api.fetchFiados(token);
      if (data.success) {
        setFiados(data.fiados || []);
      } else {
        setError(data.error || "❌ Erro ao carregar fiados");
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiados();
    const interval = setInterval(fetchFiados, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Marcar como pago ───────────────────────────────────────────────────────
  const handleMarcarPago = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const data = await api.updateFiado(id, { status: "pago" }, token);
      if (data.success) {
        setFiados((prev) => prev.map((f) => f.id === id ? { ...f, status: "pago" } : f));
      } else {
        setError(data.error || "❌ Erro ao atualizar fiado");
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao atualizar fiado");
    }
  };

  // ─── Deletar fiado ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja apagar este fiado permanentemente?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const data = await api.deletarFiado(id, token);
      if (data.success) {
        setFiados((prev) => prev.filter((f) => f.id !== id));
      } else {
        setError(data.error || "❌ Erro ao deletar fiado");
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao deletar fiado");
    }
  };

  // ─── Criar novo fiado ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.cliente_nome || !form.valor) {
      setError("❌ Preencha o nome do cliente e o valor");
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      const data = await api.criarFiado(form, token);
      if (data.success) {
        setFiados((prev) => [data.fiado, ...prev]);
        setShowModal(false);
        setForm({ cliente_nome: "", cliente_whatsapp: "", servico_nome: "", valor: "", data_vencimento: "", observacao: "" });
        setError("");
      } else {
        setError(data.error || "❌ Erro ao criar fiado");
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao criar fiado");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const getStatusEfetivo = (fiado) => {
    const s = fiado.status?.toLowerCase();
    if (s === "pago") return "pago";
    if (isAtrasado(fiado)) return "atrasado";
    return "pendente";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  };

  const avatarColors = ["av-amber", "av-blue", "av-teal", "av-purple", "av-coral"];
  const getAvatarColor = (name) => {
    if (!name) return "av-gray";
    return avatarColors[name.charCodeAt(0) % avatarColors.length];
  };

  // ─── Filtrar ─────────────────────────────────────────────────────────────────
  const filteredFiados = fiados.filter((f) => {
    if (filter === "all") return true;
    return getStatusEfetivo(f) === filter;
  });

  // ─── Estatísticas ────────────────────────────────────────────────────────────
  const stats = {
    totalAberto: fiados.filter((f) => f.status !== "pago").reduce((acc, f) => acc + Number(f.valor || 0), 0),
    atrasados: fiados.filter((f) => isAtrasado(f)).length,
    pagos: fiados.filter((f) => f.status === "pago").reduce((acc, f) => acc + Number(f.valor || 0), 0),
  };

  const atrasados = filteredFiados.filter((f) => getStatusEfetivo(f) === "atrasado");
  const pendentes = filteredFiados.filter((f) => getStatusEfetivo(f) === "pendente");
  const pagos     = filteredFiados.filter((f) => getStatusEfetivo(f) === "pago");

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando fiados...</p>
      </div>
    );
  }

  return (
    <div className="fiados-container">
      {/* HEADER */}
      <header className="fiados-header">
        {/* ✅ Rota correta do App.jsx: /painel */}
        <button onClick={() => navigate("/painel")} className="btn-home" title="Voltar ao painel">
          <ArrowLeft size={24} />
        </button>

        <div className="header-content">
          <div className="logo-icon"><Scissors size={36} /></div>
          <div>
            <h1>Fiados <span>& Cobranças</span></h1>
            {barbeiroNome && (
              <p className="header-barbeiro">
                <User size={12} /> {barbeiroNome}
              </p>
            )}
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-novo-fiado">
          <Plus size={20} />
          <span>Registrar</span>
        </button>
      </header>

      {/* ERROR */}
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
          <p className="stat-label">💰 Em aberto</p>
          <p className="stat-value stat-amber">R$ {stats.totalAberto.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">🔴 Atrasados</p>
          <p className="stat-value stat-red">{stats.atrasados}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">✅ Recebido</p>
          <p className="stat-value stat-green">R$ {stats.pagos.toFixed(2)}</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filter-container">
        {[
          { id: "pendente", label: "⏳ Pendentes" },
          { id: "atrasado", label: "🔴 Atrasados" },
          { id: "pago",     label: "✅ Pagos" },
          { id: "all",      label: "📋 Todos" },
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

      {/* LISTA */}
      <div className="fiados-list">
        {atrasados.length > 0 && (
          <>
            <p className="section-label label-red">🔴 Atrasados</p>
            {atrasados.map((f) => (
              <FiadoCard key={f.id} fiado={f} statusEfetivo="atrasado"
                getInitials={getInitials} getAvatarColor={getAvatarColor}
                onPago={handleMarcarPago} onDelete={handleDelete} />
            ))}
          </>
        )}

        {pendentes.length > 0 && (
          <>
            <p className="section-label label-amber">⏳ Pendentes</p>
            {pendentes.map((f) => (
              <FiadoCard key={f.id} fiado={f} statusEfetivo="pendente"
                getInitials={getInitials} getAvatarColor={getAvatarColor}
                onPago={handleMarcarPago} onDelete={handleDelete} />
            ))}
          </>
        )}

        {pagos.length > 0 && (
          <>
            <p className="section-label label-green">✅ Pagos</p>
            {pagos.map((f) => (
              <FiadoCard key={f.id} fiado={f} statusEfetivo="pago"
                getInitials={getInitials} getAvatarColor={getAvatarColor}
                onPago={handleMarcarPago} onDelete={handleDelete} />
            ))}
          </>
        )}

        {filteredFiados.length === 0 && (
          <div className="empty-state">
            <DollarSign size={48} />
            <p>Nenhum fiado encontrado para este filtro.</p>
            <button onClick={fetchFiados} className="btn-retry">Atualizar</button>
          </div>
        )}
      </div>

      {/* MODAL NOVO FIADO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Fiado</h2>
              <button onClick={() => setShowModal(false)} className="modal-close"><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nome do cliente *</label>
                <input type="text" placeholder="Ex: João Silva"
                  value={form.cliente_nome}
                  onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input type="text" placeholder="(00) 90000-0000"
                  value={form.cliente_whatsapp}
                  onChange={(e) => setForm({ ...form, cliente_whatsapp: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Serviço</label>
                <input type="text" placeholder="Ex: Corte + Barba"
                  value={form.servico_nome}
                  onChange={(e) => setForm({ ...form, servico_nome: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Valor (R$) *</label>
                  <input type="number" placeholder="0,00"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Vencimento</label>
                  <input type="date"
                    value={form.data_vencimento}
                    onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Observação</label>
                <textarea placeholder="Anotação opcional..." rows={3}
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn-cancelar">Cancelar</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-salvar">
                {submitting ? "Salvando..." : "Salvar fiado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-componente FiadoCard ─────────────────────────────────────────────────
const FiadoCard = ({ fiado, statusEfetivo, getInitials, getAvatarColor, onPago, onDelete }) => {
  const borderMap = { atrasado: "card-border-red", pendente: "card-border-amber", pago: "card-border-green" };
  const badgeMap  = {
    atrasado: <span className="badge badge-atr">🔴 Atrasado</span>,
    pendente: <span className="badge badge-pend">⏳ Pendente</span>,
    pago:     <span className="badge badge-pago">✅ Pago</span>,
  };

  return (
    <div className={`fiado-card ${borderMap[statusEfetivo]}`}>
      <div className="card-header">
        {badgeMap[statusEfetivo]}
        <button onClick={() => onDelete(fiado.id)} className="btn-delete" title="Excluir">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="card-identity">
        <div className={`avatar ${getAvatarColor(fiado.cliente_nome)}`}>
          {getInitials(fiado.cliente_nome)}
        </div>
        <div>
          <p className="card-title">{fiado.cliente_nome || "Cliente"}</p>
          <p className="card-subtitle">{fiado.servico_nome || "Serviço não informado"}</p>
          {fiado.cliente_whatsapp && (
            <p className="card-whatsapp">📱 {fiado.cliente_whatsapp}</p>
          )}
          {fiado.barbeiro_nome && (
            <p className="card-barbeiro">✂️ Registrado por: {fiado.barbeiro_nome}</p>
          )}
        </div>
      </div>

      <div className="card-info">
        <div className="card-info-item">
          <Calendar size={13} />
          {/* ✅ formatDate sem UTC — usa split manual */}
          <span>Fiado em {formatDate(fiado.data_fiado || fiado.created_at)}</span>
        </div>
        {fiado.data_vencimento && (
          <div className={`card-info-item ${statusEfetivo === "atrasado" ? "info-red" : ""}`}>
            <Clock size={13} />
            {/* ✅ diasRestantes sem UTC */}
            <span>{diasRestantes(fiado.data_vencimento)}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="price-tag">
          <DollarSign size={14} />
          <span>R$ {Number(fiado.valor || 0).toFixed(2)}</span>
        </div>
        {statusEfetivo !== "pago" && (
          <button onClick={() => onPago(fiado.id)} className="btn-pago">
            <CheckCircle size={14} />
            Marcar como pago
          </button>
        )}
      </div>

      {fiado.observacao && (
        <p className="card-obs">📝 {fiado.observacao}</p>
      )}
    </div>
  );
};

export default FiadosDashboard;