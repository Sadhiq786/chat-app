import React, { useState } from "react";
import Add from "../img/avatar.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

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
            setErr(
              "Error updating user profile or saving data to Firestore: " +
                error.message
            );
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
        <span className="logo">Chat App</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Display Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <input
            style={{ display: "none" }}
            className="fileInput"
            type="file"
            id="file"
            accept="image/*"
            required
          />
          <label htmlFor="file">
            <img src={Add} alt="" className="addimg" />
            <span>Add an avatar</span>
          </label>
          <button disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
          {err && <span style={{ color: "red" }}>{err}</span>}
          {success && (
            <span style={{ color: "green" }}>Registration successful!</span>
          )}
        </form>
        <p>
          You already have an account?<Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
