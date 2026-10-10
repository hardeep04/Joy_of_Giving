import { useState } from "react";

function LogoutButton() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    setSubmitting(true);

    try {
      const csrfResponse = await fetch("/api/auth/csrf/");

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare logout.");
      }

      const csrfData: { csrfToken: string } = await csrfResponse.json();

      const response = await fetch("/api/auth/logout/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfData.csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error("Could not log out. Please try again.");
      }

      window.location.assign("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="">
      <button
        type="button"
        className="btn btn-outline-danger"
        onClick={handleLogout}
        disabled={submitting}
      >
        {submitting ? "Logging out..." : "Log out"}
      </button>

      {error && (
        <p className="text-danger mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default LogoutButton;