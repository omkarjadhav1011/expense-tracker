import React from 'react';
import './SummaryCard.css';

const SummaryCard = ({ title, value, subtitle, accentColor }) => {
  return (
    <div className={`summary-card ${accentColor}`}>
      <div className="summary-card-content">
        <h3 className="summary-card-title">{title}</h3>
        <p className="summary-card-value">{value}</p>
        {subtitle && <p className="summary-card-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default SummaryCard;