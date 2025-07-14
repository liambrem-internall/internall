import "./SearchResults.css";

const SearchResults = ({
  items = [],
  sections = [],
  webResults = {},
  onItemClick,
}) => {
  const topics = webResults.RelatedTopics || [];

  return (
    <div className="search-results">
      {items.length > 0 && (
        <div>
          <h3>Items</h3>
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
                </div>
                {item.notes && (
                  <div className="item-notes">{item.notes}</div>
                )}
                {item.link && (
                  <div className="item-link">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.link}
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {sections.length > 0 && (
        <div>
          <h3>Sections</h3>
          <ul>
            {sections.map((section) => (
              <li
                key={section._id}
                className="search-result-item"
              >
                <strong>{section.title}</strong>
                {section.description && <div>{section.description}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {topics.length > 0 && (
        <div>
          <h3>Web Results</h3>
          <ul>
            {topics
              .filter((topic) => topic.Text || topic.FirstURL)
              .map((topic, idx) => (
                <li key={idx} className="search-result-item">
                  {topic.Text && <span>{topic.Text}</span>}
                  {topic.FirstURL && (
                    <a
                      href={topic.FirstURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="search-result-link"
                    >
                      Learn more
                    </a>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
