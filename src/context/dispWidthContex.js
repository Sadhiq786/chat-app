// dispWidthContext.js
import { createContext, useEffect, useState } from "react";

export const DispWidthContext = createContext();

export const DispWidthContextProvider = ({ children }) => {
  const [displayWidth, setDisplayWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setDisplayWidth(newWidth);
    };

    window.addEventListener('resize', handleResize);

    // Immediately update width on component mount
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <DispWidthContext.Provider value={{ displayWidth }}>
      {children}
    </DispWidthContext.Provider>
  );
};
