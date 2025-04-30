import {React, useState, useRef} from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, Files, Aperture, CameraOff, DoorOpen } from "lucide-react";
import "../styles/Global.css"
import "../styles/HomeScreen.css";
import img from "../assets/background.jpg"
import axios from "axios";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      setSelectedFile(new File([blob], "captured_image.jpg", { type: "image/jpeg" }));
      setCameraActive(false);
      videoRef.current.srcObject.getTracks().forEach(track => track.stop()); 
    }, "image/jpeg");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleUpload = async () => {
    setMessage("");

    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
    const imageKey = response.data.imageKey;

    const checkAnalysis = async () => {
      try {
        const resultResponse = await axios.get(`http://localhost:5000/results/${encodeURIComponent(imageKey)}`);
        const result = resultResponse.data;

        if (result.analysisResult) {
          navigate(`/results/${encodeURIComponent(imageKey)}`);
          setIsLoading(false);
        } else {
          setTimeout(checkAnalysis, 3000);
        }
      } catch (error) {
        console.error("Error checking analysis:", error);
        setTimeout(checkAnalysis, 3000);
      }
    };

    checkAnalysis(); 

  } catch (error) {
    console.error("Upload error:", error);
    setMessage("Failed to upload file.");
    setIsLoading(true);
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
      <header className="header">
        Facial Emotion Analyser
        <Button
          variant="container" 
          className="logout-btn"
          startIcon={<DoorOpen size={16} />} 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </header>
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
          className="batch-upload-btn"
          startIcon={<Files size={16} />}
          onClick={() => navigate("/multiple")}
        >
          Go to Batch Upload
        </Button>
        <Button
          variant="container" 
          className="camera-btn"
          startIcon={<Camera size={16} />}
          onClick={startCamera}
        >
          Use Camera
        </Button>
        {cameraActive && (
          <div className="camera-preview">
            <video ref={videoRef} autoPlay playsInline className="video-feed" />
            <Button 
              variant="contained" 
              className="capture-btn"
              startIcon={<Aperture size={16} />}
              onClick={captureImage}
            >
              Capture Photo
            </Button>
            <Button
              variant="contained"
              className="stop-camera-btn"
              startIcon={<CameraOff size={16} />}
              onClick={stopCamera}
            >
              Stop Camera
            </Button>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
      {message && <p className="loading-message">{message}</p>}
      {isLoading && <p className="loading-message">Analyzing image, please wait...</p>}
    </div>
  );
};

export default Home;
