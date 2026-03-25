import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";

const Layout = () => (
  <div className="app-shell">
    <aside className="app-sidebar">
      <Sidebar />
    </aside>

    <main className="app-main">
      <div className="page-hud">
        <Outlet />
      </div>
    </main>

    <Toaster />
  </div>
);

export default Layout;
