import React, { useContext, useState, useRef } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import { AuthContext } from "../context/authContext";
import { ChatContext } from "../context/chatContext";
import {
  Timestamp,
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import InputEmoji from "react-input-emoji";
import * as Icon from "react-bootstrap-icons";

function Inputpanel() {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null); // State for image
  const [attachment, setAttachment] = useState(null); // State for other attachments
  const [isSending, setIsSending] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const fileInputRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      // Check if text, img, or attachment is present
      if (text.trim() || attachment || img) {
        handleSend();
      }
    }
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if the selected file is an image
      if (file.type.startsWith("image/")) {
        // If it's an image, set it to img state
        setImg(file);
        // Reset attachment state
        setAttachment(null);
      } else {
        // If it's not an image, set it to attachment state
        setAttachment(file);
        // Reset img state
        setImg(null);
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleSend = async () => {
    if (isSending) return;

    setIsSending(true);

    if (!data.chatId) {
      alert("Please select a user to send the message");
      setIsSending(false);
      return;
    }

    try {
      let attachmentURL = null;
      if (attachment) {
        attachmentURL = await uploadAttachment(attachment);
      }

      // Determine if attachment is an image
      const isImage = img && img.type.startsWith("image/");

      await sendMessage({
        text,
        attachment: isImage ? null : attachmentURL,
        img: isImage ? img : null,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Please try again.");
    } finally {
      setIsSending(false);
      setText("");
      setAttachment(null);
      setImg(null);
    }
  };

  const uploadAttachment = async (file) => {
    try {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, file);

      const snapshot = await uploadTask;

      return getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  };

  const sendMessage = async ({ text, attachment, img }) => {
    try {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
          attachment,
          img: img ? URL.createObjectURL(img) : null, // Convert img to URL for preview
        }),
      });
      await updateLastMessage({ text });
      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Please try again.");
    }
  };

  const updateLastMessage = async ({ text }) => {
    try {
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
      await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating last message:", error);
      alert("Error updating last message. Please try again.");
    }
  };

  return (
    <div className="input">
      <InputEmoji
        value={text}
        onChange={setText}
        cleanOnEnter
        placeholder="Type a message..."
        onKeyDown={handleKeyDown}
      />
      <div className="send">
        <img src={Attach} onClick={handleAttachClick} alt="Attach" />
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <label htmlFor="file">
          <img src={Img} alt="Upload" />
        </label>
        <span>
          <Icon.SendFill
            onClick={handleSend}
            disabled={isSending}
            style={{ cursor: "pointer" }}
            title="Send"
          />
        </span>
      </div>
    </div>
  );
}

export default Inputpanel;
