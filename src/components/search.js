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
    if (!username) {
      setErr(true);
      return;
    }

    const lowercaseUsername = username.toLowerCase();

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
          setUser(doc.data());
        });
        setErr(false);
      }
    } catch (err) {
      setErr(true);
    }
  };

  const handleKey = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  const handleSelect = async () => {
    if (err) {
      setErr(false);
      setUsername("");
    }
    setIsInputFocused(!err);

    if (user && user.uid) {
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
        setErr(true);
        console.error("Error initiating the chat:", error);
      } finally {
        setUser(null);
        setUsername("");
      }
    }
  };

  return (
    <div className="search" onClick={() => setIsInputFocused(true)}>
      <div className="searchForm">
        {!err ? (
          <>
            <input
              type="text"
              placeholder="Search or Find a user"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              value={username}
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
            </span>
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
