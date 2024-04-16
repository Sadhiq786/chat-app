import React, { useContext } from "react";
import Cam from "../img/videocam.png";
import Add from "../img/person.png";
import More from "../img/more.png";
import Messages from "./messages";
import Input from "./input";
import { ChatContext } from "../context/chatContext";

function Chat() {
  const { data } = useContext(ChatContext);
  //console.log("User data:", data); // Debugging statement

  const displayName = data.user?.displayName || "No Name";

  return (
    <div className="chat">
      <div className="chatInfo">
        {data.user.photoURL && (
          <img src={data.user.photoURL} alt="User" className="profilepic" />
        )}

        <span className="displayname">{data.user?.displayName}</span>
        <div className="chatIcons">
          <img src={Cam} alt="" className="image" />
          <img src={Add} alt="" className="image" />
          <img src={More} alt="" className="image" />
        </div>
      </div>
      <Messages />
      <Input />
    </div>
  );
}

export default Chat;
