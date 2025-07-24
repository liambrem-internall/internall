const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const connectDB = require("../utils/db");
const User = require("../models/User");

// mock checkJwt middleware
jest.mock("../middleware/checkJwt", () => (req, res, next) => {
  req.auth = { sub: "test-auth0-id" };
  next();
});

require("dotenv").config();

const USERNAME = "testuser";
const USERS_ENDPOINT = "/api/users";

describe("Rooms/Users API tests", () => {
  let server;
  let testUserId;

  beforeAll(async () => {
    await connectDB();
    server = app.listen(0);
  });

  afterAll(async () => {
    await User.deleteMany({ username: USERNAME });
    await mongoose.connection.close();
    if (server) server.close();
  });

  beforeEach(async () => {
    await User.deleteMany({ auth0Id: "test-auth0-id" });
  });

  it("should create a new user/room", async () => {
    const userData = {
      username: USERNAME,
      email: "test@example.com",
      auth0Id: "test-auth0-id",
    };

    const response = await request(app)
      .post(USERS_ENDPOINT)
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.username).toBe(userData.username);
    expect(response.body.email).toBe(userData.email);
    testUserId = response.body._id;
  });

  it("should get current user", async () => {
    const testUser = new User({
      username: USERNAME,
      email: "test@example.com",
      auth0Id: "test-auth0-id",
    });
    await testUser.save();

    const response = await request(app).get(USERS_ENDPOINT).expect(200);

    expect(response.body.username).toBe(USERNAME);
    expect(response.body.email).toBe("test@example.com");
  });

  it("should update a user", async () => {
    const testUser = new User({
      username: USERNAME,
      email: "test@example.com",
      auth0Id: "test-auth0-id",
    });
    await testUser.save();

    const updateData = {
      email: "updated@example.com",
      bio: "Updated bio",
    };

    const response = await request(app)
      .put(`${USERS_ENDPOINT}/${testUser._id}`)
      .send(updateData)
      .expect(200);

    expect(response.body.email).toBe(updateData.email);
  });

  it("should delete a user", async () => {
    const testUser = new User({
      username: USERNAME,
      email: "test@example.com",
      auth0Id: "test-auth0-id",
    });
    await testUser.save();

    await request(app)
      .delete(`${USERS_ENDPOINT}/${testUser._id}`)
      .expect(204);

    const deletedUser = await User.findById(testUser._id);
    expect(deletedUser).toBeNull();
  });

  it("should return 404 for non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    await request(app)
      .put(`${USERS_ENDPOINT}/${fakeId}`)
      .send({ email: "test@example.com" })
      .expect(404);
  });

  it("should handle duplicate username creation", async () => {
    const testUser = new User({
      username: USERNAME,
      email: "test@example.com",
      auth0Id: "test-auth0-id",
    });
    await testUser.save();

    const duplicateUserData = {
      username: USERNAME,
      email: "another@example.com",
      auth0Id: "different-auth0-id",
    };

    const response = await request(app)
      .post(USERS_ENDPOINT)
      .send(duplicateUserData)
      .expect(200);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.username).toBe(USERNAME);
  });

  it("should get user by auth0Id when accessing current user", async () => {
    const testUser = new User({
      username: USERNAME,
      email: "test@example.com",
      auth0Id: "test-auth0-id",
    });
    await testUser.save();

    const response = await request(app).get(USERS_ENDPOINT).expect(200);

    expect(response.body.auth0Id).toBe("test-auth0-id");
    expect(response.body.username).toBe(USERNAME);
  });
});
