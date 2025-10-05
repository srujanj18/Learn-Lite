
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Trash2, Clock, MessageCircle } from "lucide-react";
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
      } catch (error) {
        console.error('Error loading chats:', error);
        // If there's an error, try to load from localStorage as fallback
        const localChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
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
    navigate('/chat', { state: { savedChat: chat } });
  };

  const handleDeleteAll = () => {
    deleteAllChats();
    setSavedChats([]);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Saved Chats</h1>
        {savedChats.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your saved chats.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>Delete All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <div className="space-y-4">
        {savedChats.map((chat) => (
          <motion.div
            key={chat.sessionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h3 className="font-medium">Chat Session</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(chat.timestamp), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>
            
            <ScrollArea className="h-24 mb-4">
              <div className="space-y-2">
                {chat.messages?.slice(-3).map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 ${message.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    <MessageCircle className={`h-4 w-4 ${message.sender === 'user' ? 'text-blue-500' : 'text-gray-500'}`} />
                    <p className="text-sm truncate max-w-[300px]">{message.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleOpen(chat)}
                className="bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 dark:from-gray-800 dark:to-gray-700"
              >
                Open Chat
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(chat.sessionId)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
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
