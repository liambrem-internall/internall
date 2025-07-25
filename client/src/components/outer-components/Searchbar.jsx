import { useState, useEffect, useRef } from "react";
import "./Searchbar.css";
import { DEBOUNCE_DELAY } from "../../utils/constants";

const Searchbar = ({ onSearch, onAutocomplete, suggestions = [] }) => {
  const [query, setQuery] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) onSearch(query);
      if (onAutocomplete) onAutocomplete(query);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [query, onAutocomplete, onSearch]);

  useEffect(() => {
    if (
      suggestions.length > 0 &&
      query &&
      suggestions[0].toLowerCase().startsWith(query.toLowerCase()) &&
      suggestions[0].toLowerCase() !== query.toLowerCase()
    ) {
      setSuggestion(suggestions[0]);
    } else {
      setSuggestion("");
    }
  }, [suggestions, query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (
      (e.key === "Tab" || e.key === "ArrowRight") &&
      suggestion &&
      suggestion.toLowerCase().startsWith(query.toLowerCase())
    ) {
      e.preventDefault();
      setQuery(suggestion);
      setSuggestion("");
      if (onSearch) onSearch(suggestion);
    }
  };

  return (
    <div className="searchbar-container" style={{ position: "relative" }}>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="searchbar-input"
          autoComplete="off"
          spellCheck={false}
        />
        {suggestion && (
          <div className="searchbar-suggestion">
            <span style={{ opacity: 0 }}>{query}</span>
            {suggestion.slice(query.length)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
