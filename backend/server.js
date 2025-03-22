require("dotenv").config();
const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 5000;

app.use(cors());

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${Date.now()}_${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype, 
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(500).send("Error uploading file.");
    }
    res.json({ imageUrl: data.Location });
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));