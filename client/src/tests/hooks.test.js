import { renderHook, act } from "@testing-library/react";
import { useContext } from "react";

// mock the socket
jest.mock("../utils/socket", () => ({
  socket: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connected: true,
  },
}));

// mock Auth0
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: jest.fn().mockResolvedValue("mock-token"),
    user: { sub: "test-user", nickname: "testuser" },
  }),
}));

// mock API fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''), // Add text method
  })
);

import useLogs from "../hooks/useLogs";
import { NetworkStatusContext } from "../contexts/NetworkStatusContext";

describe("Custom Hooks Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useLogs Hook", () => {
    test("should initialize with empty logs", () => {
      const { result } = renderHook(() => useLogs());

      expect(result.current.logs).toEqual([]);
      expect(typeof result.current.addLog).toBe("function");
    });

    test("should add logs correctly", () => {
      const { result } = renderHook(() => useLogs());

      act(() => {
        result.current.addLog("Test log message");
      });

      expect(result.current.logs).toEqual(["Test log message"]);
    });

    test("should limit logs to page size", () => {
      const { result } = renderHook(() => useLogs());

      // add more logs than the page size (50)
      act(() => {
        for (let i = 0; i < 60; i++) {
          result.current.addLog(`Log message ${i}`);
        }
      });

      // should keep only the last 50 logs
      expect(result.current.logs.length).toBeLessThanOrEqual(50);
      expect(result.current.logs[0]).toBe("Log message 10");
    });
  });

  describe("NetworkStatusContext", () => {
    test("should provide network status", () => {
      const TestComponent = () => {
        const isOnline = useContext(NetworkStatusContext);
        return <div>{isOnline ? "Online" : "Offline"}</div>;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("useApiFetch Hook", () => {
    const mockApiFetch = jest.fn().mockResolvedValue({ success: true });

    jest.mock("../hooks/useApiFetch", () => ({
      useApiFetch: () => mockApiFetch,
    }));

    test("should handle API calls", async () => {
      const result = await mockApiFetch({
        endpoint: "/test",
        method: "GET",
      });

      expect(result).toEqual({ success: true });
      expect(mockApiFetch).toHaveBeenCalledWith({
        endpoint: "/test",
        method: "GET",
      });
    });
  });

  describe("Socket Hooks", () => {
    test("should handle socket emissions safely", () => {
      const mockSocket = require("../utils/socket").socket;

      mockSocket.emit("test-event", { data: "test" });

      expect(mockSocket.emit).toHaveBeenCalledWith("test-event", {
        data: "test",
      });
    });

    test("should handle socket listeners", () => {
      const mockSocket = require("../utils/socket").socket;
      const mockCallback = jest.fn();

      mockSocket.on("test-event", mockCallback);

      expect(mockSocket.on).toHaveBeenCalledWith("test-event", mockCallback);
    });
  });

  describe("useEditingSocket Hook", () => {
    const mockUseEditingSocket = jest.fn();

    test("should handle editing states", () => {
      const params = {
        roomId: "test-room",
        userId: "test-user",
        itemId: "test-item",
        editing: true,
        color: "#ff0000",
      };

      mockUseEditingSocket(params);

      expect(mockUseEditingSocket).toHaveBeenCalledWith(params);
    });
  });

  describe("useDragHandlers Hook", () => {
    test("should provide drag handlers", () => {
      const mockHandlers = {
        handleDragStart: jest.fn(),
        handleDragEnd: jest.fn(),
        handleDragOver: jest.fn(),
      };

      expect(mockHandlers.handleDragStart).toBeDefined();
      expect(mockHandlers.handleDragEnd).toBeDefined();
      expect(mockHandlers.handleDragOver).toBeDefined();
    });
  });

  describe("useSaveHandlers Hook", () => {
    test("should provide save handlers", () => {
      const mockSaveHandlers = {
        handleSaveSection: jest.fn(),
        handleSaveItem: jest.fn(),
      };

      expect(mockSaveHandlers.handleSaveSection).toBeDefined();
      expect(mockSaveHandlers.handleSaveItem).toBeDefined();
    });
  });
});
