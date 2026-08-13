import "./Button.css";

function Button({ children, onClick, active }) {
  return (
    <button 
        className={`tab-button ${active ? "active" : ""}`}
        onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;