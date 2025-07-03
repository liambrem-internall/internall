import { useParams } from "react-router-dom";
import { useEffect } from "react";

import { socket } from "../../utils/socket";
import { roomActions } from "../../utils/constants";
import { useAuth0 } from "@auth0/auth0-react";

import EnsureUserInDB from "./EnsureUserInDB";
import LoggedOut from "../logged-out-page/LoggedOut";
import SectionList from "../main-content/SectionList";
import Navigation from "../outer-components/Navigation";
import LightBallsOverlay from "../visuals/LightBallsOverlay";

const getDisplayName = (user) => {
  return user?.nickname || user?.name || user?.email || "Anonymous";
};

const UserPage = ({ setUserReady, userReady, viewMode, setViewMode }) => {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const { username } = useParams();
  const isOwnPage =
    user && (username === user.nickname || username === user.name);
  const roomId = username;
  const userId = user?.sub;
  const nickname = getDisplayName(user);

  useEffect(() => {
  if (!roomId || !userId || !nickname) return;

  const handleConnect = () => {
    console.log(`Joining room: ${roomId} as user: ${userId} with nickname: ${nickname}`);
    socket.emit(roomActions.JOIN, { roomId, userId, nickname });
  };

  if (socket.connected) {
    handleConnect();
  } else {
    socket.once("connect", handleConnect);
  }

  return () => {
    socket.emit(roomActions.LEAVE, { roomId });
    socket.off("connect", handleConnect);
  };
}, [roomId, userId, nickname]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated || !user) return <LoggedOut />;

  return (
    <>
      {isOwnPage && <EnsureUserInDB onReady={() => setUserReady(true)} />}
      {(isOwnPage ? userReady : true) ? (
        <div className="App">
          <LightBallsOverlay />
          <Navigation />
          <SectionList />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default UserPage;
