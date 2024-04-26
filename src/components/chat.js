import React, { useContext } from "react";
import Cam from "../img/videocam.png";
import Add from "../img/person.png";
import More from "../img/more.png";
import Messages from "./messages";
import Input from "./input";
import { ChatContext } from "../context/chatContext";
import { Dropdown } from "react-bootstrap";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const handleClearChat = async () => {
    console.log("delete");
    try {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: [], // Clear all messages for this chat
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
          {/* <img src={More} alt=''/> */}
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
