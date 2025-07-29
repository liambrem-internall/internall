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
