import React, { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/authContext";

function NavBar() {
  const {currentUser} = useContext(AuthContext);
 

  return (
    <div className="navbar">
      <span className="logo1">
        Chat App
      </span>
      <div className="user">
        <img src={currentUser.photoURL} alt="User" className="img" />
        <span>{currentUser.displayName}</span>
        <button
          onClick={()=>signOut(auth)}
          className="button1"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default NavBar;
