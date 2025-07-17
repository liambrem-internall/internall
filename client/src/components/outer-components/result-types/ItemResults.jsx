const ItemResults = ({ items, onItemClick }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li
            key={item._id}
            className="search-result-item"
            onClick={() => onItemClick(item)}
          >
            <div className="top-row">
              <strong>{item.content}</strong>
              <span className="score">
                {" "}
                Score: {item.score ? item.score.toFixed(2) : "N/A"}
              </span>
              {item.matchType && (
                <span className="match-type">
                  {" "}
                  Fuzzy match in: {item.matchType}
                  {typeof item.fuzzyScore === "number" && (
                    <> (fuzzy: {item.fuzzyScore.toFixed(2)})</>
                  )}
                </span>
              )}
              {typeof item.semanticScore === "number" && (
                <span className="semantic-score">
                  {" "}
                  Semantic: {item.semanticScore.toFixed(2)}
                </span>
              )}
            </div>
            {item.notes && <div className="item-notes">{item.notes}</div>}
            {item.link && (
              <div className="item-link">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.link}
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemResults;
