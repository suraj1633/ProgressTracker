import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  HiArrowRight,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";

import "./Auth.css";

const Login = () => {
  const {
    user,
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  if (user) {
    return (
      <Navigate to="/" replace />
    );
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault();
      setError("");
      setLoading(true);

      try {
        await login(form);
        navigate("/");
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to login"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-header">
          <h1>Login</h1>

          <p>
            Sign in to continue tracking your progress.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email:
                    event.target
                      .value,
                })
              }
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password:
                    event.target
                      .value,
                })
              }
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
          >
            <HiArrowRight />
            {loading
              ? "Logging in"
              : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New here?{" "}
          <Link to="/signup">
            Create account
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Login;
