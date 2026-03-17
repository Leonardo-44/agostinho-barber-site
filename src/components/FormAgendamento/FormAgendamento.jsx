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
import api from "../../services/api";
import "./FormAgendamento.css";

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
    { id: 1, nome: "Matização", preco: 8, icon: Matizacao },
    { id: 2, nome: "Relaxamento", preco: 30, icon: Relaxamento },
    { id: 3, nome: "Tintura", preco: 25, icon: Tintura },
    { id: 4, nome: "Hidratação", preco: 12, icon: Hidratacao },
    { id: 5, nome: "Sobrancelha", preco: 5, icon: Sobrancelha },
    { id: 6, nome: "Pezinho", preco: 5, icon: Pezinho },
    { id: 7, nome: "Barba", preco: 10, icon: Barba},
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

  useEffect(() => {
    const buscarDadosIniciais = async () => {
      try {
        setLoadingServicos(true);
        const token = localStorage.getItem("authToken");

        if (token) {
          try {
            const dataPerfil = await api.fetchClienteLogado(token);
            const nomeCompleto =
              `${dataPerfil.cliente?.nome || ""} ${dataPerfil.cliente?.sobrenome || ""}`.trim();
            setUsuarioNome(nomeCompleto || "Cliente App");
          } catch (err) {
            console.warn("⚠️ Token inválido ou erro ao carregar perfil.");
          }
        }

        const dataServicos = await api.fetchServicos();
        if (dataServicos.success) {
          setServicos(dataServicos.servicos);
        }
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
        setError(
          "❌ Não foi possível carregar os serviços. Verifique sua conexão.",
        );
      } finally {
        setLoadingServicos(false);
      }
    };
    buscarDadosIniciais();
  }, []);

  const buscarAgendamentosOcupados = async (dataSelecionada) => {
    try {
      const resp = await api.fetchHorariosOcupados(dataSelecionada);
      if (resp.success) {
        setAgendamentosOcupados(resp.agendamentos || []);
      }
    } catch (err) {
      console.error("Erro ao buscar horários:", err);
    }
  };

  const getHorariosDisponiveis = (data) => {
    if (!data) return [];
    const diaDaSemana = new Date(data.replace(/-/g, "/")).getDay();

    if (diaDaSemana === 0 || diaDaSemana === 1) return [];

    let horarios = [];
    const adicionarHorarios = (inicioHora, fimHora, fimMinuto, intervalo) => {
      let totalMinutos = inicioHora * 60;
      const limiteMinutos = fimHora * 60 + fimMinuto;
      while (totalMinutos <= limiteMinutos) {
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
      adicionarHorarios(7, 11, 10, 50);
      adicionarHorarios(13, 19, 0, 50);
    } else {
      adicionarHorarios(7, 11, 10, 50);
      adicionarHorarios(13, 21, 50, 50);
    }
    return horarios;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "data") {
      buscarAgendamentosOcupados(value);
      setFormData((prev) => ({ ...prev, data: value, horario: "" }));
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

  // ✅ Seleciona serviço pelo card
  const handleServicoSelect = (id) => {
    setFormData((prev) => ({
      ...prev,
      servico: prev.servico === String(id) ? "" : String(id),
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
    if (!formData.data || !formData.horario) {
      setError("❌ Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("❌ Você precisa estar logado para agendar.");
        setLoading(false);
        return;
      }

      const servicoSelecionado = servicos.find(
        (s) => s.id === parseInt(formData.servico),
      );
      const nomesAdicionais = formData.adicionais
        .map((id) => adicionais.find((a) => a.id === id)?.nome)
        .filter(Boolean)
        .join(", ");

      const payload = {
        servico_id: parseInt(formData.servico),
        servico_nome: servicoSelecionado?.nome || "Serviço",
        data_agendamento: formData.data,
        horario_agendamento: formData.horario,
        cliente_nome: usuarioNome,
        valor_total: calcularTotal(),
        observacoes: nomesAdicionais ? `Adicionais: ${nomesAdicionais}` : null,
      };

      const data = await api.criarAgendamentoCliente(payload, token);

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setFormData({ data: "", horario: "", servico: "", adicionais: [] });
          setSubmitted(false);
          navigate("/");
        }, 3500);
      }
    } catch (err) {
      setError(err.error || "❌ Erro ao processar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const hoje = new Date().toISOString().split("T")[0];
  const diaDaSemana = formData.data
    ? new Date(formData.data.replace(/-/g, "/")).getDay()
    : null;
  const diaFechado = diaDaSemana === 0 || diaDaSemana === 1;
  const horariosDisponiveis = getHorariosDisponiveis(formData.data);

  return (
    <div className="app-container">
      <div className="form-card">
        <div className="form-header">
          <button onClick={() => navigate("/")} className="btn-home">
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

            {/* DATA */}
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
                <p className="form-error">❌ Barbearia Fechada neste dia</p>
              )}
            </div>

            {/* HORÁRIO */}
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

            {/* ADICIONAIS */}
            <div className="form-group">
              <label className="form-label">
                <span>Adicionais</span>
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
                      hidden
                    />
                    {ad.icon &&(
                      <img
                        src={ad.icon}
                        alt={ad.nome}
                        className="adicional-icon"
                      />
                    )}
                    <span className="adicional-text">
                      {ad.nome} <small>+R${ad.preco}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* TOTAL */}
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
                <Loader size={18} className="spin" />
              ) : (
                "Confirmar Agendamento"
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

export default FormAgendamento;