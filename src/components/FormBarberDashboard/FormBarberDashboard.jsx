import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Scissors,
  Check,
  AlertCircle,
  Home,
  Loader,
  Phone,
  User,
} from "lucide-react";

const FormBarberDashboard = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    data: "",
    horario: "",
    servico: "",
    adicionais: [],
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [servicos, setServicos] = useState([]);
  const [agendamentosOcupados, setAgendamentosOcupados] = useState([]);
  const [loadingServicos, setLoadingServicos] = useState(true);

  const adicionais = [
    { id: 1, nome: "Matização", preco: 8, emoji: "🎨" },
    { id: 2, nome: "Relaxamento", preco: 30, emoji: "🧴" },
    { id: 3, nome: "Tintura", preco: 25, emoji: "🎨" },
    { id: 4, nome: "Hidratação", preco: 12, emoji: "💧" },
    { id: 5, nome: "Sobrancelha", preco: 5, emoji: "👁️" },
    { id: 6, nome: "Pezinho", preco: 5, emoji: "✨" },
    { id: 7, nome: "Barba", preco: 10, emoji: "🧔" },
    { id: 8, nome: "Desenho (Freestyle)", preco: 7.5, emoji: "✏️" },
    { id: 9, nome: "Penteado", preco: 15, emoji: "💈" },
    { id: 10, nome: "Penteado com Tintura", preco: 20, emoji: "👨" },
  ];

  // ✅ Buscar serviços ao montar
  useEffect(() => {
    const buscarServicos = async () => {
      try {
        setLoadingServicos(true);
        const response = await fetch("http://localhost:3001/api/servicos");
        const data = await response.json();
        if (data.success && data.servicos) {
          setServicos(data.servicos);
        } else {
          setError("❌ Erro ao carregar serviços");
        }
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
        setError("❌ Erro ao conectar com o servidor");
      } finally {
        setLoadingServicos(false);
      }
    };
    buscarServicos();
  }, []);

  // ✅ Buscar horários ocupados (de AMBAS as tabelas)
  const buscarAgendamentosOcupados = async (data) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/agendamentos/ocupados?data=${data}`,
      );
      const data_resp = await response.json();
      if (data_resp.success) {
        setAgendamentosOcupados(data_resp.agendamentos || []);
      }
    } catch (err) {
      console.error("Erro ao buscar horários:", err);
    }
  };

  // ✅ Gerar horários disponíveis
  const getHorariosDisponiveis = (data) => {
    if (!data) return [];

    const diaDaSemana = new Date(data.replace(/-/g, "/")).getDay();
    if (diaDaSemana === 1) return [];

    let horarios = [];
    const horaInicio = diaDaSemana === 0 ? 8 : 7;
    const horaFim = diaDaSemana === 0 ? 12 : 21;

    let totalMinutos = horaInicio * 60;
    while (totalMinutos < horaFim * 60) {
      const h = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
      const m = String(totalMinutos % 60).padStart(2, "0");
      const horario = `${h}:${m}`;

      const ocupado = agendamentosOcupados.some((a) =>
        a.horario_agendamento?.startsWith(horario),
      );

      if (!ocupado) horarios.push(horario);
      totalMinutos += 50;
    }
    return horarios;
  };

  // ✅ Validar segunda-feira
  const getDiaFechado = (data) => {
    if (!data) return false;
    const diaDaSemana = new Date(data.replace(/-/g, "/")).getDay();
    return diaDaSemana === 1;
  };

  // ✅ Formatar WhatsApp
  const formatarWhatsApp = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 2) return apenasNumeros;
    if (apenasNumeros.length <= 6)
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  };

  // ✅ Lidar com mudança de input
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "whatsapp") {
      setFormData((prev) => ({ ...prev, [name]: formatarWhatsApp(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setError("");

    if (name === "data") {
      buscarAgendamentosOcupados(value);
      setFormData((prev) => ({ ...prev, horario: "" }));
    }
  };

  // ✅ Lidar com adicionais
  const handleAdicionaisChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      adicionais: prev.adicionais.includes(id)
        ? prev.adicionais.filter((a) => a !== id)
        : [...prev.adicionais, id],
    }));
  };

  // ✅ Calcular total
  const calcularTotal = () => {
    let total = 0;

    if (formData.servico) {
      const s = servicos.find((srv) => srv.id === parseInt(formData.servico));
      if (s) total += Number(s.preco) || 0;
    }

    formData.adicionais.forEach((id) => {
      const ad = adicionais.find((a) => a.id === id);
      if (ad) total += ad.preco;
    });

    return isNaN(total) ? 0 : total;
  };

  // ✅ Enviar agendamento COM DEBUG
  const handleSubmit = async () => {
    if (
      !formData.nome ||
      !formData.whatsapp ||
      !formData.data ||
      !formData.horario ||
      !formData.servico
    ) {
      setError("❌ Preencha todos os campos obrigatórios!");
      return;
    }

    const apenasNumeros = formData.whatsapp.replace(/\D/g, "");
    if (apenasNumeros.length < 10) {
      setError("❌ WhatsApp inválido!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");

      const servicoSelecionado = servicos.find(
        (s) => s.id === parseInt(formData.servico),
      );

      const valorTotal = calcularTotal();

      const listaAdicionais = formData.adicionais
        .map((id) => adicionais.find((a) => a.id === id)?.nome)
        .filter(Boolean)
        .join(", ");

      // Payload ajustado para a função criarAgendamentoManual do Controller
      const payload = {
        cliente_nome: formData.nome,
        cliente_whatsapp: apenasNumeros,
        servico_id: parseInt(formData.servico),
        servico_nome: servicoSelecionado?.nome || "Serviço",
        data_agendamento: formData.data,
        horario_agendamento: formData.horario,
        valor_total: valorTotal,
        observacoes: listaAdicionais ? `Adicionais: ${listaAdicionais}` : null,
      };

      const response = await fetch(
        "http://localhost:3001/api/agendamentos/criar", // Rota do Barbeiro
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          navigate("/painel");
        }, 3000);
      } else {
        setError(`❌ ${data.error || "Erro ao criar agendamento"}`);
      }
    } catch (err) {
      console.error("❌ Erro ao enviar:", err);
      setError("❌ Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };
  const servicoAtual = servicos.find(
    (s) => s.id === parseInt(formData.servico),
  );
  const hoje = new Date().toISOString().split("T")[0];
  const diaMax = new Date();
  diaMax.setDate(diaMax.getDate() + 30);
  const diaMaxString = diaMax.toISOString().split("T")[0];
  const diaFechado = getDiaFechado(formData.data);
  const horariosDisponiveis = getHorariosDisponiveis(formData.data);
  const total = calcularTotal();

  return (
    <div className="app-container">
      <div className="form-card">
        <div className="form-header">
          <button
            onClick={() => navigate(-1)}
            className="btn-home"
            title="Voltar"
          >
            <Home size={20} />
          </button>

          <div className="header-content">
            <div className="header-icon">✂️</div>
            <div>
              <h1 className="header-title">Novo Agendamento</h1>
              <p className="header-subtitle">Painel do Barbeiro</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="success-message">
            <div className="success-icon">
              <Check size={56} />
            </div>
            <h2 className="success-title">Agendamento Criado!</h2>
            <p className="success-text">
              O agendamento foi registrado com sucesso! 💈
            </p>
            <p className="success-subtext">Redirecionando...</p>
          </div>
        ) : (
          <div className="form-content">
            {error && (
              <div className="error-alert">
                <AlertCircle size={20} />
                <span>{error}</span>
                <button
                  className="error-close"
                  onClick={() => setError("")}
                  aria-label="Fechar alerta"
                >
                  ×
                </button>
              </div>
            )}

            {loadingServicos && (
              <div className="loading-alert">
                <Loader size={18} className="spin" />
                <span>Carregando serviços...</span>
              </div>
            )}

            <div className="section-title">👤 Dados do Cliente</div>

            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                <span>Nome do Cliente *</span>
              </label>
              <input
                type="text"
                name="nome"
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={18} />
                <span>WhatsApp *</span>
              </label>
              <input
                type="tel"
                name="whatsapp"
                placeholder="(85) 99999-9999"
                value={formData.whatsapp}
                onChange={handleInputChange}
                maxLength="15"
                className="form-input"
              />
            </div>

            <div className="section-title">📅 Dados do Agendamento</div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={18} />
                <span>Data *</span>
              </label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                min={hoje}
                max={diaMaxString}
                className={`form-input ${diaFechado ? "input-error" : ""}`}
              />
              {diaFechado && (
                <p className="form-error">
                  ❌ Segunda-feira: Estabelecimento fechado
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={18} />
                <span>Horário *</span>
              </label>
              <select
                name="horario"
                value={formData.horario}
                onChange={handleInputChange}
                disabled={
                  !formData.data ||
                  diaFechado ||
                  (formData.data && horariosDisponiveis.length === 0)
                }
                className={`form-select ${formData.data && !diaFechado && horariosDisponiveis.length === 0 ? "input-error" : ""}`}
              >
                {/* Caso 1: Nenhuma data selecionada */}
                {!formData.data && <option value="">Selecione a data</option>}

                {/* Caso 2: Segunda-feira (Fechado) */}
                {formData.data && diaFechado && (
                  <option value="">Barbearia Fechada</option>
                )}

                {/* Caso 3: Data selecionada mas todos os horários ocupados */}
                {formData.data &&
                  !diaFechado &&
                  horariosDisponiveis.length === 0 && (
                    <option value="">
                      ⚠️ Todos os horários já estão ocupados
                    </option>
                  )}

                {/* Caso 4: Horários disponíveis para escolha */}
                {formData.data &&
                  !diaFechado &&
                  horariosDisponiveis.length > 0 && (
                    <>
                      <option value="">Escolha o horário</option>
                      {horariosDisponiveis.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </>
                  )}
              </select>

              {/* Aviso visual extra para o usuário não ficar em dúvida */}
              {formData.data &&
                !diaFechado &&
                horariosDisponiveis.length === 0 && (
                  <p
                    className="form-error"
                    style={{
                      color: "#ff4d4d",
                      marginTop: "5px",
                      fontSize: "0.85rem",
                    }}
                  >
                    Infelizmente não temos vagas para este dia.
                  </p>
                )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Scissors size={18} />
                <span>Serviço *</span>
              </label>
              <select
                name="servico"
                value={formData.servico}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Selecione um serviço</option>
                {servicos.length > 0 ? (
                  servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} - R$ {Number(s.preco).toFixed(2)}
                    </option>
                  ))
                ) : (
                  <option disabled>Carregando serviços...</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Adicionais (Opcional)</span>
              </label>
              <div className="adicionais-grid">
                {adicionais.map((ad) => (
                  <label
                    key={ad.id}
                    className={`adicional-item ${
                      formData.adicionais.includes(ad.id)
                        ? "adicional-selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.adicionais.includes(ad.id)}
                      onChange={() => handleAdicionaisChange(ad.id)}
                      className="adicional-checkbox"
                    />
                    <span className="adicional-emoji">{ad.emoji}</span>
                    <span className="adicional-text">
                      {ad.nome}
                      <small>+R$ {ad.preco.toFixed(2)}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="resumo-card">
              <div className="resumo-item">
                <span className="resumo-label">Cliente:</span>
                <span className="resumo-value">
                  {formData.nome || "Não informado"}
                </span>
              </div>
              <div className="resumo-item">
                <span className="resumo-label">WhatsApp:</span>
                <span className="resumo-value">
                  {formData.whatsapp || "Não informado"}
                </span>
              </div>
              <div className="resumo-item">
                <span className="resumo-label">Serviço:</span>
                <span className="resumo-value">
                  {servicoAtual?.nome || "Não selecionado"}
                </span>
              </div>
              {formData.data && (
                <div className="resumo-item">
                  <span className="resumo-label">Data:</span>
                  <span className="resumo-value">
                    {new Date(formData.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
              {formData.horario && (
                <div className="resumo-item">
                  <span className="resumo-label">Horário:</span>
                  <span className="resumo-value">{formData.horario}</span>
                </div>
              )}
            </div>

            <div className="total-container">
              <div className="total-box">
                <p className="total-label">Valor Total</p>
                <p className="total-value">R$ {total.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="submit-button"
              disabled={loading || loadingServicos}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Scissors size={18} />
                  Criar Agendamento
                </>
              )}
            </button>
          </div>
        )}

        <div className="back-button-container">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormBarberDashboard;
