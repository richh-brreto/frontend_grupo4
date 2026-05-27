import { useState } from "react";
import "./Input.css";

function Input({ label, type = "text", id, value, onChange, placeholder }) {
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isEmpty = value === null || value === "";
    const hasError = touched && isEmpty;
    const inputType = type === "password" && showPassword ? "text" : type;

    return (
        <div className="wrapper">
            {label && (
                <label className="label" htmlFor={id}>
                    {label}
                </label>
            )}
            <div className="field">
                <input
                    id={id}
                    type={inputType}
                    value={value ?? ""}
                    onChange={onChange}
                    placeholder={placeholder}
                    onBlur={() => setTouched(true)}
                    className={`input${hasError ? " inputError" : ""}`}
                />
                {type === "password" && (
                    <button
                        type="button"
                        className="toggle"
                        onClick={() => setShowPassword((v) => !v)}
                    >
                        {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                )}
            </div>
            {hasError && <span className="error">Campo obrigatório.</span>}
        </div>
    );
}

export default Input;
