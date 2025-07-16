import "./LoadingState.css";
import { LuLoaderPinwheel } from "react-icons/lu";


const LoadingState = () => {
  return (
    <div className="loading-state-container">
      <LuLoaderPinwheel className="spin" size={75}/>
    </div>
  );
};

export default LoadingState;