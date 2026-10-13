"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileDrop } from "@/components/FileDrop";
import { ResultBanner } from "@/components/ResultBanner";
import { sha256Hex } from "@/lib/hash";
import type { OfficialRecord, ReportStatus } from "@/lib/types";

const STATUS_LABELS: Record<ReportStatus, string> = {
  reported: "Reported",
  under_review: "Under review",
  resolved: "Resolved",
};

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    status: "match" | "no_match";
    record?: OfficialRecord;
  } | null>(null);

  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportResult, setReportResult] = useState<{
    alreadyReported: boolean;
    status: string;
  } | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setVerifyResult(null);
    setReportResult(null);
    setLoading(true);

    try {
      const hash = await sha256Hex(selectedFile);
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha256: hash }),
      });

      if (!res.ok) {
        setErrorMessage("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.status === "match") {
        setVerifyResult({ status: "match", record: data.record });
      } else {
        setVerifyResult({ status: "no_match" });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "HTTPS_REQUIRED") {
        setErrorMessage("Please open this page over HTTPS.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!file) return;
    setSubmittingReport(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (res.status === 409) {
        setErrorMessage("This file is an official record.");
        setSubmittingReport(false);
        return;
      }

      if (!res.ok) {
        setErrorMessage("Something went wrong. Please try again.");
        setSubmittingReport(false);
        return;
      }

      const data = await res.json();
      const statusLabel = STATUS_LABELS[data.report.status as ReportStatus] || "Reported";
      setReportResult({
        alreadyReported: Boolean(data.alreadyReported),
        status: statusLabel,
      });
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setLoading(false);
    setErrorMessage(null);
    setVerifyResult(null);
    setReportResult(null);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Verify an image</h1>
      <p className="text-gray-600 mb-6">
        Upload an image you found online. We compare its digital fingerprint with official records. Your image stays on your device unless you choose to report it.
      </p>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {errorMessage}
        </div>
      )}

      {loading && (
        <div className="py-8 text-center text-lg font-medium text-gray-700">
          Checking...
        </div>
      )}

      {!loading && !verifyResult && (
        <FileDrop
          onFileSelected={handleFileSelected}
          onError={(msg) => setErrorMessage(msg)}
        />
      )}

      {!loading && verifyResult && (
        <div>
          <ResultBanner
            status={verifyResult.status}
            record={verifyResult.record}
          />

          {verifyResult.status === "match" && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
              >
                Check another image
              </button>
            </div>
          )}

          {verifyResult.status === "no_match" && (
            <div className="space-y-4">
              {reportResult ? (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded text-blue-900">
                  <p className="font-medium">
                    {reportResult.alreadyReported
                      ? `This image was already reported. Status: ${reportResult.status}.`
                      : "Submitted for review. Status: Reported."}
                  </p>
                  <p className="mt-2">
                    <Link
                      href="/queue"
                      className="text-blue-600 underline font-medium hover:text-blue-800"
                    >
                      View the queue
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={submittingReport}
                    className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
                  >
                    {submittingReport ? "Submitting..." : "Submit for community review"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                  >
                    Check another image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
