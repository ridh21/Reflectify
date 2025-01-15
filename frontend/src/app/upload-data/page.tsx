"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Upload, Eye } from "lucide-react";

const FILE_ROUTES = {
  studentData: {
    route: "http://localhost:8000/student-data",
    label: "Student Data",
    icon: "👥",
  },
  facultyData: {
    route: "http://localhost:8000/faculty-data",
    label: "Faculty Data",
    icon: "👨‍🏫",
  },
  subjectData: {
    route: "http://localhost:8000/subject-data",
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
    <div
      suppressHydrationWarning
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <ToastContainer position="top-right" />
      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-[35%] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-white/80">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8 text-center">
                Data Upload Center
              </h1>

              <div className="space-y-6">
                {Object.entries(FILE_ROUTES).map(([key, { label, icon }]) => (
                  <div
                    key={key}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl hover:shadow-md transition-all duration-300"
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span>{icon}</span>
                      <span className="text-gray-800">{label}</span>
                    </h2>
                    <div className="relative">
                      <input
                        id={key}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileChange(e, key)}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2.5 file:px-6
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700
                          cursor-pointer transition-all duration-300"
                      />
                      {files[key] && (
                        <div className="flex items-center mt-3 bg-blue-100 p-2 rounded-lg">
                          <p className="text-sm text-blue-700 flex-grow truncate">
                            {files[key]?.name}
                          </p>
                          <button
                            onClick={() => handleClearFile(key)}
                            className="p-1 hover:bg-blue-200 rounded-full transition-colors duration-200"
                          >
                            <X className="h-4 w-4 text-blue-700" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => handlePreview(key)}
                        disabled={!files[key]}
                        className="w-1/2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg
                          hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                          transition-all duration-300 flex items-center justify-center gap-2
                          disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleSubmit(key)}
                        disabled={loadingStates[key]}
                        className="w-1/2 bg-blue-600 text-white py-2.5 px-4 rounded-lg
                          hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          transition-all duration-300 flex items-center justify-center gap-2
                          disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {loadingStates[key] ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Processing
                          </span>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeTable && (
            <div className="md:w-[65%]">
              <div className="bg-white rounded-2xl shadow-xl p-8 h-[calc(100vh-6rem)] backdrop-blur-sm bg-white/80">
                <div className="sticky top-0 bg-white z-20 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {activeTable.type} Preview
                  </h2>
                </div>

                <div
                  className="overflow-auto mt-4 rounded-xl"
                  style={{ height: "calc(100% - 60px)" }}
                >
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
                      <tr>
                        {Object.keys(activeTable.data[0] || {}).map(
                          (header) => (
                            <th
                              key={header}
                              className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeTable.data.map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
