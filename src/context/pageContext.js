import { createContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";
export const PageContext = createContext();
export const PageContextProvider = ({ children }) => {
  const [pageState, changePagestate] = useState(true)

  const handlePageChange = () => {
    pageState ? changePagestate(false) : changePagestate(true)
  };

  console.log(pageState);
  return (
    <PageContext.Provider value={{ pageState, handlePageChange }}>
      {children}
    </PageContext.Provider>
  )
}