const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const connectDB = require("../utils/db");
const Section = require("../models/Section");
const Item = require("../models/Item");
const User = require("../models/User");

// Mock checkJwt middleware to bypass authentication in tests
jest.mock("../middleware/checkJwt", () => (req, res, next) => {
  req.auth = { sub: "test-auth0-id-items" };
  next();
});

// Mock embedder to avoid external service calls during tests
jest.mock("../utils/embedder", () => ({
  getEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

require("dotenv").config();

const USERNAME = "testuser-items";
const ITEMS_ENDPOINT = "/api/items";

describe("Items API tests", () => {
  let server;
  let testUserId;
  let testSectionId;
  let testItemId;

  beforeAll(async () => {
    await connectDB();
    server = app.listen(0);

    const testUser = new User({
      username: USERNAME,
      email: "test-items@example.com",
      auth0Id: "test-auth0-id-items",
    });
    await testUser.save();
    testUserId = testUser._id;

    const testSection = new Section({
      title: "Test Section",
      username: USERNAME,
      userId: "test-auth0-id-items",
      order: 0,
    });
    await testSection.save();
    testSectionId = testSection._id;
  });

  afterAll(async () => {
    // clean up test data and close connections
    await Item.deleteMany({ sectionId: testSectionId });
    await Section.deleteMany({ userId: "test-auth0-id-items" });
    await User.deleteMany({ username: USERNAME });
    await mongoose.connection.close();
    if (server) server.close();
  });

  beforeEach(async () => {
    // clean up items before each test
    await Item.deleteMany({ sectionId: testSectionId });
    // reset the section's items array
    await Section.findByIdAndUpdate(testSectionId, { items: [] });
  });

  // test creating a new item via POST request
  it("should create a new item", async () => {
    const itemData = {
      content: "Test item content",
      notes: "Test notes",
      link: "https://example.com",
    };

    const response = await request(app)
      .post(`${ITEMS_ENDPOINT}/${testSectionId}/items/${USERNAME}`)
      .send(itemData)
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.content).toBe(itemData.content);
    expect(response.body.sectionId).toBe(testSectionId.toString());
    testItemId = response.body._id;
  });

  // test retrieving all items within a specific section
  it("should get items by section", async () => {
    const item1 = new Item({
      content: "Item 1",
      sectionId: testSectionId,
    });
    const item2 = new Item({
      content: "Item 2",
      sectionId: testSectionId,
    });
    await item1.save();
    await item2.save();

    // add items to the section's items array
    await Section.findByIdAndUpdate(testSectionId, {
      items: [item1._id, item2._id],
    });

    const response = await request(app)
      .get(`${ITEMS_ENDPOINT}/${testSectionId}/items`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  // test updating item content and properties
  it("should update an item", async () => {
    const item = new Item({
      content: "Original content",
      sectionId: testSectionId,
    });
    await item.save();

    const updateData = {
      content: "Updated content",
      notes: "Updated notes",
      timestamp: new Date().toISOString(),
      username: USERNAME,
    };

    const response = await request(app)
      .put(`${ITEMS_ENDPOINT}/${testSectionId}/items/${item._id}/${USERNAME}`)
      .send(updateData)
      .expect(200);

    expect(response.body.content).toBe(updateData.content);
  });

  // test reordering items within a section
  it("should update item order", async () => {
    const item1 = new Item({
      content: "Item 1",
      sectionId: testSectionId,
    });
    const item2 = new Item({
      content: "Item 2",
      sectionId: testSectionId,
    });
    await item1.save();
    await item2.save();

    // add items to section in original order
    await Section.findByIdAndUpdate(testSectionId, {
      items: [item1._id, item2._id],
    });

    // reverse the order
    const newOrder = [item2._id.toString(), item1._id.toString()];

    const response = await request(app)
      .put(`${ITEMS_ENDPOINT}/${testSectionId}/items/${USERNAME}/order`)
      .send({ order: newOrder, username: USERNAME })
      .expect(200);

    expect(response.status).toBe(200);
  });

  // test moving an item from one section to another
  it("should move item between sections", async () => {
    const targetSection = new Section({
      title: "Target Section",
      username: USERNAME,
      userId: "test-auth0-id-items",
      order: 1,
    });
    await targetSection.save();

    const item = new Item({
      content: "Item to move",
      sectionId: testSectionId,
    });
    await item.save();

    // add item to original section
    await Section.findByIdAndUpdate(testSectionId, {
      items: [item._id],
    });

    const response = await request(app)
      .put(
        `${ITEMS_ENDPOINT}/${testSectionId}/items/${item._id}/${USERNAME}/move`
      )
      .send({
        toSectionId: targetSection._id.toString(),
        toIndex: 0,
        timestamp: new Date().toISOString(),
        username: USERNAME,
      })
      .expect(200);

    expect(response.body.success).toBe(true);

    await Section.findByIdAndDelete(targetSection._id);
  });

  // test deleting an item
  it("should delete an item", async () => {
    const item = new Item({
      content: "Item to delete",
      sectionId: testSectionId,
    });
    await item.save();

    await Section.findByIdAndUpdate(testSectionId, {
      items: [item._id],
    });

    await request(app)
      .delete(
        `${ITEMS_ENDPOINT}/${testSectionId}/items/${item._id}/${USERNAME}`
      )
      .send({
        timestamp: new Date().toISOString(),
        username: USERNAME,
      })
      .expect(204);

    // verify item was deleted
    const deletedItem = await Item.findById(item._id);
    expect(deletedItem).toBeNull();
  });

  // test finding a specific item by its ID
  it("should find an item by ID", async () => {
    const item = new Item({
      content: "Findable item",
      sectionId: testSectionId,
    });
    await item.save();

    const response = await request(app)
      .get(`${ITEMS_ENDPOINT}/find/${item._id}`)
      .expect(200);

    expect(response.body.content).toBe("Findable item");
    expect(response.body).toHaveProperty("currentSectionId");
  });

  // test error handling for non-existent items
  it("should return 404 for non-existent item", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    await request(app)
      .put(`${ITEMS_ENDPOINT}/${testSectionId}/items/${fakeId}/${USERNAME}`)
      .send({
        content: "Test",
        timestamp: new Date().toISOString(),
        username: USERNAME,
      })
      .expect(404);
  });

  // test error handling for non-existent sections
  it("should return 404 for non-existent section", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    await request(app).get(`${ITEMS_ENDPOINT}/${fakeId}/items`).expect(404);
  });
});
