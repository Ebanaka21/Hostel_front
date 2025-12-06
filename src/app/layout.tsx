import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { ToastContainer } from "../components/Toast";
import { ToastProvider } from "../components/ToastProvider";
import Container from "../components/Container";
import Footer from "../components/Footer";
import { AuthChecker } from "../components/AuthChecker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HostelStay",
  description: "Hostel management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-900 via-[#0a0a0a] to-[#1a0a20] text-white min-h-screen`}
      >
        <AuthChecker />
        <ToastProvider>
          <Header />
          <Container>
            {children}
          </Container>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
