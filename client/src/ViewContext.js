import { createContext } from "react";
import { ViewModes } from "./utils/constants";

const ViewContext = createContext({
  viewMode: ViewModes.BOARD, 
  setViewMode: () => {}, 
});

export default ViewContext;