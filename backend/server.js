require("dotenv").config();
const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
const AdmZip = require("adm-zip");

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
  const { imageKey, analysisResult, batchId } = req.body;  

  if (!imageKey || !analysisResult) {
    return res.status(400).send("Missing imageKey or analysisResult.");
  }

  const dbParams = {
    TableName: TABLE_NAME,
    Key: { imageKey },
    UpdateExpression: "set analysisResult = :result, #status = :status, #batchId = :batch",
    ExpressionAttributeNames: {
      "#status": "status", 
      "#batchId": "batchId"
    },
    ExpressionAttributeValues: {
      ":result": analysisResult, 
      ":status": "completed",  
      ":batch": batchId 
    },
  };

  try {
    await dynamoDB.update(dbParams).promise();
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

app.post("/multiple-upload", upload.array("images"), async (req, res) => {
  const { emotion, threshold, batchId } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const uploadResults = [];

  for (const file of req.files) {
    const imageKey = `multiple/${batchId}/${Date.now()}_${file.originalname}`;

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        emotion: emotion.toUpperCase(),
        threshold: threshold.toString(),
        batchId,
      },
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
          emotion,
          threshold: Number(threshold),
          batchId
        },
      };

      await dynamoDB.put(dbParams).promise();

      uploadResults.push({ imageKey, imageUrl: uploadResult.Location });
    } catch (err) {
      console.error("Error uploading file:", err);
      return res.status(500).send("Upload failed for one or more files.");
    }
  }

  res.status(200).json({ message: "All files uploaded", results: uploadResults });
});

app.post("/download-matching", async (req, res) => {
  const { emotion, threshold, batchId } = req.body;

  if (!emotion || !threshold) {
    return res.status(400).send("Missing emotion or threshold.");
  }

  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await dynamoDB.scan(params).promise();

    const matchedItems = (data.Items || []).filter(item => {
      const emotions = item.analysisResult?.emotions || [];
      const match = emotions.find(e => e.Type === emotion.toUpperCase() && e.Confidence >= Number(threshold));
      return item.batchId === batchId && item.analysisResult?.passed && match;
    });

    if (matchedItems.length === 0) {
      return res.status(404).send("No matching images found.");
    }

    const zip = new AdmZip();

    for (const item of matchedItems) {
      const s3Object = await s3.getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: item.imageKey,
      }).promise();

      zip.addFile(item.imageKey.split("/").pop(), s3Object.Body);
    }

    const zippedBuffer = zip.toBuffer();

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=filtered-images.zip",
      "Content-Length": zippedBuffer.length,
    });

    res.send(zippedBuffer);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).send("Failed to create zip file.");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));