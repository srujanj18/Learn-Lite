import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Trash2, Clock, MessageCircle, FolderOpen, Sparkles } from "lucide-react";
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
import { useToast } from "@/components/ui/ToastContext";

const SavedChats = () => {
  const [savedChats, setSavedChats] = useState([]);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await getSavedChats();
        setSavedChats(chats);
      } catch {
        const localChats = JSON.parse(localStorage.getItem("savedChats") || "[]");
        setSavedChats(localChats);
      }
    };
    loadChats();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteChat(id);
      const updatedChats = await getSavedChats();
      setSavedChats(updatedChats);
      showSuccess("Chat deleted successfully");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      showError("Failed to delete chat. Please try again.");
    }
  };

  const handleOpen = (chat) => {
    navigate("/chat", { state: { savedChat: chat } });
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllChats();
      setSavedChats([]);
      showSuccess("All chats deleted successfully");
    } catch (error) {
      console.error("Failed to delete all chats:", error);
      showError("Failed to delete all chats. Please try again.");
    }
  };

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="page-header glow-box lava-border">
        <div className="page-header-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={14} />
              Saved Sessions
            </p>
            <div>
              <h1 className="hero-title">
                Reopen your <span>best conversations</span>
              </h1>
              <p className="hero-text mt-4">
                Review previous chat sessions, inspect recent message context, and jump straight back into the main AI console.
              </p>
            </div>
          </div>

          <div className="hero-stats">
            <div className="metric-card">
              <p className="metric-kicker">Saved Chats</p>
              <p className="metric-value">{savedChats.length}</p>
              <p className="metric-subtext">Stored sessions available to reopen or clean up.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="content-card panel">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Conversation library</h2>
            <p className="section-copy mt-2">Every saved session keeps a short preview so you can identify the right thread quickly.</p>
          </div>

          {savedChats.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete All</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all saved chats?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently remove every stored conversation from your workspace.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll}>Delete All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {savedChats.length === 0 ? (
          <div className="empty-state rounded-[24px] border border-[rgba(255,120,50,0.12)] bg-[rgba(255,255,255,0.02)]">
            <FolderOpen className="h-10 w-10 text-[#FF8C42]" />
            <p className="text-lg font-medium text-white">No saved chats yet</p>
            <p className="text-sm text-[rgba(237,237,237,0.62)]">Saved conversations will appear here once you store them from the AI console.</p>
          </div>
        ) : (
          <div className="card-grid">
            {savedChats.map((chat, index) => (
              <motion.div
                key={`${chat.sessionId}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="content-card panel"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(255,80,0,0.08)] text-[#FF8C42]">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Chat Session</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[rgba(237,237,237,0.5)]">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(chat.timestamp), "dd MMM yyyy • HH:mm")}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(chat.sessionId)} className="rounded-xl border border-[rgba(255,120,50,0.16)] p-2 text-[rgba(237,237,237,0.55)] transition hover:text-[#FF8C42]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <ScrollArea className="h-32 rounded-[20px] border border-[rgba(255,120,50,0.12)] bg-[rgba(255,255,255,0.02)] p-3">
                  <div className="space-y-2 pr-2">
                    {chat.messages?.slice(-3).map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-3 py-2 text-sm ${msg.sender === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3 w-3 opacity-70" />
                            <span className="truncate">{msg.text}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="pill">{chat.messages?.length || 0} messages</span>
                  <Button onClick={() => handleOpen(chat)}>Open Chat</Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SavedChats;
