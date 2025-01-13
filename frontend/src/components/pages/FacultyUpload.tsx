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

export function FacultyUpload() {
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
      setSchedules(result.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-700 px-6 py-6">
        <label className="block text-xl font-medium text-gray-700 mb-6">
          Upload Faculty Schedule
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="block w-full text-lg text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-100 file:text-blue-700
            hover:file:bg-blue-200
            cursor-pointer"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule, index) => (
            <Card key={index}>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg font-geist-sans">
                  {schedule.subject_code}
                </h3>
                <div className="text-sm text-gray-600 space-y-1 font-geist-sans">
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
  );
}
