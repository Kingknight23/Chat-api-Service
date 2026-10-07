import { useState } from "react";

import {
    login
} from "../../api/api.js";

import {
    setToken,
    setUser
} from "../../utils/storage.js";

const Login = ({
    onRegister
}) => {
    const [
        email,
        setEmail
    ] = useState("");

    const [
        password,
        setPassword
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);


    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result =
                await login(
                    email,
                    password
                );

            setToken(
                result.token
            );

            setUser(
                result.user
            );

            window.location.reload();
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <section className="auth-card">

            <div className="brand-mark">
                ✦
            </div>

            <p className="eyebrow">
                CHAT APPLICATION
            </p>

            <h1>
                Welcome back
            </h1>

            <p className="muted">
                Sign in to continue
                to your messages.
            </p>

            <form
                onSubmit={handleSubmit}
            >

                <label>
                    Email
                </label>

                <input
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onChange={(event) =>
                        setEmail(
                            event.target.value
                        )
                    }
                    required
                />


                <label>
                    Password
                </label>

                <input
                    type="password"
                    value={password}
                    placeholder="Password"
                    onChange={(event) =>
                        setPassword(
                            event.target.value
                        )
                    }
                    required
                />


                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}


                <button
                    className="primary-button"
                    disabled={loading}
                >
                    {loading
                        ? "Signing in..."
                        : "Sign In"}
                </button>

            </form>


            <p className="auth-switch">
                Don't have an account?

                <button
                    onClick={onRegister}
                >
                    Create account
                </button>
            </p>

        </section>
    );
};

export default Login;