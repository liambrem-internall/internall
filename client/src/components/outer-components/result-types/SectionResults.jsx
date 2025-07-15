const SectionResults = ({ sections }) => {
  if (sections.length === 0) return null;

  return (
    <div>
      <ul>
        {sections.map((section) => (
          <li key={section._id} className="search-result-item">
            <strong>{section.title}</strong>
            {section.description && <div>{section.description}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SectionResults;
