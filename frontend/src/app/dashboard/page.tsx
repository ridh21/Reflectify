"use client";

import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  name: string;
  email: string;
  picture: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("http://localhost:4000/auth/status", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
      } else {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
          <Image
            src={user.picture}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-medium">{user.name}</span>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of faculty schedules and matrix data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Total Faculty</p>
              <p className="text-2xl font-bold text-primary">24</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Active Schedules</p>
              <p className="text-2xl font-bold text-primary">156</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Total Labs</p>
              <p className="text-2xl font-bold text-primary">12</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <Card>
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Matrix Upload Completed
                    </p>
                    <p className="text-sm text-gray-600">
                      Faculty schedule matrix processed successfully
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Upload Matrix</h3>
                <p className="text-sm text-gray-600">
                  Upload new faculty schedule matrix
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">View Schedules</h3>
                <p className="text-sm text-gray-600">
                  Check current faculty schedules
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Manage Faculty</h3>
                <p className="text-sm text-gray-600">
                  Update faculty information
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
