import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import CampaignCard from "../components/CampaignCard";
import type { Campaign } from "../types/campaign";

function MyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function loadCampaigns() {
      try {
        const response = await fetch("/api/campaigns/mine/");

        if (response.status === 401 || response.status === 403) {
          if (!ignore) {
            navigate("/login", { replace: true });
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load your campaigns.");
        }

        const data: Campaign[] = await response.json();

        if (!ignore) {
          setCampaigns(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCampaigns();

    return () => {
      ignore = true;
    };
  }, [navigate]);


  function handleCampaignDeleted(id: number) {
    setCampaigns((currentCampaigns) =>
      currentCampaigns.filter((campaign) => campaign.id !== id)
    );
  }

  return (
    <main className="container py-5">
      <h1 className="text-success">My campaigns</h1>
      <p className="text-secondary">
        Fundraisers you have created.
      </p>

      <Link to="/campaigns/new" className="btn btn-success mb-4">
        Add campaign
      </Link>

      {loading && <p>Loading your campaigns...</p>}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {campaigns.length === 0 ? (
            <p>You haven’t created any campaigns yet.</p>
          ) : (
            <div className="row g-4">
              {campaigns.map((campaign) => (
                <div className="col-12 col-md-6" key={campaign.id}>
                  <CampaignCard
                    id={campaign.id}
                    title={campaign.title}
                    description={campaign.description}
                    targetAmount={Number(campaign.target_amount)}
                    creatorUsername={campaign.creator_username}
                    showEdit = {true}
                    onDeleted={handleCampaignDeleted}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default MyCampaignsPage;