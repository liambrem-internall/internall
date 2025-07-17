import "./SearchResults.css";
import ItemResults from "./result-types/ItemResults";
import WebResults from "./result-types/WebResults";

const SearchResults = ({ results = [], onItemClick, onDdgClick }) => {
  if (!results.length) return null;

  return (
    <div className="search-results">
      <ul>
        {results.map((result, idx) => {
          if (result.type === "item") {
            return (
              <ItemResults
                key={result.data._id}
                items={[result.data]}
                onItemClick={onItemClick}
              />
            );
          }
          if (result.type === "web") {
            return (
              <WebResults
                key={result.data.FirstURL || idx}
                webResults={{ RelatedTopics: [result.data] }}
                onDdgClick={onDdgClick}
              />
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
};

export default SearchResults;
