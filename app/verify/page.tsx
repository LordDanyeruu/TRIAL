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
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
        Verify an image
      </h1>
      <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
        Upload an image you found online. We compare its digital fingerprint with official records. Your image stays on your device unless you choose to report it.
      </p>

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded mb-8 shadow-sm">
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-xl font-bold text-gray-800">Checking...</p>
        </div>
      )}

      {!loading && !verifyResult && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <FileDrop
            onFileSelected={handleFileSelected}
            onError={(msg) => setErrorMessage(msg)}
          />
        </div>
      )}

      {!loading && verifyResult && (
        <div>
          <ResultBanner
            status={verifyResult.status}
            record={verifyResult.record}
          />

          {verifyResult.status === "match" && (
            <div className="mt-8">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto bg-gray-900 text-white font-semibold text-base sm:text-lg px-8 py-3.5 rounded-xl hover:bg-black transition-colors shadow-md"
              >
                Check another image
              </button>
            </div>
          )}

          {verifyResult.status === "no_match" && (
            <div className="space-y-6 mt-8">
              {reportResult ? (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-blue-950 shadow-sm">
                  <p className="text-lg sm:text-xl font-bold mb-3">
                    {reportResult.alreadyReported
                      ? `This image was already reported. Status: ${reportResult.status}.`
                      : "Submitted for review. Status: Reported."}
                  </p>
                  <div>
                    <Link
                      href="/queue"
                      className="inline-flex items-center text-blue-700 font-bold text-base sm:text-lg hover:underline"
                    >
                      View the queue →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={submittingReport}
                    className="bg-amber-600 text-white font-bold text-base sm:text-lg px-6 py-3.5 rounded-xl hover:bg-amber-700 transition-colors shadow-md disabled:opacity-50"
                  >
                    {submittingReport ? "Submitting..." : "Submit for community review"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-gray-800 text-white font-semibold text-base sm:text-lg px-6 py-3.5 rounded-xl hover:bg-gray-900 transition-colors shadow-md"
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
