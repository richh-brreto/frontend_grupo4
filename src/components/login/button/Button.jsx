import "./Button.css";

function Button({ children, onClick, type = "button" }) {
    return (
        <button type={type} onClick={onClick} className="button">
            {children}
        </button>
    );
}

export default Button;
