const AuthLayout = ({
    title,
    subtitle,
    children
}) => {
    return (
        <main className="auth-layout">
            <div className="auth-layout__background" />

            <section className="auth-layout__content">
                <div className="auth-card">
                    <div className="auth-card__brand">
                        <span className="auth-card__brand-symbol">
                            &gt;_
                        </span>

                        <span>
                            PROJECT_PARTNER_FINDER
                        </span>
                    </div>

                    <div className="auth-card__header">
                        <p className="auth-card__terminal">
                            system.auth
                        </p>

                        <h1>
                            {title}
                        </h1>

                        {subtitle && (
                            <p>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="auth-card__body">
                        {children}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AuthLayout;