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
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileType className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Document Mining</h1>
        </div>

        {/* File Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed rounded-lg p-8 text-center mb-8"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-medium mb-2">Drop your file here</h2>
          <p className="text-sm text-muted-foreground mb-4">Supported formats: CSV, Excel, JSON</p>
          <input
            type="file"
            onChange={(e) => handleFileSelection(e.target.files[0])}
            accept=".csv,.xlsx,.json,.xls"
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
        </div>

        {/* File Info */}
        {file && (
          <div className="mb-6">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Check className="w-5 h-5 text-green-500" />
              <span className="font-medium">{file.name}</span>
              <Button variant="outline" size="sm" onClick={() => setFile(null)} className="ml-auto">
                Change
              </Button>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <Button onClick={handleAnalyze} disabled={!file || loading} className="w-full">
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

        {/* Result Section */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data Overview */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Data Overview</h3>
                <div className="space-y-2 text-sm">
                  <p>Original Rows: {analysis.originalRows}</p>
                  <p>Cleaned Rows: {analysis.cleanedRows}</p>
                  <p>Null Values: {analysis.nullValues}</p>
                  <p>Null Percentage: {analysis.nullPercentage}%</p>
                </div>
              </div>

              {/* AI Insights */}
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">AI Insights</h3>
                </div>
                <div className="text-sm whitespace-pre-wrap">{analysis.aiInsights}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button onClick={downloadCleanedData} variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Download Cleaned Data
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowVisualization((prev) => !prev)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showVisualization ? 'Hide' : 'Visualize'} Data
                {showVisualization ? <ChevronUp className="ml-1 w-4" /> : <ChevronDown className="ml-1 w-4" />}
              </Button>
            </div>

            {/* Visualization Controls */}
            {showVisualization && (
              <div className="space-y-6 mt-6">
                <div className="flex gap-4 items-center">
                  <select
                    className="p-2 border rounded-md"
                    value={selectedChartType}
                    onChange={(e) => setSelectedChartType(e.target.value)}
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="donut">Donut Chart</option>
                    <option value="stacked">Stacked Bar Chart</option>
                  </select>
                  {numericColumn && (
                    <select
                      className="p-2 border rounded-md"
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                    >
                      {Object.keys(analysis.cleanedData[0])
                        .filter(key => typeof analysis.cleanedData[0][key] === 'number')
                        .map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                  )}
                </div>

                {/* Charts Section */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="font-semibold mb-2">{selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    {selectedChartType === 'bar' && (
                      <BarChart data={analysis.cleanedData.slice(0, 20)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={categoricalColumn || numericColumn} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={selectedMetric || numericColumn} fill="#8884d8" />
                      </BarChart>
                    )}
                    {selectedChartType === 'line' && (
                      <LineChart data={analysis.cleanedData.slice(0, 20)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={categoricalColumn || numericColumn} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={selectedMetric || numericColumn} stroke="#8884d8" />
                      </LineChart>
                    )}
                    {selectedChartType === 'pie' && (
                      <PieChart>
                        <Pie
                          data={getPieData()}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={160}
                          label
                        >
                          {getPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    )}
                    {selectedChartType === 'donut' && (
                      <PieChart>
                        <Pie
                          data={getPieData()}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={160}
                          label
                        >
                          {getPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    )}
                    {selectedChartType === 'stacked' && (
                      <BarChart data={analysis.cleanedData.slice(0, 20)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={categoricalColumn || numericColumn} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {Object.keys(analysis.cleanedData[0])
                          .filter(key => typeof analysis.cleanedData[0][key] === 'number')
                          .slice(0, 3)
                          .map((key, index) => (
                            <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index]} />
                          ))}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Chat Interface */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Chat with Your Document</h3>
            
            {/* Chat Messages */}
            <div className="h-[300px] overflow-y-auto mb-4 space-y-4 p-4 border rounded-lg">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-indigo-600 dark:via-purple-600 dark:to-blue-600 text-white rounded-br-none'
                      : 'bg-muted dark:bg-gray-800 rounded-bl-none'}`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg rounded-bl-none">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Ask a question about your document..."
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                disabled={chatLoading}
              />
              <Button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || chatLoading}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DocumentMining;
