"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FileDrop } from "@/components/FileDrop";
import { useDemoRole } from "@/components/RoleToggle";
import { DEMO_ROLE_HEADER, formatDate } from "@/lib/constants";
import type { OfficialRecord } from "@/lib/types";

export default function StampPage() {
  const role = useDemoRole();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stampSuccess, setStampSuccess] = useState<{
    record: OfficialRecord;
    alreadyStamped: boolean;
  } | null>(null);

  const [recentRecords, setRecentRecords] = useState<OfficialRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const refreshRecords = useCallback(() => {
    fetch("/api/records")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setRecentRecords(data.records || []);
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setLoadingRecords(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;

    fetch("/api/records")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setRecentRecords(data.records || []);
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (!ignore) {
          setLoadingRecords(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStampSuccess(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length > 120) {
      setErrorMessage("Title must be between 1 and 120 characters.");
      return;
    }

    if (!file) {
      setErrorMessage("Please choose a PNG or JPG under 4 MB.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("file", file);

      const res = await fetch("/api/stamp", {
        method: "POST",
        headers: {
          [DEMO_ROLE_HEADER]: role,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setErrorMessage(
          errorData?.error?.message || "Something went wrong. Please try again."
        );
        return;
      }

      const data = await res.json();
      setStampSuccess({
        record: data.record,
        alreadyStamped: Boolean(data.alreadyStamped),
      });
      setTitle("");
      setFile(null);
      refreshRecords();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stamp an official file</h1>

      {role === "public" ? (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-6 rounded-lg mb-8">
          <p className="text-lg font-medium">
            Official access required. Use the Demo mode switch in the header.
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8 shadow-sm">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {errorMessage}
            </div>
          )}

          {stampSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-900 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">
                {stampSuccess.alreadyStamped
                  ? `Already stamped on ${formatDate(stampSuccess.record.stampedAt)}.`
                  : "Stamped"}
              </h2>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-semibold">Title:</span> {stampSuccess.record.title}
                </p>
                <p>
                  <span className="font-semibold">Digital fingerprint:</span>{" "}
                  <code className="font-mono">
                    {stampSuccess.record.sha256.slice(0, 8)}...{stampSuccess.record.sha256.slice(-8)}
                  </code>
                </p>
                {!stampSuccess.alreadyStamped && (
                  <p>
                    <span className="font-semibold">Stamped at:</span>{" "}
                    {formatDate(stampSuccess.record.stampedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
                placeholder="Announcement or memo title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File
              </label>
              {file ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <FileDrop
                  onFileSelected={(f) => setFile(f)}
                  onError={(err) => setErrorMessage(err)}
                  disabled={submitting}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !file || !title.trim()}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Stamping..." : "Stamp file"}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent stamps</h2>
        {loadingRecords ? (
          <p className="text-gray-500">Loading...</p>
        ) : recentRecords.length === 0 ? (
          <p className="text-gray-500">No stamped files yet.</p>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((rec) => {
              const fingerprintPreview = `${rec.sha256.slice(0, 8)}...${rec.sha256.slice(-8)}`;
              return (
                <div
                  key={rec.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(rec.stampedAt)}
                    </p>
                  </div>
                  <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded self-start sm:self-auto">
                    {fingerprintPreview}
                  </code>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
