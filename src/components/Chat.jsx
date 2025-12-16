
import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, Image, Loader2, Copy, Check, Volume2, VolumeX, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getChatResponse } from "@/lib/gemini";
import { saveChat } from "@/lib/chatStorage";
import { useLocation } from "react-router-dom";
import { createWorker } from 'tesseract.js';

const Chat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState(location.state?.savedChat?.messages || []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState(Date.now());
// Remove this declaration since it's already declared below
  const [imageData, setImageData] = useState(null);
// Remove duplicate declaration since fileInputRef is already declared below
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [mutedMessages, setMutedMessages] = useState(new Set());
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [speechPosition, setSpeechPosition] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageText, setImageText] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  const speakText = (text, messageId) => {
    if (!text) return;
    
    // Process text to handle special characters
    const processedText = text.replace(/[^a-zA-Z0-9\s.,!?"']/g, ' ');

    // Create new utterance if none exists or if it's a different message
    if (!currentUtterance || currentUtterance.messageId !== messageId) {
      if (synth.speaking) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.messageId = messageId;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeechPosition(0);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
        setSpeechPosition(0);
      };
      
      utterance.onboundary = (event) => {
        setSpeechPosition(event.charIndex);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
        setSpeechPosition(0);
        toast({
          title: "Error",
          description: "Failed to play speech",
          variant: "destructive",
        });
      };

      setCurrentUtterance(utterance);

      if (speechEnabled && !mutedMessages.has(messageId)) {
        synth.speak(utterance);
      }
    } else if (speechEnabled && !mutedMessages.has(messageId)) {
      // Resume speech from last position
      const remainingText = processedText.slice(speechPosition);
      const resumeUtterance = new SpeechSynthesisUtterance(remainingText);
      resumeUtterance.messageId = messageId;
      synth.speak(resumeUtterance);
    }
  };

  const handleImageProcessing = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        setImageData({
          mimeType: file.type,
          data: base64Data
        });
        setSelectedImage(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const newMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
      image: selectedImage
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getChatResponse(input, imageData);
      const aiResponse = {
        id: Date.now() + 1,
        text: response,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      };

      // Clear image data after sending
      setSelectedImage(null);
      setImageData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      
      // Speak the AI response
      speakText(response, aiResponse.id);
      
      // Save chat after successful response
      saveChat({
        sessionId,
        messages: finalMessages,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new function
  const handleSaveChat = () => {
    if (messages.length === 0) {
      toast({
        title: "Error",
        description: "No chat to save",
        variant: "destructive",
      });
      return;
    }

    saveChat({
      sessionId,
      messages,
      timestamp: new Date().toISOString()
    });

    toast({
      title: "Success",
      description: "Chat saved successfully!",
    });

    // Reset for new session
    setMessages([]);
    setSessionId(Date.now());
  };

  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Error",
        description: "Your browser does not support voice input",
        variant: "destructive",
      });
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now",
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast({
        title: "Error",
        description: event.error,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const processImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingImage(true);
    setSelectedImage(URL.createObjectURL(file));

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setImageText(text);
      setInput(text);
      
      toast({
        title: "Success",
        description: "Text extracted from image",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to extract text from image",
        variant: "destructive",
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImageText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };
  const toggleMuteMessage = (message) => {
  const newMuted = new Set(mutedMessages);

  if (newMuted.has(message.id)) {
    newMuted.delete(message.id);
    setMutedMessages(newMuted);

    if (speechEnabled) {
      speakText(message.text, message.id);
    }
  } else {
    newMuted.add(message.id);
    setMutedMessages(newMuted);
    if (synth.speaking) {
      synth.cancel();
    }
  }
};

  return (
  <div className="mx-auto max-w-5xl h-full flex flex-col">
    {/* Top Toolbar */}
    <div className="flex justify-end gap-3 mb-4">
      <Button
        onClick={() => setSpeechEnabled(!speechEnabled)}
        className="
          bg-gradient-to-r from-indigo-600 to-blue-600
          hover:from-indigo-500 hover:to-blue-500
          text-slate-900 shadow-lg
        "
      >
        {speechEnabled ? <Volume2 /> : <VolumeX />}
      </Button>

      <Button
        onClick={handleSaveChat}
        disabled={messages.length === 0}
        className="
          bg-gradient-to-r from-indigo-600 to-blue-600
          hover:from-indigo-500 hover:to-blue-500
          text-slate-900 shadow-lg
        "
      >
        Save Chat
      </Button>
    </div>

    {/* Chat Area */}
    <div
      className="
        flex-1 overflow-y-auto
        rounded-2xl p-4
        bg-slate-950
        border border-indigo-700/40
        shadow-xl shadow-indigo-900/40
        space-y-6
      "
    >
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${
            message.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`
              max-w-[75%] p-4 rounded-2xl relative group
              ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-slate-900 rounded-br-none"
                  : "bg-slate-900 border border-indigo-700/40 text-indigo-200 rounded-bl-none"
              }
            `}
          >
            {message.image && (
              <img
                src={message.image}
                alt="Uploaded"
                className="rounded-lg mb-2 max-h-60"
              />
            )}

            <p className="whitespace-pre-wrap text-sm">
              {message.text}
            </p>

            {/* AI Message Actions */}
{message.sender === "ai" && (
  <div className="
    absolute -top-3 right-2
    opacity-0 group-hover:opacity-100
    transition flex gap-1
  ">
    <Button
      size="icon"
      variant="ghost"
      onClick={() => handleCopy(message.text, message.id)}
      className="bg-slate-800 hover:bg-slate-700"
    >
      {copiedId === message.id ? <Check /> : <Copy />}
    </Button>
  </div>
)}

            {/* Speech Controls */}
            {message.sender === "ai" && (
              <div className="  
                absolute -bottom-3 right-2
                opacity-0 group-hover:opacity-100
                transition flex gap-1 
              ">
                <Button
                  size="icon" 
                  variant="ghost"
                  onClick={() => toggleMuteMessage(message)}
                  className="bg-slate-800 hover:bg-slate-700"
                >
                  {mutedMessages.has(message.id) ? <VolumeX /> : <Volume2 />}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>


    {/* Input Section */}
    <div
      className="
        mt-4 p-3
        rounded-2xl
        bg-slate-950
        border border-indigo-700/40
        shadow-lg shadow-indigo-900/40
        flex items-center gap-3
      "
    >
      {/* Tools */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileSelect}
        accept="image/*"
        className="hidden"
      />

      <Button
        size="icon"
        onClick={handleImageUpload}
        disabled={isProcessingImage}
        className="bg-slate-900 hover:bg-slate-800"
      >
        {isProcessingImage ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Image />
        )}
      </Button>

      <Button
        size="icon"
        onClick={handleVoiceInput}
        disabled={isListening}
        className="bg-slate-900 hover:bg-slate-800"
      >
        {isListening ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Mic />
        )}
      </Button>

      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ask the AI anything..."
        className="
          flex-1 px-4 py-2 rounded-xl
          bg-slate-900 text-indigo-200
          border border-indigo-700/40
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />

      {/* Send */}
      <Button
        onClick={handleSend}
        disabled={isLoading}
        className="
          bg-gradient-to-r from-indigo-600 to-blue-600
          hover:from-indigo-500 hover:to-blue-500
          text-slate-900 shadow-lg
        "
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
      </Button>
    </div>
  </div>
);
};


export default Chat;
