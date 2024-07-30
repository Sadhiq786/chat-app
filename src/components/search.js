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
import * as Icon from "react-bootstrap-icons";

const SearchBar = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleSearch = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErr(true);
      return;
    }

    const lowercaseUsername = trimmedUsername.toLowerCase();

    const q = query(
      collection(db, "users"),
      where("displayNameLowercase", "==", lowercaseUsername)
    );

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setErr(true);
        setUser(null);
      } else {
        querySnapshot.forEach((doc) => {
          console.log("User found:", doc.data());
          setUser(doc.data());
        });
        setErr(false);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setErr(true);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    if (err) {
      setErr(false);
      setUsername("");
      return;
    }

    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Error initiating the chat:", err);
    }

    setUser(null);
    setUsername("");
  };

  return (
    <div className="search" onClick={() => setIsInputFocused(true)}>
      <div className="searchForm">
        {!err ? (
          <>
            <input
              type="search"
              placeholder="Search or Find a user"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              value={username}
              alt="Type Name and Press Enter"
            />
            {!isInputFocused && (
              <span>
                <Icon.Search />
              </span>
            )}
          </>
        ) : (
          <div className="errorContainer" onClick={handleSelect}>
            <span>
              <Icon.XCircleFill />
            </span>&nbsp;&nbsp;&nbsp;&nbsp;
            <span>User not found!</span>
          </div>
        )}
      </div>
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
