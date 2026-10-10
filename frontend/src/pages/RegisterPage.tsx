import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const csrfResponse = await fetch("/api/auth/csrf/");

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare registration.");
      }

      const csrfData: { csrfToken: string } =
        await csrfResponse.json();

      const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfData.csrfToken,
        },
        body: JSON.stringify({
          username: username.trim(),
          password1: password,
          password2: confirmPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errors: Record<string, string[] | string> =
            await response.json();

          const message = Object.entries(errors)
            .map(([field, messages]) => {
              const text = Array.isArray(messages)
                ? messages.join(" ")
                : messages;

              return `${field}: ${text}`;
            })
            .join(" ");

          throw new Error(message || "Please check your details.");
        }

        throw new Error("Could not create your account.");
      }

      navigate("/login", {
        state: {
          message: "Account created successfully. Please log in.",
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <h1 className="text-success">Create an account</h1>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
              <label htmlFor="register-username" className="form-label">
                Username
              </label>
              <input
                id="register-username"
                type="text"
                className="form-control"
                autoComplete="username"
                maxLength={150}
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="register-password" className="form-label">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="form-control"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <div className="form-text">
                Use a strong password with at least 8 characters.
                Avoid common passwords and personal information.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="form-control"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-3">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;