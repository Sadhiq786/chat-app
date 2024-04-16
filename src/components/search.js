import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/authContext";

const SearchBar = () => {
  const [username, setUsername] = useState(""); // State for the input value
  const [user, setUser] = useState(null); // State for the user found
  const [error, setError] = useState(""); // State for error handling
  const { currentUser } = useContext(AuthContext); // Access current user from context

  // Function to search for a user based on username
  const handleSearch = async () => {
    // Check if the username is empty
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);
      // Check if any user found
      if (querySnapshot.empty) {
        setError("User not found.");
        setUser(null);
      } else {
        querySnapshot.forEach((doc) => {
          setUser(doc.data()); // Set found user to state
          setError(""); // Reset error state if user is found
        });
      }
    } catch (err) {
      setError("An error occurred while searching for the user.");
      console.error("Error searching for user:", err);
    }
  };

  // Function to handle key press events, triggering search when 'Enter' is pressed
  const handleKey = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Function to handle selection of a user
  const handleSelect = async () => {
    if (!user || !user.uid) {
      console.error(
        "No user selected or user object does not have UID property."
      );
      return;
    }

    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    try {
      const chatDocRef = doc(db, "chats", combinedId);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        await setDoc(chatDocRef, { messages: [] });

        await Promise.all([
          updateDoc(doc(db, "userChats", currentUser.uid), {
            [combinedId + ".userInfo"]: {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
            [combinedId + ".date"]: serverTimestamp(),
          }),
          updateDoc(doc(db, "userChats", user.uid), {
            [combinedId + ".userInfo"]: {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            },
            [combinedId + ".date"]: serverTimestamp(),
          }),
        ]);
      }
    } catch (error) {
      setError("An error occurred while initiating the chat.");
      console.error("Error initiating the chat:", error);
    } finally {
      // Reset user state and input value after selection
      setUser(null);
      setUsername("");
    }
  };

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKey}
          value={username}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            outline: "none",
          }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <span style={{ color: "red" }}>{error}</span>}
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img
            src={user.photoURL}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
            alt="User profile"
          />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
