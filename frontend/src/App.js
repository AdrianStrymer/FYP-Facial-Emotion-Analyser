import ResultsScreen from "./pages/ResultsScreen";
import HomeScreen from "./pages/HomeScreen";
import MultipleUploadScreen from "./pages/MultipleUploadScreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomeScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/results/:imageKey"
          element={
            <PrivateRoute>
              <ResultsScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/multiple"
          element={
            <PrivateRoute>
              <MultipleUploadScreen />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;