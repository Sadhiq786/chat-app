import React, { useContext } from "react";
import Cam from "../img/videocam.png";
import Add from "../img/person.png";
import More from "../img/more.png";
import Messages from "./messages";
import Input from "./input";
import { ChatContext } from "../context/chatContext";
import { Dropdown } from "react-bootstrap";
import { doc, updateDoc, deleteField, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/authContext"; // Import AuthContext to get currentUser


const Chat = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext); // Get currentUser from AuthContext

  const handleClearChat = async () => {
    console.log("delete");
    try {
      // Clear all messages for this chat
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: [],
      });

      // Update the user chat documents to remove the last message
      await updateDoc(doc(db, "userChats", data.user.uid), {
        [`${data.chatId}.lastMessage`]: deleteField(),
        [`${data.chatId}.date`]: serverTimestamp(),
      });
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [`${data.chatId}.lastMessage`]: deleteField(),
        [`${data.chatId}.date`]: serverTimestamp(),
      });

      console.log("Chat cleared successfully!");
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <div className="chat">
      <div className="chatInfo">
        <div className="chatIcon">
          {data.user.photoURL && (
            <img src={data.user.photoURL} alt="User" className="userImage" />
          )}
          {data.user?.displayName}
        </div>
        <div className="chatIcons">
          <img src={Cam} alt="" />
          <img src={Add} alt="" />
          <Dropdown data-bs-theme="dark">
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              <img src={More} alt="" />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleClearChat}>
                Clear chat
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <Messages />
      <Input />
    </div>
  );
};

export default Chat;
