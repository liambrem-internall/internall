import { useState } from "react";
import Navigation from "./components/outer-components/Navigation";
import SectionList from "./components/main-content/SectionList";
import { ViewModes } from "./utils/constants";
import ViewContext from "./ViewContext";

import LightBallsOverlay from "./components/visuals/LightBallsOverlay";

import "./App.css";

const App = () => {
  const [viewMode, setViewMode] = useState(ViewModes.BOARD);
  return (
    <ViewContext.Provider value={{ viewMode, setViewMode }}>
      <LightBallsOverlay />
      <div className="App">
        <Navigation />
        <SectionList />
      </div>
    </ViewContext.Provider>
  );
};

export default App;
