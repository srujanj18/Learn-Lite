import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";

const Layout = () => {
  return (
    <div
      className="
        flex h-screen w-full
        bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950
        text-indigo-200
      "
    >
      {/* Sidebar */}
      <div className="relative">
        <Sidebar />

        {/* Glow Divider */}
        <div
          className="
            absolute top-0 right-0 h-full w-[1px]
            bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent
          "
        />
      </div>

      {/* Main Content */}
      <main
        className="
          flex-1 overflow-y-auto
          px-6 py-6
          scrollbar-thin
          scrollbar-thumb-indigo-700/50
          scrollbar-track-transparent
        "
      >
        <Outlet />
      </main>

      {/* Toasts */}
      <Toaster />
    </div>
  );
};

export default Layout;
