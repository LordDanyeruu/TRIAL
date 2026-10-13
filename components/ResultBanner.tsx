import React from "react";
import { formatDate } from "@/lib/constants";
import type { OfficialRecord } from "@/lib/types";

interface ResultBannerProps {
  status: "match" | "no_match";
  record?: OfficialRecord;
}

export function ResultBanner({ status, record }: ResultBannerProps) {
  if (status === "match" && record) {
    const fingerprintPreview = `${record.sha256.slice(0, 8)}...${record.sha256.slice(-8)}`;

    return (
      <div className="w-full bg-emerald-600 text-white p-8 rounded-xl shadow-xl border border-emerald-500 my-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">Authentic</h2>
        <p className="text-xl sm:text-2xl font-medium leading-snug mb-6 text-emerald-50">
          This exact file was stamped by {record.stampedBy} on {formatDate(record.stampedAt)}.
        </p>
        <div className="bg-emerald-700/60 p-5 rounded-lg border border-emerald-500/40 text-base space-y-2">
          <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-bold text-emerald-100">Title:</span>
            <span className="text-white font-medium">{record.title}</span>
          </p>
          <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-bold text-emerald-100">Digital fingerprint:</span>
            <code className="font-mono bg-emerald-800/80 px-2.5 py-0.5 rounded text-emerald-100 font-semibold tracking-wider text-sm sm:text-base self-start sm:self-auto">
              {fingerprintPreview}
            </code>
          </p>
        </div>
      </div>
    );
  }

  if (status === "no_match") {
    return (
      <div className="w-full bg-amber-400 text-amber-950 p-8 rounded-xl shadow-xl border border-amber-500 my-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">No official record found</h2>
        <p className="text-xl sm:text-2xl font-medium leading-relaxed text-amber-950">
          This file doesn&apos;t match any official record. That can mean it was edited, or that a real file was re-saved, screenshotted, or compressed by a social platform. It does not mean the image is fake.
        </p>
      </div>
    );
  }

  return null;
}
