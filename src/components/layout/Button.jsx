import "./Button.css";

function Button({
  children,
  onClick,
  active = false,
  danger = false,
  variant = 'secondary',
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const variantFinal = danger ? 'danger' : active ? 'primary' : variant;

  return (
    <button
        type={type}
        className={`tab-button tab-button--${variantFinal} ${className}`.trim()}
        onClick={onClick}
        disabled={disabled}
        {...props}>
      {children}
    </button>
  );
}

export default Button;