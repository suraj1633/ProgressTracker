import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  HiArrowRight,
  HiEnvelope,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";

import "./Auth.css";

const Signup = () => {
  const {
    user,
    signup,
    verifyOtp,
    resendOtp,
  } = useAuth();

  const navigate =
    useNavigate();

  const [step, setStep] =
    useState("details");

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      otp: "",
    });

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const updateField =
    (field, value) => {
      setForm({
        ...form,
        [field]: value,
      });
    };

  const handleSignup =
    async (event) => {
      event.preventDefault();
      setError("");
      setMessage("");
      setLoading(true);

      try {
        const data =
          await signup({
            name: form.name,
            email: form.email,
            password:
              form.password,
          });

        setStep("otp");
        setMessage(
          data.message ||
            "OTP sent to your email"
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to sign up"
        );
      } finally {
        setLoading(false);
      }
    };

  const handleVerify =
    async (event) => {
      event.preventDefault();
      setError("");
      setLoading(true);

      try {
        await verifyOtp({
          email: form.email,
          otp: form.otp,
        });
        navigate("/dashboard");
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to verify OTP"
        );
      } finally {
        setLoading(false);
      }
    };

  const handleResend =
    async () => {
      setError("");
      setMessage("");
      setLoading(true);

      try {
        const data =
          await resendOtp(
            form.email
          );

        setMessage(
          data.message ||
            "OTP sent again"
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to resend OTP"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-header">
          <h1>
            {step === "details"
              ? "Create account"
              : "Verify email"}
          </h1>

          <p>
            {step === "details"
              ? "Create your account and start tracking your DSA practice."
              : "Enter the code sent to your email to finish setup."}
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={
            step === "details"
              ? handleSignup
              : handleVerify
          }
        >
          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {step === "details" ? (
            <>
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target
                        .value
                    )
                  }
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target
                        .value
                    )
                  }
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  minLength={6}
                  value={
                    form.password
                  }
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target
                        .value
                    )
                  }
                  required
                />
              </label>
            </>
          ) : (
            <label>
              OTP
              <input
                inputMode="numeric"
                maxLength={6}
                value={form.otp}
                onChange={(event) =>
                  updateField(
                    "otp",
                    event.target.value
                  )
                }
                required
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {step === "details" ? (
              <HiEnvelope />
            ) : (
              <HiArrowRight />
            )}
            {loading
              ? "Please wait"
              : step === "details"
                ? "Send OTP"
                : "Verify"}
          </button>
        </form>

        {step === "otp" && (
          <button
            type="button"
            className="auth-secondary-action"
            onClick={handleResend}
            disabled={loading}
          >
            Resend OTP
          </button>
        )}

        <p className="auth-switch">
          Already registered?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Signup;
