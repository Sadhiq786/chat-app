import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import Add from "../img/avatar.png";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";

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
            const displayNameLowercase = displayName.toLowerCase();

            await updateProfile(user, { displayName, photoURL: downloadURL });
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              displayName,
              displayNameLowercase,
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
        <span className="logo">Connectify</span>
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

export default Register;
