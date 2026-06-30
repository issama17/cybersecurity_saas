import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecLabs | Cybersecurity Platform",
  description: "Interactive cybersecurity challenges and study hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 pb-12">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
