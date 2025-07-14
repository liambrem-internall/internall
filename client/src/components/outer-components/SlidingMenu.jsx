import React, { useState } from "react";
import "./SlidingMenu.css";
import Searchbar from "./Searchbar";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { duckDuckGoSearch } from "../../utils/functions/duckDuckGoSearch";
import SearchResults from "./SearchResults";

const SlidingMenu = ({ open, onClose }) => {
  const [results, setResults] = useState(null);

  const handleSearch = async (query) => {
    if (!query) {
      setResults(null);
      return;
    }
    const data = await duckDuckGoSearch(query);
    setResults(data);
  };

  return (
    <div className={`sliding-menu${open ? " open" : ""}`}>
      <div className="menu-header">
        <h2>Search</h2>
        <button className="close-btn" onClick={onClose}>
          <IoMdClose size={30} />
        </button>
      </div>
      <Searchbar onSearch={handleSearch} />
      <div className="search-results">
        {results ? (
          <SearchResults webResults={results} />
        ) : (
          <div className="search-placeholder">
            <FaSearch size={100} />
            <p>Start typing to see results...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlidingMenu;