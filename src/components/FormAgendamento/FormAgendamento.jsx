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
} from "lucide-react";
import "./FormAgendamento.css";

const FormAgendamento = () => {

  const navigate = useNavigate();

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

  useEffect(() => {
    const buscarServicosEUsuario = async () => {
      try {
        setLoadingServicos(true);
        const token = localStorage.getItem("authToken");
        
        // Buscar dados do perfil se houver token
        if (token) {
          const response = await fetch(
            "http://localhost:3001/api/clientes/perfil",
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            },
          );
          
          if (response.status === 403) {
            console.warn("⚠️ Token inválido ou expirado");
            localStorage.removeItem("authToken");
            setError("❌ Sua sessão expirou. Por favor, faça login novamente.");
          } else if (response.ok) {
            const data = await response.json();
            const nomeCompleto =
              `${data.cliente?.nome || ""} ${data.cliente?.sobrenome || ""}`.trim();
            setUsuarioNome(nomeCompleto || "Cliente App");
          }
        }
        
        // Buscar serviços (não requer autenticação)
        const resServicos = await fetch("http://localhost:3001/api/servicos");
        
        if (resServicos.status === 403) {
          console.error("❌ Acesso negado ao buscar serviços");
          setError("❌ Erro de permissão ao carregar serviços");
        } else if (resServicos.ok) {
          const dataServicos = await resServicos.json();
          if (dataServicos.success) setServicos(dataServicos.servicos);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("❌ Erro ao conectar com o servidor");
      } finally {
        setLoadingServicos(false);
      }
    };
    buscarServicosEUsuario();
  }, []);

  const buscarAgendamentosOcupados = async (data) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/agendamentos/ocupados?data=${data}`,
      );
      
      if (response.status === 403) {
        console.warn("⚠️ Acesso negado ao buscar agendamentos");
        setError("❌ Erro de permissão ao carregar horários");
        return;
      }
      
      if (response.ok) {
        const data_resp = await response.json();
        if (data_resp.success)
          setAgendamentosOcupados(data_resp.agendamentos || []);
      }
    } catch (err) {
      console.error("Erro ao buscar horários:", err);
    }
  };

  const getHorariosDisponiveis = (data) => {
    if (!data) return [];
    const diaDaSemana = new Date(data.replace(/-/g, "/")).getDay();
    
    // Domingo (0) e Segunda (1) - Fechado
    if (diaDaSemana === 0 || diaDaSemana === 1) return [];
    
    let horarios = [];
    
    // Terça (2), Quarta (3), Quinta (4)
    if (diaDaSemana >= 2 && diaDaSemana <= 4) {
      // Período da manhã: 7h até 11:10 (último corte)
      let totalMinutos = 7 * 60; // 7:00
      while (totalMinutos <= 11 * 60 + 10) { // 11:10
        const h = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
        const m = String(totalMinutos % 60).padStart(2, "0");
        const horario = `${h}:${m}`;
        const ocupado = agendamentosOcupados.some((a) =>
          a.horario_agendamento?.startsWith(horario),
        );
        if (!ocupado) horarios.push(horario);
        totalMinutos += 50;
      }
      
      // Período da tarde: 13h até 19h (último corte)
      totalMinutos = 13 * 60; // 13:00
      while (totalMinutos < 19 * 60) { // Até 19:00
        const h = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
        const m = String(totalMinutos % 60).padStart(2, "0");
        const horario = `${h}:${m}`;
        const ocupado = agendamentosOcupados.some((a) =>
          a.horario_agendamento?.startsWith(horario),
        );
        if (!ocupado) horarios.push(horario);
        totalMinutos += 50;
      }
    }
    
    // Sexta (5) e Sábado (6)
    if (diaDaSemana === 5 || diaDaSemana === 6) {
      // Período da manhã: 7h até 11:10 (último corte)
      let totalMinutos = 7 * 60; // 7:00
      while (totalMinutos <= 11 * 60 + 10) { // 11:10
        const h = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
        const m = String(totalMinutos % 60).padStart(2, "0");
        const horario = `${h}:${m}`;
        const ocupado = agendamentosOcupados.some((a) =>
          a.horario_agendamento?.startsWith(horario),
        );
        if (!ocupado) horarios.push(horario);
        totalMinutos += 50;
      }
      
      // Período da tarde: 13h até 21:50 (último corte)
      totalMinutos = 13 * 60; // 13:00
      while (totalMinutos <= 21 * 60 + 50) { // 21:50
        const h = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
        const m = String(totalMinutos % 60).padStart(2, "0");
        const horario = `${h}:${m}`;
        const ocupado = agendamentosOcupados.some((a) =>
          a.horario_agendamento?.startsWith(horario),
        );
        if (!ocupado) horarios.push(horario);
        totalMinutos += 50;
      }
    }
    
    return horarios;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "data") {
      buscarAgendamentosOcupados(value);
      setFormData((prev) => ({ ...prev, horario: "" }));
    }
  };

  const handleAdicionaisChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      adicionais: prev.adicionais.includes(id)
        ? prev.adicionais.filter((a) => a !== id)
        : [...prev.adicionais, id],
    }));
  };

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
    return total;
  };

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
        setError("❌ Você precisa estar logado");
        setLoading(false);
        return;
      }

      // 1. Encontra o serviço selecionado
      const servicoSelecionado = servicos.find(
        (s) => s.id === parseInt(formData.servico),
      );

      // 2. Gera a string de adicionais
      const nomesAdicionais = formData.adicionais
        .map(id => adicionais.find(a => a.id === id)?.nome)
        .filter(Boolean)
        .join(", ");

      const payload = {
        servico_id: parseInt(formData.servico),
        servico_nome: servicoSelecionado?.nome_servico || servicoSelecionado?.nome || "Serviço", 
        data_agendamento: formData.data,
        horario_agendamento: formData.horario,
        cliente_nome: usuarioNome,
        valor_total: calcularTotal(),
        observacoes: nomesAdicionais ? `Adicionais: ${nomesAdicionais}` : null,
      };

      console.log("🚀 Payload sendo enviado:", payload);

      const response = await fetch(
        "http://localhost:3001/api/agendamentos/cliente/criar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 403) {
        setError("❌ Sua sessão expirou. Por favor, faça login novamente.");
        localStorage.removeItem("authToken");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setFormData({ data: "", horario: "", servico: "", adicionais: [] });
          setSubmitted(false);
          navigate("/");
        }, 3500);
      } else {
        setError(`❌ ${data.error || "Erro ao agendar"}`);
      }
    } catch (err) {
      console.error("Erro no submit:", err);
      setError("❌ Erro ao processar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const hoje = new Date().toISOString().split("T")[0];
  const diaDaSemana = formData.data ? new Date(formData.data.replace(/-/g, "/")).getDay() : null;
  const diaFechado = diaDaSemana === 0 || diaDaSemana === 1;
  const horariosDisponiveis = getHorariosDisponiveis(formData.data);

  return (
    <div className="app-container">
      <div className="form-card">
        <div className="form-header">
          <button
            onClick={() => navigate("/")}
            className="btn-home"
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

        {submitted ? (
          <div className="success-message">
            <div className="success-icon">
              <Check size={56} />
            </div>
            <h2 className="success-title">Agendamento Confirmado!</h2>
            <p className="success-text">
              Prepare o visual, esperamos por você! 💈
            </p>
          </div>
        ) : (
          <div className="form-content">
            {error && (
              <div className="error-alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

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
                className="form-input"
              />
              {diaFechado && (
                <p className="form-error">❌ Domingo e Segunda: Barbearia Fechada</p>
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
                {!formData.data && <option value="">Selecione a data</option>}
                {formData.data && diaFechado && (
                  <option value="">Barbearia Fechada</option>
                )}
                {formData.data &&
                  !diaFechado &&
                  horariosDisponiveis.length === 0 && (
                    <option value="">
                      ⚠️ Todos os horários já estão ocupados
                    </option>
                  )}
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
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} - R$ {Number(s.preco).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Adicionais</span>
              </label>
              <div className="adicionais-grid">
                {adicionais.map((ad) => (
                  <label
                    key={ad.id}
                    className={`adicional-item ${formData.adicionais.includes(ad.id) ? "adicional-selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.adicionais.includes(ad.id)}
                      onChange={() => handleAdicionaisChange(ad.id)}
                      hidden
                    />
                    <span className="adicional-emoji">{ad.emoji}</span>
                    <span className="adicional-text">
                      {ad.nome} <small>+R$ {ad.preco.toFixed(2)}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="total-container">
              <div className="total-box">
                <p className="total-label">Valor Total</p>
                <p className="total-value">R$ {calcularTotal().toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="submit-button"
              disabled={loading || loadingServicos}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spin" /> Processando...
                </>
              ) : (
                <>
                  <Scissors size={18} /> Agendar Corte
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

export default FormAgendamento;