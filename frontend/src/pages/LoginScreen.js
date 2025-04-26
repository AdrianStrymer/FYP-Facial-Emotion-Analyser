import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";
import "../styles/LoginScreen.css"
import img from "../assets/background.jpg";
import Button from "@mui/material/Button";
import { LogIn, UserPlus } from "lucide-react";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setMessage("");

    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data?.error === "Invalid credentials") {
        setMessage("The username or password is not correct.");
      } else {
        setMessage("Login failed. Please try again.");
      }
      console.error(err);
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
      <header className="header">Login</header>
      <div className="content">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="container" 
          className="upload-btn"
          startIcon={<LogIn size={16} />} 
          onClick={handleLogin}
        >
          Login
        </Button>
        <Button
          variant="container" 
          className="signup-btn"
          startIcon={<UserPlus size={16} />} 
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </Button>
      </div>
      {message && <div className="error-message">{message}</div>}
    </div>
  );
};

export default LoginScreen;