"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function SignupPage() {
  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <motion.div
        className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-gray-600">Get started with Reflectify</p>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Image
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          Sign up with Google
        </button>
      </motion.div>
    </div>
  );
}
