import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      // Try to sign in with provided email and password
      await signInWithEmailAndPassword(auth, email, password);
      setErr(null); // Reset error state
      navigate("/"); // Redirect to home page after successful login
    } catch (error) {
      // If user not found, display message and suggest registration
      if (error.code === "auth/user-not-found") {
        setErr("User not found. Please register.");
      } else {
        setErr("Incorrect email or password."); // Display generic error message for other errors
      }
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chat App</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit} className="form">
          <input type="email" placeholder="Email" required />
          <br></br>
          <input type="password" placeholder="Password" required />
          <br></br>
          <button>Sign in</button>
          {err && <span style={{ color: "red" }}>{err}</span>}
        </form>
        <p>
          You don't have an account?<Link to="/register">Register</Link>
        </p>
        <div className="defaultlogin">
          <h6>Sample Login Details</h6>
          <b>
            <span>Email:</span>
          </b>
          <span> user123@gmail.com</span>
          <br />
          <b>
            <span>Password:</span>
          </b>
          <span> 123456</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
