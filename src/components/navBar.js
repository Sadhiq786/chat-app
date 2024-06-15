import React, { useContext, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/authContext";
import { FaEllipsisV } from "react-icons/fa"; // Import the ellipsis icon

function NavBar() {
  const { currentUser } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="navbar">
      <span className="logo">Connectify</span>
      <div className="user">
        <img src={currentUser.photoURL} alt="User" />
        <div className={`dropdown ${dropdownOpen ? "open" : ""}`}>
          <FaEllipsisV className="dropdown-icon" onClick={toggleDropdown} />
          <div className="dropdown-menu">
            <span>{currentUser.displayName}</span>
            <button onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
