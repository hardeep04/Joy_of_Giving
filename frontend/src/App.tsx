import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import LoginPage from "./pages/LoginPage";

import Navbar from "./components/Navbar";

import RegisterPage from "./pages/RegisterPage";

import MyCampaignsPage from "./pages/MyCampaignsPage";

import EditCampaignPage from "./pages/EditCampaignPage";
function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
      
        <Route
          path="/campaigns/:id"
          element={<CampaignDetailPage />}
        />
        
        <Route
          path="/campaigns/new"
          element={<CreateCampaignPage />}
        />

        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/my-campaigns" element={<MyCampaignsPage />} />

        <Route
          path="/campaigns/:id/edit"
          element={<EditCampaignPage />}
        />
        
        <Route
          path="*"
          element={<p className="container py-5">Page not found.</p>}
        />
      </Routes>
    </>
  );
}

export default App;