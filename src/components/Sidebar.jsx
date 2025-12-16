import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Image as ImageIcon,
  FileText,
  BookMarked,
  LogOut,
  User,
  Home,
  Settings as SettingsIcon,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/firebase";

const Sidebar = () => {
  const location = useLocation();
  const user = auth.currentUser;
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageSquare, label: "Chat with AI", path: "/chat" },
    { icon: ImageIcon, label: "Image Generation", path: "/image-generation" },
    { icon: FileText, label: "Document Analysis", path: "/document-analysis" },
    { icon: Database, label: "Document Mining", path: "/document-mining" },
    { icon: BookMarked, label: "Saved Chats", path: "/saved-chats" },
    { icon: SettingsIcon, label: "Settings", path: "/settings" },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="
        relative h-screen
        bg-slate-950
        border-r border-indigo-700/40
        shadow-xl shadow-indigo-900/50
        flex flex-col
      "
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-6
          bg-gradient-to-br from-indigo-600 to-blue-600
          text-slate-900
          p-1.5 rounded-full
          shadow-lg shadow-indigo-700/50
          hover:scale-105 transition
        "
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* User Section */}
      <div className="flex items-center gap-3 p-4">
        <div className="
          w-10 h-10 rounded-full
          bg-gradient-to-br from-indigo-600 to-blue-600
          flex items-center justify-center
        ">
          <User className="w-5 h-5 text-slate-900" />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-medium text-indigo-200 truncate">
              {user ? user.email : "Guest User"}
            </p>
            <p className="text-xs text-indigo-400">AI Workspace</p>
          </div>
        )}
      </div>

      <Separator className="bg-indigo-700/40 my-2" />

      {/* Menu */}
      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  flex items-center gap-3
                  px-3 py-2 rounded-xl
                  transition-all
                  ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 shadow-inner"
                      : "text-indigo-400 hover:bg-indigo-800/30"
                  }
                `}
              >
                <item.icon className="w-5 h-5 shrink-0" />

                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-indigo-700/40 my-2" />

      {/* Logout */}
      <Button
        variant="ghost"
        onClick={() => auth.signOut()}
        className="
          mx-2 mb-4
          flex items-center gap-3
          text-indigo-400
          hover:bg-red-500/20 hover:text-red-400
        "
      >
        <LogOut className="w-5 h-5" />
        {!collapsed && <span>Logout</span>}
      </Button>
    </motion.aside>
  );
};

export default Sidebar;
