import React, { useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import "../styles/Global.css";
import "../styles/SignupScreen.css"
import img from "../assets/background.jpg";
import { useNavigate } from "react-router-dom";
import { UserPlus, Undo } from "lucide-react";

const SignupScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    setMessage("");

    if (!username || !password) {
        setMessage("Please enter both username and password.");
        return;
      }

    if (username.length < 3 || username.length > 15) {
        setMessage("Username must be between 3 and 15 characters long.");
        return;
    }

    if (password.length < 6) {
        setMessage("Password must be at least 6 characters long.");
        return;
    }

    try {
      await axios.post("http://localhost:5000/auth/signup", { username, password });
      setMessage("Signup successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
        if (err.response && err.response.data?.error === "Username exists") {
          setMessage("Username already taken. Please choose another one.");
        } else {
          setMessage("Signup failed. Please try again.");
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
      <header className="header">Sign Up</header>
      <div className="content">
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button 
            variant="container" 
            className="upload-btn" 
            startIcon={<UserPlus size={16} />}
            onClick={handleSignup}>
          Create User
        </Button>
        <Button 
            variant="container" 
            className="back-login-btn" 
            startIcon={<Undo size={16} />}
            onClick={() => navigate("/login")}>
          Back to Login
        </Button>
      </div>
      {message && <div className="error-message">{message}</div>}
    </div>
  );
};

export default SignupScreen;