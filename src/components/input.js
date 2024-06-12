import React, { useContext, useState, useRef, useEffect } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import Send from "../img/send-regular-24.png";
import { AuthContext } from "../context/authContext";
import { ChatContext } from "../context/chatContext";
import { v4 as uuid } from "uuid";
import { Timestamp, arrayUnion, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { DispWidthContext } from "../context/dispWidthContex";
import { PageContext } from "../context/pageContext";
import { Link } from "react-router-dom";

const InputPanel = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const { displayWidth } = useContext(DispWidthContext);
  const { pageState, handlePageChange } = useContext(PageContext);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Code for any additional side effects
  }, []);

  const handleSend = async () => {
    if (!text.trim() && !img && !file) {
      setError("Cannot send empty messages");
      return;
    }

    setError("");
    const messageId = uuid();
    const newMessage = {
      id: messageId,
      text,
      senderId: currentUser.uid,
      date: Timestamp.now(),
    };

    setUploading(true);
    let uploadPromise = Promise.resolve();

    if (img) {
      const storageRef = ref(storage, `images/${uuid()}`);
      uploadPromise = uploadBytesResumable(storageRef, img).then(snapshot =>
        getDownloadURL(snapshot.ref).then(downloadURL => {
          newMessage.img = downloadURL;
        })
      );
    } else if (file) {
      const storageRef = ref(storage, `files/${uuid()}`);
      uploadPromise = uploadBytesResumable(storageRef, file).then(snapshot =>
        getDownloadURL(snapshot.ref).then(downloadURL => {
          newMessage.attachment = downloadURL;
        })
      );
    }

    try {
      await uploadPromise;
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion(newMessage),
      });

      const updateUserChat = async (userId) => {
        await updateDoc(doc(db, "userChats", userId), {
          [`${data.chatId}.lastMessage`]: { text: newMessage.text || "Attachment" },
          [`${data.chatId}.date`]: serverTimestamp(),
        });
      };

      await Promise.all([updateUserChat(currentUser.uid), updateUserChat(data.user.uid)]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setText("");
      setImg(null);
      setFile(null);
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (error) setError("");
    setIsTyping(!!e.target.value.trim());
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setImg(null); // Ensure img is cleared when a file is selected
    }
    if (error) setError("");
    setIsTyping(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      setFile(null); // Ensure file is cleared when an image is selected
    }
    if (error) setError("");
    setIsTyping(false);
  };

  return (
    <div className="input">
      {img && (
        <div className="preview">
          <img src={URL.createObjectURL(img)} alt="Image Preview" />
        </div>
      )}
      {file && (
        <div className="preview">
          <p>{file.name}</p>
        </div>
      )}
      <input
        type="text"
        placeholder="Type something..."
        onChange={handleInputChange}
        value={text}
        onKeyDown={handleKeyDown}
        disabled={uploading || !!img || !!file} // Disable when uploading or img/file is selected
      />
      <div className="send">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={uploading || isTyping}
        />
        <input
          type="file"
          accept="image/*"
          ref={attachmentInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
          disabled={uploading || isTyping}
        />
        <label htmlFor="file" onClick={() => attachmentInputRef.current.click()}>
          <img src={Img} alt="Upload Image" />
        </label>
        <label htmlFor="file" onClick={() => fileInputRef.current.click()}>
          <img src={Attach} alt="Upload File" />
        </label>
        {(text.trim() || img || file) && (
          displayWidth <= 768 ? (
            // If the display width is less than or equal to 900px (mobile/tablet view)
            <img src={Send} className="send-icon" onClick={handleSend} />
          ) : (
            // If the display width is greater than 900px (desktop view)
            <button onClick={handleSend} disabled={uploading}>
              {uploading ? "Sending..." : "Send"}
            </button>
          )
        )}
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default InputPanel;
