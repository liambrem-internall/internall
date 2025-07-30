import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { FaBars } from "react-icons/fa6";
import { FaCompass } from "react-icons/fa";
import { prepopulateDemoData } from "../../utils/functions/prepopulateDemoData";

import "./HamburgerMenu.css";

const HamburgerMenu = ({
  showGraph,
  setShowGraph,
  username,
  getAccessTokenSilently,
  apiFetch,
  logout,
  navigate,
}) => {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="div"
        className="hamburger-toggle"
        id="hamburger-dropdown"
      >
        <FaBars size={20} />
      </Dropdown.Toggle>

      <Dropdown.Menu className="hamburger-menu">
        <Dropdown.Item
          className="hamburger-item"
          onClick={() => setShowGraph((prev) => !prev)}
        >
          {showGraph ? "Hide Graph" : "Show Graph"}
        </Dropdown.Item>
        <Dropdown.Item
          className="hamburger-item"
          onClick={() =>
            prepopulateDemoData({
              username,
              getAccessTokenSilently,
              apiFetch,
            })
          }
        >
          Demo-Data
        </Dropdown.Item>
        <Dropdown.Item
          className="hamburger-item"
          onClick={() => navigate("/browse")}
        >
          Browse Boards
        </Dropdown.Item>

        <div className="px-3 py-2">
          <Button
            className="get-started-btn w-100"
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
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default HamburgerMenu;
