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
import LoadingState from "./LoadingState";
import useSafeSocketEmit from "../../hooks/socketHandlers/useSafeSocketEmit";

const getDisplayName = (user) => {
  return user?.nickname || user?.name || user?.email || "Anonymous";
};

const UserPage = ({ setUserReady, userReady }) => {
  const { user, isAuthenticated } = useAuth0();
  const { username } = useParams();
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sections, setSections] = useState({}); 
  const [showLogs, setShowLogs] = useState(false);
  const isOwnPage =
    user && (username === user.nickname || username === user.name);
  const roomId = username;
  const userId = user?.sub;
  const nickname = getDisplayName(user);
  const safeEmit = useSafeSocketEmit();

  useEffect(() => {
    // handles connecting for entire client lifecycle
    if (!roomId || !userId || !nickname) return;

    const handleConnect = () => {
      safeEmit(roomActions.JOIN, { roomId, userId, nickname });
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once("connect", handleConnect);
    }

    return () => {
      safeEmit(roomActions.LEAVE, { roomId });
      socket.off("connect", handleConnect);
    };
  }, [roomId, userId, nickname, safeEmit]);

  if (!isAuthenticated || !user) return <LoggedOut />;

  return (
    <>
      {isOwnPage && <EnsureUserInDB onReady={() => setUserReady(true)} />}
      {(isOwnPage ? userReady : true) ? (
        <div className="App">
          <LightBallsOverlay />
          <div className="app-header">
            <Navigation 
              setSearchMenuOpen={setSearchMenuOpen}
              showLogs={showLogs}
              setShowLogs={setShowLogs}
            />
          </div>
          <div className="app-content">
            <SlidingMenu
              open={searchMenuOpen}
              onClose={() => setSearchMenuOpen(false)}
              setShowItemModal={setShowItemModal}
              setEditingItem={setEditingItem}
              sections={sections}
            />
            <SectionList
              showItemModal={showItemModal}
              setShowItemModal={setShowItemModal}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              onSectionsChange={setSections}
              showLogs={showLogs}
            />
          </div>
        </div>
      ) : (
        <LoadingState />
      )}
    </>
  );
};

export default UserPage;
