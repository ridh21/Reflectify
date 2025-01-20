"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Upload, Eye, FileSpreadsheet } from "lucide-react";

const FILE_ROUTES = {
  studentData: {
    route: "http://localhost:4000/api/upload-data/student-data",
    label: "Student Data",
    icon: "👥",
  },
  facultyData: {
    route: "http://localhost:4000/api/upload-data/faculty-data",
    label: "Faculty Data",
    icon: "👨‍🏫",
  },
  subjectData: {
    route: "http://localhost:4000/api/upload-data/subject-data",
    label: "Subject Data",
    icon: "📚",
  },
} as {
  [K in "studentData" | "facultyData" | "subjectData"]: {
    route: string;
    label: string;
    icon: string;
  };
};

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
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({
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
      type: FILE_ROUTES[fileKey as keyof typeof FILE_ROUTES].label,
    });
  };

  const handleSubmit = async (fileKey: string) => {
    const formData = new FormData();
    const file = files[fileKey];

    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [fileKey]: true }));
    formData.append(fileKey, file);

    try {
      const response = await fetch(
        FILE_ROUTES[fileKey as keyof typeof FILE_ROUTES].route,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setFiles((prev) => ({ ...prev, [fileKey]: null }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        `Upload failed for ${
          FILE_ROUTES[fileKey as keyof typeof FILE_ROUTES].label
        }`
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [fileKey]: false }));
    }
  };

  const handleClearFile = (fileKey: string) => {
    setFiles((prev) => ({ ...prev, [fileKey]: null }));
    setActiveTable(null);
  };

  
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Data Upload Center</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-between gap-2">
          {Object.entries(FILE_ROUTES).map(([key, { label, icon }]) => (
            <div
              key={key}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex-1 max-w-[30%]"
            >
              <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">{label}</h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                id={key}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileChange(e, key)}
                className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2.5 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-orange-600 file:text-white
            hover:file:bg-orange-700
            cursor-pointer transition-all duration-200"
              />
            </div>

            {files[key] && (
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-gray-600 mr-2" />
                <p className="text-sm text-gray-600 flex-grow truncate">
            {files[key]?.name}
                </p>
                <button
            onClick={() => handleClearFile(key)}
            className="p-1 hover:bg-gray-200 rounded-full"
                >
            <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePreview(key)}
                disabled={!files[key]}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 
            rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
            disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>

              <button
                onClick={() => handleSubmit(key)}
                disabled={loadingStates[key]}
                className="inline-flex items-center justify-center px-4 py-2.5 
            rounded-lg text-sm font-medium text-white bg-orange-600 
            hover:bg-orange-700 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-orange-500
            disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates[key] ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Processing
            </div>
                ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
                )}
              </button>
            </div>
          </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          {activeTable ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-12rem)]">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {activeTable.type} Preview
                </h2>
              </div>
              <div className="overflow-auto" style={{ height: "calc(100% - 73px)" }}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(activeTable.data[0] || {}).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeTable.data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
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
          ) : (
            <div className="h-[calc(100vh-12rem)] bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
              <div className="text-center">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Preview Available</h3>
                <p className="mt-2 text-sm text-gray-500">Select a file and click preview to see the content</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
