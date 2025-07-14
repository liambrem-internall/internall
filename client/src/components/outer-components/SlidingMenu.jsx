import React from "react";
import "./SlidingMenu.css";
import Searchbar from "./Searchbar";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";


const SlidingMenu = ({ open, onClose }) => {
  return (
    <div className={`sliding-menu${open ? " open" : ""}`}>
      <div className="menu-header">
        <h2>Search</h2>
        <button className="close-btn" onClick={onClose}>
          <IoMdClose size={30} />
        </button>
      </div>
      <Searchbar />
      {/* search results will go here */}
      <div className="search-placeholder">
        <FaSearch size={100} />
        <p>Start typing to see results...</p>
      </div>
    </div>
  );
};

export default SlidingMenu;
