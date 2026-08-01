import React from 'react';
import { PieChart, Target, Wallet } from 'lucide-react';
import mark from '../../assets/mark.png';

const POINTS = [
  { icon: Wallet, label: 'One ledger for income and spend' },
  { icon: PieChart, label: 'See where the money actually went' },
  { icon: Target, label: 'Caps that tell you when to slow down' },
];

const AuthBrandPanel = () => (
  <div className="auth-brand-panel">
    <div className="auth-brand-lockup">
      <img src={mark} alt="" className="auth-brand-mark" />
      <div>
        <div className="auth-brand-name">BudgetWise</div>
        <div className="auth-brand-by">by NonStop io</div>
      </div>
    </div>

    <div className="auth-brand-copy">
      <h1 className="auth-brand-title">
        Take control of
        <br />
        your finances
      </h1>
      <p className="auth-brand-body">
        Track every rupee in and out, see the categories quietly draining your month, and keep your
        savings rate where you want it.
      </p>
    </div>

    <div className="auth-brand-points">
      {POINTS.map((point) => {
        const Icon = point.icon;
        return (
          <div key={point.label} className="auth-brand-point">
            <span className="auth-brand-point-glyph">
              <Icon size={17} />
            </span>
            {point.label}
          </div>
        );
      })}
    </div>
  </div>
);

export default AuthBrandPanel;
