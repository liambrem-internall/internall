import { useState } from "react";
import Navigation from "./components/outer-components/Navigation";
import SectionList from "./components/main-content/SectionList";
import { ViewModes } from "./utils/constants";

import "./App.css";

const App = () => {
  const [viewMode, setViewMode] = useState(ViewModes.BOARD);

  return (
    <div className="App">
      <Navigation
        clickBoard={() => setViewMode(ViewModes.BOARD)}
        clickList={() => setViewMode(ViewModes.LIST)}
        mode={viewMode}
      />
      <SectionList mode={viewMode} />
    </div>
  );
};

export default App;
