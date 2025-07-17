import React, { useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import "./SlidingMenu.css";
import Searchbar from "./Searchbar";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { combinedSearch } from "../../utils/functions/combinedSearch";
import { apiFetch } from "../../utils/apiFetch";
import SearchResults from "./SearchResults";

const URL = import.meta.env.VITE_API_URL;

const SlidingMenu = ({ open, onClose, setShowItemModal, setEditingItem }) => {
  const [results, setResults] = useState(null);
  const { username: roomId } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  const handleSearch = useCallback(
    async (query) => {
      if (!query) {
        setResults(null);
        return;
      }
      const data = await combinedSearch(query, roomId);
      setResults(data);
    },
    [roomId]
  );

  const handleItemClick = async (item) => {
    await apiFetch({
      endpoint: `${URL}/api/search/${item._id}/accessed`,
      method: "POST",
      body: { matchedIn: item.matchType },
      getAccessTokenSilently,
    });
    setShowItemModal(true);
    setEditingItem(item);
    onClose();
  };

  const handleDdgClick = async (topic) => {
    await apiFetch({
      endpoint: `${URL}/api/search/web-accessed`,
      method: "POST",
      body: {
        url: topic.FirstURL,
        text: topic.Text,
        timestamp: new Date().toISOString(),
      },
      getAccessTokenSilently,
    });
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
            results={results?.results || []}
            onItemClick={(item) => handleItemClick(item)}
            onDdgClick={(topic) => handleDdgClick(topic)}
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
