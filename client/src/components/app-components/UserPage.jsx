import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { socket } from "../../utils/socket";
import { roomActions } from "../../utils/constants";
import { useAuth0 } from "@auth0/auth0-react";

import EnsureUserInDB from "./EnsureUserInDB";
import LoggedOut from "../logged-out-page/LoggedOut";
import SectionList from "../main-content/SectionList";
import Navigation from "../outer-components/Navigation";
import SlidingMenu from "../outer-components/SlidingMenu";
import LightBallsOverlay from "../visuals/LightBallsOverlay";
import { FaSearch } from "react-icons/fa";


const getDisplayName = (user) => {
  return user?.nickname || user?.name || user?.email || "Anonymous";
};

const UserPage = ({ setUserReady, userReady, viewMode, setViewMode }) => {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const { username } = useParams();
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const isOwnPage =
    user && (username === user.nickname || username === user.name);
  const roomId = username;
  const userId = user?.sub;
  const nickname = getDisplayName(user);

  useEffect(() => { // handles connecting for entire client lifecycle
  if (!roomId || !userId || !nickname) return;

  const handleConnect = () => {
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
          <button
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 0,
              background: "var(--pink2)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
            onClick={() => setSearchMenuOpen(true)}
            aria-label="Open search"
          >
            <FaSearch />
          </button>
          <SlidingMenu open={searchMenuOpen} onClose={() => setSearchMenuOpen(false)} />
          <SectionList />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default UserPage;
