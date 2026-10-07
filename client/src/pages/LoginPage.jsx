import Login from "../components/auth/Login.jsx";

const LoginPage = ({
    onRegister
}) => {
    return (
        <main className="auth-page">
            <Login
                onRegister={onRegister}
            />
        </main>
    );
};

export default LoginPage;