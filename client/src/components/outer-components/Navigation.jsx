import React, { useContext, useState } from "react";

import { useParams } from "react-router-dom";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useAuth0 } from "@auth0/auth0-react";
import Container from "react-bootstrap/Container";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { NetworkStatusContext } from "../../contexts/NetworkStatusContext";
import { useApiFetch } from "../../hooks/useApiFetch";
import SemanticGraphOverlay from "./SemanticGraphOverlay";
import HamburgerMenu from "./HamburgerMenu";

import ViewContext from "../../ViewContext";
import { ViewModes } from "../../utils/constants";
import useRoomUsers from "../../hooks/rooms/useRoomUsers";
import { TbColumns3 } from "react-icons/tb";

import "./Navbar.css";

const Navigation = () => {
  const { viewMode, setViewMode } = useContext(ViewContext);
  const { logout, user, getAccessTokenSilently } = useAuth0();
  const { username } = useParams();
  const roomId = username;
  const userId = user?.sub;
  const isOnline = useContext(NetworkStatusContext);
  const otherUsers = useRoomUsers(roomId, userId, user.nickname);
  const apiFetch = useApiFetch();
  const [showGraph, setShowGraph] = useState(false);

  const toggleViewMode = () => {
    setViewMode(viewMode === ViewModes.BOARD ? ViewModes.LIST : ViewModes.BOARD);
  };

  const userColors = otherUsers.map((user) => (
    <OverlayTrigger
      key={user.socketId}
      placement="bottom"
      overlay={
        <Tooltip id={`tooltip-${user.socketId}`}>{user.nickname}</Tooltip>
      }
    >
      <div
        className="user-avatar"
        style={{
          backgroundColor: user.color,
          "--user-color": user.color,
        }}
      >
        {user.nickname?.charAt(0) || "?"}
      </div>
    </OverlayTrigger>
  ));

  return (
    <div className="navbar-float-wrapper">
      <Navbar className="custom-navbar px-4 py-2">
        <Container fluid>
          <Navbar.Brand className="fw-bold d-flex align-items-center text-white">
            {userColors}
          </Navbar.Brand>
          <span
            className={`status-indicator ${isOnline ? "online" : "offline"}`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
          
          <div className="d-flex align-items-center">
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="view-toggle-tooltip">
                  Switch to {viewMode === ViewModes.BOARD ? "List" : "Board"} View
                </Tooltip>
              }
            >
              <Nav.Link
                className="nav-link-custom"
                onClick={toggleViewMode}
              >
                <TbColumns3 
                  size={20} 
                  className={`view-toggle-icon ${viewMode === ViewModes.BOARD ? 'rotated' : ''}`}
                />
              </Nav.Link>
            </OverlayTrigger>
            
            <HamburgerMenu
              showGraph={showGraph}
              setShowGraph={setShowGraph}
              username={username}
              getAccessTokenSilently={getAccessTokenSilently}
              apiFetch={apiFetch}
              logout={logout}
            />
          </div>
        </Container>
      </Navbar>
      <SemanticGraphOverlay
        isVisible={showGraph}
        onClose={() => setShowGraph(false)}
        roomId={roomId}
      />
    </div>
  );
};

export default Navigation;
