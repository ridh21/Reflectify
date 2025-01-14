"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

interface User {
  name: string;
  picture: string;
  email: string;
}

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("http://localhost:4000/auth/status", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.log("Not authenticated");
      }
    };

    checkAuthStatus();
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <>
      {/* User Status Display */}
      {user && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
          <Image
            src={user.picture || "https://via.placeholder.com/32"}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-medium">{user.name}</span>
        </div>
      )}

      <div className="flex min-h-screen flex-col items-center justify-center">
        <motion.div
          className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Image
              src="https://authjs.dev/img/providers/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </motion.div>
      </div>
    </>
  );
}
