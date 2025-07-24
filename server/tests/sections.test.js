const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const connectDB = require("../utils/db");
const Section = require("../models/Section");
const User = require("../models/User");

// mock checkJwt middleware
jest.mock("../middleware/checkJwt", () => (req, res, next) => {
  req.auth = { sub: "test-auth0-id" };
  next();
});

jest.mock("../utils/embedder", () => ({
  getEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

require("dotenv").config();

const USERNAME = "testuser";
const SECTIONS_ENDPOINT = "/api/sections";

describe("Sections API tests", () => {
  let server;
  let testUserId;
  let testSectionId;

  beforeAll(async () => {
    await connectDB();
    server = app.listen(0);

    const testUser = new User({
      username: USERNAME,
      email: "test@example.com",
      auth0Id: "test-auth0-id",
    });
    await testUser.save();
    testUserId = testUser._id;
  });

  afterAll(async () => {
    // clean up test data
    await Section.deleteMany({ userId: "test-auth0-id" });
    await User.deleteMany({ username: USERNAME });
    await mongoose.connection.close();
    if (server) server.close();
  });

  beforeEach(async () => {
    // clean up sections before each test
    await Section.deleteMany({ userId: "test-auth0-id" });
  });

  it("should create a new section", async () => {
    const sectionData = {
      title: "Test Section",
      description: "Test description",
    };

    const response = await request(app)
      .post(`${SECTIONS_ENDPOINT}/${USERNAME}`)
      .send(sectionData)
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(sectionData.title);
    testSectionId = response.body._id;
  });

  it("should get sections by username", async () => {
    const section1 = new Section({
      title: "Section 1",
      username: USERNAME,
      userId: "test-auth0-id",
      order: 0,
    });
    const section2 = new Section({
      title: "Section 2",
      username: USERNAME,
      userId: "test-auth0-id",
      order: 1,
    });
    await section1.save();
    await section2.save();

    const response = await request(app)
      .get(`${SECTIONS_ENDPOINT}/user/${USERNAME}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it("should update section order", async () => {
    const section1 = new Section({
      title: "Section 1",
      username: USERNAME,
      userId: "test-auth0-id",
      order: 0,
    });
    const section2 = new Section({
      title: "Section 2",
      username: USERNAME,
      userId: "test-auth0-id",
      order: 1,
    });
    await section1.save();
    await section2.save();

    const newOrder = [section2._id.toString(), section1._id.toString()];

    const response = await request(app)
      .put(`${SECTIONS_ENDPOINT}/user/${USERNAME}/order`)
      .send({ order: newOrder })
      .expect(200);

    expect(response.status).toBe(200);
  });

  it("should update a section", async () => {
    const section = new Section({
      title: "Original Title",
      username: USERNAME,
      userId: "test-auth0-id",
      order: 0,
    });
    await section.save();

    const updateData = {
      title: "Updated Title",
      description: "Updated description",
    };

    const response = await request(app)
      .put(`${SECTIONS_ENDPOINT}/${section._id}`)
      .send(updateData)
      .expect(200);

    expect(response.body.title).toBe(updateData.title);
  });

  it("should delete a section", async () => {
    const section = new Section({
      title: "To Delete",
      username: USERNAME,
      userId: "test-auth0-id",
      order: 0,
    });
    await section.save();

    await request(app)
      .delete(`${SECTIONS_ENDPOINT}/${section._id}/${USERNAME}`)
      .send({ timestamp: new Date().toISOString(), username: USERNAME })
      .expect(204);

    const deletedSection = await Section.findById(section._id);
    expect(deletedSection).toBeNull();
  });

  it("should return 404 for non-existent section", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    await request(app)
      .put(`${SECTIONS_ENDPOINT}/${fakeId}`)
      .send({ title: "Test" })
      .expect(404);
  });

  it("should handle empty sections list", async () => {
    const response = await request(app)
      .get(`${SECTIONS_ENDPOINT}/user/nonexistentuser`)
      .expect(404);

    expect(response.body).toHaveProperty("error");
  });
});
