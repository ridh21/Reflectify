import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";

const googleSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
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
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${googleSans.variable} font-sans antialiased min-h-screen flex flex-col bg-background`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
