require("dotenv").config();
const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const connectDB = require("../utils/db");

const USERNAME = "liambrem";
const ENDPOINT = "/api/search/search";
const SECTIONS = "sections";
const ITEMS = "items";

describe("Search API speed tests", () => {
  let server;
  
  beforeAll(async () => {
    // set up database connection and test server
    await connectDB();
    server = app.listen(0);
  });

  afterAll(async () => {
    // clean up connections after all tests complete
    await mongoose.connection.close();
    server.close();
  });

  const measureSearchTime = async (query, roomId) => {
    const start = Date.now();
    const res = await request(server).get(ENDPOINT).query({ q: query, roomId });
    const duration = Date.now() - start;
    return { res, duration };
  };

  // test basic search functionality and response time
  it("should respond to a search query within 1000ms", async () => {
    const roomId = USERNAME;
    const { res, duration } = await measureSearchTime("test", roomId);
    
    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(1000);
    expect(res.body).toHaveProperty("results");
    expect(res.body).toHaveProperty("total");
  });

  // test error handling for empty search queries
  it("should handle empty query quickly", async () => {
    const roomId = USERNAME;
    const start = Date.now();
    const res = await request(server).get(ENDPOINT).query({ q: "", roomId });
    const duration = Date.now() - start;
    
    expect(res.status).toBe(400);
    expect(duration).toBeLessThan(300);
  });

  // test error handling for missing roomId parameter
  it("should handle missing roomId quickly", async () => {
    const start = Date.now();
    const res = await request(server).get(ENDPOINT).query({ q: "test" });
    const duration = Date.now() - start;
    
    expect(res.status).toBe(400);
    expect(duration).toBeLessThan(300);
  });

  // test performance consistency across multiple sequential searches
  it("should scale with multiple requests", async () => {
    const roomId = USERNAME;
    const queries = Array.from({ length: 5 }, (_, i) => `query${i}`); // Generate 5 different queries
    const times = [];
    
    for (const q of queries) {
      const { duration } = await measureSearchTime(q, roomId);
      times.push(duration);
    }
    
    times.forEach((t) => expect(t).toBeLessThan(1200));
  });

  // test performance under concurrent load 
  it("should handle multiple concurrent search queries rapidly", async () => {
    const roomId = USERNAME;
    const queries = ["test", "office", "running", "food", "resources"];
    
    const promises = queries.map((q) => measureSearchTime(q, roomId));
    const results = await Promise.all(promises);

    results.forEach(({ res, duration }) => {
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(1200);
      expect(res.body).toHaveProperty("results");
      expect(res.body).toHaveProperty("total");
    });
  });
});
