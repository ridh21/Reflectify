"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="grid place-items-center h-[48.05rem] relative">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(70deg, #4e89f7 0%, #ed5aa4 100%)",
        }}
      />

      <motion.div
        className="w-full max-w-md bg-white rounded-xl shadow-xl mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-600">Join us today</p>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-3">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Image
                src="https://authjs.dev/img/providers/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              Google
            </button>
            <div className="text-center mt-4">
              <span className="text-gray-600">Already have an account?</span>
              <a
                href="/login"
                className="ml-2 text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign in
              </a>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
