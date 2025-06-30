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

const EnsureUserInDB = ({ onReady }) => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    const createUserIfNeeded = async () => {
      const token = await getAccessTokenSilently();
      await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          username: user.email.split("@")[0],
        }),
      });
      setLoading(false);
      onReady && onReady();
    };
    createUserIfNeeded();
  }, [isAuthenticated, getAccessTokenSilently, user, onReady]);

  if (loading) return <div>Loading...</div>;
  return null;
};

const App = () => {
  const [userReady, setUserReady] = useState(false);
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
        audience: "https://internall-api",
        scope:
          "openid profile email read:sections write:sections read:items write:items manage:profile collaborate:realtime",
      }}
    >
      <ViewContext value={{ viewMode, setViewMode }}>
        <Router>
          <EnsureUserInDB onReady={() => setUserReady(true)} />
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route
              path="/:username"
              element={
                userReady ? (
                  <div className="App">
                    <LightBallsOverlay />
                    <Navigation />
                    <SectionList />
                  </div>
                ) : (
                  <div>Loading...</div>
                )
              }
            />
            <Route path="/loggedOut" element={<LoggedOut />} />
          </Routes>
        </Router>
      </ViewContext>
    </Auth0Provider>
  );
};

export default App;
