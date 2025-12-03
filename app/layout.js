import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/quotation.css";
import { AuthProvider } from "../context/AuthContext.js";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Quotation CRM - Pipe Rate Calculator",
  description: "Professional pipe rate calculation and quotation system with user authentication",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
