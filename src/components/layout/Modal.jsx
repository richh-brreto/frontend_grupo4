import Button from "./Button";
import ButtonContainer from "./ButtonContainer";
import "./Modal.css";

function Modal({
  title,
  children,
  onClose,
  onSave,
  showSave = true,
  showCancel = true,
  saveLabel = "Salvar",
  cancelLabel = "Cancelar",
  className = "",
  hideFooter = false
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-backdrop" />

      <div
        className={`modal-content ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {!hideFooter && (
          <ButtonContainer>
            {showCancel && <Button onClick={onClose}>{cancelLabel}</Button>}
            {showSave && <Button active onClick={onSave || onClose}>{saveLabel}</Button>}
          </ButtonContainer>
        )}
      </div>
    </div>
  );
}

export default Modal;