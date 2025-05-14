"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface MobileContextType {
  isMobileView: boolean;
}

const MobileContext = createContext<MobileContextType>({ isMobileView: false });

export const useMobileView = () => useContext(MobileContext);

export const MobileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  
  useEffect(() => {
    // Function to check viewport size
    const checkViewport = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Check on initial render
    checkViewport();
    
    // Set up resize listener
    window.addEventListener('resize', checkViewport);
    
    // Clean up
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return (
    <MobileContext.Provider value={{ isMobileView }}>
      {children}
    </MobileContext.Provider>
  );
};
