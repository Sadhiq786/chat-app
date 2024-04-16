import React, { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../context/authContext";
import { db } from "../firebase";
import { ChatContext } from "../context/chatContext";
import Card from "react-bootstrap/Card";


function Chats() {
  const [chats, setChats] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!currentUser || !currentUser.uid) return; // Ensure currentUser is available

        const docSnapshot = await doc(db, "userChats", currentUser.uid);
        const unsubscribe = onSnapshot(docSnapshot, (doc) => {
          if (doc.exists()) {
            setChats(doc.data());
          } else {
            setChats([]);
          }
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching chats:", error);
        // Handle error gracefully, e.g., display an error message
      }
    };

    fetchChats();
  }, [currentUser]); // Removed currentUser.uid from dependency array since currentUser object reference changes might be important

  const handleSelect = (user) => {
    dispatch({ type: "CHANGE_USER", payload: user });
  };

  const getMessageSentTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate(); 
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map(([key, chat]) => (
        <div
          className="userChat"
          key={key}
          onClick={() => handleSelect(chat.userInfo)}
        >
          <img
            src={chat.userInfo.photoURL}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
            alt="User Avatar"
          />
          <div className="userChatInfo">
            <span style={{ fontSize: "18px", fontWeight: "500" }}>
              {chat.userInfo.displayName}
            </span>
            <div className="TimeMessage">
              <p
                style={{
                  fontSize: "14px",
                  color: "lightgray",
                  marginTop: "0px",
                  overflow: "hidden",
                }}
              >
                {chat.lastMessage?.text}
              </p>
              <p className='time'>{getMessageSentTime(chat.date)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Chats;




