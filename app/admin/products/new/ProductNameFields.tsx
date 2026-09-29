"use client";

import { useState } from "react";

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductNameFields() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugManuallyEdited) {
      setSlug(makeSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(makeSlug(value));
  };

  return (
    <>
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium"
        >
          Product Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) =>
            handleNameChange(event.target.value)
          }
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/30"
          placeholder="Example: Classic Cotton Hoodie"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="mb-2 block text-sm font-medium"
        >
          Slug
        </label>

        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(event) =>
            handleSlugChange(event.target.value)
          }
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/30"
          placeholder="classic-cotton-hoodie"
        />

        <p className="mt-2 text-xs text-white/40">
          Automatically generated from the product name. You can edit it manually if needed.
        </p>
      </div>
    </>
  );
}