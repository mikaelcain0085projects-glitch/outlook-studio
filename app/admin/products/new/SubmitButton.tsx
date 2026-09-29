"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleUploadStatus = (event: Event) => {
      const customEvent = event as CustomEvent<{
        uploading: boolean;
      }>;

      setUploading(customEvent.detail.uploading);
    };

    window.addEventListener(
      "product-image-upload-status",
      handleUploadStatus
    );

    return () => {
      window.removeEventListener(
        "product-image-upload-status",
        handleUploadStatus
      );
    };
  }, []);

  const disabled = pending || uploading;

  return (
    <button
  type="submit"
  disabled={disabled}
  className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] px-5 py-3 text-[9px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(22,163,74,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#15803D] hover:shadow-[0_10px_28px_rgba(22,163,74,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
>
  {disabled ? (
    <>
      <span
        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/25 border-t-white"
        aria-hidden="true"
      />
      {uploading
        ? "Uploading Image..."
        : "Creating Product..."}
    </>
  ) : (
    <>
      <span
        className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        +
      </span>

      <span>Create Product</span>
    </>
  )}
</button>
  );
}