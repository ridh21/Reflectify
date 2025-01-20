"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Link from "next/link";
import { UserState } from "@/types/user";

export default function Home() {
  const router = useRouter();
  const { currentUser } = useSelector((state: { user: UserState }) => state.user);


  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="relative w-full max-w-2xl mx-auto px-4">
        {/* Main content container */}
        <motion.div 
          className="relative z-10 bg-white rounded-2xl p-12 shadow-[0_0_50px_rgba(0,0,0,0.05)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-7xl font-black text-orange-500 mb-2 tracking-tight">
                Reflectify
              </h1>
              <div className="h-0.5 w-24 bg-orange-200 mx-auto rounded-full"></div>
            </motion.div>

            <motion.p
              className="text-2xl text-gray-600 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Please sign in to continue
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-6 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                href="/login"
                className="group relative px-8 py-4 bg-orange-500 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-orange-600"
              >
                Sign in
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Subtle background accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-50 rounded-full blur-3xl"></div>
      </div>
    </main>

  );
}
