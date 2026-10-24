import "./Button.css";

function Button({ children, onClick, active, danger, disabled = false }) {
  return (
    <button 
        className={`tab-button ${active ? "active" : ""} ${danger ? "danger" : ""}`}
        onClick={onClick}
        disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;