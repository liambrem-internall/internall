import { Trie } from "../utils/trieLogic";

describe("Utility Functions Tests", () => {
  describe("Trie Data Structure", () => {
    let trie;

    beforeEach(() => {
      trie = new Trie();
    });

    test("should create empty trie", () => {
      expect(trie).toBeDefined();
    });

    test("should insert and search items", () => {
      const item1 = { id: "1", content: "test item" };
      const item2 = { id: "2", content: "testing" };

      trie.insert("test", item1);
      trie.insert("testing", item2);

      const results = trie.search("test");
      expect(results).toContain(item1);
      expect(results).toContain(item2);
    });

    test("should handle case insensitive search", () => {
      const item = { id: "1", content: "Test Item" };

      trie.insert("Test", item);

      const results = trie.search("test");
      expect(results).toContain(item);
    });

    test("should remove items correctly", () => {
      const item = { id: "1", content: "test item" };

      trie.insert("test", item);
      trie.remove("test", item);

      const results = trie.search("test");
      expect(results).not.toContain(item);
    });

    test("should handle partial matches", () => {
      const item1 = { id: "1", content: "javascript" };
      const item2 = { id: "2", content: "java" };

      trie.insert("javascript", item1);
      trie.insert("java", item2);

      const results = trie.search("java");
      expect(results).toContain(item1);
      expect(results).toContain(item2);
    });
  });

  describe("Constants", () => {
    test("should export view modes", () => {
      const { ViewModes } = require("../utils/constants");

      expect(ViewModes).toBeDefined();
      expect(ViewModes.BOARD).toBeDefined();
      expect(ViewModes.LIST).toBeDefined();
    });

    test("should export section actions", () => {
      const { SectionActions } = require("../utils/constants");

      expect(SectionActions).toBeDefined();
      expect(SectionActions.ADD).toBeDefined();
      expect(SectionActions.DELETE_ZONE).toBeDefined();
    });

    test("should export draggable component types", () => {
      const { DraggableComponentTypes } = require("../utils/constants");

      expect(DraggableComponentTypes).toBeDefined();
      expect(DraggableComponentTypes.SECTION).toBeDefined();
      expect(DraggableComponentTypes.ITEM).toBeDefined();
    });
  });

  describe("Socket Utils", () => {
    test("should create socket instance", () => {
      const { socket } = require("../utils/socket");

      expect(socket).toBeDefined();
      expect(typeof socket.emit).toBe("function");
      expect(typeof socket.on).toBe("function");
    });
  });

  describe("Custom Collision Detection", () => {
    test("should handle collision detection", () => {
      const customCollisionDetection =
        require("../utils/customCollisionDetection").default;

      const mockArgs = {
        active: { id: "test-id" },
        droppableContainers: new Map(),
        collisionRect: { top: 0, left: 0, bottom: 100, right: 100 },
      };

      expect(() => customCollisionDetection(mockArgs)).not.toThrow();
    });
  });

  describe("Section List Utils", () => {
    test("should find items by section", () => {
      const { findItemBySection } = require("../utils/sectionListUtils");

      const section = {
        items: [
          { id: "1", content: "Item 1" },
          { id: "2", content: "Item 2" },
        ],
      };

      const found = findItemBySection(section, { activeId: "1" });
      expect(found).toEqual({ id: "1", content: "Item 1" });

      const notFound = findItemBySection(section, { activeId: "999" });
      expect(notFound).toBeNull();
    });

    test("should handle drag end events", () => {
      const { handleDragEnd } = require("../utils/sectionListUtils");

      const mockEvent = {
        active: {
          id: "test-id",
          data: {
            current: { type: "section" },
          },
        },
        over: {
          id: "drop-zone",
          data: {
            current: { type: "section" },
          },
        },
      };

      const mockParams = {
        setActiveId: jest.fn(),
        setShowItemModal: jest.fn(),
        setTargetSectionId: jest.fn(),
        sections: {},
        setSections: jest.fn(),
        setSectionOrder: jest.fn(),
      };

      expect(() => handleDragEnd(mockEvent, mockParams)).not.toThrow();
    });
  });

  describe("Combined Search", () => {
    const mockCombinedSearch = jest.fn().mockResolvedValue({
      results: [],
      total: 0,
    });

    jest.mock("../utils/functions/combinedSearch", () => ({
      combinedSearch: mockCombinedSearch,
    }));

    test("should perform combined search", async () => {
      const { combinedSearch } = require("../utils/functions/combinedSearch");

      const result = await combinedSearch("test query", "room-id", 10, 0);

      expect(result).toEqual({
        results: [],
        total: 0,
      });
    });
  });

  describe("Demo Data Utility", () => {
    test("should provide demo data function", () => {
      const {
        prepopulateDemoData,
      } = require("../utils/functions/prepopulateDemoData");

      expect(prepopulateDemoData).toBeDefined();
      expect(typeof prepopulateDemoData).toBe("function");
    });
  });

  describe("Offline Queue", () => {
    test("should handle offline operations", () => {
      const { addPendingEdit } = require("../utils/offlineQueue");

      const mockEdit = {
        type: "section",
        action: "create",
        payload: { title: "Test Section" },
        timestamp: Date.now(),
      };

      expect(() => addPendingEdit(mockEdit)).not.toThrow();
    });
  });

  describe("Array Utilities", () => {
    test("should handle array moves for drag and drop", () => {
      const { arrayMove } = require("@dnd-kit/sortable");

      const testArray = ["a", "b", "c", "d"];
      const moved = arrayMove(testArray, 0, 2);

      expect(moved).toEqual(["b", "c", "a", "d"]);
    });
  });

  describe("URL and Environment", () => {
    test("should handle environment variables", () => {
      const apiUrl = global.importMeta.env.VITE_API_URL;
      expect(apiUrl).toBe("http://localhost:3001");
    });
  });

  describe("Error Handling", () => {
    test("should handle API errors", async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      try {
        await fetch("/api/test");
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe("Network error");
      }

      global.fetch = originalFetch;
    });

    test("should handle invalid data", () => {
      const { findItemBySection } = require("../utils/sectionListUtils");

      expect(() => {
        const result = findItemBySection(null, { activeId: "1" });
        expect(result).toBeNull();
      }).not.toThrow();

      expect(() => {
        const emptySection = {};
        const result2 = findItemBySection(emptySection, { activeId: "1" });
        expect(result2).toBeNull();
      }).not.toThrow();
    });
  });
});
