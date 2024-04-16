import React, { useState, useContext } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import Card from "react-bootstrap/Card";
import { AuthContext } from "../context/authContext";
import { ChatContext } from "../context/chatContext";
import {
  Timestamp,
  arrayUnion,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function Input() {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    // Check if both text and image are empty
    if (!text.trim() && !img) {
      setError("Cannot send empty message");
      return;
    }

    try {
      // Clear previous error
      setError("");
      setUploading(true); // Set uploading status to true

      if (img) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, img);

        uploadTask.on(
          (error) => {
            console.error("Error uploading image:", error);
            setUploading(false); // Reset uploading status
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateMessages(downloadURL);
          }
        );
      } else {
        await updateMessages(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const updateMessages = async (imageURL) => {
    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion({
        id: uuid(),
        text,
        senderId: currentUser.uid,
        date: Timestamp.now(),
        img: imageURL,
      }),
    });

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

    setText("");
    setImg(null);
    setUploading(false);
  };

  return (
    <div className="inputclass">
      <input
        type="text"
        placeholder="Type something..."
        className="input-enter"
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <div className="send">
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={(e) => setImg(e.target.files[0])}
        />
        <label htmlFor="file">
          <img src={Img} alt="" className="send-img" />
        </label>
        <img src={Attach} alt="" className="document-upload" />
        
        <button onClick={handleSend} className="send-button">
          {uploading ? "Uploading..." : "Send"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Input;
