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
// ✅ Importação do serviço de API
import api from "../../services/api";

//ICONS
import Sobrancelha from "../../icons/Adicionais/Sobrancelha.png";
import Barba from "../../icons/Adicionais/Barba.png";
import Penteado from "../../icons/Adicionais/Penteado.png";
import PenteadoTintura from "../../icons/Adicionais/PenteadoTintura.png";
import Hidratacao from "../../icons/Adicionais/Hidratacao.png";
import Relaxamento from "../../icons/Adicionais/Relaxamento.png";
import Tintura from "../../icons/Adicionais/Tintura.png";
import Matizacao from "../../icons/Adicionais/Matizacao.png";
import Pezinho from "../../icons/Adicionais/Pezinho.png";
import Desenho from "../../icons/Adicionais/Desenho.png";

//SERVIÇOS
import Selagem from "../../icons/Servicos/Selagem.jpeg";
import Degrade from "../../icons/Servicos/Degrade.jpeg";
import Platinado from "../../icons/Servicos/Platinado.jpeg";
import Social from "../../icons/Servicos/Social.jpeg";
import LuzesBranca from "../../icons/Servicos/LuzesBranca.jpeg";

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
    { id: 1, nome: "Matização", preco: 8, icon: Matizacao },
    { id: 2, nome: "Relaxamento", preco: 30, icon: Relaxamento },
    { id: 3, nome: "Tintura", preco: 25, icon: Tintura },
    { id: 4, nome: "Hidratação", preco: 12, icon: Hidratacao },
    { id: 5, nome: "Sobrancelha", preco: 5, icon: Sobrancelha },
    { id: 6, nome: "Pezinho", preco: 5, icon: Pezinho },
    { id: 7, nome: "Barba", preco: 10, icon: Barba },
    { id: 8, nome: "Desenho (Freestyle)", preco: 7.5, icon: Desenho },
    { id: 9, nome: "Penteado", preco: 15, icon: Penteado },
    { id: 10, nome: "Penteado com Tintura", preco: 20, icon: PenteadoTintura },
  ];

  const ServicosConfig = {
    1: { img: LuzesBranca, style: { objectPosition: "center" } },
    // 2: { img: LuzesComum,  style: {objectPosition: "center"}},
    3: { img: Platinado, style: { objectPosition: "center" } },
    4: { img: Degrade, style: { objectPosition: "center" } },
    5: { img: Social, style: { objectPosition: "center 20%" } },
    // 6: {img: ComboSocial, style: {objectPosition: "center"}},
    // 7: {img: ComboDegrade, style: {objectPosition: "center"}}
    8: { img: Selagem, style: { objectPosition: "center 25%" } },
  };
  // ✅ CORREÇÃO API: Buscar serviços
  useEffect(() => {
    const buscarServicos = async () => {
      try {
        setLoadingServicos(true);
        const data = await api.fetchServicos();
        if (data.success) {
          setServicos(data.servicos);
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

  // ✅ CORREÇÃO API: Buscar horários ocupados
  const buscarAgendamentosOcupados = async (data) => {
    try {
      const data_resp = await api.fetchHorariosOcupados(data);
      if (data_resp.success) {
        setAgendamentosOcupados(data_resp.agendamentos || []);
      }
    } catch (err) {
      console.error("Erro ao buscar horários:", err);
    }
  };

  // ✅ Lógica de horários (Mantida exatamente como a sua)
  const getHorariosDisponiveis = (data) => {
    if (!data) return [];
    const diaDaSemana = new Date(data.replace(/-/g, "/")).getDay();
    if (diaDaSemana === 0 || diaDaSemana === 1) return [];

    let horarios = [];
    const gerar = (inicio, fimH, fimM, intervalo) => {
      let totalMinutos = inicio * 60;
      const limite = fimH * 60 + fimM;
      while (totalMinutos <= limite) {
        const h = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
        const m = String(totalMinutos % 60).padStart(2, "0");
        const horario = `${h}:${m}`;
        const ocupado = agendamentosOcupados.some((a) =>
          a.horario_agendamento?.startsWith(horario),
        );
        if (!ocupado) horarios.push(horario);
        totalMinutos += intervalo;
      }
    };

    if (diaDaSemana >= 2 && diaDaSemana <= 4) {
      gerar(7, 11, 10, 50);
      gerar(13, 18, 50, 50);
    } else {
      gerar(7, 11, 10, 50);
      gerar(13, 21, 50, 50);
    }
    return horarios;
  };

  const getDiaFechado = (data) => {
    if (!data) return false;
    const diaDaSemana = new Date(data.replace(/-/g, "/")).getDay();
    return diaDaSemana === 0 || diaDaSemana === 1;
  };

  const formatarWhatsApp = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 2) return apenasNumeros;
    if (apenasNumeros.length <= 6)
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  };

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
    return isNaN(total) ? 0 : total;
  };

  const handleServicoSelect = (id) => {
    setFormData((prev) => ({
      ...prev,
      servico: prev.servico === String(id) ? "" : String(id),
    }));
  };

  // ✅ CORREÇÃO API: Enviar agendamento manual
  const handleSubmit = async () => {
    if (
      !formData.nome ||
      !formData.whatsapp ||
      !formData.data ||
      !formData.horario
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
      if (!token) throw { error: "❌ Sessão expirada. Faça login novamente." };

      const servicoSelecionado = servicos.find(
        (s) => s.id === parseInt(formData.servico),
      );
      const listaAdicionais = formData.adicionais
        .map((id) => adicionais.find((a) => a.id === id)?.nome)
        .filter(Boolean)
        .join(", ");

      const payload = {
        cliente_nome: formData.nome,
        cliente_whatsapp: apenasNumeros,
        servico_id: parseInt(formData.servico),
        servico_nome: servicoSelecionado?.nome || "Serviço",
        data_agendamento: formData.data,
        horario_agendamento: formData.horario,
        valor_total: calcularTotal(),
        observacoes: listaAdicionais ? `Adicionais: ${listaAdicionais}` : null,
      };

      const data = await api.criarAgendamentoManual(payload, token);

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => navigate("/painel"), 3000);
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDEREIZAÇÃO (JSX MANTIDO ORIGINAL) ---
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
                <button className="error-close" onClick={() => setError("")}>
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
                  ❌ Domingo e Segunda-feira: Estabelecimento fechado
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
                className="form-select"
              >
                {!formData.data && <option value="">Selecione a data</option>}
                {formData.data && diaFechado && (
                  <option value="">Barbearia Fechada</option>
                )}
                {formData.data &&
                  !diaFechado &&
                  horariosDisponiveis.length === 0 && (
                    <option value="">⚠️ Sem horários livres</option>
                  )}
                {horariosDisponiveis.length > 0 && (
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

            {/* SERVIÇO — Grid de Cards com Imagem */}
            <div className="form-group">
              <label className="form-label">
                <Scissors size={18} />
                <span>Serviço</span>
              </label>

              {loadingServicos ? (
                <div className="servicos-loading">
                  <Loader size={16} className="spin" />
                  <span>Carregando serviços...</span>
                </div>
              ) : (
                <div className="servicos-grid">
                  {servicos.map((s) => {
                    const isSelected = formData.servico === String(s.id);
                    return (
                      <div
                        key={s.id}
                        className={`servico-card ${isSelected ? "servico-card--selected" : ""}`}
                        onClick={() => handleServicoSelect(s.id)}
                      >
                        {ServicosConfig[s.id] ? (
                          <img
                            src={ServicosConfig[s.id].img}
                            alt={s.nome}
                            className="servico-card__img"
                            style={ServicosConfig[s.id].style}
                          />
                        ) : (
                          <div className="servico-card__placeholder">
                            <span className="servico-card__placeholder-icon">
                              ✂️
                            </span>
                          </div>
                        )}

                        <div className="servico-card__info">
                          <p className="servico-card__nome">{s.nome}</p>
                          <p className="servico-card__preco">
                            R$ {Number(s.preco).toFixed(2)}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="servico-card__check">
                            <Check size={11} strokeWidth={3} color="#000" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Adicionais (Opcional)</span>
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
                      className="adicional-checkbox"
                    />
                    {ad.icon && (
                      <img
                        src={ad.icon}
                        alt={ad.nome}
                        className="adicional-icon"
                      />
                    )}
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
                <span className="resumo-label">Cliente: </span>
                <span className="resumo-value">
                  {formData.nome || "Não informado"}
                </span>
              </div>
              <div className="resumo-item">
                <span className="resumo-label">WhatsApp: </span>
                <span className="resumo-value">
                  {formData.whatsapp || "Não informado"}
                </span>
              </div>
              <div className="resumo-item">
                <span className="resumo-label">Serviço: </span>
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
                <Loader size={18} className="spin" />
              ) : (
                <>
                  <Scissors size={18} /> Criar Agendamento
                </>
              )}
            </button>

            <div className="back-button-container">
              <button onClick={() => navigate(-1)} className="btn-back">
                ← Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBarberDashboard;