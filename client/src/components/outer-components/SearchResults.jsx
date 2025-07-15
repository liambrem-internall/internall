import "./SearchResults.css";
import ItemResults from "./result-types/ItemResults";
import SectionResults from "./result-types/SectionResults";
import WebResults from "./result-types/WebResults";

const SearchResults = ({
  items = [],
  sections = [],
  webResults = {},
  onItemClick,
}) => {
  return (
    <div className="search-results">
      <ItemResults items={items} onItemClick={onItemClick} />
      <SectionResults sections={sections} />
      <WebResults webResults={webResults} />
    </div>
  );
};

export default SearchResults;
