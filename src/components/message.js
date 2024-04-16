import React, { useContext, useRef, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { ChatContext } from "../context/chatContext";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const getMessageSentTime = (timestamp) => {
    const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return date.toLocaleString("en-US", options);
  };

  if (!message.text && !message.img) {
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
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <span>{getMessageSentTime(message.date)}</span>{" "}
        {/* Display formatted message time */}
      </div>
      <div className="messageContent ">
        {message.text && <p className="p">{message.text}</p>}
        {message.img && (
          <img src={message.img} alt="" style={{ width: "50%" }} />
        )}
      </div>
    </div>
  );
};

export default Message;
