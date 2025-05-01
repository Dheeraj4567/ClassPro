"use client";

import React from "react";
import dynamic from "next/dynamic";

// Using dynamic import with ssr disabled (safely inside a client component)
const AnalyticsNavBar = dynamic(() => import("./AnalyticsNavBar"), {
  ssr: false
});

const NavBarWrapper: React.FC = () => {
  return <AnalyticsNavBar />;
};

export default NavBarWrapper;