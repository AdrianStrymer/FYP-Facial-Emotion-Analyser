import React from "react";
import Button from "@mui/material/Button";
import { Upload, Camera } from "lucide-react";
import "./Global.css"
import "./HomeScreen.css";
import img from "../assets/background.jpg"

const Home = () => {
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
        <Button
          variant="container" 
          className="upload-btn"
          startIcon={<Upload size={16} />} 
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
