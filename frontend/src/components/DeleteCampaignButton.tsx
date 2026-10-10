import { useState } from "react";

type DeleteCampaignButtonProps = {
  id: number;
  onDeleted: (id: number) => void;
};

function DeleteCampaignButton({
  id,
  onDeleted,
}: DeleteCampaignButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this campaign? This cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const csrfResponse = await fetch("/api/auth/csrf/");

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare deletion.");
      }

      const csrfData: { csrfToken: string } =
        await csrfResponse.json();

      const response = await fetch(`/api/campaigns/${id}/delete/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": csrfData.csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(
          "Could not delete the campaign. Check your login and permissions."
        );
      }

      onDeleted(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-outline-danger"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="text-danger small mt-2 mb-0" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default DeleteCampaignButton;