import "./SearchResults.css";

const SearchResults = ({ webResults }) => {
  return (
    <div className="search-results">
      {webResults.AbstractText && <p>{webResults.AbstractText}</p>}
      {webResults.RelatedTopics && webResults.RelatedTopics.length > 0 && (
        <ul>
          {webResults.RelatedTopics
            .filter(topic => topic.Text || topic.FirstURL)
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
