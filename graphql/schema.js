const { buildSchema } = require("graphql");
const bcrypt = require("bcrypt");
const { getDB } = require("../models/db");
const { ObjectId } = require("mongodb");

const saltRounds = 10;
const collectionName = process.env.DB_COLLECTION || 'users';

const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    createUser(input: UserInput): User
    updateUser(id: ID!, input: UserInput): User
    deleteUser(id: ID!): String
  }
`);

const resolvers = {
  users: async () => {
    const db = getDB();
    const users = await db.collection(collectionName).find().toArray();
    return users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
    }));
  },

  user: async ({ id }) => {
    const db = getDB();
    const user = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(id) });
    if (!user) throw new Error("User not found");
    return { id: user._id, name: user.name, email: user.email };
  },

  createUser: async ({ input }) => {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(input.password, saltRounds);
    const result = await db
      .collection(collectionName)
      .insertOne({ ...input, password: hashedPassword });
    return { id: result.insertedId, name: input.name, email: input.email };
  },

  updateUser: async ({ id, input }) => {
    const db = getDB();

    if (input.password) {
      input.password = await bcrypt.hash(input.password, saltRounds);
    }

    const result = await db
      .collection(collectionName)
      .updateOne({ _id: new ObjectId(id) }, { $set: input });
    if (result.matchedCount === 0) throw new Error("User not found");
    return { id, ...input };
  },

  deleteUser: async ({ id }) => {
    const db = getDB();
    const result = await db
      .collection(collectionName)
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) throw new Error("User not found");
    return "User deleted successfully";
  },
};

module.exports = { schema, resolvers };
