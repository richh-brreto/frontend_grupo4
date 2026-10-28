import { useId, useRef, useState } from "react";
import Button from "./Button";
import "./Modal.css";

function Modal({
  title,
  children,
  onClose,
  onSave,
  showSave = true,
  showCancel = true,
  onDelete,
  deleteLabel = "Excluir",
  saveLabel = "Salvar",
  cancelLabel = "Cancelar",
  className = "",
  size = "md",
  footerActions,
  hideFooter = false,
  saving = false
}) {
  const titleId = useId();
  const [savingInternally, setSavingInternally] = useState(false);
  const saveInProgressRef = useRef(false);
  const isSaving = saving || savingInternally;

  const handleSave = async () => {
    if (isSaving || saveInProgressRef.current) return;
    if (!onSave) {
      onClose();
      return;
    }

    saveInProgressRef.current = true;
    setSavingInternally(true);
    try {
      await onSave();
    } finally {
      saveInProgressRef.current = false;
      setSavingInternally(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isSaving ? undefined : onClose}>
      <div className="modal-backdrop" aria-hidden="true" />

      <div
        className={`modal-content modal-size-${size} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>

          <button
            type="button"
            className="modal-close"
            aria-label="Fechar diálogo"
            onClick={onClose}
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {!hideFooter && (
          <div className="modal-actions">
            {footerActions ?? (
              <>
                {onDelete && <Button danger onClick={onDelete} disabled={isSaving}>{deleteLabel}</Button>}
                {showCancel && <Button onClick={onClose} disabled={isSaving}>{cancelLabel}</Button>}
                {showSave && <Button active onClick={handleSave} disabled={isSaving}>{isSaving ? 'Salvando...' : saveLabel}</Button>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;