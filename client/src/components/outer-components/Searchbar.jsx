import { useState, useEffect } from "react";
import "./Searchbar.css";
import { DEBOUNCE_DELAY } from "../../utils/constants"; 

const Searchbar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="searchbar-container">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
        className="searchbar-input"
      />
    </div>
  );
};

export default Searchbar;