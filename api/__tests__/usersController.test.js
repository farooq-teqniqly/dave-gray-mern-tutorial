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

const getTestNote = (completed = false) => {
  return {
    title: "Test note",
    text: "This is a test note",
    completed,
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
      expect(actualUsers[i]).not.toHaveProperty("password");
      expect(actualUsers[i]).not.toHaveProperty("__v");
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
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("__v");
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
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("__v");
  });
});

describe("Update user", () => {
  let user;
  let createdUser;
  let createdUserId;

  beforeAll(async () => {
    await deleteAllUsers();

    user = getTestUser();
    res = await request(app).post("/users").send(user);
    createdUser = res.body;
    createdUserId = createdUser._id;
  });

  it("Returns an error message when username is missing", async () => {
    delete user.username;
    const res = await request(app).patch(`/users/${createdUserId}`).send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when password is missing", async () => {
    delete user.password;
    const res = await request(app).patch(`/users/${createdUserId}`).send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is missing", async () => {
    delete user.roles;
    const res = await request(app).patch(`/users/${createdUserId}`).send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is an empty array", async () => {
    user.roles = [];
    const res = await request(app).patch(`/users/${createdUserId}`).send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when roles is not an array", async () => {
    user.roles = "foo";
    const res = await request(app).patch(`/users/${createdUserId}`).send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when active attribute is missing", async () => {
    delete user.active;
    const res = await request(app).patch(`/users/${createdUserId}`).send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns an error message when active attribute is not a boolean", async () => {
    user.active = "true";
    const res = await request(app).patch(`/users/${createdUserId}`).send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  it("Returns error when user not found.", async () => {
    user = getTestUser();
    user.active = true;
    const res = await request(app).patch(`/users/${badUserId}`).send(user);

    expect(res.body.message).toBe("User not found.");
    expect(res.status).toBe(404);
  });

  it("Updates the user", async () => {
    createdUser.username = "Updated";
    createdUser.password = "Updated";
    createdUser.roles = ["Admin"];
    createdUser.active = false;
    delete createdUser._id;

    const res = await request(app)
      .patch(`/users/${createdUserId}`)
      .send(createdUser);

    expect(res.status).toBe(200);

    const { _id, username, roles, active, createdAt, updatedAt } = res.body;

    expect(_id).toBe(createdUserId);
    expect(username).toBe(createdUser.username);
    expect(roles).toStrictEqual(createdUser.roles);
    expect(active).toBe(false);
    expect(createdAt).not.toBe(null);
    expect(updatedAt).not.toBe(null);
    expect(updatedAt).not.toBe(createdAt);
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("__v");
  });

  it("Returns an error if the updated username is already taken", async () => {
    const newUser = getTestUser((username = "User A"));
    await request(app).post("/users").send(newUser);

    createdUser.username = newUser.username;

    const res = await request(app)
      .patch(`/users/${createdUserId}`)
      .send(createdUser);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Username already taken.");
  });
});

describe("Delete user", () => {
  it("Does not return an error if the user does not exist", async () => {
    const res = await request(app).delete(`/users/${badUserId}`);
    expect(res.status).toBe(204);
  });

  it("Returns error if user has notes", async () => {
    const user = getTestUser((username = "User note test"));
    const createUserResult = await request(app).post("/users").send(user);
    const { _id } = createUserResult.body;

    const note = getTestNote();
    const createNoteResult = await request(app)
      .post(`/users/${_id}/notes`)
      .send(note);

    const deleteUserResult = await request(app).delete(`/users/${_id}`);

    expect(deleteUserResult.status).toBe(409);
    expect(deleteUserResult.body.message).toBe(
      "Cannot delete user because it has assigned notes."
    );

    await request(app).delete(
      `/users/${_id}/notes/${createNoteResult.body._id}`
    );
  });
});
