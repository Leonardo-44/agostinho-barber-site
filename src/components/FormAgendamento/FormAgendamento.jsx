import React, { useState, useEffect } from "react";
import { Calendar, Clock, Scissors, Check, AlertCircle, Home, Loader } from "lucide-react";
import "./FormAgendamento.css";

const FormAgendamento = () => {
  const [formData, setFormData] = useState({
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
  const [usuarioNome, setUsuarioNome] = useState("");

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
    const buscarServicosEUsuario = async () => {
      try {
        setLoadingServicos(true);
        
        const token = localStorage.getItem("authToken");
        console.log("🔑 Token existe?", !!token);
        
        // Buscar dados do cliente do backend
        if (token) {
          try {
            const response = await fetch("http://localhost:3001/api/clientes/perfil", {
              headers: { "Authorization": `Bearer ${token}` }
            });
            
            console.log("📊 Status da resposta /clientes/perfil:", response.status);
            
            if (response.ok) {
              const data = await response.json();
              console.log("📊 Dados do cliente:", data);
              
              if (data.success && data.cliente) {
                const nomeCompleto = `${data.cliente.nome || ""} ${data.cliente.sobrenome || ""}`.trim();
                setUsuarioNome(nomeCompleto || "Cliente");
                console.log("✅ Nome do usuário:", nomeCompleto);
              } else if (data.cliente) {
                const nomeCompleto = `${data.cliente.nome || ""} ${data.cliente.sobrenome || ""}`.trim();
                setUsuarioNome(nomeCompleto || "Cliente");
                console.log("✅ Nome do usuário:", nomeCompleto);
              }
            } else {
              console.warn("⚠️ Erro na resposta:", response.status);
              const errorData = await response.json().catch(() => ({}));
              console.warn("⚠️ Erro data:", errorData);
            }
          } catch (err) {
            console.error("❌ Erro ao buscar dados do usuário:", err);
          }
        } else {
          console.warn("⚠️ Token não encontrado no localStorage");
        }
        
        // Buscar serviços
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
    buscarServicosEUsuario();
  }, []);

  // ✅ Buscar horários ocupados
  const buscarAgendamentosOcupados = async (data) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/agendamentos/ocupados?data=${data}`
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
    if (diaDaSemana === 1) return []; // Segunda-feira fechado

    let horarios = [];
    const horaInicio = diaDaSemana === 0 ? 8 : 7;
    const horaFim = diaDaSemana === 0 ? 12 : 21;

    let totalMinutos = horaInicio * 60;
    while (totalMinutos < horaFim * 60) {
      const h = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
      const m = String(totalMinutos % 60).padStart(2, "0");
      const horario = `${h}:${m}`;

      const ocupado = agendamentosOcupados.some((a) =>
        a.horario_agendamento?.startsWith(horario)
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

  // ✅ Lidar com mudança de input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Limpar erro ao digitar
    
    if (name === "data") {
      buscarAgendamentosOcupados(value);
      setFormData((prev) => ({ ...prev, horario: "" })); // Resetar horário
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

  // ✅ Calcular total com segurança
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

  // ✅ Enviar agendamento
  const handleSubmit = async () => {
    if (!formData.data || !formData.horario || !formData.servico) {
      setError("❌ Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("❌ Você precisa estar logado para agendar");
        setLoading(false);
        return;
      }

      const servicoSelecionado = servicos.find(
        (s) => s.id === parseInt(formData.servico)
      );
      const valorTotal = calcularTotal();

      const listaAdicionais = formData.adicionais
        .map((id) => adicionais.find((a) => a.id === id)?.nome)
        .filter(Boolean)
        .join(", ");

      const payload = {
        servico_id: parseInt(formData.servico),
        data_agendamento: formData.data,
        horario_agendamento: formData.horario,
        cliente_nome: usuarioNome,
        servico_nome: servicoSelecionado?.nome || "Serviço",
        valor_total: valorTotal,
        observacoes: listaAdicionais ? `Adicionais: ${listaAdicionais}` : null,
      };

      console.log("📝 Payload enviado:", payload);
      console.log("👤 Cliente Nome:", usuarioNome);
      console.log("🎯 Serviço ID:", formData.servico);
      console.log("💰 Valor Total:", valorTotal);

      const response = await fetch(
        "http://localhost:3001/api/agendamentos/criar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setFormData({ data: "", horario: "", servico: "", adicionais: [] });
          setSubmitted(false);
        }, 3500);
      } else {
        setError(`❌ ${data.error || "Erro ao criar agendamento"}`);
      }
    } catch (err) {
      console.error("Erro:", err);
      setError("❌ Erro ao processar agendamento");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Variáveis auxiliares
  const servicoAtual = servicos.find((s) => s.id === parseInt(formData.servico));
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
        {/* HEADER */}
        <div className="form-header">
          <button
            onClick={() => window.location.href = "/"}
            className="btn-home"
            title="Voltar ao início"
          >
            <Home size={20} />
          </button>
          
          <div className="header-content">
            <div className="header-icon">✂️</div>
            <div>
              <h1 className="header-title">Agende seu Corte</h1>
              <p className="header-subtitle">Agostinho Barber Shop</p>
            </div>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {submitted ? (
          <div className="success-message">
            <div className="success-icon">
              <Check size={56} />
            </div>
            <h2 className="success-title">Agendamento Confirmado!</h2>
            <p className="success-text">
              Prepare o visual, esperamos por você! 💈
            </p>
            <p className="success-subtext">Redirecionando...</p>
          </div>
        ) : (
          <div className="form-content">
            {/* ERROR ALERT */}
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

            {/* LOADING SERVICOS */}
            {loadingServicos && (
              <div className="loading-alert">
                <Loader size={18} className="spin" />
                <span>Carregando serviços...</span>
              </div>
            )}

            {/* FORM GROUPS */}
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
                <p className="form-error">❌ Segunda-feira: Estabelecimento fechado</p>
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
                disabled={!formData.data || diaFechado}
                className="form-select"
              >
                <option value="">
                  {!formData.data ? "Selecione uma data" : "Selecione um horário"}
                </option>
                {horariosDisponiveis.length > 0 ? (
                  horariosDisponiveis.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))
                ) : (
                  formData.data && !diaFechado && (
                    <option disabled>Nenhum horário disponível</option>
                  )
                )}
              </select>
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

            {/* ADICIONAIS */}
            <div className="form-group">
              <label className="form-label">
                <span>Adicionais (Opcional)</span>
              </label>
              <div className="adicionais-grid">
                {adicionais.map((ad) => (
                  <label
                    key={ad.id}
                    className={`adicional-item ${
                      formData.adicionais.includes(ad.id) ? "adicional-selected" : ""
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

            {/* RESUMO */}
            <div className="resumo-card">
              <div className="resumo-item">
                <span className="resumo-label">Serviço:</span>
                <span className="resumo-value">
                  {servicoAtual?.nome || "Não selecionado"}
                </span>
              </div>
              {servicoAtual?.duracao && (
                <div className="resumo-item">
                  <span className="resumo-label">Duração:</span>
                  <span className="resumo-value">
                    {typeof servicoAtual.duracao === 'object' 
                      ? `${servicoAtual.duracao.minutes || 0} min`
                      : servicoAtual.duracao}
                  </span>
                </div>
              )}
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

            {/* TOTAL */}
            <div className="total-container">
              <div className="total-box">
                <p className="total-label">Valor Total</p>
                <p className="total-value">R$ {total.toFixed(2)}</p>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
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
                  Agendar Corte
                </>
              )}
            </button>
          </div>
        )}

        {/* BACK BUTTON */}
        <div className="back-button-container">
          <button
            onClick={() => window.history.back()}
            className="btn-back"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormAgendamento;