import React from 'react';
import usePropositionsCount from './usePropositionsCount';
import "../assets/styles/lead.css";

const PropositionsButton = ({ lead, onClick }) => {
  const { count } = usePropositionsCount(lead);

  return (
    <div className="proposition" onClick={() => onClick(lead)}>
      Propositions ({count})
    </div>
  );
};

export default PropositionsButton; 