import { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import "./BoardSearchBar.css";

const BoardSearchBar = ({ onSearch, loading }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    clearTimeout(handleChange.timeout);
    handleChange.timeout = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  return (
    <Form onSubmit={handleSubmit} className="board-search-form">
      <InputGroup className="board-search-group">
        <Form.Control
          type="text"
          placeholder="Search users by name or username..."
          value={localSearchTerm}
          onChange={handleChange}
          className="board-search-input"
          disabled={loading}
        />
        <InputGroup.Text className="search-icon">
          <FaSearch />
        </InputGroup.Text>
      </InputGroup>
    </Form>
  );
};

export default BoardSearchBar;
