import ResultsScreen from "./pages/ResultsScreen";
import HomeScreen from "./pages/HomeScreen";
import MultipleUploadScreen from "./pages/MultipleUploadScreen";
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