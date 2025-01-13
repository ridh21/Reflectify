"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const textVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9 },
    staggerChildren: 0.1,
    delayChildren: 0.3,
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-8">
            <motion.h1
              className="text-4xl font-bold text-gray-900 sm:text-6xl"
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              Faculty Schedule Management
            </motion.h1>

            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={textVariants}
              transition={{ delay: 0.3 }}
            >
              Streamline your faculty scheduling process with our intuitive
              matrix upload system. Organize, manage, and optimize academic
              schedules efficiently.
            </motion.p>

            <div className="flex justify-center gap-4">
              <motion.div
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/faculty-matrix-upload"
                  className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors"
                >
                  Upload Matrix
                </Link>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 }}
              >
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-gray-100 px-6 py-3 text-base font-medium text-gray-900 hover:bg-gray-200 transition-colors"
                >
                  View Dashboard
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Upload",
                description:
                  "Upload your faculty matrix in Excel format with just a few clicks.",
              },
              {
                title: "Smart Processing",
                description:
                  "Automatic schedule processing and conflict detection.",
              },
              {
                title: "Instant View",
                description:
                  "View processed schedules immediately in an organized format.",
              },
            ].map((card, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white rounded-lg shadow-md border border-gray-200"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.8 + index * 0.2 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-gray-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
