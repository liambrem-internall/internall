import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navigation from "./components/outer-components/Navigation";
import SectionList from "./components/main-content/SectionList";
import { ViewModes } from "./utils/constants";
import ViewContext from "./ViewContext";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import LoggedOut from "./components/logged-out-page/LoggedOut";

import LightBallsOverlay from "./components/visuals/LightBallsOverlay";
import "./App.css";

const App = () => {
  const [viewMode, setViewMode] = useState(ViewModes.BOARD);
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  const HomeRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated && user) {
    const username = user.nickname || user.name;
    return <Navigate to={`/${username}`} replace />;
  }
  return <LoggedOut />;
};

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <ViewContext.Provider value={{ viewMode, setViewMode }}>
        <Router>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route
              path="/:username"
              element={
                <div className="App">
                  <LightBallsOverlay />
                  <Navigation />
                  <SectionList />
                </div>
              }
            />
            <Route path="/loggedOut" element={<LoggedOut />} />
          </Routes>
        </Router>
      </ViewContext.Provider>
    </Auth0Provider>
  );
};

export default App;
