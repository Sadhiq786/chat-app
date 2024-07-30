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
import InputEmoji from "react-input-emoji";
import * as Icon from 'react-bootstrap-icons';
import { Link } from "react-router-dom";
import pica from 'pica';

const InputPanel = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
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

  const handleSend = async () => {
    if (!text.trim() && !img && !file) {
      alert("Cannot send empty messages");
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
      const resizedImage = await resizeImageWithPica(img); // Resize image before uploading
      const storageRef = ref(storage, `images/${uuid()}`);
      uploadPromise = uploadBytesResumable(storageRef, resizedImage).then(snapshot =>
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
          [`${data.chatId}.lastMessage`]: { text: newMessage.text || "Photo" },
          [`${data.chatId}.date`]: serverTimestamp(),
        });
      };

      await Promise.all([updateUserChat(currentUser.uid), updateUserChat(data.user.uid)]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setImg(null);
      setImgPreview(null); // Clear image preview after sending
      setFile(null);
      setUploading(false);
    }
    setText("");
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
      setImgPreview(null); // Ensure image preview is cleared when a file is selected
    }
    if (error) setError("");
    setIsTyping(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      setImgPreview(URL.createObjectURL(file)); // Display image preview
      setFile(null); // Ensure file is cleared when an image is selected
    }
    if (error) setError("");
    setIsTyping(false);
  };

  const resizeImageWithPica = (file, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const picaInstance = pica();

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        picaInstance.resize(canvas, canvas)
          .then((result) => picaInstance.toBlob(result, file.type, 0.90))
          .then((blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          })
          .catch((error) => reject(error));
      };

      img.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="input">
      {imgPreview && (
        <div className="preview" 
            style={{ width: displayWidth <=768?'30px':"30px", 
                     height: displayWidth <=768?'30px':"30px", 
                     overflow: 'hidden', 
                     position:"absolute", 
                     top: displayWidth <=768?'93.5%':"94%", 
                     zIndex:"1000", 
                     left: displayWidth <=768?'8%':"5%" }}>
          <img src={imgPreview} alt="Image Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      {file && (
        <div className="preview">
          <p>{file.name}</p>
        </div>
      )}
      <InputEmoji
        value={text}
        onChange={setText}
        cleanOnEnter
        placeholder="Type a message..."
        onKeyDown={handleKeyDown}
        disabled={uploading || !!img || !!file}
        maxLength={displayWidth <= 768 ? 30 : 99}
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
        <label htmlFor="file">
          <img src={Attach} alt="Upload File" onClick={() => attachmentInputRef.current.click()} />
        </label>

        {(text.trim() || img || file) && (
          displayWidth <= 768 ? (
            // If the display width is less than or equal to 768px (mobile/tablet view)
            <img src={Send} className="send-icon" onClick={handleSend} />
          ) : (
            // If the display width is greater than 768px (desktop view)
            <label>
              <Icon.SendFill onClick={handleSend} style={{ rotate: "45deg" }} />
            </label>
          )
        )}
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default InputPanel;
