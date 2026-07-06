import React, { useState } from "react";
import {
  Repeat,
  Scissors,
  User,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  Check,
  X,
  Edit3,
  Trash2,
} from "lucide-react";
import "./ModalClientesFixos.css";
import api from "../../services/api";

const formatarWhatsApp = (valor) => {
  const n = valor.replace(/\D/g, "");
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 11)
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
};

const DIAS_SEMANA = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
];

const gerarHorariosPorDia = (diaSemana) => {
  const dia = parseInt(diaSemana);
  const horarios = [];
  const gerar = (inicioH, fimH, fimM) => {
    let total = inicioH * 60;
    const limite = fimH * 60 + fimM;
    while (total <= limite) {
      const h = String(Math.floor(total / 60)).padStart(2, "0");
      const m = String(total % 60).padStart(2, "0");
      horarios.push(`${h}:${m}`);
      total += 50;
    }
  };
  if (dia === 0 || dia === 1) return [];
  gerar(7, 11, 10);
  if (dia === 2 || dia === 3) gerar(13, 19, 40);
  else if (dia === 4) gerar(13, 20, 30);
  else gerar(13, 21, 50);
  return horarios;
};

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const FORM_INICIAL = {
  nome: "",
  whatsapp: "",
  servico: "",
  dia_semana: "2",
  horario: "",
  observacao: "",
  frequencia: "semanal",
  data_referencia: hojeISO(),
};

export default function ModalClientesFixos({
  onClose,
  clientesFixos,
  setClientesFixos,
}) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [filtroDia, setFiltroDia] = useState("todos");

  const token = localStorage.getItem("authToken");

  const feedback = (msg, tipo = "sucesso") => {
    if (tipo === "sucesso") setSucesso(msg);
    else setErro(msg);
    setTimeout(() => {
      setSucesso("");
      setErro("");
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!form.nome.trim() || !form.horario) {
      feedback("Preencha nome e horário.", "erro");
      return;
    }
    const apenasNumeros = form.whatsapp.replace(/\D/g, "");
    if (apenasNumeros.length > 0 && apenasNumeros.length < 10) {
      feedback("WhatsApp inválido.", "erro");
      return;
    }
    if (form.frequencia === "quinzenal" && !form.data_referencia) {
      feedback(
        "Informe a data da primeira sessão para o cliente quinzenal.",
        "erro",
      );
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, whatsapp: apenasNumeros };
      if (editandoId !== null) {
        const data = await api.atualizarClienteFixo(editandoId, payload, token);
        if (!data.success) throw new Error(data.error);
        setClientesFixos((prev) =>
          prev.map((c) =>
            c.id === editandoId
              ? { ...data.cliente, dia_semana: String(data.cliente.dia_semana) }
              : c,
          ),
        );
        feedback("✅ Cliente atualizado!");
        setEditandoId(null);
      } else {
        const data = await api.criarClienteFixo(payload, token);
        if (!data.success) throw new Error(data.error);
        setClientesFixos((prev) => [
          ...prev,
          { ...data.cliente, dia_semana: String(data.cliente.dia_semana) },
        ]);
        feedback("✅ Cliente fixo cadastrado!");
      }
      setForm(FORM_INICIAL);
    } catch (err) {
      feedback(err.message || "Erro ao salvar.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (c) => {
    setForm({
      nome: c.nome,
      whatsapp: c.whatsapp ? formatarWhatsApp(c.whatsapp) : "",
      servico: c.servico || "",
      dia_semana: String(c.dia_semana),
      horario: c.horario,
      observacao: c.observacao || "",
      frequencia: c.frequencia || "semanal",
      data_referencia: c.data_referencia
        ? c.data_referencia.split("T")[0]
        : hojeISO(),
    });
    setEditandoId(c.id);
  };

  const cancelarEdicao = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
    setErro("");
  };

  const remover = async (id) => {
    if (!window.confirm("Remover este cliente fixo?")) return;
    try {
      const data = await api.deletarClienteFixo(id, token);
      if (!data.success) throw new Error(data.error);
      setClientesFixos((prev) => prev.filter((c) => c.id !== id));
      feedback("🗑️ Cliente removido.");
    } catch (err) {
      feedback(err.message || "Erro ao remover.", "erro");
    }
  };

  const nomeDia = (valor) =>
    DIAS_SEMANA.find((d) => d.value === valor)?.label || "";

  const clientesFiltrados =
    filtroDia === "todos"
      ? clientesFixos
      : clientesFixos.filter((c) => c.dia_semana === filtroDia);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        {/* Cabeçalho */}
        <div className="modal-header">
          <div className="modal-header-left">
            <Repeat size={18} />
            <span>Clientes Fixos</span>
            <span className="excecao-badge">{clientesFixos.length}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {sucesso && (
            <div className="cf-feedback cf-feedback-ok">{sucesso}</div>
          )}
          {erro && <div className="cf-feedback cf-feedback-err">{erro}</div>}

          {/* Formulário */}
          <div className="cf-form">
            <h3 className="cf-form-title">
              <Scissors size={14} />
              {editandoId ? "Editando cliente fixo" : "Novo cliente fixo"}
            </h3>

            <div className="cf-form-grid">
              <div className="cf-field">
                <label>
                  <User size={13} /> Nome *
                </label>
                <input
                  placeholder="Ex: João Silva"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>

              <div className="cf-field">
                <label>
                  <Phone size={13} /> WhatsApp
                </label>
                <input
                  placeholder="(89) 99999-9999"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      whatsapp: formatarWhatsApp(e.target.value),
                    })
                  }
                  maxLength={15}
                  type="tel"
                />
              </div>

              <div className="cf-field">
                <label>
                  <Scissors size={13} /> Serviço
                </label>
                <input
                  placeholder="Ex: Corte + Barba"
                  value={form.servico}
                  onChange={(e) =>
                    setForm({ ...form, servico: e.target.value })
                  }
                />
              </div>

              <div className="cf-field">
                <label>
                  <Calendar size={13} /> Dia da semana
                </label>
                <select
                  value={form.dia_semana}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dia_semana: e.target.value,
                      horario: "",
                    })
                  }
                >
                  {DIAS_SEMANA.filter(
                    (d) => d.value !== "0" && d.value !== "1",
                  ).map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cf-field">
                <label>
                  <Repeat size={13} /> Frequência
                </label>
                <select
                  value={form.frequencia}
                  onChange={(e) =>
                    setForm({ ...form, frequencia: e.target.value })
                  }
                >
                  <option value="semanal">Toda semana</option>
                  <option value="quinzenal">A cada 15 dias</option>
                </select>
              </div>

              {form.frequencia === "quinzenal" && (
                <div className="cf-field">
                  <label>
                    <Calendar size={13} /> Data da primeira sessão *
                  </label>
                  <input
                    type="date"
                    value={form.data_referencia}
                    onChange={(e) =>
                      setForm({ ...form, data_referencia: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="cf-field">
                <label>
                  <Clock size={13} /> Horário fixo *
                </label>
                <select
                  value={form.horario}
                  onChange={(e) =>
                    setForm({ ...form, horario: e.target.value })
                  }
                >
                  <option value="">Selecione o horário</option>
                  {gerarHorariosPorDia(form.dia_semana).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cf-field cf-field-full">
                <label>
                  <MessageSquare size={13} /> Observação
                </label>
                <input
                  placeholder="Ex: prefere não usar máquina 0"
                  value={form.observacao}
                  onChange={(e) =>
                    setForm({ ...form, observacao: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="cf-form-actions">
              <button
                className="cf-btn-salvar"
                onClick={handleSubmit}
                disabled={loading}
              >
                <Check size={15} />
                {loading
                  ? "Salvando..."
                  : editandoId
                    ? "Atualizar"
                    : "Cadastrar"}
              </button>
              {editandoId && (
                <button className="cf-btn-cancelar" onClick={cancelarEdicao}>
                  <X size={15} /> Cancelar edição
                </button>
              )}
            </div>
          </div>

          {/* Filtro por dia */}
          <div className="cf-filtros">
            <button
              className={`cf-filtro-btn ${filtroDia === "todos" ? "active" : ""}`}
              onClick={() => setFiltroDia("todos")}
            >
              Todos ({clientesFixos.length})
            </button>
            {DIAS_SEMANA.map((d) => {
              const count = clientesFixos.filter(
                (c) => c.dia_semana === d.value,
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={d.value}
                  className={`cf-filtro-btn ${filtroDia === d.value ? "active" : ""}`}
                  onClick={() => setFiltroDia(d.value)}
                >
                  {d.label.split("-")[0]} ({count})
                </button>
              );
            })}
          </div>

          {/* Lista de cards */}
          {clientesFiltrados.length === 0 ? (
            <div className="cf-vazio">
              <User size={32} />
              <p>Nenhum cliente fixo cadastrado.</p>
            </div>
          ) : (
            <div className="cf-grid">
              {[...clientesFiltrados]
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map((c) => (
                  <div
                    key={c.id}
                    className={`cf-card ${editandoId === c.id ? "cf-card-editing" : ""}`}
                  >
                    <div className="cf-card-top">
                      <div className="cf-avatar">
                        {c.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="cf-card-info">
                        <p className="cf-card-nome">{c.nome}</p>
                        {c.servico && (
                          <p className="cf-card-servico">
                            <Scissors size={11} /> {c.servico}
                          </p>
                        )}
                      </div>
                      <div className="cf-card-acoes">
                        <button
                          onClick={() => iniciarEdicao(c)}
                          className="cf-btn-edit"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => remover(c.id)}
                          className="cf-btn-del"
                          title="Remover permanentemente"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="cf-card-bottom">
                      <span className="cf-tag cf-tag-dia">
                        <Calendar size={11} /> {nomeDia(c.dia_semana)}
                      </span>
                      <span className="cf-tag cf-tag-hora">
                        <Clock size={11} /> {c.horario}
                      </span>
                      <span
                        className={`cf-tag ${
                          c.frequencia === "quinzenal"
                            ? "cf-tag-quinzenal"
                            : "cf-tag-semanal"
                        }`}
                      >
                        <Repeat size={11} />
                        {c.frequencia === "quinzenal"
                          ? "15 em 15 dias"
                          : "Toda semana"}
                      </span>
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="cf-tag cf-tag-wa"
                        >
                          📱 WhatsApp
                        </a>
                      )}
                    </div>

                    {c.observacao && (
                      <p className="cf-obs">💬 {c.observacao}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}