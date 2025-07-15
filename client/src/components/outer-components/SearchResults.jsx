import "./SearchResults.css";
import ItemResults from "./result-types/ItemResults";
import SectionResults from "./result-types/SectionResults";
import WebResults from "./result-types/WebResults";

const SearchResults = ({
  items = [],
  sections = [],
  webResults = {},
  semantic = {},
  onItemClick,
}) => {
  return (
    <div className="search-results">
      <h3>Fuzzy Items</h3>
      <ItemResults items={items} onItemClick={onItemClick} />
      <h3>Fuzzy Sections</h3>
      <SectionResults sections={sections} />
      <h3>Semantic Items</h3>
      <ItemResults items={semantic.items || []} onItemClick={onItemClick} />
      <h3>Semantic Sections</h3>
      <SectionResults sections={semantic.sections || []} />
      <h3>Web Results</h3>
      <WebResults webResults={webResults} />
    </div>
  );
};

export default SearchResults;
