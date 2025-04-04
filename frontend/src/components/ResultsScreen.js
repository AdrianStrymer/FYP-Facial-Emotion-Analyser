import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Global.css"
import "./ResultsScreen.css"
import img from "../assets/background.jpg"

const ResultsScreen = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const { imageKey } = useParams();
  const [analysisResults, setAnalysisResults] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/results/${encodeURIComponent(imageKey)}`);
        const { analysisResult, imageUrl } = response.data;
  
        if (analysisResult && analysisResult.emotions) {
          const emotions = analysisResult.emotions.map((emotionObj) => ({
            emotion: emotionObj.Type, 
            confidence: emotionObj.Confidence, 
          }));
  
          setAnalysisResults(emotions);
        } else {
          setAnalysisResults([]);
        }
  
        setImageUrl(imageUrl); 
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };
  
    fetchResults();
  }, [imageKey]);

  const filteredResults = analysisResults.filter(
    (result) => result.confidence >= sliderValue
  );

  return (
    <div style={{
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100vw",
          height: "100vh",
          overflow: "hidden"
        }}>
    <header className="header">Image Analysis Results</header>
    <div className="results-container">
      <div className="image-placeholder">
      {imageUrl && <img src={imageUrl} alt="Uploaded"/>}
      </div>
      <div className="bottom-section">
        <div className="emotion-box">
        <h3>Detected Emotions (Above {sliderValue}%)</h3>
            <ul>
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <li key={index}>
                    {result.emotion}: {result.confidence.toFixed(2)}%
                  </li>
                ))
              ) : (
                <p>No emotions above threshold</p>
              )}
            </ul>
        </div>
        <div className="slider-container">
            <input type="range" min="0" max="100" className="slider" value={sliderValue}
            onChange={(e) => setSliderValue(e.target.value)} />
            <div className="slider-labels">
                <span>0%</span>
                <span>{sliderValue}%</span>
                <span>100%</span>
            </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ResultsScreen;