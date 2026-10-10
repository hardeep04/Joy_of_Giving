import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";


function CreateCampaignPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
  let ignore = false;

  async function checkLogin() {
    try {
      const response = await fetch("/api/auth/me/");

      if (!response.ok) {
        throw new Error("Could not check your login status.");
      }

      const data: { is_authenticated: boolean } =
        await response.json();

      if (ignore) return;

      if (!data.is_authenticated) {
        navigate("/login", { replace: true });
        return;
      }

      setCheckingAuth(false);
    } catch {
      if (!ignore) {
        setAuthError(
          "Could not check your login status. Please refresh and try again."
        );
        setCheckingAuth(false);
      }
    }
  }

  checkLogin();

  return () => {
    ignore = true;
  };
}, [navigate]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");

  if (!title.trim() || !description.trim()) {
    setError("Title and description cannot be only spaces.");
    return;
  }

  setSubmitting(true);

  try {
    const csrfResponse = await fetch("/api/auth/csrf/");

    if (!csrfResponse.ok) {
      throw new Error("Could not prepare the request.");
    }

    const csrfData: { csrfToken: string } = await csrfResponse.json();

    const response = await fetch("/api/campaigns/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfData.csrfToken,
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        target_amount: targetAmount,
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errors: Record<string, string[]> = await response.json();

        const message = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
          .join(" ");

        throw new Error(message || "Please check your form values.");
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Creation was denied. Check that you are logged in, then try again."
        );
      }

      throw new Error("Could not create the campaign.");
    }

    const newCampaign: { id: number } = await response.json();

    navigate(`/campaigns/${newCampaign.id}`);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setSubmitting(false);
  }
}



  if (checkingAuth) {
  return (
    <main className="container py-5">
      <p>Checking login status...</p>
    </main>
  );
}

if (authError) {
  return (
    <main className="container py-5">
      <div className="alert alert-danger" role="alert">
        {authError}
      </div>
      <Link to="/" className="btn btn-outline-success">
        Back to campaigns
      </Link>
    </main>
  );
}


  return (
    <main className="container py-5">
      <Link to="/" className="btn btn-outline-success mb-4">
        Back to campaigns
      </Link>

      <h1 className="text-success">Create a campaign</h1>
      <p className="text-secondary">
        Share the story and fundraising target.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
            {error}
        </div>
     )}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Campaign title
          </label>
          <input
            id="title"
            type="text"
            className="form-control"
            maxLength={150}
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            className="form-control"
            rows={5}
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="target-amount" className="form-label">
            Target amount (₹)
          </label>
          <input
            id="target-amount"
            type="number"
            className="form-control"
            min="1"
            step="0.01"
            required
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
          />
        </div>

        <button
            type="submit"
            className="btn btn-success"
            disabled={submitting}
        >
            {submitting ? "Creating..." : "Create campaign"}
        </button>

        
      </form>
    </main>
  );
}

export default CreateCampaignPage;