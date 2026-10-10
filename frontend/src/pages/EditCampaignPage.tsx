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

  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const [removeImage, setRemoveImage] = useState(false);

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
          setCurrentImage(data.image);
          setImage(null);
          setRemoveImage(false);
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

      const csrfData: { csrfToken: string } =
        await csrfResponse.json();

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("target_amount", targetAmount);

      if (removeImage) {
        formData.append("remove_image", "true");
      } else if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`/api/campaigns/${id}/edit/`, {
        method: "PATCH",
        headers: {
          "X-CSRFToken": csrfData.csrfToken,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Campaign not found, or you do not have permission to edit it."
          );
        }

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

          throw new Error(message || "Please check your form values.");
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Update was denied. Check your login and permissions."
          );
        }

        throw new Error("Could not save your changes.");
      }

      const updatedCampaign: { id: number } =
        await response.json();

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

        <div className="mb-3">
          <p className="form-label">Current image</p>

          <img
            src={
              removeImage
                ? "/images/default-campaign.jpg"
                : currentImage || "/images/default-campaign.jpg"
            }
            alt="Current campaign"
            className="img-thumbnail d-block mb-3"
            style={{
              width: "240px",
              height: "160px",
              objectFit: "cover",
            }}
          />

          <label htmlFor="edit-campaign-image" className="form-label">
            Replace image (optional)
          </label>

          {currentImage && (
            <div className="form-check mt-3">
              <input
                id="remove-campaign-image"
                type="checkbox"
                className="form-check-input"
                checked={removeImage}
                onChange={(event) => setRemoveImage(event.target.checked)}
              />

              <label
                htmlFor="remove-campaign-image"
                className="form-check-label"
              >
                Remove current image and use the default
              </label>
            </div>
          )}

          <input
            id="edit-campaign-image"
            type="file"
            className="form-control"
            accept="image/*"
            disabled={removeImage}
            onChange={(event) =>
              setImage(event.target.files?.[0] ?? null)
            }
          />

          <div className="form-text">
            Leave this empty to keep the current image.
          </div>
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
