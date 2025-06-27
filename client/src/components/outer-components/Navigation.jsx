import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { ViewModes } from "../../utils/constants";
import { useContext } from "react";
import ViewContext from "../../ViewContext";
import "./Navbar.css";


const Navigation = () => {
  const { viewMode, setViewMode } = useContext(ViewContext);

  return (
    <div className="navbar-float-wrapper">
      <Navbar expand="lg" className="custom-navbar px-4 py-2">
        <Container fluid>
          <Navbar.Brand className="fw-bold d-flex align-items-center text-white">
            Title
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="d-flex ms-auto align-items-center">
              <Nav className="mx-auto">
                <Nav.Link
                  className={`nav-link-custom${viewMode === ViewModes.BOARD ? " selected" : ""}`}
                  onClick={() => setViewMode(ViewModes.BOARD)}
                >
                  Board
                </Nav.Link>
                <Nav.Link
                  className={`nav-link-custom${viewMode === ViewModes.LIST ? " selected" : ""}`}
                  onClick={() => setViewMode(ViewModes.LIST)} 
                >
                  List
                </Nav.Link>
              </Nav>
              <Button className="get-started-btn">Account</Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Navigation;
