import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

type GoogleSignInButtonProps = {
  onSuccess: () => void;
};

function GoogleSignInButton({
  onSuccess,
}: GoogleSignInButtonProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSuccess(
    result: CredentialResponse
  ) {
    setError("");

    if (!result.credential) {
      setError("Google did not return a sign-in credential.");
      return;
    }

    setSubmitting(true);

    try {
      const csrfResponse = await fetch("/api/auth/csrf/");

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare Google sign-in.");
      }

      const csrfData: { csrfToken: string } =
        await csrfResponse.json();

      const response = await fetch("/api/auth/google/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfData.csrfToken,
        },
        body: JSON.stringify({
          credential: result.credential,
        }),
      });

      if (!response.ok) {
        const data: { detail?: string } = await response.json();

        throw new Error(
          data.detail || "Google sign-in failed."
        );
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4">
      <p className="text-secondary text-center">Or continue with Google</p>

      {submitting ? (
        <p role="status">Signing in with Google...</p>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() =>
            setError("Google sign-in failed. Please try again.")
          }
          useOneTap={false}
          auto_select={false}
        />
      )}

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default GoogleSignInButton;