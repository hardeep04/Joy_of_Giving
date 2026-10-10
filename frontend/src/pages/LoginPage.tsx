import { useState } from "react";
import type { SubmitEvent } from "react";

import { Link, useLocation, useNavigate } from "react-router";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const navigationState = location.state as
  | {
      message?: string;
      returnTo?: string;
    }
  | null;

  const successMessage = navigationState?.message;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const csrfResponse = await fetch("/api/auth/csrf/");

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare login. Please try again.");
      }

      const csrfData: { csrfToken: string } = await csrfResponse.json();

      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfData.csrfToken,
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid username or password.");
        }

        throw new Error("Login failed. Please try again.");
      }

      const destination =
        navigationState?.returnTo === "/campaigns/new"
          ? "/campaigns/new"
          : "/";

      navigate(destination, { replace: true });
      
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
      <Link to="/" className="btn btn-outline-success mb-4">
        Back to campaigns
      </Link>

      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <h1 className="text-success">Log in</h1>
          <p className="text-secondary">
            Log in to create your fundraiser.
          </p>


          {successMessage && (
            <div className="alert alert-success" role="status">
                {successMessage}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-control"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-3">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;