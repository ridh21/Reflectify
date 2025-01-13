"use client";

import { useState } from "react";
import ExcelJS from 'exceljs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FILE_ROUTES = {
  studentData: {
    route: "http://localhost:8000/student-data",
    label: "Student Data"
  },
  facultyData: {
    route: "http://localhost:8000/faculty-data",
    label: "Faculty Data"
  },
  subjectData: {
    route: "http://localhost:8000/subject-data",
    label: "Subject Data"
  }
} as const;

interface TableData {
  data: any[];
  type: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    studentData: null,
    facultyData: null,
    subjectData: null,
  });
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({
    studentData: false,
    facultyData: false,
    subjectData: false,
  });
  const [activeTable, setActiveTable] = useState<TableData | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileKey: string
  ) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Please upload only Excel files");
      return;
    }
    setFiles((prev) => ({ ...prev, [fileKey]: file }));
  };

  const handlePreview = async (fileKey: string) => {
    const file = files[fileKey];
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.worksheets[0];
    const jsonData: Record<string, string | number | boolean | null>[] = [];
    
    const headers = worksheet.getRow(1).values as string[];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowData: Record<string, string | number | boolean | null> = {};
        row.eachCell((cell, colNumber) => {
          const cellValue = cell.value;
          rowData[headers[colNumber]] = cellValue?.toString() ?? null;
        });
        jsonData.push(rowData);
      }
    });

    setActiveTable({
      data: jsonData,
      type: FILE_ROUTES[fileKey as keyof typeof FILE_ROUTES].label
    });
  };

  const handleSubmit = async (fileKey: string) => {
    const formData = new FormData();
    const file = files[fileKey];

    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [fileKey]: true }));
    formData.append(fileKey, file);

    try {
      const response = await fetch(FILE_ROUTES[fileKey as keyof typeof FILE_ROUTES].route, {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        setFiles((prev) => ({ ...prev, [fileKey]: null }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(`Upload failed for ${FILE_ROUTES[fileKey as keyof typeof FILE_ROUTES].label}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [fileKey]: false }));
    }
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" />
      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-[35%] flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Upload Excel Files
              </h1>

              <div className="space-y-8">
                {Object.entries(FILE_ROUTES).map(([key, { label }]) => (
                  <div key={key} className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">{label}</h2>
                    <div className="relative">
                      <input
                        id={key}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileChange(e, key)}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          cursor-pointer
                          border rounded-md p-2"
                      />
                      {files[key] && (
                        <p className="mt-1 text-sm text-green-600">
                          Selected: {files[key]?.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => handlePreview(key)}
                        disabled={!files[key]}
                        className="w-1/2 bg-gray-600 text-white py-2 px-4 rounded-md
                          hover:bg-gray-700 focus:outline-none focus:ring-2
                          focus:ring-gray-500 focus:ring-offset-2 transition-colors
                          font-medium disabled:bg-gray-300"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleSubmit(key)}
                        disabled={loadingStates[key]}
                        className="w-1/2 bg-blue-600 text-white py-2 px-4 rounded-md
                          hover:bg-blue-700 focus:outline-none focus:ring-2
                          focus:ring-blue-500 focus:ring-offset-2 transition-colors
                          font-medium disabled:bg-blue-300"
                      >
                        {loadingStates[key] ? 'Processing...' : `Upload ${label}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeTable && (
            <div className="md:w-[65%]">
              <div className="bg-white rounded-lg shadow-lg p-8 h-[calc(100vh-6rem)]">
                <div className="sticky top-0 bg-white z-20 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTable.type} Preview
                  </h2>
                </div>
                
                <div className="overflow-auto mt-4" style={{ height: 'calc(100% - 60px)' }}>
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        {Object.keys(activeTable.data[0] || {}).map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeTable.data.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {value?.toString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
