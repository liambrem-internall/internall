import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import "./SlidingMenu.css";
import Searchbar from "./Searchbar";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { combinedSearch } from "../../utils/functions/combinedSearch";
import { apiFetch } from "../../utils/apiFetch";
import { Trie } from "../../utils/trieLogic";
import SearchResults from "./SearchResults";

const URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 8;
const OBSERVER_THRESHOLD = 0.1;

const SlidingMenu = ({
  open,
  onClose,
  setShowItemModal,
  setEditingItem,
  sections,
}) => {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const { username: roomId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [suggestions, setSuggestions] = useState([]);
  const trieRef = useRef(null);
  const prevItemsRef = useRef([]);
  const sentinelRef = useRef(null);
  const resultsContainerRef = useRef(null);

  useEffect(() => {
    if (!sections) return;
    const trie = trieRef.current || new Trie();

    const allItems = Object.values(sections).flatMap(
      (section) =>
        section.items.map(({ _id, ...rest }) => ({
          ...rest,
          id: _id,
        }))
    );

    const prevItems = prevItemsRef.current;
    const prevIds = new Set(prevItems.map((i) => i.id));
    const currIds = new Set(allItems.map((i) => i.id));

    allItems.forEach((item) => {
      if (!prevIds.has(item.id)) {
        trie.insert(item.content, item);
      }
    });

    prevItems.forEach((item) => {
      if (!currIds.has(item.id)) {
        trie.remove(item.content, item);
      }
    });

    allItems.forEach((item) => {
      const prev = prevItems.find((i) => i.id === item.id);
      if (prev && prev.content !== item.content) {
        trie.remove(prev.content, prev);
        trie.insert(item.content, item);
      }
    });

    trieRef.current = trie;
    prevItemsRef.current = allItems;
  }, [sections]);

  const handleSearch = useCallback(
    async (q) => {
      setQuery(q);
      setPage(0);
      if (!q) {
        setResults([]);
        setTotal(0);
        if (resultsContainerRef.current) {
          resultsContainerRef.current.scrollTop = 0;
        }
        return;
      }
      const data = await combinedSearch(q, roomId, PAGE_SIZE, 0);
      const normalizedResults = (data.results || []).map((result) => {
        if (result.type === "item" && result.data?._id) {
          return {
            ...result,
            data: { ...result.data, id: result.data._id },
          };
        }
        return result;
      });
      setResults(normalizedResults);
      setTotal(data.total || 0);
      // Scroll to top after new search
      if (resultsContainerRef.current) {
        resultsContainerRef.current.scrollTop = 0;
      }
    },
    [roomId]
  );

  const handleLoadMore = useCallback(async () => {
    if (results.length >= total) return;
    const nextPage = page + 1;
    const offset = nextPage * PAGE_SIZE;
    const data = await combinedSearch(query, roomId, PAGE_SIZE, offset);
    setResults((prev) => [...prev, ...(data.results || [])]);
    setPage(nextPage);
  }, [results.length, total, page, query, roomId]);

  const handleItemClick = async (item) => {
    await apiFetch({
      endpoint: `${URL}/api/search/${item.id}/accessed`,
      method: "POST",
      body: {
        fuzzyScore: item.fuzzyScore,
        semanticScore: item.semanticScore,
        frequencyScore: item.freqScore,
        recencyScore: item.recencyScore,
      },
      getAccessTokenSilently,
    });
    setShowItemModal(true);
    setEditingItem(item);
    onClose();
  };

  const handleDdgClick = async (topic) => {
    await apiFetch({
      endpoint: `${URL}/api/search/web-accessed`,
      method: "POST",
      body: {
        url: topic.FirstURL,
        text: topic.Text,
        timestamp: new Date().toISOString(),
      },
      getAccessTokenSilently,
    });
  };

  const handleAutocomplete = (query) => {
    if (!query || !trieRef.current) {
      setSuggestions([]);
      return;
    }
    const matches = trieRef.current.search(query);
    const unique = Array.from(new Set(matches.map((i) => i.content))).slice(
      0,
      PAGE_SIZE
    );
    setSuggestions(unique);
  };

  // infinite scrolling
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (results.length >= total) return; // no more results to load

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { root: null, rootMargin: "0px", threshold: OBSERVER_THRESHOLD }
    );
    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [results, total, handleLoadMore]);

  return (
    <div className={`sliding-menu${open ? " open" : ""}`}>
      <div className="menu-header">
        <h2>Search</h2>
        <button className="close-btn" onClick={onClose}>
          <IoMdClose size={30} />
        </button>
      </div>
      <Searchbar
        onSearch={handleSearch}
        onAutocomplete={handleAutocomplete}
        suggestions={suggestions}
      />
      <div className="search-results" ref={resultsContainerRef}>
        {results.length ? (
          <>
            <SearchResults
              results={results}
              onItemClick={handleItemClick}
              onDdgClick={handleDdgClick}
            />
            <div ref={sentinelRef} style={{ height: 32 }} />{" "}
            {results.length >= total && total > 0 && (
              <div className="no-more-content">No more content to show</div>
            )}
          </>
        ) : (
          <div className="search-placeholder">
            <FaSearch size={100} />
            <p>Start typing to see results...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlidingMenu;
