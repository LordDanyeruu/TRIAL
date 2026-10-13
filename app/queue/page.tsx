"use client";

import React, { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useDemoRole } from "@/components/RoleToggle";
import { DEMO_ROLE_HEADER, formatDate } from "@/lib/constants";
import type { Report, ReportStatus } from "@/lib/types";

export default function QueuePage() {
  const role = useDemoRole();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setReports(data.reports || []);
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: ReportStatus) => {
    setUpdatingId(id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          [DEMO_ROLE_HEADER]: role,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      setReports((prev) =>
        prev.map((r) => (r.id === id ? data.report : r))
      );
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Community review queue</h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">No reports yet.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.imageUrl}
                  alt={report.fileName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Report info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {report.fileName}
                  </h3>
                  <StatusBadge status={report.status} />
                </div>
                {report.note && (
                  <p className="text-sm text-gray-600 mb-1">{report.note}</p>
                )}
                <p className="text-xs text-gray-400">
                  {formatDate(report.createdAt)}
                </p>
              </div>

              {/* Status dropdown for officials only */}
              {role === "official" && (
                <div className="flex-shrink-0 self-start sm:self-center">
                  <select
                    value={report.status}
                    disabled={updatingId === report.id}
                    onChange={(e) =>
                      handleStatusChange(report.id, e.target.value as ReportStatus)
                    }
                    className="text-sm border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="reported">Reported</option>
                    <option value="under_review">Under review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
