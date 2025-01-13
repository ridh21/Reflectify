import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const googleSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-google-sans",
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
        className={`${googleSans.variable} font-sans antialiased min-h-screen flex flex-col bg-background`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Reflectify. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
