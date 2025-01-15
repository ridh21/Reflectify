export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-4">Reflectify</h3>
            <p className="text-gray-600">
              Empowering education through data-driven insights
            </p>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/upload-data"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Upload Data
                </a>
              </li>
              <li>
                <a
                  href="/reports"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Reports
                </a>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p className="text-gray-600">Email: support@reflectify.com</p>
            <p className="text-gray-600">Phone: (555) 123-4567</p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            © 2024 Reflectify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
