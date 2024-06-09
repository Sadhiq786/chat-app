import React, { useContext } from "react";
import Cam from "../img/videocam.png";
import Add from "../img/person.png";
import More from "../img/more.png";
import { FaArrowLeft } from "react-icons/fa"; // Import the back icon
import Messages from "./messages";
import Input from "./input";
import { Dropdown } from "react-bootstrap";
import { ChatContext } from "../context/chatContext";
import { AuthContext } from "../context/authContext";
import { updateDoc, deleteField, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const Chat = () => {
  const { data, dispatch } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  const handleClearChat = async () => {
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

  const handleBack = () => {
    // Reset the chat state to clear the chat ID and user data
    dispatch({ type: "DELETE_CHAT" });
  };

  return (
    <div className="chat">
      <div className="chatInfo">
        <div className="backIcon" onClick={handleBack}>
          <FaArrowLeft />
        </div>
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