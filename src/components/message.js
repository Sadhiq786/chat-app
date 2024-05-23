import React, { useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { ChatContext } from "../context/chatContext";
import { FaFile } from "react-icons/fa";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const getMessageSentTime = (timestamp) => {
    const date = timestamp.toDate();
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return date.toLocaleString("en-US", options);
  };

  // Determine the message type
  const messageType = () => {
    if (message.text) return "text";
    if (message.img) return "image";
    if (message.attachment) return "attachment";
    return "text"; // Default to text if no recognizable type
  };

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "second"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL
              : data.user.photoURL
          }
          alt=""
        />
        <span>{getMessageSentTime(message.date)}</span>
      </div>
      <div className="messageContent">
        {messageType() === "text" && <p>{message.text}</p>}
        {messageType() === "image" && <img src={message.img} alt="Image" />}
        {messageType() === "attachment" && (
          <div className="attachment">
            <FaFile />
            <a href={message.attachment} target="_blank" rel="noopener noreferrer">
              View File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
