"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ExcelJS from "exceljs";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  ClipboardIcon,
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
  const router = useRouter();
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

  const handleExportToExcel = async () => {
    const filteredData = getFilteredFaculty();

    if (filteredData.length === 0) {
      toast.error("No faculty data available to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Faculty Data");

    // Define columns with Sr. No.
    worksheet.columns = [
      { header: "Sr. No.", key: "srNo", width: 8 },
      { header: "Faculty Name", key: "name", width: 30 },
      { header: "Email Address", key: "email", width: 35 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Department", key: "department", width: 25 },
      { header: "Location", key: "location", width: 20 },
      { header: "Abbreviation", key: "abbreviation", width: 15 },
      { header: "Joining Date", key: "joiningDate", width: 15 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E5E5" },
    };

    // Add data with Sr. No.
    getFilteredFaculty().forEach((f, index) => {
      worksheet.addRow({
        srNo: index + 1,
        name: f.name,
        email: f.email,
        designation: f.designation,
        department: f.department.name,
        location: f.seatingLocation,
        abbreviation: f.abbreviation,
        joiningDate: new Date(f.joiningDate).toLocaleDateString(),
      });
    });

    // Center align Sr. No. column
    worksheet.getColumn("srNo").alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Rest of your existing styling code remains the same
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (colNumber !== 1) {
          // Skip Sr. No. column as it's already centered
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `faculty_data_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Faculty data exported successfully");
  };

  const handleCreate = async (facultyData: Omit<Faculty, "id">) => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/dashboard/createfaculty",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(facultyData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Faculty created successfully");
        await fetchFaculty();
        setIsAddModalOpen(false);
      } else {
        toast.error(data.error || "Failed to create faculty");
      }
    } catch (error) {
      toast.error("Failed to create faculty");
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

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      toast.success(`${email} copied to clipboard`, {
        duration: 2000,
        style: {
          background: "#ffffff",
          color: "#22c55e",
        },
      });
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] min-h-[48.05rem] mx-auto space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="space-y-1 md:space-y-2 flex flex-auto justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-xl md:text-4xl font-semibold text-gray-900">
            Faculty Management Portal
          </h1>
          <p className="text-sm md:text-md text-gray-500">
            Manage and monitor faculty information
          </p>
        </div>
        <button
          onClick={handleExportToExcel}
          className="flex items-center justify-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm whitespace-nowrap"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export Excel
        </button>
      </div>

      {/* Stats Cards */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${
          departmentStats.length + 1
        } gap-4 md:gap-6`}
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
            onClick={() => router.push("/department")}
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
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center bg-white p-4 md:p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100">
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <select
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 bg-white shadow-sm min-w-[200px] text-gray-600 cursor-pointer appearance-none pr-10"
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
            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
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
            className="flex items-center justify-center gap-2 bg-orange-400 text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 transition-colors duration-200 shadow-sm whitespace-nowrap"
          >
            <PlusIcon className="h-5 w-5" />
            Add Faculty
          </button>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100">
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
                    <div className="flex items-center gap-2">
                      {faculty.email}
                      <button
                        onClick={() => handleCopyEmail(faculty.email)}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <ClipboardIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedFaculty(faculty);
                          setIsEditModalOpen(true);
                        }}
                        className="text-orange-500 hover:text-orange-700"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faculty.id)}
                        className="text-red-500 hover:text-red-700"
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
    </div>
  );
}
