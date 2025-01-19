"use client";

import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AcademicCapIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ViewColumnsIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserPlusIcon,
  UserIcon,
  DocumentPlusIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  facultyCount: number;
  subjectCount: number;
  studentCount: number;
  departmentCount: number;
  divisionCount: number;
  feedbackCount: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch("http://localhost:4000/api/dashboard/stats");
      const data = await response.json();
      setStats(data);
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Dashboard
              <BoltIcon className="h-8 w-8 text-orange-500" />
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Overview of system statistics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md"
              onClick={() => router.push("/faculty")}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">
                    Total Faculty
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.facultyCount || 0}
                  </p>
                </div>
                <AcademicCapIcon className="h-12 w-12 text-orange-500" />
              </div>
            </Card>

            <Card
              className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md"
              onClick={() => router.push("/students")}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.studentCount || 0}
                  </p>
                </div>
                <UserGroupIcon className="h-12 w-12 text-orange-500" />
              </div>
            </Card>
            <Card
              className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md"
              onClick={() => router.push("/department")}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">
                    Departments
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.departmentCount || 0}
                  </p>
                </div>
                <BuildingOfficeIcon className="h-12 w-12 text-orange-500" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">Divisions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.divisionCount || 0}
                  </p>
                </div>
                <ViewColumnsIcon className="h-12 w-12 text-orange-500" />
              </div>
            </Card>
            <Card className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">Subjects</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.subjectCount || 0}
                  </p>
                </div>
                <BookOpenIcon className="h-12 w-12 text-orange-500" />
              </div>
            </Card>
            <Card className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">
                    Feedback Forms
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.feedbackCount || 0}
                  </p>
                </div>
                <ClipboardDocumentListIcon className="h-12 w-12 text-orange-500" />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BoltIcon className="h-6 w-6 text-orange-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md">
                <div className="flex items-center space-x-3">
                  <UserPlusIcon className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Add New Faculty
                    </h3>
                    <p className="text-sm text-gray-600">
                      Create faculty entries
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Add New Student
                    </h3>
                    <p className="text-sm text-gray-600">
                      Create student records
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="cursor-pointer bg-white border-2 border-orange-100 hover:border-orange-500 transition-all transform hover:-translate-y-1 shadow-md">
                <div className="flex items-center space-x-3">
                  <DocumentPlusIcon className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Create Feedback
                    </h3>
                    <p className="text-sm text-gray-600">
                      Set up new feedback forms
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
