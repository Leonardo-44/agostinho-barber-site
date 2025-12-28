import React from "react";
import { useNavigate } from 'react-router-dom';

const  Agendamento= () => {

  const navigate = useNavigate();
  return (
  
    <div>
        AGENDAMENTO
        <button className="btn btn-primary" onClick={() => navigate('/')}>VOLTAR</button>
    </div>
  );
};

export default Agendamento;