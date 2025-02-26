// This AWS Lambda function provides an API for membership card operations
// including adding a membership card, recording in/out actions, and viewing records.

// WARNING: In-memory storage is used for demo purposes. In production, use a persistent datastore (e.g., DynamoDB).
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand // Added ScanCommand for membership lookup
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Utility to generate unique IDs
const generateId = () => {
  return "id_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
};

// Compute total working hours for records for a specific card
// Assumes records for a day and iterates over them in order
const computeTotalWorkingHours = (recList) => {
  let total = 0;
  let lastIn = null;
  recList.forEach((record) => {
    if (record.type === "in") {
      lastIn = record;
    } else if (record.type === "out" && lastIn) {
      total += record.timestamp - lastIn.timestamp;
      lastIn = null;
    }
  });
  return total / (1000 * 60 * 60); // hours
};

exports.handler = async (event, context) => {
  let response;
  try {
    const method = event.httpMethod;
    const path = event.path;

    // Handle preflight CORS requests
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'OPTIONS,GET,POST'
        },
        body: ''
      };
    }

    // For logging purposes
    console.log("Received event:", JSON.stringify(event));

    if (method === "POST" && path === "/membership") {
      // Updated membership initialization logic
      // Expected body: { name: string, cardNumber: string, otherDetails: {} }
      const body = JSON.parse(event.body);
      const { name, cardNumber, ...otherDetails } = body;

      if (!cardNumber) {
        response = {
          statusCode: 400,
          body: JSON.stringify({ error: "cardNumber is required" })
        };
      } else {
        // Check if a membership with the same cardNumber already exists
        const scanResult = await docClient.send(
          new ScanCommand({
            TableName: process.env.MEMBERSHIP_TABLE,
            FilterExpression: "cardNumber = :cardNum",
            ExpressionAttributeValues: { ":cardNum": cardNumber }
          })
        );

        if (scanResult.Items && scanResult.Items.length > 0) {
          // Membership exists, return the existing record
          response = {
            statusCode: 200,
            body: JSON.stringify({
              message: "Membership exists",
              membership: scanResult.Items[0]
            })
          };
        } else {
          // Create new membership record
          const id = generateId();
          const membership = { id, name, cardNumber, ...otherDetails, createdAt: Date.now() };
          await docClient.send(
            new PutCommand({
              TableName: process.env.MEMBERSHIP_TABLE,
              Item: membership
            })
          );
          response = {
            statusCode: 200,
            body: JSON.stringify({
              message: "Membership added successfully",
              membership
            })
          };
        }
      }
    } else if (method === "POST" && path === "/record") {
      // Record an in/out action
      // Expected body: { cardId: string, type: "in" | "out" }
      const body = JSON.parse(event.body);
      const { cardId, type } = body;
      if (!cardId || (type !== "in" && type !== "out")) {
        response = {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid input" }),
        };
      } else {
        // Verify membership exists
        const membershipResult = await docClient.send(
          new GetCommand({
            TableName: process.env.MEMBERSHIP_TABLE,
            Key: { id: cardId },
          })
        );
        if (!membershipResult.Item) {
          response = {
            statusCode: 404,
            body: JSON.stringify({ error: "Membership not found" }),
          };
        } else {
          const newRecord = { cardId, type, timestamp: Date.now() };
          await docClient.send(
            new PutCommand({
              TableName: process.env.RECORDS_TABLE,
              Item: newRecord,
            })
          );
          response = {
            statusCode: 200,
            body: JSON.stringify({
              message: `Recorded ${type} successfully`,
              record: newRecord,
            }),
          };
        }
      }
    } else if (method === "GET" && path === "/records") {
      // View records for a membership card
      // Expected query parameter: cardId
      const query = event.queryStringParameters || {};
      const cardId = query.cardId;
      const startDay = query.startDay;
      const endDay = query.endDay;
      if (!cardId || !startDay || !endDay) {
        response = {
          statusCode: 400,
          body: JSON.stringify({
            error: "cardId, startDay and endDay query parameters are required",
          }),
        };
      } else {
        const membershipResult = await docClient.send(
          new GetCommand({
            TableName: process.env.MEMBERSHIP_TABLE,
            Key: { id: cardId },
          })
        );
        if (!membershipResult.Item) {
          response = {
            statusCode: 404,
            body: JSON.stringify({ error: "Membership not found" }),
          };
        } else {
          const startTimestamp = new Date(startDay).getTime();
          const endTimestamp = new Date(endDay).getTime();
          const recordsResult = await docClient.send(
            new QueryCommand({
              TableName: process.env.RECORDS_TABLE,
              KeyConditionExpression:
                "cardId = :cardId and #ts BETWEEN :start and :end",
              ExpressionAttributeNames: { "#ts": "timestamp" },
              ExpressionAttributeValues: {
                ":cardId": cardId,
                ":start": startTimestamp,
                ":end": endTimestamp,
              },
            })
          );
          let cardRecords = recordsResult.Items || [];
          cardRecords.sort((a, b) => a.timestamp - b.timestamp);
          const totalHours = computeTotalWorkingHours(cardRecords);
          response = {
            statusCode: 200,
            body: JSON.stringify({
              membership: membershipResult.Item,
              records: cardRecords,
              totalWorkingHours: totalHours.toFixed(1),
            }),
          };
        }
      }
    } else {
      response = {
        statusCode: 404,
        body: JSON.stringify({ error: "Not Found" }),
      };
    }
  } catch (err) {
    console.error(err);
    response = {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }

  return {
    ...response,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};
