import React, { useContext, useState } from "react";
import { FaArrowLeft, FaEllipsisV } from "react-icons/fa";
import Messages from "./messages";
import Input from "./input";
import { ChatContext } from "../context/chatContext";
import { AuthContext } from "../context/authContext";
import { updateDoc, deleteField, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { DispWidthContext } from '../context/dispWidthContex';
import { PageContext } from '../context/pageContext';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const { displayWidth } = useContext(DispWidthContext);
  const { handlePageChange } = useContext(PageContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState([]);

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
      setDropdownOpen(false);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const openLightbox = (src) => {
    setLightboxSlides([{ src }]);
    setLightboxOpen(true);
  };

  return (
    <div className="chat">
      <div className="chatInfo">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {displayWidth < 499 && <FaArrowLeft className='arrow' onClick={handlePageChange} />}
          <img
            src={data.user?.photoURL}
            alt=""
            onClick={() => openLightbox(data.user?.photoURL)}
            style={{ cursor: "pointer" }}
          />
          <span style={{ textAlign: "center" }}>{data.user?.displayName}</span>
        </div>
        <div className="chatIcons">
          <FaEllipsisV className="dropdown-icon" onClick={toggleDropdown} />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleClearChat}>Clear chat</button>
            </div>
          )}
        </div>
      </div>
      <Messages />
      <Input />
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
      />
    </div>
  );
};

export default Chat;
