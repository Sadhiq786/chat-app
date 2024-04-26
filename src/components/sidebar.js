import React from "react";
import NavBar from "./navBar";
import SearchBar from "./search";
import Chats from "./chats";
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
