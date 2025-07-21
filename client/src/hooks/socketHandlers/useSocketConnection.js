import { useContext, useEffect } from "react";
import { NetworkStatusContext } from "../../contexts/NetworkStatusContext";
import { socket } from "../../utils/socket";

const useSocketConnection = () => {
  const isOnline = useContext(NetworkStatusContext);

  useEffect(() => {
    if (isOnline) {
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [isOnline]);
};

export default useSocketConnection;
