"use client";

import { UserState } from "@/types/user";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

const navigation = [
  { name: "Upload Faculty Matrix Excel", href: "/faculty-matrix-upload" },
  { name: "Upload Data", href: "/upload-data" },
];

export function Header() {
  const pathname = usePathname();
  const { currentUser } = useSelector((state: { user: UserState }) => state.user);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.span
                className="text-3xl font-bold text-gray-900"
                animate={{
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                  Reflectify
                </span>
              </motion.span>
            </Link>

            {currentUser && (
              <nav className="hidden md:flex items-center gap-8">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      className="relative px-3 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pathname === item.href && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-orange-50 rounded-lg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span
                        className={`relative z-10 text-sm font-medium ${
                          pathname === item.href
                            ? "text-orange-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {item.name}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-6">
            {currentUser ? (
              <motion.div 
                className="flex items-center gap-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 grid place-items-center text-white font-medium shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentUser.name.charAt(0)}
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {currentUser.name}
                    </span>
                    {/* {currentUser.isSuper && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        Admin
                      </span>
                    )}   */}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = "http://localhost:4000/auth/logout")}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Logout
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    Sign in
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
