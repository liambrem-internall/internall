import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./SlidingMenu.css";
import Searchbar from "./Searchbar";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { combinedSearch } from "../../utils/functions/combinedSearch";
import SearchResults from "./SearchResults";

const SlidingMenu = ({ open, onClose, setShowItemModal, setEditingItem }) => {
  const [results, setResults] = useState(null);
  const { username: roomId } = useParams();

  const handleSearch = async (query) => {
    if (!query) {
      setResults(null);
      return;
    }
    const data = await combinedSearch(query, roomId);
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
          <SearchResults
            items={results.items}
            sections={results.sections}
            webResults={results.duckduckgo}
            onItemClick={(item) => {
              // edit an item
              setShowItemModal(true);
              setEditingItem(item);
              onClose()
            }}
          />
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
