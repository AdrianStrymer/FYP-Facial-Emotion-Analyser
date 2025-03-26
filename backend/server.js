require("dotenv").config();
const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors({ origin: "*" }));
app.use(express.json()); 

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const imageKey = `uploads/${Date.now()}_${req.file.originalname}`

  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: imageKey,
    Body: req.file.buffer,
    ContentType: req.file.mimetype, 
  };

  try {
    const uploadResult = await s3.upload(s3Params).promise();

    const dbParams = {
      TableName: TABLE_NAME,
      Item: {
        imageKey,
        imageUrl: uploadResult.Location,
        status: "processing",
        analysisResult: null,
      },
    };

    await dynamoDB.put(dbParams).promise();
    res.json({ imageUrl: uploadResult.Location, imageKey });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).send("Error uploading file.");
  }
});

app.post("/update-analysis", async (req, res) => {
  const { imageKey, analysisResult } = req.body;  

  if (!imageKey || !analysisResult) {
    return res.status(400).send("Missing imageKey or analysisResult.");
  }

  const dbParams = {
    TableName: TABLE_NAME,
    Key: { imageKey },
    UpdateExpression: "set analysisResult = :result, #status = :status",
    ExpressionAttributeNames: {
      "#status": "status", 
    },
    ExpressionAttributeValues: {
      ":result": analysisResult, 
      ":status": "completed",   
    },
  };

  try {
    await dynamoDB.update(dbParams).promise();
    console.log(`Successfully updated DynamoDB with analysis for image: ${imageKey}`);
    res.status(200).send("Analysis results updated.");
  } catch (error) {
    console.error("Error updating DynamoDB:", error);
    res.status(500).send("Error updating analysis.");
  }
});

app.get("/results/:imageKey", async (req, res) => {
  const { imageKey } = req.params;

  const dbParams = {
    TableName: TABLE_NAME,
    Key: { imageKey },
  };

  try {
    const result = await dynamoDB.get(dbParams).promise();

    if (!result.Item) {
      return res.status(404).send("Analysis not found.");
    }

    res.json(result.Item);
  } catch (err) {
    console.error("Error fetching analysis:", err);
    res.status(500).send("Error retrieving analysis.");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));