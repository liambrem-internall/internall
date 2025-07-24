const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const connectDB = require("../utils/db");
const User = require("../models/User");

// mock checkJwt middleware to bypass authentication
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
    // clean up test data and close connections
    await User.deleteMany({ username: USERNAME });
    await mongoose.connection.close();
    if (server) server.close();
  });

  beforeEach(async () => {
    // clean up users before each test
    await User.deleteMany({ auth0Id: "test-auth0-id" });
  });

  // test creating a new user account
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

  // test retrieving current user's profile information
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

  // test updating user profile information
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

  // test deleting a user account 
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

    // verify user was deleted from database
    const deletedUser = await User.findById(testUser._id);
    expect(deletedUser).toBeNull();
  });

  // test error handling for operations on non-existent users
  it("should return 404 for non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    await request(app)
      .put(`${USERS_ENDPOINT}/${fakeId}`)
      .send({ email: "test@example.com" })
      .expect(404);
  });

  // test handling duplicate usernames
  it("should handle duplicate username creation", async () => {
    const testUser = new User({
      username: USERNAME,
      email: "test@example.com",
      auth0Id: "test-auth0-id",
    });
    await testUser.save();

    // create another user with same username but different auth0Id
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

  // test authentication based user lookup
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
