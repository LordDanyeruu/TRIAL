"use client";

import React, { useSyncExternalStore } from "react";

function subscribeRole(callback: () => void) {
  window.addEventListener("demo_role_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("demo_role_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getRoleSnapshot(): "public" | "official" {
  if (typeof window === "undefined") return "public";
  const stored = localStorage.getItem("demo_role");
  return stored === "official" ? "official" : "public";
}

function getServerSnapshot(): "public" | "official" {
  return "public";
}

export function useDemoRole(): "public" | "official" {
  return useSyncExternalStore(subscribeRole, getRoleSnapshot, getServerSnapshot);
}

export function RoleToggle() {
  const role = useDemoRole();

  const toggleRole = () => {
    const nextRole = role === "public" ? "official" : "public";
    localStorage.setItem("demo_role", nextRole);
    window.dispatchEvent(new Event("demo_role_change"));
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-medium text-gray-700">
        Demo mode: {role === "official" ? "Official" : "Public"}
      </span>
      <button
        type="button"
        onClick={toggleRole}
        className="border border-gray-400 px-2.5 py-1 rounded text-xs font-semibold bg-white hover:bg-gray-100 transition-colors shadow-sm"
      >
        {role === "official" ? "Switch to Public" : "Switch to Official"}
      </button>
    </div>
  );
}
