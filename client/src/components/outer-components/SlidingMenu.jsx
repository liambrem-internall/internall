import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import "./SlidingMenu.css";
import Searchbar from "./Searchbar";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { combinedSearch } from "../../utils/functions/combinedSearch";
import { apiFetch } from "../../utils/apiFetch";
import { Trie } from "../../utils/trieLogic";
import SearchResults from "./SearchResults";

const URL = import.meta.env.VITE_API_URL;

const SlidingMenu = ({ open, onClose, setShowItemModal, setEditingItem, sections }) => {
  const [results, setResults] = useState(null);
  const { username: roomId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [suggestions, setSuggestions] = useState([]);
  const trieRef = useRef(null);

  useEffect(() => {
    if (!sections) return;
    const trie = new Trie();
    Object.values(sections).forEach((section) => {
      section.items.forEach((item) => {
        trie.insert(item.content, item);
      });
    });
    trieRef.current = trie;
  }, [sections]);

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

  const handleAutocomplete = (query) => {
    if (!query || !trieRef.current) {
      setSuggestions([]);
      return;
    }
    const matches = trieRef.current.search(query);
    // Remove duplicates and limit suggestions
    const unique = Array.from(new Set(matches.map((i) => i.content))).slice(
      0,
      8
    );
    setSuggestions(unique);
  };

  return (
    <div className={`sliding-menu${open ? " open" : ""}`}>
      <div className="menu-header">
        <h2>Search</h2>
        <button className="close-btn" onClick={onClose}>
          <IoMdClose size={30} />
        </button>
      </div>
      <Searchbar
        onSearch={handleSearch}
        onAutocomplete={handleAutocomplete}
        suggestions={suggestions}
      />
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
