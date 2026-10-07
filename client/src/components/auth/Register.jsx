import { useState } from "react";

import {
    register
} from "../../api/api.js";

import {
    setToken,
    setUser
} from "../../utils/storage.js";

const Register = ({
    onLogin
}) => {
    const [
        username,
        setUsername
    ] = useState("");

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
                await register(
                    username,
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
                Create account
            </h1>

            <p className="muted">
                Create your account
                and start chatting.
            </p>


            <form
                onSubmit={handleSubmit}
            >

                <label>
                    Username
                </label>

                <input
                    type="text"
                    value={username}
                    placeholder="Username"
                    onChange={(event) =>
                        setUsername(
                            event.target.value
                        )
                    }
                    required
                />


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
                        ? "Creating..."
                        : "Create Account"}
                </button>

            </form>


            <p className="auth-switch">
                Already have an account?

                <button
                    onClick={onLogin}
                >
                    Sign In
                </button>
            </p>

        </section>
    );
};

export default Register;