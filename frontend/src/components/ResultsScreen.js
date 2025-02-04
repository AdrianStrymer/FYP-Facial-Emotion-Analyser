import React, {useState} from "react";
import "./Global.css"
import "./ResultsScreen.css"
import img from "../assets/background.jpg"

const ResultsScreen = () => {
  const [sliderValue, setSliderValue] = useState(50);

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
      <div className="image-placeholder"></div>
      <div className="bottom-section">
        <div className="emotion-box"></div>
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