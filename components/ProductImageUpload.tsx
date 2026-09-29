"use client";

import { useState } from "react";

type ProductImageUploadProps = {
  label: string;
  onUpload: (image: {
    url: string;
    publicId: string;
  }) => void;
};

const MAX_COMPRESSED_SIZE_KB = 7500;

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function compressImage(file: File): Promise<File> {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Unable to read the selected image."));
      image.src = objectUrl;
    });

    const MAX_DIMENSION = 3000;

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = Math.min(
        MAX_DIMENSION / width,
        MAX_DIMENSION / height
      );

      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to prepare image compression.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(image, 0, 0, width, height);

    const MAX_SIZE_BYTES = MAX_COMPRESSED_SIZE_KB * 1024;
    const originalSizeIsSmall = file.size <= 750 * 1024;

    if (originalSizeIsSmall) {
      const highQualityBlob = await new Promise<Blob | null>(
        (resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob),
            "image/webp",
            0.92
          );
        }
      );

      if (highQualityBlob && highQualityBlob.size <= file.size) {
        return new File(
          [highQualityBlob],
          `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
          {
            type: "image/webp",
          }
        );
      }
    }

    let low = 0.45;
    let high = 0.92;
    let bestBlob: Blob | null = null;

    for (let attempt = 0; attempt < 8; attempt++) {
      const quality = (low + high) / 2;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (result) => resolve(result),
          "image/webp",
          quality
        );
      });

      if (!blob) {
        continue;
      }

      if (blob.size <= MAX_SIZE_BYTES) {
        bestBlob = blob;
        low = quality;
      } else {
        high = quality;
      }
    }

    if (!bestBlob) {
      bestBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/webp",
          0.45
        );
      });
    }

    if (!bestBlob) {
      throw new Error("Image compression failed.");
    }

    if (bestBlob.size > MAX_SIZE_BYTES) {
      throw new Error(
        "Unable to compress the image below 7500 KB."
      );
    }

    return new File(
      [bestBlob],
      `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
      {
        type: "image/webp",
      }
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function ProductImageUpload({
  label,
  onUpload,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const [originalSize, setOriginalSize] = useState<number | null>(
    null
  );

  const [compressedSize, setCompressedSize] = useState<
    number | null
  >(null);

  const setUploadStatus = (isUploading: boolean) => {
    window.dispatchEvent(
      new CustomEvent("product-image-upload-status", {
        detail: { uploading: isUploading },
      })
    );
  };

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setImageUrl("");
    setOriginalSize(file.size);
    setCompressedSize(null);

    setUploading(true);
    setUploadStatus(true);

    try {
      const compressedFile = await compressImage(file);

      setCompressedSize(compressedFile.size);

      const formData = new FormData();
      formData.append("file", compressedFile);

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }

      setImageUrl(data.url);

      onUpload({
        url: data.url,
        publicId: data.publicId,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
      setUploadStatus(false);
    }
  };

  const compressionPercentage =
    originalSize && compressedSize
      ? Math.max(
          0,
          Math.round(
            ((originalSize - compressedSize) / originalSize) *
              100
          )
        )
      : null;

  return (
    <div className="group">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#252525]">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] text-[#999999]">
            WebP recommended
          </p>
        </div>

        {imageUrl && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#F0FFF7] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#119957]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16C172]" />
            Uploaded
          </span>
        )}
      </div>

      <label
        className={[
          "relative block cursor-pointer overflow-hidden rounded-xl border transition-all duration-200",
          uploading
            ? "border-[#16C172] bg-[#F5FFF9]"
            : imageUrl
              ? "border-[#CDEEDC] bg-[#FAFFFC]"
              : "border-dashed border-[#D7D7D7] bg-[#FAFAF9] hover:border-[#16C172] hover:bg-[#F7FFF9]",
        ].join(" ")}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="sr-only"
        />

        {imageUrl ? (
          <div className="relative">
            <div className="flex h-56 items-center justify-center bg-white p-5">
              <img
                src={imageUrl}
                alt={`${label} preview`}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-white/70 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
              <span className="text-[10px] font-medium text-[#555555]">
                Click to replace
              </span>

              <span className="text-[10px] font-semibold text-[#119957]">
                New image
              </span>
            </div>
          </div>
        ) : uploading ? (
          <div className="flex h-56 flex-col items-center justify-center px-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9FFF2]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#16C172]/25 border-t-[#16C172]" />
            </div>

            <p className="mt-4 text-xs font-semibold text-[#333333]">
              Compressing & uploading
            </p>

            <p className="mt-1 text-[10px] text-[#999999]">
              Please keep this window open
            </p>
          </div>
        ) : (
          <div className="flex h-56 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E2E2E2] bg-white shadow-sm transition group-hover:border-[#BFE8D0] group-hover:shadow-md">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 16V4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M7.5 8.5L12 4L16.5 8.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 15.5V18.5C5 19.3284 5.67157 20 6.5 20H17.5C18.3284 20 19 19.3284 19 18.5V15.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="mt-4 text-xs font-semibold text-[#333333]">
              Upload {label.toLowerCase()}
            </p>

            <p className="mt-1 max-w-[220px] text-[10px] leading-4 text-[#999999]">
              Choose a product image from your computer
            </p>

            <span className="mt-4 rounded-full border border-[#DCDCDC] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#444444] shadow-sm transition group-hover:border-[#16C172] group-hover:text-[#119957]">
              Choose image
            </span>
          </div>
        )}
      </label>

      {originalSize !== null && compressedSize !== null && (
        <div className="mt-3 grid grid-cols-3 divide-x divide-[#EAEAEA] overflow-hidden rounded-lg border border-[#EAEAEA] bg-[#FAFAFA]">
          <div className="px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#AAAAAA]">
              Original
            </p>

            <p className="mt-1 text-[11px] font-semibold text-[#333333]">
              {formatFileSize(originalSize)}
            </p>
          </div>

          <div className="px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#AAAAAA]">
              Compressed
            </p>

            <p className="mt-1 text-[11px] font-semibold text-[#333333]">
              {formatFileSize(compressedSize)}
            </p>
          </div>

          <div className="px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#AAAAAA]">
              Reduced
            </p>

            <p className="mt-1 text-[11px] font-semibold text-[#119957]">
              {compressionPercentage !== null
                ? `${compressionPercentage}%`
                : "—"}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="mt-0.5 shrink-0 text-red-500"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M12 8V13"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <circle
              cx="12"
              cy="16.5"
              r="0.8"
              fill="currentColor"
            />
          </svg>

          <p className="text-[10px] leading-4 text-red-600">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}