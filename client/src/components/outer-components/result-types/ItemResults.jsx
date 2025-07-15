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
              {item.matchType && (
                <span className="match-type">
                  (matched in {item.matchType})
                </span>
              )}
              {item.similarity && (
                <span className="match-type">
                  (semantic score: {item.similarity.toFixed(2)})
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
