import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
              Faculty Schedule Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamline your faculty scheduling process with our intuitive matrix upload system. 
              Organize, manage, and optimize academic schedules efficiently.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/faculty-matrix-upload"
                className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Upload Matrix
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg bg-gray-100 px-6 py-3 text-base font-medium text-gray-900 hover:bg-gray-200 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Easy Upload</h3>
              <p className="mt-2 text-gray-600">Upload your faculty matrix in Excel format with just a few clicks.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Smart Processing</h3>
              <p className="mt-2 text-gray-600">Automatic schedule processing and conflict detection.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Instant View</h3>
              <p className="mt-2 text-gray-600">View processed schedules immediately in an organized format.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
