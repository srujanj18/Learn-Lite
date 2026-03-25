import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare,
  Image as ImageIcon,
  FileText,
  BookMarked,
  LogOut,
  Home,
  Settings as SettingsIcon,
  Database,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/firebase";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: ImageIcon, label: "Images", path: "/image-generation" },
  { icon: FileText, label: "Documents", path: "/document-analysis" },
  { icon: Database, label: "Data", path: "/document-mining" },
  { icon: BookMarked, label: "Saved", path: "/saved-chats" },
  { icon: SettingsIcon, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();
  const user = auth.currentUser;

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="content-card panel">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(255,80,0,0.12)] text-[#FF8C42]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">LearnLite</p>
            <p className="truncate text-sm text-[rgba(237,237,237,0.58)]">{user?.displayName || user?.email || "Guest User"}</p>
          </div>
        </div>
      </div>

      <nav className="content-card panel flex-1">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(237,237,237,0.4)]">Navigation</p>
        </div>
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`simple-nav-link ${active ? "active" : ""}`}>
                <item.icon size={18} className={active ? "text-[#FF8C42]" : "text-[rgba(255,140,66,0.8)]"} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <button onClick={() => auth.signOut()} className="btn-primary w-full">
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default Sidebar;
