import { useEffect, useState } from "react";

import { io } from "socket.io-client";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";

import ViewContext from "./ViewContext";
import { apiFetch } from "./utils/apiFetch";
import { ViewModes } from "./utils/constants";
import LoggedOut from "./components/logged-out-page/LoggedOut";
import SectionList from "./components/main-content/SectionList";
import Navigation from "./components/outer-components/Navigation";
import LightBallsOverlay from "./components/visuals/LightBallsOverlay";
import EnsureUserInDB from "./components/app-components/EnsureUserInDB";
import UserPage from "./components/app-components/UserPage";

import "./App.css";

const AUDIENCE = import.meta.env.VITE_API_AUDIENCE;
const DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const CLIENTID = import.meta.env.VITE_AUTH0_CLIENT_ID;

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
      cacheLocation="localstorage"
    >
      <ViewContext value={{ viewMode, setViewMode }}>
        <Router>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route
              path="/:username"
              element={
                <UserPage
                  setUserReady={setUserReady}
                  userReady={userReady}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
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
