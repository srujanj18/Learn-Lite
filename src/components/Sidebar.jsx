
import React from "react";
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
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/firebase";

const Sidebar = () => {
  const location = useLocation();
  const user = auth.currentUser;

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
    <div className="fixed left-0 top-0 h-screen w-[200px] bg-background border-r p-4 flex flex-col">
      {/* User Profile Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user ? user.email : 'Guest User'}
          </p>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <Separator className="my-4" />
      <Button
        variant="ghost"
        className="w-full justify-start gap-3"
        onClick={() => auth.signOut()}
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </Button>
    </div>
  );
};

export default Sidebar;
