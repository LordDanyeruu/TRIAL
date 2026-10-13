import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { APP_NAME, TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: TAGLINE,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <Header />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
