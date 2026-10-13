"use client";

import React, { useRef } from "react";
import { ALLOWED_MIME, MAX_FILE_BYTES } from "@/lib/constants";

interface FileDropProps {
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function FileDrop({ onFileSelected, onError, disabled = false }: FileDropProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      onError("Please choose a PNG or JPG under 4 MB.");
      return;
    }

    if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
      onError("Please choose a PNG or JPG under 4 MB.");
      return;
    }

    onFileSelected(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => {
        if (!disabled) {
          fileInputRef.current?.click();
        }
      }}
      className={`border-2 border-dashed border-gray-400 p-8 text-center cursor-pointer rounded-lg hover:border-gray-600 transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      <p className="text-lg font-medium text-gray-700">
        Choose a PNG or JPG (max 4 MB)
      </p>
    </div>
  );
}
