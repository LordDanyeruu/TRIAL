import React from "react";
import Link from "next/link";
import { RoleToggle } from "@/components/RoleToggle";
import { APP_NAME } from "@/lib/constants";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/verify" className="text-gray-600 hover:text-gray-900">
              Verify
            </Link>
            <Link href="/stamp" className="text-gray-600 hover:text-gray-900">
              Stamp
            </Link>
            <Link href="/queue" className="text-gray-600 hover:text-gray-900">
              Queue
            </Link>
          </nav>
        </div>
        <RoleToggle />
      </div>
    </header>
  );
}
