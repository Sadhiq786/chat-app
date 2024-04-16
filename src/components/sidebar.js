import React from "react";
import NavBar from "./navBar";
import SearchBar from "./search";
import Chats from "./chats";
import "../../src/style.css";
function Sidebar() {
  return (
    <div className="sidebar">
      <NavBar />
      <SearchBar />
      <Chats />
    </div>
  );
}
export default Sidebar;
