import React, { useContext, useState } from "react";

import { useParams } from "react-router-dom";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { useAuth0 } from "@auth0/auth0-react";
import Container from "react-bootstrap/Container";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { BsFillPersonFill } from "react-icons/bs";
import { prepopulateDemoData } from "../../utils/functions/prepopulateDemoData";
import { NetworkStatusContext } from "../../contexts/NetworkStatusContext";
import { useApiFetch } from "../../hooks/useApiFetch";
import SemanticGraphOverlay from "./SemanticGraphOverlay";

import ViewContext from "../../ViewContext";
import { ViewModes } from "../../utils/constants";
import useRoomUsers from "../../hooks/rooms/useRoomUsers";

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

  const userColors = otherUsers.map((user) => (
    <OverlayTrigger
      key={user.socketId}
      placement="bottom"
      overlay={
        <Tooltip id={`tooltip-${user.socketId}`}>{user.nickname}</Tooltip>
      }
    >
      <BsFillPersonFill
        fontSize={25}
        style={{
          display: "inline-block",
          margin: "0 2px",
          color: user.color,
          cursor: "pointer",
        }}
      />
    </OverlayTrigger>
  ));

  return (
    <div className="navbar-float-wrapper">
      <Navbar expand="lg" className="custom-navbar px-4 py-2">
        <Container fluid>
          <Navbar.Brand className="fw-bold d-flex align-items-center text-white">
            {userColors}
          </Navbar.Brand>
          <span
            className={`status-indicator ${isOnline ? "online" : "offline"}`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="d-flex ms-auto align-items-center">
              <Nav className="mx-auto">
                <Nav.Link
                  className="nav-link-custom"
                  onClick={() => setShowGraph((prev) => !prev)}
                >
                  {showGraph ? "Hide Graph" : "Show Graph"}
                </Nav.Link>
                <Nav.Link
                  className="nav-link-custom"
                  onClick={() =>
                    prepopulateDemoData({
                      username,
                      getAccessTokenSilently,
                      apiFetch,
                    })
                  }
                >
                  Demo-Data
                </Nav.Link>
                <Nav.Link
                  className={`nav-link-custom${
                    viewMode === ViewModes.BOARD ? " selected" : ""
                  }`}
                  onClick={() => setViewMode(ViewModes.BOARD)}
                >
                  Board
                </Nav.Link>
                <Nav.Link
                  className={`nav-link-custom${
                    viewMode === ViewModes.LIST ? " selected" : ""
                  }`}
                  onClick={() => setViewMode(ViewModes.LIST)}
                >
                  List
                </Nav.Link>
              </Nav>
              <Button
                className="get-started-btn"
                onClick={() =>
                  logout({
                    logoutParams: {
                      returnTo: `${window.location.origin}/loggedOut`,
                    },
                  })
                }
              >
                Log Out
              </Button>
            </div>
          </Navbar.Collapse>
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
