"use client";

import { Card } from "@/components/ui/Card";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of faculty schedules and matrix data
          </p>
        </div>

        {/* Stats Overview */}
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

        {/* Recent Activity */}
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

        {/* Quick Actions */}
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
