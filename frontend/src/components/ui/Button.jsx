const Button = ({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
    className = ""
}) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`button button--${variant} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;