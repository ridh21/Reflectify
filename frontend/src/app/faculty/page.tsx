"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { AddFacultyModal } from "@/components/modals/AddFacultyModal";
import { EditFacultyModal } from "@/components/modals/EditFacultyModal";
import { DeleteFacultyModal } from "@/components/modals/DeleteFacultyModal";

const BASE_URL = "http://localhost:4000/api/dashboard/faculty";

interface Faculty {
  id: string;
  name: string;
  email: string;
  designation: string;
  seatingLocation: string;
  departmentId: string;
  abbreviation: string;
  joiningDate: string;
  department: {
    id: string;
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

interface DepartmentStats {
  departmentName: string;
  count: number;
}

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const response = await fetch(
      "http://localhost:4000/api/dashboard/departments"
    );
    if (response.ok) {
      const data = await response.json();
      setDepartments(data);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch(BASE_URL, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFaculty(data);
      calculateDepartmentStats(data);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      setFaculty([]);
    }
  };

  const calculateDepartmentStats = (facultyData: Faculty[]) => {
    const stats = facultyData.reduce((acc: DepartmentStats[], curr) => {
      const existingStat = acc.find(
        (stat) => stat.departmentName === curr.department.name
      );
      if (existingStat) {
        existingStat.count++;
      } else {
        acc.push({ departmentName: curr.department.name, count: 1 });
      }
      return acc;
    }, []);
    setDepartmentStats(stats);
  };

  const getFilteredFaculty = () => {
    return faculty
      .filter((f) => {
        const matchesSearch =
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.abbreviation.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment =
          selectedDepartment === "" || f.department.id === selectedDepartment;

        return matchesSearch && matchesDepartment;
      })
      .sort((a, b) => {
        if (sortOrder === "asc") {
          return a.name.localeCompare(b.name);
        }
        return b.name.localeCompare(a.name);
      });
  };

  const handleCreate = async (facultyData: Omit<Faculty, "id">) => {
    const promise = fetch("http://localhost:4000/api/dashboard/createfaculty", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(facultyData),
    });

    toast.promise(promise, {
      loading: "Creating faculty...",
      success: "Faculty created successfully",
      error: (error: { message: string }) => {
        return error.message || "Failed to create faculty";
      },
    });

    const response = await promise;
    if (response.ok) {
      await fetchFaculty();
      setIsAddModalOpen(false);
    }
  };

  const handleUpdate = async (id: string, facultyData: Partial<Faculty>) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(facultyData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Faculty updated successfully");
        await fetchFaculty();
        setIsEditModalOpen(false);
      } else {
        toast.error(`${facultyData.email} already exists in the database`);
      }
    } catch (error) {
      toast.error("Failed to update faculty");
    }
  };

  // In your component:
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setFacultyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (facultyToDelete) {
      const promise = fetch(`${BASE_URL}/${facultyToDelete}`, {
        method: "DELETE",
      });

      toast.promise(promise, {
        loading: "Deleting faculty...",
        success: "Faculty deleted successfully",
        error: "Failed to delete faculty",
      });

      const response = await promise;
      if (response.ok) {
        await fetchFaculty();
      }
      setIsDeleteModalOpen(false);
      setFacultyToDelete(null);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-gray-50/50">
      <Toaster position="top-right" />
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Faculty Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and monitor faculty information
        </p>
      </div>
      {/* Stats Cards with Dynamic Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${
          departmentStats.length + 1
        } gap-6`}
      >
        <Card className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow duration-200">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Total Faculty</p>
              <p className="text-3xl font-semibold text-gray-900">
                {faculty.length}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </Card>

        {departmentStats.map((stat) => (
          <Card
            key={stat.departmentName}
            className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow duration-200"
          >
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  {stat.departmentName}
                </p>
                <p className="text-3xl font-semibold text-gray-900">
                  {stat.count}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Search, Filters and Add Button */}
      <div className="flex gap-6 items-center bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search faculty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <UserGroupIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
        </div>

        <select
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 bg-white shadow-sm min-w-[180px]"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
        >
          <span className="text-gray-700">
            Sort {sortOrder === "asc" ? "A→Z" : "Z→A"}
          </span>
          {sortOrder === "asc" ? (
            <ArrowUpIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-gray-500" />
          )}
        </button>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-orange-400 text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 transition-colors duration-200 shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Add Faculty
        </button>
      </div>
      {/* Faculty Table */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredFaculty().length > 0 ? (
                getFilteredFaculty().map((faculty) => (
                  <tr
                    key={faculty.id}
                    className="hover:bg-orange-50/50 hover:shadow-sm transition-all duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-orange-100/50 flex items-center justify-center">
                          <span className="text-orange-600 font-medium">
                            {faculty.abbreviation}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {faculty.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {faculty.abbreviation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {faculty.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {faculty.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {faculty.department.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {faculty.seatingLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedFaculty(faculty);
                            setIsEditModalOpen(true);
                          }}
                          className="text-orange-400 hover:text-orange-500 transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(faculty.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UserGroupIcon className="h-8 w-8 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        No matching faculty members found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddFacultyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleCreate}
      />
      <EditFacultyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleUpdate}
        faculty={selectedFaculty}
      />
      <DeleteFacultyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
      ;
    </div>
  );
}
