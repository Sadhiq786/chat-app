import React, { useContext } from "react";
import Sidebar from "../components/sidebar";
import Chat from "../components/chat";
import { DispWidthContext } from "../context/dispWidthContex";
import { PageContext } from "../context/pageContext";


function Home() {
  const {displayWidth}=useContext(DispWidthContext)
  const {pageState} = useContext(PageContext)
  return (
    <div className="home">
      <div className="container">
        {
          displayWidth <500 ? 
          pageState ?<Sidebar/> : <Chat/>
          :<>
          <Sidebar/>
          <Chat/>
          </>
        }
      </div>
    </div>
  );
}

export default Home;