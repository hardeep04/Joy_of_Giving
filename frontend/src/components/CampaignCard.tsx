import { Link } from "react-router";

import DeleteCampaignButton from "./DeleteCampaignButton";

type CampaignCardProps = {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  creatorUsername: string;
  showEdit?: boolean;
  onDeleted?: (id: number) => void;
};

function CampaignCard({
  id,
  title,
  description,
  targetAmount,
  creatorUsername,
  showEdit = false,
  onDeleted,
}: CampaignCardProps) {
  return (
    <article className="card h-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title h5">{title}</h2>
        
        <p className="text-secondary small">
          Posted by <span className="fw-semibold">{creatorUsername}</span>
        </p>
        
        <p className="card-text">{description}</p>

        <p>
          <strong>Target:</strong>{" "}
          {targetAmount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </p>

        <div className="d-flex flex-wrap gap-2">

        <Link
          to={`/campaigns/${id}`}
          className="btn btn-success"
        >
          View details
        </Link>

        {showEdit && (
          <Link
            to={`/campaigns/${id}/edit`}
            className="btn btn-outline-success"
          >
            Edit
          </Link>
        )}

        {onDeleted && (
          <DeleteCampaignButton id={id} onDeleted={onDeleted} />
        )}

      </div>

      </div>
    </article>
  );
}

export default CampaignCard;