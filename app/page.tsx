import React from "react";
import Link from "next/link";
import { APP_NAME, TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
        {APP_NAME}
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        {TAGLINE}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/verify"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow"
        >
          Verify an image
        </Link>
        <Link
          href="/stamp"
          className="bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors shadow"
        >
          Stamp an official file
        </Link>
        <Link
          href="/queue"
          className="border border-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
        >
          Community queue
        </Link>
      </div>
    </main>
  );
}
