import { useContext } from "react";
import { NetworkStatusContext } from "../../contexts/NetworkStatusContext";
import { socket } from "../../utils/socket";

const useSafeSocketEmit = () => {
  const isOnline = useContext(NetworkStatusContext);

  return (event, data) => {
    if (isOnline && socket.connected) {
      socket.emit(event, data);
    }
  };
};

export default useSafeSocketEmit;