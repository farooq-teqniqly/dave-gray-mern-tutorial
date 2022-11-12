const mongoose = require("mongoose");
const app = require("../server");
const request = require("supertest");

const badUserId = "999999999999999999999999";

const getTestUser = (
  username = "Farooq",
  password = "1234",
  roles = ["User"]
) => {
  return {
    username,
    password,
    roles,
  };
};

const deleteAllUsers = async () => {
  const res = await request(app).get("/users");
  const users = res.body;

  for (let i = 0; i < users.length; i++) {
    await request(app).delete(`/users/${users[i]._id}`);
  }
};

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
  await deleteAllUsers();
});

describe("Get all users", () => {
  it("Returns an empty array when there are no users", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  it("Returns the users", async () => {
    const expectedUsers = [
      getTestUser((username = "UserA")),
      getTestUser((username = "UserB")),
    ];

    for (let i = 0; i < expectedUsers.length; i++) {
      await request(app).post("/users").send(expectedUsers[i]);
    }

    const res = await request(app).get("/users");
    const actualUsers = res.body;

    expect(actualUsers.length).toBe(2);

    for (let i = 0; i < actualUsers.length; i++) {
      expect(actualUsers[i]._id).not.toBe(null);
      expect(actualUsers[i].username).toBe(expectedUsers[i].username);
      expect(actualUsers[i].roles).toStrictEqual(expectedUsers[i].roles);
      expect(actualUsers[i].active).toBe(true);
      expect(actualUsers[i].createdAt).not.toBe(null);
      expect(actualUsers[i].updatedAt).not.toBe(null);
    }
  });
});

describe("Get a single user", () => {
  let expectedUser;
  let actualUser;

  beforeAll(async () => {
    expectedUser = getTestUser();
    const res = await request(app).post("/users").send(expectedUser);
    actualUser = res.body;
  });

  it("Returns the user", async () => {
    const res = await request(app).get(`/users/${actualUser._id}`);
    const { _id, username, roles, active, createdAt, updatedAt } = res.body;

    expect(_id).toBe(actualUser._id);
    expect(username).toBe(actualUser.username);
    expect(roles).toStrictEqual(actualUser.roles);
    expect(active).toBe(actualUser.active);
    expect(createdAt).toBe(actualUser.createdAt);
    expect(updatedAt).toBe(actualUser.updatedAt);
  });
});

describe("Create user", () => {
  let user;

  beforeAll(async () => {
    await deleteAllUsers();
  });

  beforeEach(() => {
    user = getTestUser();
  });

  it("Returns an error message when username is missing", async () => {
    delete user.username;
    const res = await request(app).post("/users").send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when password is missing", async () => {
    delete user.password;
    const res = await request(app).post("/users").send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is missing", async () => {
    delete user.roles;
    const res = await request(app).post("/users").send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is an empty array", async () => {
    user.roles = [];
    const res = await request(app).post("/users").send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is not an array", async () => {
    user.roles = "foo";
    const res = await request(app).post("/users").send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Creates the user", async () => {
    const res = await request(app).post("/users").send(user);

    expect(res.status).toBe(201);

    const { _id, username, roles, active, createdAt, updatedAt } = res.body;

    expect(_id).not.toBe(null);
    expect(username).toBe(user.username);
    expect(roles).toStrictEqual(user.roles);
    expect(active).toBe(true);
    expect(createdAt).not.toBe(null);
    expect(updatedAt).toBe(createdAt);
  });
});

describe("Update user", () => {
  let user;
  let createdUser;

  beforeAll(async () => {
    await deleteAllUsers();

    user = getTestUser();
    createdUser = await request(app).post("/users").send(user);
  });

  it("Returns an error message when username is missing", async () => {
    delete user.username;
    const res = await request(app)
      .patch(`/users/${createdUser._id}`)
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when password is missing", async () => {
    delete user.password;
    const res = await request(app)
      .patch(`/users/${createdUser._id}`)
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is missing", async () => {
    delete user.roles;
    const res = await request(app)
      .patch(`/users/${createdUser._id}`)
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is an empty array", async () => {
    user.roles = [];
    const res = await request(app)
      .patch(`/users/${createdUser._id}`)
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is not an array", async () => {
    user.roles = "foo";
    const res = await request(app)
      .patch(`/users/${createdUser._id}`)
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when active attribute is missing", async () => {
    delete user.active;
    const res = await request(app)
      .patch(`/users/${createdUser._id}`)
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when active attribute is not a boolean", async () => {
    user.active = "true";
    const res = await request(app)
      .patch(`/users/${createdUser._id}`)
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns error when user not found.", async () => {
    user = getTestUser();
    user.active = true;
    console.log(user);
    const res = await request(app).patch(`/users/${badUserId}`).send(user);

    expect(res.body.message).toBe("User not found.");
    expect(res.status).toBe(404);
  });
});
