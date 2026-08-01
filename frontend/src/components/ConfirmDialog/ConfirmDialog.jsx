import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  cancelLabel = 'Keep it',
  busy = false,
  icon,
  onConfirm,
  onCancel,
}) => {
  const Icon = icon || Trash2;

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-root">
      <div className="confirm-scrim" onClick={onCancel} />
      <div className="confirm-card" role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="confirm-icon">
          <Icon size={19} />
        </div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-body">{body}</div>
        <div className="confirm-actions">
          <button type="button" className="confirm-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
          <button type="button" className="confirm-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
