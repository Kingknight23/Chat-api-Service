import Register from "../components/auth/Register.jsx";

const RegisterPage = ({
    onLogin
}) => {
    return (
        <main className="auth-page">
            <Register
                onLogin={onLogin}
            />
        </main>
    );
};

export default RegisterPage;