import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";

import { Link, useNavigate, useParams } from "react-router";

import type { Campaign } from "../types/campaign";

function EditCampaignPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();

  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadError, setLoadError] = useState("");

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

useEffect(() => {
  let ignore = false;

  async function loadCampaign() {
    setLoadingCampaign(true);
    setLoadError("");

    try {
      const response = await fetch(`/api/campaigns/${id}/edit/`);

      if (response.status === 401 || response.status === 403) {
        if (!ignore) {
          navigate("/login", { replace: true });
        }
        return;
      }

      if (response.status === 404) {
        throw new Error(
          "Campaign not found, or you do not have permission to edit it."
        );
      }

      if (!response.ok) {
        throw new Error("Could not load the campaign.");
      }

      const data: Campaign = await response.json();

      if (!ignore) {
        setTitle(data.title);
        setDescription(data.description);
        setTargetAmount(data.target_amount);
      }
    } catch (err) {
      if (!ignore) {
        setLoadError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      }
    } finally {
      if (!ignore) {
        setLoadingCampaign(false);
      }
    }
  }

  loadCampaign();

  return () => {
    ignore = true;
  };
}, [id, navigate]);



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

    const response = await fetch(`/api/campaigns/${id}/edit/`, {
      method: "PATCH",
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

      if (response.status === 404) {
        throw new Error(
          "Campaign not found, or you do not have permission to edit it."
        );
      }

      if (response.status === 400) {
        const errors: Record<string, string[]> = await response.json();

        const message = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
          .join(" ");

        throw new Error(message || "Please check your form values.");
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Editing was denied. Check that you are logged in, then try again."
        );
      }

      throw new Error("Could not edit the campaign.");
    }

    const updatedCampaign: { id: number } = await response.json();

    navigate(`/campaigns/${updatedCampaign.id}`);
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

  if (loadingCampaign) {
    return (
      <main className="container py-5">
        <p>Loading campaign...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger" role="alert">
          {loadError}
        </div>
        <Link to="/my-campaigns" className="btn btn-outline-success">
          Back to my campaigns
        </Link>
      </main>
    );
  }


  return (
    <main className="container py-5">
      <Link to="/" className="btn btn-outline-success mb-4">
        Back to campaigns
      </Link>

      <h1 className="text-success">Edit campaign</h1>
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
            {submitting ? "Saving..." : "Save changes"}
        </button>

        
      </form>
    </main>
  );
}

export default EditCampaignPage;