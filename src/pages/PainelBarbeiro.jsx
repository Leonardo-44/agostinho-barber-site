// src/pages/PainelBarbeiro.jsx

import React from 'react';
import BarberDashboard from '../components/BarberDashboard'; 

const PainelBarbeiro = () => {
  return (
    // Usa a classe CSS para garantir o fundo escuro
    <div className="body-dark">
      <BarberDashboard />
    </div>
  );
};

export default PainelBarbeiro;