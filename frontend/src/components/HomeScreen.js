import {React, useState} from "react";
import Button from "@mui/material/Button";
import { Upload, Camera } from "lucide-react";
import "./Global.css"
import "./HomeScreen.css";
import img from "../assets/background.jpg"
import axios from "axios";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully: " + response.data.imageUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file.");
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
      <header className="header">Facial Emotion Analyser</header>
      <div className="content">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <Button
          variant="container" 
          className="upload-btn"
          startIcon={<Upload size={16} />} 
          onClick={handleUpload}
        >
          Upload Image
        </Button>

        <Button
          variant="container" 
          className="camera-btn"
          startIcon={<Camera size={16} />}
        >
          Use Camera
        </Button>
      </div>
    </div>
  );
};

export default Home;
