import React from "react";
import Header from "./Header";
import Footer from "./Footer";

import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen bg-[#0f1219] flex flex-col">
      {/* your navbar / header */}
      <Header />

      <Outlet />

      <Footer />
      {/* your footer */}
    </div>
  );
}

export default Layout;
