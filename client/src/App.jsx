import { useState } from "react";
import Navbar from "./components/outer-components/Navbar";
import SectionList from "./components/main-content/SectionList";
import { DndContext } from "@dnd-kit/core";


import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Navbar />
      <DndContext>
        <SectionList />
      </DndContext>
    </div>
  );
};

export default App;
