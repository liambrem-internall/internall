import { useEffect, useState } from "react";

import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

import ViewContext from "./ViewContext";
import { apiFetch } from "./utils/apiFetch";
import { ViewModes } from "./utils/constants";
import LoggedOut from "./components/logged-out-page/LoggedOut";
import SectionList from "./components/main-content/SectionList";
import Navigation from "./components/outer-components/Navigation";
import LightBallsOverlay from "./components/visuals/LightBallsOverlay";

import "./App.css";

const URL = import.meta.env.VITE_API_URL;
const AUDIENCE = import.meta.env.VITE_API_AUDIENCE;
const DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const CLIENTID = import.meta.env.VITE_AUTH0_CLIENT_ID;

const EnsureUserInDB = ({ onReady }) => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    const createUserIfNeeded = async () => {
      await apiFetch({
        endpoint: `${URL}/api/users`,
        method: "POST",
        body: {
          email: user.email,
          name: user.name,
          username: user.email.split("@")[0],
        },
        getAccessTokenSilently,
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
      domain={DOMAIN}
      clientId={CLIENTID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: AUDIENCE,
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
