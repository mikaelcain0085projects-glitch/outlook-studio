"use client";

import { useState } from "react";
import ProductImageUpload from "@/components/ProductImageUpload";

export default function ProductImageField() {
  const [frontImage, setFrontImage] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  const [backImage, setBackImage] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <ProductImageUpload
          label="Front Image"
          onUpload={(uploadedImage) => {
            setFrontImage(uploadedImage);
          }}
        />

        <input
          type="hidden"
          name="front_image_url"
          value={frontImage?.url ?? ""}
        />

        <input
          type="hidden"
          name="front_image_public_id"
          value={frontImage?.publicId ?? ""}
        />
      </div>

      <div>
        <ProductImageUpload
          label="Back Image"
          onUpload={(uploadedImage) => {
            setBackImage(uploadedImage);
          }}
        />

        <input
          type="hidden"
          name="back_image_url"
          value={backImage?.url ?? ""}
        />

        <input
          type="hidden"
          name="back_image_public_id"
          value={backImage?.publicId ?? ""}
        />
      </div>
    </div>
  );
}