// "use client";

// import { motion } from "framer-motion";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useDispatch } from "react-redux";
// import { signInFailure, signInStart, signInSuccess } from "@/slices/userSlice";
// import toast from "react-hot-toast";

// const validateEmail = (email: string) => {
//   return String(email)
//     .toLowerCase()
//     .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
// };

// export default function LoginPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const [credentials, setCredentials] = useState({
//     email: "",
//     password: "",
//   });

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!credentials.email || !credentials.password) {
//       const errorMsg = "Please fill in all fields";
//       toast.error(errorMsg);
//       return dispatch(signInFailure(errorMsg));
//     }

//     if (!validateEmail(credentials.email)) {
//       const errorMsg = "Please enter a valid email";
//       toast.error(errorMsg);
//       return dispatch(signInFailure(errorMsg));
//     }

//     if (credentials.password.length < 6) {
//       const errorMsg = "Password must be at least 6 characters long";
//       toast.error(errorMsg);
//       return dispatch(signInFailure(errorMsg));
//     }

//     try {
//       dispatch(signInStart());
//       const response = await fetch("http://localhost:4000/api/admin/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(credentials),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       const { token, user } = data;

//       if (token) {
//         localStorage.setItem("token", token);
//         dispatch(signInSuccess(user));
//         toast.success("Login successful!");
//         router.push("/dashboard");
//       } else {
//         const errorMsg = "Authentication failed";
//         toast.error(errorMsg);
//         dispatch(signInFailure(errorMsg));
//       }
//     } catch (error: any) {
//       const errorMsg = error.message || "An error occurred during login";
//       toast.error(errorMsg);
//       dispatch(signInFailure(errorMsg));
//     }
//   };

//   return (
//     <main className="min-h-screen grid place-items-center p-4">
//       <div
//         className="absolute inset-0 -z-10"
//         style={{
//           background: "linear-gradient(70deg, #FF8C42 0%, #FFB566 100%)",
//         }}
//       />

//       <motion.div
//         className="w-full max-w-md bg-white rounded-xl shadow-2xl"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="p-8 space-y-6">
//           <div className="text-center">
//             <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
//             <p className="text-sm text-gray-600 mt-2">Sign in to your account</p>
//           </div>

//           <form onSubmit={handleLogin} className="space-y-4">
//             {error && (
//               <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
//                 {error}
//               </div>
//             )}

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={credentials.email}
//                 onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
//                 className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors"
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 value={credentials.password}
//                 onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
//                 className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors"
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full py-3 px-4 border border-transparent rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors font-medium"
//             >
//               Sign in
//             </button>

//             <div className="text-center mt-6">
//               <span className="text-gray-600">New to Reflectify?</span>
//               <a
//                 href="/signup"
//                 className="ml-2 text-orange-500 hover:text-orange-600 font-medium"
//               >
//                 Create an account
//               </a>
//             </div>
//           </form>
//         </div>
//       </motion.div>
//     </main>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { signInFailure, signInStart, signInSuccess } from "@/slices/userSlice";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value.trim() }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      const errorMsg = "Please fill in all fields";
      toast.error(errorMsg);
      return dispatch(signInFailure(errorMsg));
    }

    if (!validateEmail(formData.email)) {
      const errorMsg = "Please enter a valid email";
      toast.error(errorMsg);
      return dispatch(signInFailure(errorMsg));
    }

    if (formData.password.length < 6) {
      const errorMsg = "Password must be at least 6 characters long";
      toast.error(errorMsg);
      return dispatch(signInFailure(errorMsg));
    }

    try {
      dispatch(signInStart());
      const response = await fetch("http://localhost:4000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const { token, user } = data;

      if (token) {
        localStorage.setItem("token", token);
        dispatch(signInSuccess(user));
        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        const errorMsg = "Authentication failed";
        toast.error(errorMsg);
        dispatch(signInFailure(errorMsg));
      }
    } catch (error: any) {
      const errorMsg = error.message || "An error occurred during login";
      toast.error(errorMsg);
      dispatch(signInFailure(errorMsg));
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-orange-100 p-8 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                  placeholder="johndoe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <RiEyeOffLine size={20} />
                  ) : (
                    <RiEyeLine size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-lg font-semibold transition-all hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500/50 active:scale-[.98] disabled:opacity-70 shadow-lg shadow-orange-500/30 relative overflow-hidden group"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/20 hidden group-hover:block transition-opacity"></div>
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
