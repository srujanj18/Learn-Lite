
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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex justify-end mb-2 space-x-2">
        <Button
          onClick={() => setSpeechEnabled(!speechEnabled)}
          variant="outline"
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
        >
          {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <Button
          onClick={handleSaveChat}
          variant="outline"
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
          disabled={messages.length === 0}
        >
          Save Chat
        </Button>
      </div>
      <div className="mb-4 rounded-lg border bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/50 dark:to-purple-900/50 p-4 shadow-lg backdrop-blur-sm">
        <div className="min-h-[400px] max-h-[60vh] overflow-y-auto space-y-6 py-4 px-2">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                <span>{message.sender === "user" ? "You" : "AI Assistant"}</span>
                <span>•</span>
                <span>{message.timestamp}</span>
              </div>
              <div
                className={`max-w-[80%] rounded-lg p-4 shadow-lg relative group ${message.sender === "user" 
                  ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white rounded-tr-none" 
                  : "bg-gradient-to-r from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-tl-none backdrop-blur-sm"}`}
              >
                <div className="whitespace-pre-wrap">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded-lg mb-2"
                  />
                )}
                {message.text}
              </div>
                {message.sender === "ai" && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gray-200/20"
                      onClick={() => {
                        if (mutedMessages.has(message.id)) {
                          const newMutedMessages = new Set(mutedMessages);
                          newMutedMessages.delete(message.id);
                          setMutedMessages(newMutedMessages);
                          if (speechEnabled) {
                            speakText(message.text, message.id);
                          }
                        } else {
                          const newMutedMessages = new Set(mutedMessages);
                          newMutedMessages.add(message.id);
                          setMutedMessages(newMutedMessages);
                          if (synth.speaking) {
                            synth.cancel();
                          }
                        }
                      }}
                      disabled={false}
                    >
                      {mutedMessages.has(message.id) ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gray-200/20"
                      onClick={() => handleCopy(message.text, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {selectedImage && (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img src={selectedImage} alt="Selected" className="max-h-60 w-full object-contain" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={clearSelectedImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleImageUpload}
            className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 dark:from-gray-800 dark:to-gray-700"
            disabled={isProcessingImage}
          >
            {isProcessingImage ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Image className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 dark:from-gray-800 dark:to-gray-700"
            disabled={isListening}
          >
            {isListening ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-md border bg-gradient-to-r from-white/80 via-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-600/80 backdrop-blur-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <Button onClick={handleSend} className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
