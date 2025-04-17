import React, { useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import {Upload, Download} from "lucide-react";
import "../styles/Global.css";
import "../styles/MultipleUploadScreen.css" 
import img from "../assets/background.jpg";

const MultipleUploadScreen = () => {
  const [files, setFiles] = useState([]);
  const [emotion, setEmotion] = useState("HAPPY");
  const [threshold, setThreshold] = useState(80);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select files to upload.");
      return;
    }
  
    const formData = new FormData();
  
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]); 
    }
  
    formData.append("emotion", emotion);
    formData.append("threshold", threshold.toString());
  
    try {
      const response = await axios.post("http://localhost:5000/multiple-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Upload success:", response.data);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleDownload = async () => {
    if (!emotion || !threshold) {
      alert("Please select an emotion and threshold.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:5000/download-matching",
        { emotion, threshold },
        { responseType: "blob" } 
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "filtered-images.zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download matching images.");
    }
  };

  return (
    <div style={{
      backgroundImage: `url(${img})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      width: "100vw",
      height: "100vh"
    }}>
      <header className="header">Batch File Upload</header>
      <div className="content">
        <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files))} />
        <select className="emotion-input" value={emotion} onChange={e => setEmotion(e.target.value)}>
          <option value="HAPPY">Happy</option>
          <option value="SAD">Sad</option>
          <option value="ANGRY">Angry</option>
          <option value="CALM">Calm</option>
          <option value="CONFUSED">Confused</option>
          <option value="FEAR">Fear</option>
          <option value="DISGUSTED">Disgusted</option>
          <option value="SURPRISED">Surprised</option>
        </select>
        <input
          type="number"
          value={threshold}
          className="threshold-input"
          min="0"
          max="100"
          onChange={e => setThreshold(e.target.value)}
          placeholder="Threshold"
        />
        <Button
          variant="contained"
          className="upload-btn"
          startIcon={<Upload size={16} />} 
          onClick={handleUpload}
        >
          Upload All
        </Button>
        <Button
          variant="contained"
          className="download-btn"
          startIcon={<Download size={16} />} 
          onClick={handleDownload}
        >
          Download Matching Images
        </Button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default MultipleUploadScreen;