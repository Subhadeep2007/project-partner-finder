const Input = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false
}) => {
    return (
        <div className="input-group">
            {label && (
                <label
                    className="input-label"
                    htmlFor={name}
                >
                    {label}

                    {required && (
                        <span className="input-required">
                            *
                        </span>
                    )}
                </label>
            )}

            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`input-field ${
                    error ? "input-field--error" : ""
                }`}
            />

            {error && (
                <p className="input-error">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;