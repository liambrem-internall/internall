import { useState, useEffect } from "react";

import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

import ViewContext from "./ViewContext";
import { ViewModes } from "./utils/constants";
import LoggedOut from "./components/logged-out-page/LoggedOut";
import UserPage from "./components/app-components/UserPage";
import LoadingState from "./components/app-components/LoadingState";
import BrowseBoards from "./components/browse-boards/BrowseBoards";
import useSocketConnection from "./hooks/socketHandlers/useSocketConnection";

import "./App.css";

const AUDIENCE = import.meta.env.VITE_API_AUDIENCE;
const DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const CLIENTID = import.meta.env.VITE_AUTH0_CLIENT_ID;

const App = () => {
  const [userReady, setUserReady] = useState(false);
  const [viewMode, setViewMode] = useState(ViewModes.BOARD);

  useSocketConnection();

  useEffect(() => {
    // remove the initial loader once React has mounted
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.remove();
    }
  }, []);

  const HomeRedirect = () => {
    const { isAuthenticated, user, isLoading } = useAuth0();

    if (isLoading) return <LoadingState />;
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
            <Route path="/browse" element={<BrowseBoards />} />
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
