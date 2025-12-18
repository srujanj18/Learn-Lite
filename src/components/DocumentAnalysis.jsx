import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

/* -------- Backend calls unchanged -------- */

export default function DocumentAnalysis() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const { showSuccess, showError } = useToast();

  const analyzeDocument = async () => {
    if (!file && !textInput.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      } else {
        formData.append("content", textInput);
      }

      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setAnalysis(data);
      setChatMessages([]); // Reset chat when new document is analyzed

      showSuccess("Document has been analyzed successfully.");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { id: Date.now(), sender: "user", text: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const formData = new FormData();
      formData.append("question", chatInput);

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Chat failed");
      }

      const data = await response.json();
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.answer,
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      showError(error.message || "Failed to send message");
    } finally {
      setIsChatLoading(false);
      setChatInput("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <h1
        className="
          text-3xl md:text-4xl font-bold text-center
          bg-gradient-to-r from-indigo-400 to-blue-400
          bg-clip-text text-transparent
        "
      >
        Document Analysis
      </h1>

      {/* Upload / Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          p-6 rounded-3xl
          bg-slate-950
          border border-indigo-700/40
          shadow-xl shadow-indigo-900/40
          space-y-6
        "
      >
        {/* Upload */}
        <label
          className="
            flex flex-col items-center justify-center
            h-44 rounded-2xl cursor-pointer
            border-2 border-dashed border-indigo-700/40
            hover:bg-indigo-900/20 transition
          "
        >
          <Upload className="h-10 w-10 text-indigo-400 mb-2" />
          <p className="text-indigo-300 text-sm">
            Click or drag a document here
          </p>
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {file && (
          <div
            className="
              flex items-center justify-between
              p-3 rounded-xl
              bg-slate-900 border border-indigo-700/40
            "
          >
            <span className="flex items-center gap-2 text-indigo-300 text-sm">
              <FileText className="h-4 w-4" />
              {file.name}
            </span>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setFile(null)}
              className="hover:bg-red-500/20 hover:text-red-400"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* OR */}
        <div className="flex items-center gap-4">
          <Separator className="flex-1 bg-indigo-700/40" />
          <span className="text-indigo-400 text-xs">OR</span>
          <Separator className="flex-1 bg-indigo-700/40" />
        </div>

        {/* Text input */}
        <Textarea
          placeholder="Paste your text here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="
            min-h-[160px]
            bg-slate-900 text-indigo-200
            border border-indigo-700/40
            focus:ring-2 focus:ring-indigo-500
          "
        />

        {/* Analyze */}
        <Button
          onClick={analyzeDocument}
          disabled={loading || (!file && !textInput)}
          className="
            w-full h-11
            bg-gradient-to-r from-indigo-600 to-blue-600
            hover:from-indigo-500 hover:to-blue-500
            text-slate-900
            shadow-lg shadow-indigo-700/50
          "
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Analyze Document"
          )}
        </Button>
      </motion.div>

      {/* Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div
            className="
              p-6 rounded-2xl
              bg-slate-950
              border border-indigo-700/40
              shadow-lg shadow-indigo-900/40
            "
          >
            <h3 className="font-semibold text-indigo-300 mb-3">
              AI Summary
            </h3>
            <p className="text-indigo-200 text-sm whitespace-pre-wrap">
              {analysis.summary}
            </p>
          </div>

          {/* Chat */}
          <div
            className="
              p-5 rounded-2xl
              bg-slate-950
              border border-indigo-700/40
              shadow-lg shadow-indigo-900/40
            "
          >
            <h3 className="font-semibold text-indigo-300 mb-3">
              Chat with Document
            </h3>

            <div
              ref={chatContainerRef}
              className="
                h-72 overflow-y-auto space-y-3
                p-3 rounded-xl
                bg-slate-900
                border border-indigo-700/40
              "
            >
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      px-4 py-2 rounded-xl max-w-[75%] text-sm
                      ${
                        m.sender === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-slate-900"
                          : "bg-slate-800 text-indigo-200 border border-indigo-700/40"
                      }
                    `}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <div className="flex gap-2 mt-4">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                placeholder="Ask something about the document..."
                className="
                  bg-slate-900 text-indigo-200
                  border border-indigo-700/40
                  focus:ring-2 focus:ring-indigo-500
                "
              />

              <Button
                onClick={sendChatMessage}
                disabled={isChatLoading}
                className="
                  bg-gradient-to-r from-indigo-600 to-blue-600
                  hover:from-indigo-500 hover:to-blue-500
                  text-slate-900
                "
              >
                {isChatLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
