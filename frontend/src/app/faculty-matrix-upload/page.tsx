"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelJS from "exceljs";
import { useSelector } from "react-redux";

interface ClassSchedule {
  [key: string]: {
    subjects: {
      subject_code: string;
      type: "Lecture" | "Lab";
      faculty: string;
      batch?: string;
    }[];
  };
}

export default function FacultyMatrixUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ClassSchedule | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [activeTable, setActiveTable] = useState<any[] | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Please upload only Excel files");
      return;
    }
    setSelectedFile(file);
    setActiveTable(null);
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await selectedFile.arrayBuffer();
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

    setActiveTable(jsonData);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("facultyMatrix", selectedFile);

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/faculty-matrix", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const results = await response.json();

      if (response.ok) {
        toast.success("File processed successfully");
        const newProcessedData: ClassSchedule = {};

        // Process the hierarchical data
        Object.entries(results).forEach(
          ([college, collegeData]: [string, any]) => {
            Object.entries(collegeData).forEach(
              ([department, departmentData]: [string, any]) => {
                Object.entries(departmentData).forEach(
                  ([semester, semesterData]: [string, any]) => {
                    Object.entries(semesterData).forEach(
                      ([division, divisionData]: [string, any]) => {
                        const classKey = `${semester}${division}`;
                        if (!newProcessedData[classKey]) {
                          newProcessedData[classKey] = { subjects: [] };
                        }

                        Object.entries(divisionData).forEach(
                          ([subject, subjectData]: [string, any]) => {
                            // Handle Lectures
                            if (subjectData?.lectures?.designated_faculty) {
                              newProcessedData[classKey].subjects.push({
                                subject_code: subject,
                                type: "Lecture",
                                faculty:
                                  subjectData.lectures.designated_faculty,
                              });
                            }

                            // Handle Labs
                            if (subjectData?.labs) {
                              Object.entries(subjectData.labs).forEach(
                                ([batch, labData]: [string, any]) => {
                                  if (labData?.designated_faculty) {
                                    newProcessedData[classKey].subjects.push({
                                      subject_code: subject,
                                      type: "Lab",
                                      batch: batch,
                                      faculty: labData.designated_faculty,
                                    });
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );

        setProcessedData(newProcessedData);
        setSelectedFile(null);
        setActiveTable(null);
      } else {
        toast.error(results.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error processing file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer position="top-right" />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Faculty Matrix Upload
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload your faculty schedule matrix in Excel format (.xlsx, .xls)
          </p>
        </div>

        <Card>
          <div className="space-y-4 p-6">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-orange-100 file:text-orange-700
                hover:file:bg-orange-200
                cursor-pointer"
            />
            {selectedFile && (
              <p className="mt-1 text-sm text-orange-700">
                Selected: {selectedFile.name}
              </p>
            )}
            <div className="flex gap-4 mt-4">
              <button
                onClick={handlePreview}
                disabled={!selectedFile || isLoading}
                className="w-1/2 bg-gray-700 text-white py-2 px-4 rounded-md
                  hover:bg-gray-800 focus:outline-none focus:ring-2
                  focus:ring-gray-500 focus:ring-offset-2 transition-colors
                  font-medium disabled:bg-gray-300"
              >
                Preview
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="w-1/2 bg-orange-600 text-white py-2 px-4 rounded-md
                  hover:bg-orange-700 focus:outline-none focus:ring-2
                  focus:ring-orange-500 focus:ring-offset-2 transition-colors
                  font-medium disabled:bg-orange-300"
              >
                {isLoading ? "Processing..." : "Upload"}
              </button>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
          </div>
        ) : activeTable ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(activeTable[0] || {}).map((header) => (
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
                  {activeTable.map((row, index) => (
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
          </Card>
        ) : processedData ? (
          <div className="space-y-8">
            {Object.entries(processedData).map(([classKey, data]) => (
              <Card key={classKey}>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">
                    Semester {classKey[0]} Division {classKey.slice(1)}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Subject</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Faculty</th>
                          <th className="px-4 py-2 text-left">Batch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.subjects.map((subject, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2">
                              {subject.subject_code}
                            </td>
                            <td className="px-4 py-2">{subject.type}</td>
                            <td className="px-4 py-2">{subject.faculty}</td>
                            <td className="px-4 py-2">
                              {subject.batch || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
