import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/outer-components/Navigation";
import SectionList from "./components/main-content/SectionList";
import { ViewModes } from "./utils/constants";
import ViewContext from "./ViewContext";
//import { Auth0Provider } from "@auth0/auth0-react";
import { Auth0Provider } from "@auth0/auth0-react/dist/auth0-react.esm.js";
import LoggedOut from "./components/logged-out-page/LoggedOut";

import LightBallsOverlay from "./components/visuals/LightBallsOverlay";
import "./App.css";



const App = () => {
  const [viewMode, setViewMode] = useState(ViewModes.BOARD);
  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
  
  return (
    <Auth0Provider 
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}>
    <ViewContext value={{ viewMode, setViewMode }}>
      <Router>
          <Routes>
            <Route
              path="/"
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
    </ViewContext>
    </Auth0Provider>
  );
};

export default App;
