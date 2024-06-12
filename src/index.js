import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContextProvider } from "./context/authContext";
import { ChatContextProvider } from "./context/chatContext";
import { DispWidthContextProvider } from './context/dispWidthContex';
import { PageContextProvider } from './context/pageContext';



const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <PageContextProvider>
    <DispWidthContextProvider>
      <AuthContextProvider>
        <ChatContextProvider>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </ChatContextProvider>
      </AuthContextProvider>
    </DispWidthContextProvider>
  </PageContextProvider>

);

reportWebVitals();
