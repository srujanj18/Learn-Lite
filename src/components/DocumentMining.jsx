import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileType,
  Check,
  Loader2,
  Brain,
  Download,
  BarChart3,
  Sparkles,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { getChatResponse } from "@/lib/gemini";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#FF3B00", "#FF6A00", "#FF8C42", "#F7A26B", "#D94C17", "#FF9E57"];
const DOCUMENT_MINING_DRAFT_KEY = "learnlite-document-mining-draft";

const DocumentMining = () => {
  const savedDraft = (() => {
    try {
      return JSON.parse(localStorage.getItem(DOCUMENT_MINING_DRAFT_KEY) || "null");
    } catch {
      return null;
    }
  })();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(savedDraft?.analysis || null);
  const [showVisualization, setShowVisualization] = useState(savedDraft?.showVisualization || false);
  const [selectedChartType, setSelectedChartType] = useState(savedDraft?.selectedChartType || "bar");
  const [selectedMetric, setSelectedMetric] = useState(savedDraft?.selectedMetric || null);
  const [messages, setMessages] = useState(savedDraft?.messages || []);
  const [chatInput, setChatInput] = useState(savedDraft?.chatInput || "");
  const [chatLoading, setChatLoading] = useState(false);
  const { toast } = useToast();
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  useEffect(() => {
    localStorage.setItem(
      DOCUMENT_MINING_DRAFT_KEY,
      JSON.stringify({
        analysis,
        showVisualization,
        selectedChartType,
        selectedMetric,
        messages,
        chatInput,
      }),
    );
  }, [analysis, showVisualization, selectedChartType, selectedMetric, messages, chatInput]);

  const allowedFileTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/json",
    "application/vnd.ms-excel",
  ];

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !analysis) return;

    const userMessage = { content: chatInput, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const prompt = `Based on this document analysis and data:\n\n${analysis.aiInsights}\n\nUser Question: ${chatInput}\n\nPlease provide a relevant answer based on the document content and analysis.`;
      const response = await getChatResponse(prompt);
      const aiMessage = { content: response, sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to get AI response", variant: "destructive" });
    } finally {
      setChatLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  };

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return;

    if (!allowedFileTypes.includes(selectedFile.type)) {
      toast({ title: "Invalid file type", description: "Please upload CSV, Excel, or JSON files only", variant: "destructive" });
      return;
    }

    setFile(selectedFile);
  };

  const parseCSV = (uploadedFile) =>
    new Promise((resolve, reject) => {
      Papa.parse(uploadedFile, {
        complete: (results) => resolve(results.data),
        header: true,
        error: (error) => reject(error),
      });
    });

  const parseExcel = async (uploadedFile) => {
    const buffer = await uploadedFile.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    return rows;
  };

  const parseJSON = async (uploadedFile) => {
    const text = await uploadedFile.text();
    return JSON.parse(text);
  };

  const normalizeValue = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
        return Number(trimmed);
      }
    }
    return value;
  };

  const analyzeData = async (rawData) => {
    const sourceRows = Array.isArray(rawData) ? rawData : [];
    let nullCount = 0;
    let totalFields = 0;

    const cleanedData = sourceRows
      .map((row) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) return null;
        const cleanRow = {};
        Object.keys(row).forEach((header) => {
          totalFields += 1;
          const value = row[header];
          if (value === null || value === undefined || value === "") {
            nullCount += 1;
            return;
          }
          cleanRow[header] = normalizeValue(value);
        });
        return Object.keys(cleanRow).length ? cleanRow : null;
      })
      .filter(Boolean);

    const dataSnapshot = cleanedData.slice(0, 10);
    const analysisPrompt = `Analyze this dataset and provide insights about:
1. Data patterns and trends
2. Potential data quality issues
3. Recommendations for data cleaning
4. Possible use cases for this data

Dataset sample: ${JSON.stringify(dataSnapshot, null, 2)}`;

    const geminiInsights = await getChatResponse(analysisPrompt);

    return {
      originalRows: sourceRows.length,
      cleanedRows: cleanedData.length,
      nullValues: nullCount,
      nullPercentage: totalFields ? ((nullCount / totalFields) * 100).toFixed(2) : "0.00",
      cleanedData,
      aiInsights: geminiInsights,
    };
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a file to analyze", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let data;
      if (file.type === "text/csv") {
        data = await parseCSV(file);
      } else if (file.type.includes("sheet") || file.type.includes("excel")) {
        data = await parseExcel(file);
      } else if (file.type === "application/json") {
        data = await parseJSON(file);
      }

      const results = await analyzeData(data);
      setAnalysis(results);
      setMessages([]);
      setSelectedMetric(null);
      setShowVisualization(false);
      toast({ title: "Analysis Complete", description: "Document analysis completed successfully" });
    } catch (error) {
      toast({ title: "Analysis Failed", description: error.message || "Failed to analyze document", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadCleanedData = () => {
    if (!analysis?.cleanedData) return;

    const blob = new Blob([JSON.stringify(analysis.cleanedData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cleaned_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNewSession = () => {
    setFile(null);
    setAnalysis(null);
    setShowVisualization(false);
    setSelectedChartType("bar");
    setSelectedMetric(null);
    setMessages([]);
    setChatInput("");
    localStorage.removeItem(DOCUMENT_MINING_DRAFT_KEY);
  };

  const numericColumns = useMemo(() => {
    if (!analysis?.cleanedData?.length) return [];
    return Object.keys(analysis.cleanedData[0]).filter((key) =>
      analysis.cleanedData.some((row) => typeof row[key] === "number" && !Number.isNaN(row[key])),
    );
  }, [analysis]);

  const categoricalColumn = useMemo(() => {
    if (!analysis?.cleanedData?.length) return null;
    return Object.keys(analysis.cleanedData[0]).find((key) => analysis.cleanedData.some((row) => typeof row[key] === "string"));
  }, [analysis]);

  const activeMetric = selectedMetric || numericColumns[0] || null;

  const chartData = useMemo(() => {
    if (!analysis?.cleanedData?.length || !activeMetric) return [];
    const labelColumn = categoricalColumn || Object.keys(analysis.cleanedData[0])[0];
    return analysis.cleanedData.slice(0, 8).map((row, index) => ({
      name: String(row[labelColumn] ?? `Row ${index + 1}`),
      value: typeof row[activeMetric] === "number" ? row[activeMetric] : Number(row[activeMetric]) || 0,
    }));
  }, [analysis, activeMetric, categoricalColumn]);

  const pieData = useMemo(() => {
    if (!analysis?.cleanedData?.length || !categoricalColumn) return [];
    const counts = {};
    analysis.cleanedData.forEach((row) => {
      const key = row[categoricalColumn] || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [analysis, categoricalColumn]);

  const renderChart = () => {
    if (!chartData.length && !pieData.length) {
      return <div className="empty-state min-h-[280px]"><BarChart3 className="h-10 w-10 text-[#FF8C42]" /><p className="text-sm">No chartable data found in the cleaned dataset.</p></div>;
    }

    if (selectedChartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={0} outerRadius={120} paddingAngle={4}>
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,120,50,0.25)", borderRadius: 16 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (selectedChartType === "line") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#888888" />
            <YAxis stroke="#888888" />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,120,50,0.25)", borderRadius: 16 }} />
            <Line type="monotone" dataKey="value" stroke="#FF6A00" strokeWidth={3} dot={{ fill: "#FF8C42", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#888888" />
          <YAxis stroke="#888888" />
          <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,120,50,0.25)", borderRadius: 16 }} />
          <Bar dataKey="value" radius={[12, 12, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="page-header glow-box lava-border">
        <div className="page-header-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={14} />
              Document Mining
            </p>
            <div>
              <h1 className="hero-title">
                Turn raw files into <span>readable intelligence</span>
              </h1>
              <p className="hero-text mt-4">
                Upload structured data, review quality metrics, generate AI insights, and visualize numeric trends from one cleaner workspace.
              </p>
            </div>
          </div>

          <div className="hero-stats">
            <div className="metric-card">
              <p className="metric-kicker">Accepted Formats</p>
              <p className="metric-value">CSV, XLSX, JSON</p>
              <p className="metric-subtext">Structured imports with quick quality checks and follow-up exploration.</p>
            </div>
            <div className="metric-card">
              <p className="metric-kicker">Outputs</p>
              <p className="metric-value">Metrics + Charts</p>
              <p className="metric-subtext">Quantitative overview, AI commentary, and visual summaries.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="content-card panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Dataset input</h2>
            <p className="section-copy mt-2">Drag a file in or browse from your machine.</p>
          </div>
          <Button variant="outline" onClick={handleNewSession}>
            New Session
          </Button>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className={`dropzone mt-6 min-h-[120px] px-6 transition-all ${loading ? "pointer-events-none border-[rgba(255,140,66,0.5)] bg-[rgba(255,80,0,0.05)]" : ""}`}
        >
          {loading ? <Loader2 className="h-10 w-10 animate-spin text-[#FF8C42]" /> : <Upload className="h-9 w-9 text-[#FF8C42]" />}
          <div>
            <p className="text-base font-semibold text-white">
              {loading ? "Processing dataset..." : "Drop your data file here"}
            </p>
            <p className="mt-2 text-sm text-[rgba(237,237,237,0.62)]">
              {loading ? "We are analyzing your dataset and preparing the results." : "CSV, Excel, and JSON are supported."}
            </p>
          </div>
          {loading && (
            <div className="mt-2 w-full max-w-sm overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div className="h-2 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#FF3B00] to-[#FF8C42]" />
            </div>
          )}
          <input type="file" onChange={(e) => handleFileSelection(e.target.files?.[0])} accept=".csv,.xlsx,.json,.xls" hidden id="file-upload" />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">Browse Files</label>
          </Button>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-[rgba(255,120,50,0.18)] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(255,80,0,0.08)] text-[#FF8C42]">
              <Check className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Selected dataset</p>
              <p className="truncate text-sm text-[rgba(237,237,237,0.66)]">{file.name}</p>
            </div>
            <Button variant="outline" onClick={() => setFile(null)}>Change</Button>
          </div>
        )}

        <Button onClick={handleAnalyze} disabled={!file || loading} className="mt-5 h-12 w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
          {loading ? "Analyzing Dataset..." : "Analyze Dataset"}
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 items-start">
        <div className="stack min-h-0">
          <div className="card-grid">
            <div className="metric-card">
              <p className="metric-kicker">Rows</p>
              <p className="metric-value">{analysis?.originalRows ?? "-"}</p>
              <p className="metric-subtext">Total rows detected before cleaning.</p>
            </div>
            <div className="metric-card">
              <p className="metric-kicker">Clean Rows</p>
              <p className="metric-value">{analysis?.cleanedRows ?? "-"}</p>
              <p className="metric-subtext">Rows retained after removing empty fields.</p>
            </div>
            <div className="metric-card">
              <p className="metric-kicker">Null Values</p>
              <p className="metric-value">{analysis?.nullValues ?? "-"}</p>
              <p className="metric-subtext">Missing fields identified across the file.</p>
            </div>
            <div className="metric-card">
              <p className="metric-kicker">Null Rate</p>
              <p className="metric-value">{analysis ? `${analysis.nullPercentage}%` : "-"}</p>
              <p className="metric-subtext">Percentage of missing values in the parsed dataset.</p>
            </div>
          </div>

          <div className="content-card panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="section-title">AI insights</h2>
                <p className="section-copy mt-2">Automatically generated observations and improvement suggestions.</p>
              </div>
              {analysis && (
                <Button variant="outline" onClick={downloadCleanedData}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Cleaned Data
                </Button>
              )}
            </div>
            <div className="mt-5 h-[420px] overflow-y-auto rounded-[24px] border border-[rgba(255,120,50,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
              {analysis ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-[rgba(237,237,237,0.88)]">{analysis.aiInsights}</p>
              ) : (
                <div className="empty-state min-h-[360px]">
                  <FileType className="h-10 w-10 text-[#FF8C42]" />
                  <p className="text-white">Insights will appear here</p>
                  <p className="max-w-sm text-sm text-[rgba(237,237,237,0.62)]">Run an analysis first to generate automated commentary and recommendations.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-card panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Chat with dataset</h2>
              <p className="section-copy mt-2">Ask focused questions about the imported file and generated insights.</p>
            </div>
            <Button variant="outline" onClick={() => setShowVisualization((value) => !value)} disabled={!analysis}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {showVisualization ? "Hide Charts" : "Show Charts"}
            </Button>
          </div>

          {showVisualization && analysis && (
            <div className="mt-5 rounded-[24px] border border-[rgba(255,120,50,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
              <div className="mb-4 flex flex-wrap gap-3">
                <select className="select-surface" value={selectedChartType} onChange={(e) => setSelectedChartType(e.target.value)}>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
                <select className="select-surface" value={activeMetric || ""} onChange={(e) => setSelectedMetric(e.target.value)} disabled={!numericColumns.length}>
                  {numericColumns.length ? numericColumns.map((column) => <option key={column} value={column}>{column}</option>) : <option>No numeric columns</option>}
                </select>
              </div>
              <div className="h-[280px]">{renderChart()}</div>
            </div>
          )}

          <div ref={chatContainerRef} className="mt-5 h-[420px] min-h-0 space-y-3 overflow-y-auto rounded-[22px] border border-[rgba(255,120,50,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
            {messages.length === 0 ? (
              <div className="empty-state min-h-[280px]">
                <Sparkles className="h-8 w-8 text-[#FF8C42]" />
                <p className="text-sm text-[rgba(237,237,237,0.62)]">Dataset questions and AI replies will show here.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={`${message.sender}-${index}`} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] px-4 py-3 text-sm ${message.sender === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
              placeholder="Ask something about the dataset..."
              className="input-surface"
            />
            <Button onClick={handleChatSubmit} disabled={!chatInput.trim() || chatLoading || !analysis} className="h-[52px] px-5">
              {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentMining;
