import React from 'react';
import './SummaryCard.css';

/**
 * One KPI tile from the redesign: overline label, tinted glyph, big figure and
 * a delta/footnote line.
 *
 * `tone` picks the glyph tint ('brand' | 'neutral'), `deltaTone` picks the
 * colour of the delta figure ('positive' | 'warning' | 'muted').
 */
const SummaryCard = ({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  accent = false,
  delta,
  deltaTone = 'muted',
  foot,
  loading = false,
}) => (
  <div className="stat-card">
    <div className="stat-card-top">
      <span className="stat-card-label">{label}</span>
      <span className={`stat-card-glyph tone-${tone}`}>{Icon && <Icon size={16} />}</span>
    </div>

    {loading ? (
      <div className="ns-skeleton stat-card-skeleton" />
    ) : (
      <div className={`stat-card-value${accent ? ' accent' : ''}`}>{value}</div>
    )}

    <div className="stat-card-foot">
      {delta && <span className={`stat-card-delta tone-${deltaTone}`}>{delta}</span>}
      {foot}
    </div>
  </div>
);

export default SummaryCard;
