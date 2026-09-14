import "./Button.css";

function Button({ children, onClick, active, danger }) {
  return (
    <button 
        className={`tab-button ${active ? "active" : ""} ${danger ? "danger" : ""}`}
        onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;