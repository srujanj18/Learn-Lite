
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare, BookMarked, Image, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <MessageSquare className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="text-xl font-bold">LearnLite</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </Button>
            </Link>
            <Link to="/saved-chats">
              <Button
                variant={location.pathname === "/saved-chats" ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <BookMarked className="h-4 w-4" />
                <span>Saved</span>
              </Button>
            </Link>
            <Link to="/image-generation">
              <Button
                variant={location.pathname === "/image-generation" ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <Image className="h-4 w-4" />
                <span>Images</span>
              </Button>
            </Link>
            <Link to="/document-analysis">
              <Button
                variant={location.pathname === "/document-analysis" ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </Button>
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
