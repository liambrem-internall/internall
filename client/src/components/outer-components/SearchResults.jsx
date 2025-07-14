import "./SearchResults.css";

const SearchResults = ({ webResults }) => {
  const topics = webResults.RelatedTopics;

  return (
    <div className="search-results">
      {topics.length > 0 && (
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
      )}
    </div>
  );
};

export default SearchResults;
