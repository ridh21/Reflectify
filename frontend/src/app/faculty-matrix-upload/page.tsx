"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

interface ScheduleData {
  subject_code: string;
  semester: number;
  division: string;
  batch?: string;
  is_lab: boolean;
  time_slot: number;
  day: string;
  faculty_code: string;
}

export default function FacultyMatrixUpload() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.length) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/process-faculty-data/",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      console.log("Result:", result);
      setSchedules(result.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Faculty Matrix Upload
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload your faculty schedule matrix in Excel format (.xlsx, .xls)
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-medium
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20
                cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Supported formats: .xlsx, .xls
            </p>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((schedule, index) => (
              <Card key={index}>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">
                    {schedule.subject_code}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Semester: {schedule.semester}</p>
                    <p>Division: {schedule.division}</p>
                    <p>Day: {schedule.day}</p>
                    <p>Time Slot: {schedule.time_slot}</p>
                    <p>Type: {schedule.is_lab ? "Lab" : "Lecture"}</p>
                    <p>Faculty: {schedule.faculty_code}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
