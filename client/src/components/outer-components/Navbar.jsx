import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar-container">
      <div className="navbar">
        <h1>My Application</h1>
        <nav>
          <ul className="nav-links">
            <button>Board</button>
            <button>List</button>
            <button className="right-button">Add</button>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
