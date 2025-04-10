import React, { useState } from "react";
import axios from "axios";
import "./Global.css";
import "./HomeScreen.css"; 
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
        <select value={emotion} onChange={e => setEmotion(e.target.value)}>
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
          min="0"
          max="100"
          onChange={e => setThreshold(e.target.value)}
          placeholder="Confidence Threshold"
        />
        <button onClick={handleUpload}>Upload All</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default MultipleUploadScreen;