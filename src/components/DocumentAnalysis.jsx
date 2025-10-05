import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, Send, Download, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import * as XLSX from 'xlsx';
import { getChatResponse } from "@/lib/gemini";
import { analyzeWithFlanT5 } from "@/lib/huggingface";
import { auth } from "@/lib/firebase";

const DocumentAnalysis = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const { toast } = useToast();
  const chatContainerRef = useRef(null);



  const processFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          let content = '';

          switch (file.type) {
            case 'text/plain':
            case 'text/html':
            case 'application/json':
            case 'application/xml':
              content = data;
              break;

            case 'text/csv':
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              try {
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                content = XLSX.utils.sheet_to_csv(sheet);
              } catch (error) {
                reject(new Error('Failed to process Excel/CSV file. Please check if the file is corrupted or in the correct format.'));
                return;
              }
              break;

            default:
              content = `File Content (${file.type}): ${file.name}\n${data}`;
          }

          resolve(content);
        } catch (error) {
          reject(new Error('Failed to process file content. Please try with a different file or format.'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file. The file might be corrupted or inaccessible.'));

      if (file.type.startsWith('text/') || file.type.includes('sheet') || file.type.includes('excel')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
      'text/html',
      'application/xml',
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      toast({
        title: "Error",
        description: "Unsupported file type. Please upload a text, PDF, Word, Excel, or similar document.",
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    setFileUploaded(true);
    setAnalysis(null);
    setChatMessages([]);
    setAnalysisComplete(false);
    toast({
      title: "File Uploaded",
      description: "Please click 'Analyze Document' to process your file.",
    });
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please upload a document first",
        variant: "destructive",
      });
      return;
    }

    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "Please sign in to analyze documents",
        variant: "destructive",
      });
      return;
    }

    if (!import.meta.env.VITE_HUGGINGFACE_API_KEY) {
      toast({
        title: "Configuration Error",
        description: "Hugging Face API key is not configured. Please check your environment variables.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const content = await processFileContent(file);
      
      // Use Hugging Face's flan-t5-large model for analysis
      const response = await analyzeWithFlanT5(
        `Analyze this document and provide a comprehensive analysis including summary, key points, main topics, patterns, and recommendations:\n\n${content}`
      );
      
      const analysisData = {
        fileName: file.name,
        fileType: file.type,
        analysis: response,
        timestamp: new Date().toISOString()
      };

      setAnalysis({
        summary: response,
        content: content
      });
      setAnalysisComplete(true);

      // Save analysis to Firestore
      await saveDocumentAnalysis(auth.currentUser.uid, analysisData);

      toast({
        title: "Analysis Complete",
        description: "You can now chat with your document.",
      });
    } catch (error) {
      let errorTitle = "Error";
      let errorMessage = error.message || "Failed to analyze document";
      
      if (errorMessage.includes("Rate limit exceeded")) {
        errorTitle = "API Rate Limit Exceeded";
        errorMessage = "You have reached the maximum number of requests allowed. Please wait a few minutes before trying again.";
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
          duration: 10000,
        });
        return;
      } else if (errorMessage.includes("API key")) {
        errorTitle = "API Configuration Error";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !file || !analysis) return;

    const newMessage = {
      id: Date.now(),
      text: chatInput,
      sender: "user",
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await getChatResponse(
        `Based on this document content:\n\n${analysis.content}\n\nUser's question: ${chatInput}`
      );

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: response,
          sender: "ai",
        }
      ]);

      // Scroll to bottom of chat
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setChatMessages([]);
    setChatInput("");
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Document Analysis
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 bg-gradient-to-br from-background to-background/90 rounded-xl p-6 shadow-lg border border-primary/10"
      >
        <div className="rounded-xl border-2 bg-card p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer gradient-card hover:bg-primary/5 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, TXT, CSV (Max 50MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx,.csv,.xlsx,.json,.xml,.html"
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between bg-accent/50 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              className="w-full"
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Document
                </>
              )}
            </Button>
          </div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg gradient-card p-6 border border-primary/10 shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
                <div className="whitespace-pre-wrap text-sm text-primary/90">{analysis.summary}</div>
              </motion.div>

              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold mb-4">Chat with Document</h3>
                <div
                  ref={chatContainerRef}
                  className="h-[300px] overflow-y-auto mb-4 space-y-4 p-4 rounded-lg bg-accent/50"
                >
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.sender === "user"
                            ? "gradient-button"
                            : "gradient-card border border-primary/10"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                    placeholder="Ask about the document..."
                    disabled={isChatLoading}
                  />
                  <Button
                    onClick={handleChatSend}
                    disabled={isChatLoading || !chatInput.trim()}
                  >
                    {isChatLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );


  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Document Analysis
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 bg-gradient-to-br from-background to-background/90 rounded-xl p-6 shadow-lg border border-primary/10"
      >
        <div className="rounded-xl border-2 bg-card p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer gradient-card hover:bg-primary/5 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, TXT, CSV (Max 50MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx,.csv,.xlsx,.json,.xml,.html"
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between bg-accent/50 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              className="w-full"
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Document
                </>
              )}
            </Button>
          </div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg gradient-card p-6 border border-primary/10 shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
                <div className="whitespace-pre-wrap text-sm text-primary/90">{analysis.summary}</div>
              </motion.div>

              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold mb-4">Chat with Document</h3>
                <div
                  ref={chatContainerRef}
                  className="h-[300px] overflow-y-auto mb-4 space-y-4 p-4 rounded-lg bg-accent/50"
                >
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.sender === "user"
                            ? "gradient-button"
                            : "gradient-card border border-primary/10"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                    placeholder="Ask about the document..."
                    disabled={isChatLoading}
                  />
                  <Button
                    onClick={handleChatSend}
                    disabled={isChatLoading || !chatInput.trim()}
                  >
                    {isChatLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentAnalysis;