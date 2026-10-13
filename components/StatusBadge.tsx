import React from "react";
import type { ReportStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ReportStatus;
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  reported: "Reported",
  under_review: "Under review",
  resolved: "Resolved",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;

  let colorClasses = "bg-gray-100 text-gray-800";
  if (status === "reported") {
    colorClasses = "bg-amber-100 text-amber-800 border border-amber-300";
  } else if (status === "under_review") {
    colorClasses = "bg-blue-100 text-blue-800 border border-blue-300";
  } else if (status === "resolved") {
    colorClasses = "bg-green-100 text-green-800 border border-green-300";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses}`}
    >
      {label}
    </span>
  );
}
