import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { getChatResponse } from '@/lib/gemini';

export const parseCSV = (file) => new Promise((resolve, reject) => {
  Papa.parse(file, {
    complete: (results) => resolve(results.data),
    header: true,
    error: (error) => reject(error),
  });
});

export const parseExcel = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
};

export const parseJSON = async (file) => {
  const text = await file.text();
  return JSON.parse(text);
};

export const analyzeData = async (data) => {
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