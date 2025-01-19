import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import page_icon from "/public/review.png";

import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});


export const metadata: Metadata = {
  icons: {
    icon: page_icon.src,
  },
  title: "Reflectify - Faculty Schedule Management",
  description: "Efficiently manage and organize faculty schedules",
  keywords: ["schedule", "faculty", "management", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={dmSans.variable}>
      <body
        suppressHydrationWarning
        className="font-dm-sans antialiased flex flex-col bg-background"
      >
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              success: {
                style: {
                  background: "#ffffff",
                  color: "#16a34a",
                },
              },
              error: {
                style: {
                  background: "#ffffff",
                  color: "#ef4444",
                },
              },
            }}
          />
          <Header />
          <main className="m-0 p-0">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
