import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, Mic, Image, Loader2, Copy, Check, Volume2, VolumeX, X, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getChatResponse } from "@/lib/gemini";
import { saveChat } from "@/lib/chatStorage";
import { useLocation } from "react-router-dom";
import { createWorker } from "tesseract.js";

const CHAT_DRAFT_KEY = "learnlite-chat-draft";

const Chat = () => {
  const location = useLocation();
  const savedDraft = (() => {
    try {
      return JSON.parse(localStorage.getItem(CHAT_DRAFT_KEY) || "null");
    } catch {
      return null;
    }
  })();
  const initialMessages = location.state?.savedChat?.messages || savedDraft?.messages || [];
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState(savedDraft?.input || "");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sessionId, setSessionId] = useState(location.state?.savedChat?.sessionId || savedDraft?.sessionId || Date.now());
  const [imageData, setImageData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [mutedMessages, setMutedMessages] = useState(new Set());
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [speechPosition, setSpeechPosition] = useState(0);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const messageAreaRef = useRef(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (location.state?.savedChat) {
      setMessages(location.state.savedChat.messages || []);
      setSessionId(location.state.savedChat.sessionId || Date.now());
      setInput("");
    }
  }, [location.state]);

  useEffect(() => {
    const draft = { sessionId, messages, input };
    localStorage.setItem(CHAT_DRAFT_KEY, JSON.stringify(draft));
  }, [sessionId, messages, input]);

  useEffect(() => {
    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, [synth]);

  const aiMessageCount = useMemo(() => messages.filter((message) => message.sender === "ai").length, [messages]);

  const speakText = (text, messageId) => {
    if (!text) return;
    const processedText = text.replace(/[^a-zA-Z0-9\s.,!?"']/g, " ");

    if (!currentUtterance || currentUtterance.messageId !== messageId) {
      if (synth.speaking) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.messageId = messageId;
      utterance.onboundary = (event) => setSpeechPosition(event.charIndex);
      utterance.onend = () => setCurrentUtterance(null);
      utterance.onerror = () => {
        setCurrentUtterance(null);
        setSpeechPosition(0);
      };
      setCurrentUtterance(utterance);

      if (speechEnabled && !mutedMessages.has(messageId)) {
        synth.speak(utterance);
      }
    } else if (speechEnabled && !mutedMessages.has(messageId)) {
      const resumeUtterance = new SpeechSynthesisUtterance(processedText.slice(speechPosition));
      resumeUtterance.messageId = messageId;
      synth.speak(resumeUtterance);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const newMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
      image: selectedImage,
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

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      setSelectedImage(null);
      setImageData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      speakText(response, aiResponse.id);
      saveChat({ sessionId, messages: finalMessages, timestamp: new Date().toISOString() });
    } catch {
      toast({ title: "Error", description: "Failed to get response from AI", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChat = () => {
    if (!messages.length) {
      toast({ title: "Error", description: "No chat to save", variant: "destructive" });
      return;
    }

    saveChat({ sessionId, messages, timestamp: new Date().toISOString() });
    toast({ title: "Success", description: "Chat saved successfully" });
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setSelectedImage(null);
    setImageData(null);
    setSessionId(Date.now());
    if (fileInputRef.current) fileInputRef.current.value = "";
    localStorage.removeItem(CHAT_DRAFT_KEY);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({ title: "Error", description: "Your browser does not support voice input", variant: "destructive" });
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const processImage = async (file) => {
    if (!file?.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    setIsProcessingImage(true);

    try {
      setSelectedImage(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(",")[1];
        setImageData({ mimeType: file.type, data: base64Data });
      };
      reader.readAsDataURL(file);

      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      if (text?.trim()) setInput(text.trim());
      toast({ title: "Success", description: "Image added successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to process image", variant: "destructive" });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy text", variant: "destructive" });
    }
  };

  const toggleMuteMessage = (message) => {
    const next = new Set(mutedMessages);
    if (next.has(message.id)) {
      next.delete(message.id);
      setMutedMessages(next);
      if (speechEnabled) speakText(message.text, message.id);
    } else {
      next.add(message.id);
      setMutedMessages(next);
      if (synth.speaking) synth.cancel();
    }
  };

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div className="page-header-grid">
          <div className="hero-copy">
            <p className="eyebrow">Chat</p>
            <h1 className="hero-title">Talk with <span>your AI assistant</span></h1>
            <p className="hero-text">Ask a question, add an image if needed, and keep everything in one clear conversation view.</p>
          </div>
          <div className="hero-stats">
            <div className="metric-card">
              <p className="metric-kicker">Messages</p>
              <p className="metric-value">{messages.length}</p>
              <p className="metric-subtext">Total messages in the current session.</p>
            </div>
            <div className="metric-card">
              <p className="metric-kicker">AI Replies</p>
              <p className="metric-value">{aiMessageCount}</p>
              <p className="metric-subtext">Responses generated so far.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="two-column items-start">
        <div className="content-card panel flex h-[640px] min-h-0 flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(255,120,50,0.1)] pb-4">
            <div>
              <h2 className="section-title">Conversation</h2>
              <p className="section-copy mt-1">Your messages and AI replies appear here.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleNewChat}>
                New Chat
              </Button>
              <Button variant="outline" onClick={() => setSpeechEnabled(!speechEnabled)}>
                {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSaveChat} disabled={!messages.length}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          <div ref={messageAreaRef} className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
            {!messages.length && !isLoading && (
              <div className="empty-state rounded-[18px] border border-[rgba(255,120,50,0.1)] bg-[rgba(255,255,255,0.02)]">
                <p className="text-base font-semibold text-white">No messages yet</p>
                <p className="max-w-md text-sm text-[rgba(237,237,237,0.58)]">Start by typing a message below.</p>
              </div>
            )}

            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`group relative max-w-[78%] px-4 py-3 ${message.sender === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
                  {message.image && <img src={message.image} alt="Uploaded" className="mb-3 max-h-56 rounded-xl" />}
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                  {message.sender === "ai" && (
                    <div className="mt-3 flex gap-2 opacity-80">
                      <button onClick={() => handleCopy(message.text, message.id)} className="interactive-icon-button p-2">
                        {copiedId === message.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button onClick={() => toggleMuteMessage(message)} className="interactive-icon-button p-2">
                        {mutedMessages.has(message.id) ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="message-bubble-ai max-w-[78%] px-4 py-3">
                  <div className="flex items-center gap-3 text-sm text-[rgba(237,237,237,0.72)]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#FF8C42]" />
                    Generating response...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="content-card panel">
          <h2 className="section-title">New message</h2>
          <p className="section-copy mt-1">Type your prompt and use optional tools below.</p>

          <div className="mt-4 stack">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask the AI anything..."
              className="textarea-surface min-h-[180px]"
            />

            {selectedImage && (
              <div className="rounded-[16px] border border-[rgba(255,120,50,0.16)] bg-[rgba(255,255,255,0.02)] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Attached image</p>
                  <button onClick={() => { setSelectedImage(null); setImageData(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-[rgba(237,237,237,0.55)] transition hover:text-[#FF8C42]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <img src={selectedImage} alt="Selected" className="max-h-48 rounded-xl" />
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])} accept="image/*" className="hidden" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessingImage}>
                {isProcessingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image className="mr-2 h-4 w-4" />}
                Add Image
              </Button>
              <Button variant="outline" onClick={handleVoiceInput} disabled={isListening}>
                {isListening ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                Voice Input
              </Button>
            </div>

            <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)} className="h-12 w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Message
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chat;
