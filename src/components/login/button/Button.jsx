import "./Button.css";

function Button({ children, onClick, type = "button", disabled = false }) {
    return (
        <button type={type} onClick={onClick} className="button" disabled={disabled}>
            {children}
        </button>
    );
}

export default Button;
