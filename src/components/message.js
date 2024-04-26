import React, { useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { ChatContext } from "../context/chatContext";
import { FaFile } from "react-icons/fa"; // Import a file icon for documents

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

  if (!message.text && !message.img && !message.attachment) {
    return null;
  }

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
      <div className="messageContent" style={{ marginTop: "10px" }}>
        {message.text && <p>{message.text}</p>}
        {message.img && <img src={message.img} alt="" />}
        {message.attachment && (
          <div className="attachment">
            {message.attachment.includes(".jpg") ||
            message.attachment.includes(".jpeg") ||
            message.attachment.includes(".png") ||
            message.attachment.includes(".gif") ? (
              <img src={message.attachment} alt="" />
            ) : (
              <a href={message.attachment} target="_blank" rel="noreferrer">
                <FaFile />
                {`Attachment (${message.attachment
                  .split(".")
                  .pop()
                  .toUpperCase()})`}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
