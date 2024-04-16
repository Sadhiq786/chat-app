// import React, { useContext } from "react";
// import { Routes, Route, Navigate,BrowserRouter} from "react-router-dom";
// import Login from "./pages/login";
// import Register from "./pages/register";
// import Home from "./pages/home";
// import { AuthContext } from "./context/authContext";

// function App() {
//   const currentUser = useContext(AuthContext);
//   console.log("Current user:", currentUser);

//   // Check if currentUser is null before destructure
//   const user = currentUser;

//   const ProtectedRoute = ({ children }) => {
//     if (!user) {
//       console.log("User is not logged in");
//       return <Navigate to="/login" />;
//     }
//     return children;
//   };

//   return (
//     <BrowserRouter>

//     <Routes>
//       <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//     </Routes>
//     </BrowserRouter>

//   );
// }

// export default App;

import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import { AuthContext } from "./context/authContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const { currentUser } = useContext(AuthContext);
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
