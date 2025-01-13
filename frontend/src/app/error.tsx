"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="font-geist-sans text-2xl font-bold text-gray-900">
          Something went wrong
        </h2>
        <p className="font-geist-sans text-gray-600 max-w-md mx-auto">
          {error.message ||
            "We couldn't process your request. Please try again."}
        </p>
        <button
          onClick={reset}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-geist-sans"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
