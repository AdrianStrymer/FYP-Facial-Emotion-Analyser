const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");

const dynamo = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE_NAME;

const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const params = {
    TableName: USERS_TABLE,
    Item: {
      username,
      password: hashedPassword,
    },
  };

  await dynamo.put(params).promise();
};

const findUserByUsername = async (username) => {
  const params = {
    TableName: USERS_TABLE,
    Key: { username },
  };

  const result = await dynamo.get(params).promise();
  return result.Item;
};

module.exports = { createUser, findUserByUsername };