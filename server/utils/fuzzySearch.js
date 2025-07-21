const { ITEM_CONTENT_TYPES, COMPONENT_TYPES } = require("../utils/constants");

const THRESHOLD = 0.3;

const WEIGHTS = {
  CONTENT: 0.4,
  NOTES: 0.4,
  LINK: 0.2,
};

const calculateLevenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      const indicator = str1[j - 1] === str2[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1, // delete
        matrix[i - 1][j] + 1, // insert
        matrix[i - 1][j - 1] + indicator // sub
      );
    }
  }

  return matrix[str2.length][str1.length];
};

const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  // substring boost
  if (str1.includes(str2) || str2.includes(str1)) return 1;
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  const distance = calculateLevenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
};

const fuzzySearchSections = (sections, query) => {
  const results = sections
    .map((section) => ({
      item: section,
      score: calculateSimilarity(section.title, query),
    }))
    .filter((result) => result.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return results.map((result) => result.item);
};

// custom fuzzy search for items with weighted scoring
const fuzzySearchItems = (items, query) => {
  const results = items
    .map((item) => {
      let totalScore = 0;
      let totalWeight = 0;

      let bestField = null;
      let bestScore = -1;

      // content
      let contentScore = 0;
      if (item.content) {
        contentScore = calculateSimilarity(item.content, query);
        totalScore += contentScore * WEIGHTS.CONTENT;
        totalWeight += WEIGHTS.CONTENT;
        if (contentScore > bestScore) {
          bestScore = contentScore;
          bestField = ITEM_CONTENT_TYPES.CONTENT;
        }
      }

      // notes
      let notesScore = 0;
      if (item.notes) {
        notesScore = calculateSimilarity(item.notes, query);
        totalScore += notesScore * WEIGHTS.NOTES;
        totalWeight += WEIGHTS.NOTES;
        if (notesScore > bestScore) {
          bestScore = notesScore;
          bestField = ITEM_CONTENT_TYPES.NOTES;
        }
      }

      // link
      let linkScore = 0;
      if (item.link) {
        linkScore = calculateSimilarity(item.link, query);
        totalScore += linkScore * WEIGHTS.LINK;
        totalWeight += WEIGHTS.LINK;
        if (linkScore > bestScore) {
          bestScore = linkScore;
          bestField = ITEM_CONTENT_TYPES.LINK;
        }
      }

      const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

      return {
        item,
        score: finalScore,
        matchedIn: bestField,
      };
    })
    .filter((result) => result.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return results.map((res) => {
    const item = res.item;
    return {
      ...item.toObject(),
      matchType: res.matchedIn, 
      matchTypeScore: res.score,
    };
  });
};

const fuzzySearch = (content, query, contentType) => {
  if (contentType === COMPONENT_TYPES.SECTION) {
    return fuzzySearchSections(content, query);
  } else if (contentType === COMPONENT_TYPES.ITEM) {
    return fuzzySearchItems(content, query);
  } else {
    throw new Error("Invalid content type for fuzzy search");
  }
};

module.exports = { fuzzySearch, calculateSimilarity, };