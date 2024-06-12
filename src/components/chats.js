import React, { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../context/authContext";
import { db } from "../firebase";
import { ChatContext } from "../context/chatContext";
import { PageContext } from "../context/pageContext";


function Chats() {
  const [chats, setChats] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const {pageState ,handlePageChange}= useContext(PageContext)


  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!currentUser || !currentUser.uid) return;

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
      }
    };

    fetchChats();
  }, [currentUser]);

  const handleSelect = (user) => {
    dispatch({ type: "CHANGE_USER", payload: user });
    handlePageChange()

  };

  const getMessageSentTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return date.toLocaleString("en-US", options);
  };

  const getLastMessageDisplay = (lastMessage) => {
    if (!lastMessage) return "";
    if (lastMessage.messageType === "image") {
      return <img src={lastMessage.img} alt="Last message image" className="lastMessageImage" />;
    }
    if (lastMessage.messageType === "attachment") return "Attachment";
    return lastMessage.text || "No message";
  };

  return (
    <div className="chats">
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map(([key, chat]) => (
          <div
            className="userChat"
            key={key}
            onClick={() => handleSelect(chat.userInfo)}
          >
            <img src={chat.userInfo.photoURL} alt="User Avatar" />
            <div className="userChatInfo">
              <span style={{ fontSize: "18px", fontWeight: "500" }}>
                {chat.userInfo.displayName}
              </span>
              <div className="TimeMessage">
                <div className="message">{getLastMessageDisplay(chat.lastMessage)}</div>
                <p className="time">{getMessageSentTime(chat.date)}</p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Chats;
