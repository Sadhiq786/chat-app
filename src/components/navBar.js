import React, { useContext, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/authContext";
import { FaEllipsisV } from "react-icons/fa"; // Import the ellipsis icon
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function NavBar() {
  const { currentUser } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  return (
    <div className="navbar">
      <span className="logo">Whatsapp</span>
      <div className="user">
        <img
          src={currentUser.photoURL}
          alt="User"
          onClick={openLightbox}
          style={{ cursor: "pointer" }}
          title="View profile picture"
        />
        <div className={`dropdown ${dropdownOpen ? "open" : ""}`}>
          <FaEllipsisV className="dropdown-icon" onClick={toggleDropdown} />
          <div className="dropdown-menu">
            <span>{currentUser.displayName}</span>
            <button onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </div>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: currentUser.photoURL }]}
      />
    </div>
  );
}

export default NavBar;
