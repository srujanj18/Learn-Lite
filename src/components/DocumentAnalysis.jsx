import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, Send, X, Sparkles, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DOCUMENT_ANALYSIS_DRAFT_KEY = "learnlite-document-analysis-draft";

export default function DocumentAnalysis() {
  const savedDraft = (() => {
    try {
      return JSON.parse(localStorage.getItem(DOCUMENT_ANALYSIS_DRAFT_KEY) || "null");
    } catch {
      return null;
    }
  })();
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState(savedDraft?.textInput || "");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(savedDraft?.analysis || null);
  const [chatMessages, setChatMessages] = useState(savedDraft?.chatMessages || []);
  const [chatInput, setChatInput] = useState(savedDraft?.chatInput || "");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const summaryContainerRef = useRef(null);
  const [summaryScrolled, setSummaryScrolled] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    localStorage.setItem(
      DOCUMENT_ANALYSIS_DRAFT_KEY,
      JSON.stringify({
        textInput,
        analysis,
        chatMessages,
        chatInput,
      }),
    );
  }, [textInput, analysis, chatMessages, chatInput]);

  useEffect(() => {
    const container = summaryContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setSummaryScrolled(container.scrollTop > 24);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [analysis]);

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
      setChatMessages([]);
      showSuccess("Document analyzed successfully.");
    } catch (error) {
      showError(error.message || "Failed to analyze document");
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
      const aiMessage = { id: Date.now() + 1, sender: "ai", text: data.answer };
      setChatMessages((prev) => [...prev, aiMessage]);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 0);
    } catch (error) {
      showError(error.message || "Failed to send message");
    } finally {
      setIsChatLoading(false);
      setChatInput("");
    }
  };

  const handleNewSession = () => {
    setFile(null);
    setTextInput("");
    setAnalysis(null);
    setChatMessages([]);
    setChatInput("");
    localStorage.removeItem(DOCUMENT_ANALYSIS_DRAFT_KEY);
  };

  const handleSummaryScroll = () => {
    const container = summaryContainerRef.current;
    if (!container) return;

    if (summaryScrolled) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  const escapePdfText = (text) =>
    text
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  const buildSummaryPdf = (title, content) => {
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50;
    const fontSize = 12;
    const lineHeight = 18;
    const maxCharsPerLine = 86;

    const wrapParagraph = (paragraph) => {
      if (!paragraph.trim()) return [""];
      const words = paragraph.split(/\s+/);
      const lines = [];
      let line = "";

      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length > maxCharsPerLine) {
          if (line) lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      });

      if (line) lines.push(line);
      return lines;
    };

    const textLines = [
      title,
      "",
      ...content.split("\n").flatMap((paragraph) => wrapParagraph(paragraph)),
    ];

    const linesPerPage = Math.max(1, Math.floor((pageHeight - margin * 2) / lineHeight));
    const pages = [];
    for (let i = 0; i < textLines.length; i += linesPerPage) {
      pages.push(textLines.slice(i, i + linesPerPage));
    }

    const objects = [];
    const addObject = (body) => {
      objects.push(body);
      return objects.length;
    };

    const fontObjectId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

    const pageObjectIds = [];
    pages.forEach((pageLines) => {
      const contentStream = [
        "BT",
        `/F1 ${fontSize} Tf`,
        `${margin} ${pageHeight - margin} Td`,
      ];

      pageLines.forEach((line, index) => {
        if (index > 0) {
          contentStream.push(`0 -${lineHeight} Td`);
        }
        contentStream.push(`(${escapePdfText(line)}) Tj`);
      });
      contentStream.push("ET");

      const streamBody = contentStream.join("\n");
      const contentObjectId = addObject(`<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream`);
      const pageObjectId = addObject(
        `<< /Type /Page /Parent PAGES_ID 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      );
      pageObjectIds.push(pageObjectId);
    });

    const pagesObjectId = addObject(
      `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>`,
    );

    pageObjectIds.forEach((id) => {
      objects[id - 1] = objects[id - 1].replace("PAGES_ID", pagesObjectId);
    });

    const catalogObjectId = addObject(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`);

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((body, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefPosition = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
  };

  const handleDownloadSummaryPdf = () => {
    if (!analysis?.summary) return;

    try {
      const pdfBlob = buildSummaryPdf("Document Analysis Summary", analysis.summary);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document-summary-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess("Summary PDF downloaded successfully.");
    } catch (error) {
      showError("Failed to download summary PDF.");
    }
  };

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="page-header glow-box lava-border">
        <div className="page-header-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={14} />
              Document Analysis
            </p>
            <div>
              <h1 className="hero-title">
                Analyze text in a <span>structured review space</span>
              </h1>
              <p className="hero-text mt-4">
                Upload a file or paste raw content, generate a summary, then continue with a focused document-specific conversation.
              </p>
            </div>
          </div>

          <div className="hero-stats">
            <div className="metric-card">
              <p className="metric-kicker">Input Modes</p>
              <p className="metric-value">Upload or Paste</p>
              <p className="metric-subtext">Work from source files or raw text without changing screens.</p>
            </div>
            <div className="metric-card">
              <p className="metric-kicker">Output</p>
              <p className="metric-value">Summary + Q&amp;A</p>
              <p className="metric-subtext">Get a top-line explanation and ask follow-up questions in context.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="content-card panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Source input</h2>
            <p className="section-copy mt-2">Choose a document or paste text directly for analysis.</p>
          </div>
          <Button variant="outline" onClick={handleNewSession}>
            New Session
          </Button>
        </div>

        <label className={`dropzone mt-6 min-h-[120px] cursor-pointer px-6 transition-all ${loading ? "pointer-events-none border-[rgba(255,140,66,0.5)] bg-[rgba(255,80,0,0.05)]" : ""}`}>
          {loading ? <Loader2 className="h-10 w-10 animate-spin text-[#FF8C42]" /> : <Upload className="h-9 w-9 text-[#FF8C42]" />}
          <div>
            <p className="text-base font-semibold text-white">
              {loading ? "Processing document..." : "Drop a document here"}
            </p>
            <p className="mt-2 text-sm text-[rgba(237,237,237,0.62)]">
              {loading ? "We are analyzing your document and preparing the summary." : "PDF, TXT, DOC, and DOCX are supported."}
            </p>
          </div>
          {loading && (
            <div className="mt-2 w-full max-w-sm overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div className="h-2 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#FF3B00] to-[#FF8C42]" />
            </div>
          )}
          <input type="file" accept=".pdf,.txt,.doc,.docx" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        {file && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(255,120,50,0.18)] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,80,0,0.08)] text-[#FF8C42]">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Selected file</p>
                <p className="text-sm text-[rgba(237,237,237,0.66)]">{file.name}</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="rounded-xl border border-[rgba(255,120,50,0.18)] p-2 text-[rgba(237,237,237,0.6)] transition hover:text-[#FF8C42]">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[rgba(255,120,50,0.15)]" />
          <span className="text-xs uppercase tracking-[0.3em] text-[rgba(237,237,237,0.42)]">or</span>
          <div className="h-px flex-1 bg-[rgba(255,120,50,0.15)]" />
        </div>

        <Textarea
          placeholder="Paste the document text here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="textarea-surface min-h-[160px]"
        />

          <Button onClick={analyzeDocument} disabled={loading || (!file && !textInput.trim())} className="mt-5 h-12 w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Analyzing Document..." : "Analyze Document"}
          </Button>
        </section>

      <section className="grid gap-4 lg:grid-cols-2 items-start">
        <div className="content-card panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Summary output</h2>
              <p className="section-copy mt-2">Your analysis will appear here once processing is complete.</p>
            </div>
            {analysis && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSummaryScroll} className="shrink-0">
                  {summaryScrolled ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                  {summaryScrolled ? "Top" : "Bottom"}
                </Button>
                <Button variant="outline" onClick={handleDownloadSummaryPdf} className="shrink-0">
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            )}
          </div>
          <div ref={summaryContainerRef} className="mt-5 h-[420px] overflow-y-auto rounded-[24px] border border-[rgba(255,120,50,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
            {analysis ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-[rgba(237,237,237,0.88)]">{analysis.summary}</p>
            ) : (
              <div className="empty-state min-h-[210px]">
                <FileText className="h-10 w-10 text-[#FF8C42]" />
                <p className="text-white">Waiting for analysis</p>
                <p className="max-w-sm text-sm text-[rgba(237,237,237,0.62)]">Run a document analysis to generate a summary and unlock follow-up chat.</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-card panel">
          <div className="mb-4">
            <h2 className="section-title">Chat with document</h2>
            <p className="section-copy mt-2">Ask targeted follow-up questions after analysis.</p>
          </div>

          <div ref={chatContainerRef} className="h-[420px] min-h-0 space-y-3 overflow-y-auto rounded-[22px] border border-[rgba(255,120,50,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
            {chatMessages.length === 0 ? (
              <div className="empty-state min-h-[180px]">
                <Sparkles className="h-8 w-8 text-[#FF8C42]" />
                <p className="text-sm text-[rgba(237,237,237,0.62)]">Questions about the document will appear here.</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] px-4 py-3 text-sm ${message.sender === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
                    {message.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              placeholder="Ask about this document..."
              className="input-surface"
            />
            <Button onClick={sendChatMessage} disabled={isChatLoading || !analysis} className="h-[52px] px-5">
              {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
