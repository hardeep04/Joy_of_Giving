import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Campaign } from "../types/campaign";

function CampaignDetailPage() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCampaign() {
      setLoading(true);
      setError("");
      setCampaign(null);

      try {
        const response = await fetch(`/api/campaigns/${id}/`);

        if (response.status === 404) {
          throw new Error("Campaign not found.");
        }

        if (!response.ok) {
          throw new Error("Could not load this campaign.");
        }

        const data: Campaign = await response.json();

        if (!ignore) {
          setCampaign(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCampaign();

    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <main className="container py-5">
      <Link to="/" className="btn btn-outline-success mb-4">
        Back to campaigns
      </Link>

      {loading && <p>Loading campaign...</p>}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}


      {!loading && !error && campaign && (
        <article className="card shadow-sm">
          <img
            src={campaign.image || "/images/default-campaign.jpg"}
            alt={`Campaign: ${campaign.title}`}
            className="card-img-top"
            style={{
              maxHeight: "450px",
              objectFit: "contain",
            }}
          />
          <div className="card-body p-4">
            <h1 className="text-success">{campaign.title}</h1>
            <p className="text-secondary small">
              Posted by <span className="fw-semibold">{campaign.creator_username}</span>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {campaign.description}
            </p>

            <p>
              <strong>Target:</strong>{" "}
              {Number(campaign.target_amount).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </p>

            <p className="text-secondary mb-0">
              Created on{" "}
              {new Date(campaign.created_at).toLocaleDateString("en-IN")}
            </p>


          </div>
        </article>
      )}
    </main>
  );
}

export default CampaignDetailPage;