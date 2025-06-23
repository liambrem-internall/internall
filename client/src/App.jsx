import { useState } from "react";
import Navbar from "./components/outer-components/Navigation";
import SectionList from "./components/main-content/SectionList";
import { DndContext } from "@dnd-kit/core";

import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Navbar /> <SectionList />
    </div>
  );
};

export default App;
