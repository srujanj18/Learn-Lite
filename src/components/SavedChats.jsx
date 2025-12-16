import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Trash2,
  Clock,
  MessageCircle,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSavedChats, deleteChat, deleteAllChats } from "@/lib/chatStorage";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SavedChats = () => {
  const [savedChats, setSavedChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await getSavedChats();
        setSavedChats(chats);
      } catch {
        const localChats = JSON.parse(
          localStorage.getItem("savedChats") || "[]"
        );
        setSavedChats(localChats);
      }
    };
    loadChats();
  }, []);

  const handleDelete = (id) => {
    deleteChat(id);
    setSavedChats(getSavedChats());
  };

  const handleOpen = (chat) => {
    navigate("/chat", { state: { savedChat: chat } });
  };

  const handleDeleteAll = () => {
    deleteAllChats();
    setSavedChats([]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-700/40">
            <FolderOpen className="h-6 w-6 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Saved Conversations
          </h1>
        </div>

        {savedChats.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="shadow-md shadow-red-700/30"
              >
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all saved chats?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all saved conversations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Empty State */}
      {savedChats.length === 0 && (
        <div className="text-center py-20 text-indigo-400">
          <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No saved chats yet</p>
          <p className="text-sm text-indigo-500">
            Your saved conversations will appear here
          </p>
        </div>
      )}

      {/* Chat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedChats.map((chat) => (
          <motion.div
            key={chat.sessionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="
              rounded-3xl p-6
              bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950
              border border-indigo-700/40
              shadow-xl shadow-indigo-900/40
              transition-all
            "
          >
            {/* Card Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold text-indigo-200">
                  Chat Session
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-400">
                <Clock className="h-3 w-3" />
                {format(new Date(chat.timestamp), "dd MMM yyyy • HH:mm")}
              </div>
            </div>

            {/* Preview */}
            <ScrollArea className="h-28 mb-5 pr-2">
              <div className="space-y-2">
                {chat.messages?.slice(-3).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        max-w-[80%] px-3 py-2 rounded-xl text-sm
                        ${
                          msg.sender === "user"
                            ? "bg-indigo-600 text-slate-900"
                            : "bg-slate-800 text-indigo-200 border border-indigo-700/40"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-3 w-3 opacity-60" />
                        <span className="truncate">{msg.text}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button
                onClick={() => handleOpen(chat)}
                className="
                  bg-gradient-to-r from-indigo-600 to-blue-600
                  hover:from-indigo-500 hover:to-blue-500
                  text-slate-900 shadow-md shadow-indigo-700/40
                "
              >
                Open Chat
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(chat.sessionId)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SavedChats;
