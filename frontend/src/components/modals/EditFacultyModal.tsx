import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

interface Department {
  id: string;
  name: string;
}

interface EditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, facultyData: any) => void;
  faculty: any;
}

interface FacultyFormData {
  name: string;
  email: string;
  designation: string;
  seatingLocation: string;
  abbreviation: string;
  departmentId: string;
  joiningDate: string;
}

export function EditFacultyModal({
  isOpen,
  onClose,
  onEdit,
  faculty,
}: EditFacultyModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<FacultyFormData>({
    name: "",
    email: "",
    designation: "",
    seatingLocation: "",
    abbreviation: "",
    departmentId: "",
    joiningDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name,
        email: faculty.email,
        designation: faculty.designation,
        seatingLocation: faculty.seatingLocation,
        abbreviation: faculty.abbreviation,
        departmentId: faculty.departmentId,
        joiningDate: faculty.joiningDate.split("T")[0],
      });
    }
  }, [faculty]);

  const fetchDepartments = async () => {
    const response = await fetch(
      "http://localhost:4000/api/dashboard/departments"
    );
    if (response.ok) {
      const data = await response.json();
      setDepartments(data);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (faculty) {
      onEdit(faculty.id, formData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Edit Faculty
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Designation
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Seating Location
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.seatingLocation}
                onChange={(e) =>
                  setFormData({ ...formData, seatingLocation: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Abbreviation
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.abbreviation}
                onChange={(e) =>
                  setFormData({ ...formData, abbreviation: e.target.value })
                }
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
