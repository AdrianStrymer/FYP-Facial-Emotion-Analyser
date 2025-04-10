import ResultsScreen from "./components/ResultsScreen";
import HomeScreen from "./components/HomeScreen";
import MultipleUploadScreen from "./components/MultipleUploadScreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/results/:imageKey" element={<ResultsScreen />} />
        <Route path="/multiple" element={<MultipleUploadScreen />} />
      </Routes>
    </Router>
  );
}

export default App;