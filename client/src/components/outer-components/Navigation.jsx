import { useContext } from "react";

import { useParams } from "react-router-dom";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { useAuth0 } from "@auth0/auth0-react";
import Container from "react-bootstrap/Container";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FaUser } from "react-icons/fa";


import ViewContext from "../../ViewContext";
import { ViewModes } from "../../utils/constants";
import useRoomUsers from "../../hooks/useRoomUsers";

import "./Navbar.css";

const Navigation = () => {
  const { viewMode, setViewMode } = useContext(ViewContext);
  const { logout, user } = useAuth0();
  const roomId = window.location.pathname;
  const userId = user?.sub;

  const otherUsers = useRoomUsers(roomId, userId, user.nickname);

  const userColors = otherUsers.map((user, i) => (
  <OverlayTrigger
    key={user.socketId}
    placement="bottom"
    overlay={
      <Tooltip id={`tooltip-${user.socketId}`}>
        {user.nickname}
      </Tooltip>
    }
  >
    <FaUser
      style={{
        display: "inline-block",
        size: 20,
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
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="d-flex ms-auto align-items-center">
              <Nav className="mx-auto">
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
    </div>
  );
};

export default Navigation;
