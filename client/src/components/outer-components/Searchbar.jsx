import { useState } from "react";
import "./Searchbar.css";

const Searchbar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
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