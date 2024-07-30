import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("sadhiq@gmail.com");
  const [password, setPassword] = useState("786000");
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setErr(null);
      navigate("/");
    } catch (error) {
      console.error("Error:", error); // Log the error to the console

      if (error.code === "auth/user-not-found") {
        setErr("User not found. Please register.");
      } else if (error.code === "auth/wrong-password") {
        setErr("Incorrect password.");
      } else {
        setErr("Failed to log in.");
      }
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Let's Connect</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit} className="form">
          <div className="inputContainer">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="inputContainer">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="bn632-hover bn26">Sign in</button>
          {err && <span style={{ color: "red" }}>{err}</span>}
        </form>
        <p style={{fontSize:"18px"}}>
          You don't have an account? <Link to="/register" style={{color:"#21b4e5"}}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
