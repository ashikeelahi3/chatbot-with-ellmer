'use client';

import React, { useEffect, useState } from 'react';
import Papa, { ParseResult } from 'papaparse';

interface DataTableProps {
  csvPath: string;
  hasHeaders?: boolean; // Optional: default = true
}

const DataTable: React.FC<DataTableProps> = ({ csvPath, hasHeaders = true }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetch(csvPath);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const csvText = await response.text();

        Papa.parse(csvText, {
          header: hasHeaders,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results: ParseResult<any>) => {
            if (results.errors.length) {
              console.error('CSV Parsing errors:', results.errors);
              setError('Error parsing CSV data.');
              return;
            }

            if (hasHeaders) {
              const parsed = results.data as Record<string, any>[];
              setHeaders(results.meta.fields ?? []);
              const rowData = parsed.map(row => Object.values(row));
              setData(rowData);
            } else {
              const parsed = results.data as string[][];
              if (parsed.length > 0) {
                setHeaders(parsed[0].map((_, i) => `Column ${i + 1}`));
              }
              setData(parsed);
            }

            setLoading(false);
          },
          error: (err: Error) => {
            console.error('PapaParse error:', err);
            setError('Error parsing CSV file.');
            setLoading(false);
          }
        });
      } catch (err: any) {
        console.error('Fetch failed:', err);
        setError(`Failed to load CSV: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [csvPath, hasHeaders]);

  const [fullscreen, setFullscreen] = useState(false);

  // UI Feedbacks
  if (loading) return <div className="text-center py-4">Loading data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  if (data.length === 0) return <div className="text-center py-4">No data available.</div>;

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
    : "w-full max-w-xl mx-auto my-8 shadow-2xl rounded-3xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950";
  const innerClass = fullscreen
    ? "w-full h-full max-w-[90vw] max-h-[90vh] overflow-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4"
    : "overflow-auto bg-white/80 dark:bg-gray-900/80 shadow-lg rounded-2xl p-6";

  const tableWrapperStyle = { maxHeight: '70vh', overflow: 'auto', borderRadius: '1rem', boxShadow: '0 2px 16px 0 rgba(30,64,175,0.08)' };

  return (
    <div className={containerClass} style={fullscreen ? { maxHeight: '100vh', maxWidth: '100vw' } : {}}>
      <div className={innerClass}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300 tracking-tight">Data Table</h2>
          <button
            onClick={() => setFullscreen(f => !f)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 text-xs font-semibold shadow"
            aria-label={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              {fullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" />
              )}
            </svg>
            {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
        <div
          style={tableWrapperStyle}
          className="bg-white/90 dark:bg-gray-900/90 custom-scrollbar"
        >
          <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="text-xs text-blue-700 dark:text-blue-200 uppercase bg-blue-50 dark:bg-blue-900 sticky top-0 z-10" style={{ position: 'sticky', top: 0 }}>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} scope="col" className="px-6 py-3 font-semibold bg-blue-50 dark:bg-blue-900">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="bg-white/80 border-b dark:bg-gray-800/80 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
