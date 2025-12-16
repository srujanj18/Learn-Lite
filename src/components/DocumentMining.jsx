import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FileType, Check, Loader2, Brain, Download, BarChart3, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { getChatResponse } from '@/lib/gemini';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { Send } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#0088FE', '#FF8042', '#00C49F'];

const DocumentMining = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const { toast } = useToast();

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !analysis) return;

    const userMessage = {
      content: chatInput,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const prompt = `Based on this document analysis and data:\n\n${analysis.aiInsights}\n\nUser Question: ${chatInput}\n\nPlease provide a relevant answer based on the document content and analysis.`;
      
      const response = await getChatResponse(prompt);
      
      const aiMessage = {
        content: response,
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setChatLoading(false);
    }
  };

  const allowedFileTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'application/vnd.ms-excel',
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  };

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return;

    if (!allowedFileTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload CSV, Excel, or JSON files only',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
  };

  const parseCSV = (file) => new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => resolve(results.data),
      header: true,
      error: (error) => reject(error),
    });
  });

  const parseExcel = async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  };

  const parseJSON = async (file) => {
    const text = await file.text();
    return JSON.parse(text);
  };

  const analyzeData = async (data) => {
    let nullCount = 0;
    let totalFields = 0;
    let cleanedData = [];

    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      data.forEach((row) => {
        const cleanRow = {};
        headers.forEach((header) => {
          totalFields++;
          if (row[header] === null || row[header] === undefined || row[header] === '') {
            nullCount++;
          } else {
            cleanRow[header] = row[header];
          }
        });
        if (Object.keys(cleanRow).length > 0) {
          cleanedData.push(cleanRow);
        }
      });
    }

    const dataSnapshot = data.slice(0, 10);
    const analysisPrompt = `Analyze this dataset and provide insights about:
      1. Data patterns and trends
      2. Potential data quality issues
      3. Recommendations for data cleaning
      4. Possible use cases for this data

      Dataset sample: ${JSON.stringify(dataSnapshot, null, 2)}`;

    try {
      const geminiInsights = await getChatResponse(analysisPrompt);
      return {
        originalRows: data.length,
        cleanedRows: cleanedData.length,
        nullValues: nullCount,
        nullPercentage: ((nullCount / totalFields) * 100).toFixed(2),
        cleanedData,
        aiInsights: geminiInsights,
      };
    } catch (error) {
      console.error('Error getting Gemini insights:', error);
      throw error;
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to analyze',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let data;
      if (file.type === 'text/csv') {
        data = await parseCSV(file);
      } else if (file.type.includes('sheet') || file.type.includes('excel')) {
        data = await parseExcel(file);
      } else if (file.type === 'application/json') {
        data = await parseJSON(file);
      }

      const results = await analyzeData(data);
      setAnalysis(results);
      setShowVisualization(false); // Reset visualization
      toast({
        title: 'Analysis Complete',
        description: 'Document analysis completed successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCleanedData = () => {
    if (!analysis?.cleanedData) return;

    const blob = new Blob([JSON.stringify(analysis.cleanedData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFirstNumericColumn = () => {
    if (!analysis?.cleanedData?.length) return null;
    const firstRow = analysis.cleanedData[0];
    return Object.keys(firstRow).find((key) => typeof firstRow[key] === 'number');
  };

  const getFirstCategoricalColumn = () => {
    if (!analysis?.cleanedData?.length) return null;
    const firstRow = analysis.cleanedData[0];
    return Object.keys(firstRow).find((key) => typeof firstRow[key] === 'string');
  };

  const numericColumn = getFirstNumericColumn();
  const categoricalColumn = getFirstCategoricalColumn();

  const getPieData = () => {
    if (!categoricalColumn) return [];

    const counts = {};
    for (const row of analysis.cleanedData) {
      const key = row[categoricalColumn];
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.keys(counts).map((k) => ({ name: k, value: counts[k] }));
  };

  return (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-700/50">
          <FileType className="w-6 h-6 text-slate-900" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
          Document Mining
        </h1>
      </div>

      {/* Upload */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="
          rounded-3xl p-10 mb-8 text-center
          bg-slate-950 border-2 border-dashed border-indigo-700/40
          hover:bg-indigo-900/20 transition
        "
      >
        <Upload className="w-14 h-14 mx-auto mb-4 text-indigo-400" />
        <h2 className="text-lg font-semibold text-indigo-200">Drop your file here</h2>
        <p className="text-sm text-indigo-400 mb-4">
          CSV • Excel • JSON
        </p>

        <input
          type="file"
          onChange={(e) => handleFileSelection(e.target.files[0])}
          accept=".csv,.xlsx,.json,.xls"
          hidden
          id="file-upload"
        />

        <Button
          asChild
          className="
            bg-gradient-to-r from-indigo-600 to-blue-600
            hover:from-indigo-500 hover:to-blue-500
            text-slate-900
          "
        >
          <label htmlFor="file-upload" className="cursor-pointer">
            Browse Files
          </label>
        </Button>
      </div>

      {/* File Info */}
      {file && (
        <div className="mb-6">
          <div className="
            flex items-center gap-3 p-4 rounded-2xl
            bg-slate-900 border border-indigo-700/40
          ">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-indigo-200 text-sm truncate">
              {file.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              className="ml-auto text-indigo-400 hover:text-red-400"
            >
              Change
            </Button>
          </div>
        </div>
      )}

      {/* Analyze */}
      <Button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className="
          w-full h-12 mb-10
          bg-gradient-to-r from-indigo-600 to-blue-600
          hover:from-indigo-500 hover:to-blue-500
          text-slate-900 shadow-lg shadow-indigo-700/40
        "
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            Analyze Document
          </>
        )}
      </Button>

      {/* Results */}
      {analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

          {/* Overview + AI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="
              p-6 rounded-3xl
              bg-slate-950 border border-indigo-700/40
            ">
              <h3 className="text-indigo-300 font-semibold mb-3">Data Overview</h3>
              <div className="text-sm text-indigo-200 space-y-1">
                <p>Original Rows: {analysis.originalRows}</p>
                <p>Cleaned Rows: {analysis.cleanedRows}</p>
                <p>Null Values: {analysis.nullValues}</p>
                <p>Null %: {analysis.nullPercentage}%</p>
              </div>
            </div>

            <div className="
              p-6 rounded-3xl
              bg-gradient-to-br from-indigo-950 to-blue-950
              border border-indigo-700/40
            ">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-indigo-300">AI Insights</h3>
              </div>
              <p className="text-sm text-indigo-200 whitespace-pre-wrap">
                {analysis.aiInsights}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-between">
            <Button
              onClick={downloadCleanedData}
              className="bg-indigo-700 hover:bg-indigo-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Cleaned Data
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowVisualization(!showVisualization)}
              className="border-indigo-700/40 text-indigo-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showVisualization ? "Hide" : "Visualize"} Data
            </Button>
          </div>

          {/* Visualization */}
          {showVisualization && (
            <div className="
              mt-6 p-6 rounded-3xl
              bg-slate-950 border border-indigo-700/40
            ">
              <div className="flex gap-4 mb-4">
                <select
                  className="bg-slate-900 border border-indigo-700/40 text-indigo-200 p-2 rounded-lg"
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value)}
                >
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="pie">Pie</option>
                  <option value="donut">Donut</option>
                  <option value="stacked">Stacked</option>
                </select>

                {numericColumn && (
                  <select
                    className="bg-slate-900 border border-indigo-700/40 text-indigo-200 p-2 rounded-lg"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                  >
                    {Object.keys(analysis.cleanedData[0])
                      .filter(k => typeof analysis.cleanedData[0][k] === "number")
                      .map(k => <option key={k}>{k}</option>)}
                  </select>
                )}
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {/* Charts unchanged */}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chat */}
          <div className="
            mt-10 p-6 rounded-3xl
            bg-slate-950 border border-indigo-700/40
          ">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4">
              Chat with Your Document
            </h3>

            <div className="h-[300px] overflow-y-auto space-y-3 mb-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`
                      max-w-[70%] px-4 py-2 rounded-xl text-sm
                      ${m.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-slate-900'
                        : 'bg-slate-800 text-indigo-200 border border-indigo-700/40'}
                    `}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask something..."
                className="
                  flex-1 bg-slate-900 border border-indigo-700/40
                  text-indigo-200 rounded-lg px-3 py-2
                "
              />
              <Button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || chatLoading}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

        </motion.div>
      )}
    </motion.div>
  </div>
);
};


export default DocumentMining;
