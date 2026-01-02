import React, { useState } from "react";
import { Calendar, Clock, Scissors, Check } from "lucide-react";
import "./FormAgendamento.css";

const FormAgendamento = () => {
  const [formData, setFormData] = useState({
    nome: "",
    data: "",
    horario: "",
    servico: "",
    adicionais: [],
  });

  const [submitted, setSubmitted] = useState(false);

  const servicos = [
    { id: 1, nome: "Luzes (Brancas)", preco: 45, duracao: "120 min" },
    { id: 2, nome: "Luzes (Comuns)", preco: 35, duracao: "90 min" },
    { id: 3, nome: "Platinado + Corte", preco: 150, duracao: "180 min" },
    { id: 4, nome: "Corte Degrade (Disfarçado)", preco: 25, duracao: "30 min" },
    { id: 5, nome: "Corte Social", preco: 20, duracao: "25 min" },
    {
      id: 6,
      nome: "Combo Social (Corte + Barba + Sobrancelha)",
      preco: 27,
      duracao: "35 min",
    },
    {
      id: 7,
      nome: "Combo Degrade (Corte + Barba + Sobrancelha)",
      preco: 30,
      duracao: "40 min",
    },
    { id: 8, nome: "Selagem", preco: 45, duracao: "60 min" },
  ];

  const adicionais = [
    { id: 1, nome: "Matização", preco: 8 },
    { id: 2, nome: "Relaxamento", preco: 30 },
    { id: 3, nome: "Tintura", preco: 25 },
    { id: 4, nome: "Hidratação", preco: 12 },
    { id: 5, nome: "Sobrancelha", preco: 5 },
    { id: 6, nome: "Pezinho", preco: 5 },
    { id: 7, nome: "Barba", preco: 10 },
    { id: 8, nome: "Desenho (Freestyle)", preco: 7.5 },
    { id: 9, nome: "Penteado", preco: 15 },
    { id: 10, nome: "Penteado com Tintura", preco: 20 },
  ];

  const getHorariosDisponiveis = (data) => {
    if (!data) return [];
    const [ano, mes, dia] = data.split("-").map(Number);
    const date = new Date(ano, mes - 1, dia);
    const diaDaSemana = date.getDay();

    if (diaDaSemana === 1) return [];

    let horarios = [];
    let horaInicio, horaFim;

    if (diaDaSemana === 0) {
      horaInicio = 8;
      horaFim = 12;
    } else {
      horaInicio = 7;
      horaFim = 21;
    }

    for (let h = horaInicio; h < horaFim; h++) {
      for (let m = 0; m < 60; m += 50) {
        if (h === horaFim - 1 && m > 0) break;
        horarios.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }
    }

    return horarios;
  };

  const getDiaFechado = (data) => {
    if (!data) return false;
    const [ano, mes, dia] = data.split("-").map(Number);
    const date = new Date(ano, mes - 1, dia);
    const diaDaSemana = date.getDay();
    return diaDaSemana === 1;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const servicoSelecionado = servicos.find(
      (s) => s.id === parseInt(formData.servico)
    );
    if (servicoSelecionado) total += servicoSelecionado.preco;
    formData.adicionais.forEach((id) => {
      const adicional = adicionais.find((a) => a.id === id);
      if (adicional) total += adicional.preco;
    });
    return total;
  };

  const handleSubmit = () => {
    if (
      !formData.data ||
      !formData.horario ||
      !formData.servico
    ) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        data: "",
        horario: "",
        servico: "",
        adicionais: [],
      });
      setSubmitted(false);
    }, 3000);
  };

  const horariosDisponiveis = getHorariosDisponiveis(formData.data);
  const diaFechado = getDiaFechado(formData.data);
  const servicoSelecionado = servicos.find(
    (s) => s.id === parseInt(formData.servico)
  );
  const totalAtual = calcularTotal();
  const hoje = new Date().toISOString().split("T")[0];
  const dataMax = new Date();
  dataMax.setDate(dataMax.getDate() + 30);
  const dataMaxString = dataMax.toISOString().split("T")[0];

  return (
    <div className="app-container">
      <div className="form-card">
        <div className="header-form">
          <div className="header-icon">✂️</div>
          <h1 className="header-title">Agende seu Corte</h1>
          <p className="header-subtitle">Agostinho Barber</p>
        </div>

        {submitted ? (
          <div className="success-message">
            <Check size={48} className="success-icon" />
            <h2 className="success-title">Agendamento Confirmado!</h2>
            <p className="success-text">
              Obrigado, {formData.nome}! Seu agendamento foi realizado com
              sucesso.
            </p>
            <p className="success-subtext">
              Você será redirecionado em breve...
            </p>
          </div>
        ) : (
          <div className="form-content">

            <div className="form-group">
              <label className="form-label">
                <Calendar size={18} className="label-icon" />
                Data *
              </label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                min={hoje}
                max={dataMaxString}
                className={`form-input ${diaFechado ? "input-error" : ""}`}
              />
              {diaFechado && (
                <p className="error-message">
                  ❌ Segunda-feira: Estabelecimento fechado!
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={18} className="label-icon" />
                Horário *
              </label>
              <select
                name="horario"
                value={formData.horario}
                onChange={handleInputChange}
                disabled={!formData.data || diaFechado}
                className="form-select"
              >
                <option value="">Selecione um horário</option>
                {horariosDisponiveis.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Scissors size={18} className="label-icon" />
                Serviço *
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
                    {s.nome} - R$ {s.preco.toFixed(2)} ({s.duracao})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Adicionais (Opcional)</label>
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
                    <span className="adicional-text">
                      {ad.nome} (+R$ {ad.preco.toFixed(2)})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="total-container">
              <p className="total-label">Valor Total</p>
              <p className="total-value">R$ {totalAtual.toFixed(2)}</p>
              {servicoSelecionado && (
                <p className="total-duration">
                  Duração estimada: {servicoSelecionado.duracao}
                </p>
              )}
            </div>

            <button onClick={handleSubmit} className="submit-button">
              ✂️ Agendar Corte
            </button>
          </div>
        )}
        {/* Botão Voltar */}
        <div className="btn-back-container">
          <button onClick={() => window.history.back()} className="btn-back">
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormAgendamento;
