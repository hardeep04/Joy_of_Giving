import { useEffect, useState } from "react";
import CampaignCard from "../components/CampaignCard";
import type { Campaign } from "../types/campaign";

function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCampaigns() {
      try {
        const response = await fetch("/api/campaigns/");

        if (!response.ok) {
          throw new Error("Could not load campaigns.");
        }

        const data: Campaign[] = await response.json();

        if (!ignore) {
          setCampaigns(data);
        }
      } catch {
        if (!ignore) {
          setError("Could not load campaigns. Please try refreshing.");
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
  }, []);

  const query = search.trim().toLowerCase();

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(query) ||
      campaign.description.toLowerCase().includes(query)
  );

  return (
    <main className="container py-5">
      <h1 className="text-success">Joy of Giving</h1>
      <p className="text-secondary">
        Help someone take a step towards a healthier life.
      </p>

      {loading && <p>Loading campaigns...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mt-4">
            <label htmlFor="campaign-search" className="form-label">
              Search campaigns
            </label>

            <input
              id="campaign-search"
              type="search"
              className="form-control"
              placeholder="Search titles or descriptions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <p className="text-secondary mt-3">
            {filteredCampaigns.length} campaigns found
          </p>

          <div className="row g-4">
            {filteredCampaigns.map((campaign) => (
              <div className="col-12 col-md-6" key={campaign.id}>
                <CampaignCard
                  id = {campaign.id}
                  title={campaign.title}
                  description={campaign.description}
                  targetAmount={Number(campaign.target_amount)}
                  creatorUsername={campaign.creator_username}
                />
              </div>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <p className="text-secondary">
              {campaigns.length === 0
                ? "No campaigns have been created yet."
                : "No campaigns match your search."}
            </p>
          )}
        </>
      )}
    </main>
  );
}

export default HomePage;