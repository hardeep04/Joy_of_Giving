import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import LogoutButton from "./LogoutButton";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { pathname } = useLocation();

  const navigate = useNavigate();
  const [showLoginToast, setShowLoginToast] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function checkLogin() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/auth/me/");

        if (!response.ok) {
          throw new Error("Could not check login status.");
        }

        const data: { is_authenticated: boolean } =
          await response.json();

        if (!ignore) {
          setIsAuthenticated(data.is_authenticated);
        }
      } catch {
        if (!ignore) {
          setError("Login status unavailable.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    checkLogin();

    return () => {
      ignore = true;
    };
  }, [pathname]);


  function handleAddCampaign() {
    if (isAuthenticated) {
      navigate("/campaigns/new");
    } else {
      setShowLoginToast(true);
    }
  }

  useEffect(() => {
    if (!showLoginToast) return;

    const timer = window.setTimeout(() => {
      setShowLoginToast(false);
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showLoginToast]);

  return (
    <>
      <nav className="navbar bg-white border-bottom">
        <div className="container d-flex flex-wrap gap-3">
          <Link to="/" className="navbar-brand text-success fw-bold">
            Joy of Giving
          </Link>

          <div className="d-flex align-items-center gap-3">
            {loading && (
              <span className="text-secondary">Checking login...</span>
            )}

            <button
              type="button"
              className="btn btn-success"
              onClick={handleAddCampaign}
              disabled={loading || Boolean(error)}
            >
              Add campaign
            </button>

            {!loading && error && (
              <span className="text-danger" role="alert">
                {error}
              </span>
            )}

            {!loading && !error && (
              <>
                {isAuthenticated ? (
                  <>

                    <Link to="/my-campaigns" className="btn btn-outline-success">
                      My campaigns
                    </Link>


                    <LogoutButton />
                  </>
                ) : (
                  <Link to="/login" className="btn btn-outline-success">
                    Log in
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {showLoginToast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div
            className="toast show"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="toast-header">
              <strong className="me-auto">Login required</strong>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowLoginToast(false)}
              />
            </div>

            <div className="toast-body">
              Please log in to add a campaign.
              <Link
                to="/login"
                state={{ returnTo: "/campaigns/new" }}
                className="d-block mt-2"
                onClick={() => setShowLoginToast(false)}
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;