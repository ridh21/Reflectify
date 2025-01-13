export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 border border-gray-200">
      {children}
    </div>
  );
}
