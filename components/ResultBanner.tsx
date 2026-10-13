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
      <div className="w-full bg-green-600 text-white p-6 rounded-lg my-6">
        <h2 className="text-2xl font-bold mb-2">Authentic</h2>
        <p className="text-lg mb-4">
          This exact file was stamped by {record.stampedBy} on {formatDate(record.stampedAt)}.
        </p>
        <div className="bg-green-700 bg-opacity-50 p-4 rounded text-sm space-y-1">
          <p>
            <span className="font-semibold">Title:</span> {record.title}
          </p>
          <p>
            <span className="font-semibold">Digital fingerprint:</span>{" "}
            <code className="font-mono">{fingerprintPreview}</code>
          </p>
        </div>
      </div>
    );
  }

  if (status === "no_match") {
    return (
      <div className="w-full bg-amber-500 text-black p-6 rounded-lg my-6">
        <h2 className="text-2xl font-bold mb-2">No official record found</h2>
        <p className="text-lg">
          This file doesn&apos;t match any official record. That can mean it was edited, or that a real file was re-saved, screenshotted, or compressed by a social platform. It does not mean the image is fake.
        </p>
      </div>
    );
  }

  return null;
}
