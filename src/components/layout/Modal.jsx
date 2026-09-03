import Button from "./Button";
import ButtonContainer from "./ButtonContainer";
import "./Modal.css";

function Modal({ title, children, onClose, onSave, showSave = true, className = "", hideFooter = false }) {
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
            <Button onClick={onClose}>Cancelar</Button>
            {showSave && <Button active onClick={onSave || onClose}>Salvar</Button>}
          </ButtonContainer>
        )}
      </div>
    </div>
  );
}

export default Modal;