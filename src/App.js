import React, { useState, useContext, createContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import Sidebar from "./components/sidebar";
import Chat from "./components/chat";
import Add from "./img/avatar.png";
import "./style.scss";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";

// AuthContext to handle authentication state
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // Mock authentication state change handler
  auth.onAuthStateChanged((user) => {
    setCurrentUser(user);
    setLoading(false);

  });

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ProtectedRoute component to protect routes
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
};

//Register Component
const Register = () => {
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    if (!displayName || !email || !password || !file) {
      setLoading(false);
      setErr("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoading(false);
      setErr("Please enter a valid email address.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setLoading(false);
      setErr("Please select a smaller image file (max 5MB).");
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const fileName = displayName + "_avatar";
      const storageRef = ref(storage, `${displayName}/avatars/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          setLoading(false);
          setErr("Error uploading avatar: " + error.message);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateProfile(user, { displayName, photoURL: downloadURL });
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });
            await setDoc(doc(db, "userChats", user.uid), {});

            e.target.reset();
            setSuccess(true);
            setLoading(false);
            navigate("/");
          } catch (error) {
            setLoading(false);
            setErr("Error updating user profile or saving data to Firestore: " + error.message);
          }
        }
      );
    } catch (error) {
      setLoading(false);
      setErr("Error creating user: " + error.message);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">InstantChat</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <div className="inputContainer">
            <FaUser className="icon" />
            <input type="text" placeholder="Display Name" required />
          </div>
          <div className="inputContainer">
            <FaEnvelope className="icon" />
            <input type="email" placeholder="Email" required />
          </div>
          <div className="inputContainer">
            <FaLock className="icon" />
            <input type="password" placeholder="Password" required />
          </div>
          <div className="inputContainer">
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {previewImage && (
              <img src={previewImage} alt="Preview" className="previewImage" />
            )}
            <label htmlFor="file">
              <img src={Add} alt="" className="adding" />
              <span>Add an avatar</span>
            </label>

          </div>
          <button disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
          {err && <span style={{ color: "red" }}>{err}</span>}
          {success && <span style={{ color: "green" }}>Registration successful!</span>}
        </form>
        <p>
          You already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

// Login component
const Login = () => {
  const [email, setEmail] = useState("Deepika23@gmail.com");
  const [password, setPassword] = useState("Deepika@1");
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
      } else {
        setErr("Incorrect email or password.");
      }
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">InstantChat</span>
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
          <button>Sign in</button>
          {err && <span style={{ color: "red" }}>{err}</span>}
        </form>
        <p>
          You don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};



// Home component
const Home = () => {
  return (
    <div className="home">
      <div className="container">
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
};

// App component
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
