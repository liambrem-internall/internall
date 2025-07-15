const WebResults = ({ webResults }) => {
  const topics = webResults.RelatedTopics || [];

  if (topics.length === 0) return null;

  return (
    <div>
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
  );
};

export default WebResults;
