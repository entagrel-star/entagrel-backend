import React from "react";
import Header from "./Header";
import Footer from "./Footer";

import { Outlet } from "react-router-dom";
const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children ?? <Outlet />}</main>
      <Footer />
    </>
  );
};

export default Layout;
