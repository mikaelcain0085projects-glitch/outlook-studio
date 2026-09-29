"use client";

import { useState } from "react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Pink",
  "Grey",
  "Brown",
  "Beige",
];

type EditProductOptionsProps = {
  selectedSizes: string[];
  selectedColors: string[];
};

export default function EditProductOptions({
  selectedSizes,
  selectedColors,
}: EditProductOptionsProps) {
  const initialCustomSize =
    selectedSizes.find((size) => !SIZES.includes(size)) ?? "";

  const initialCustomColor =
    selectedColors.find((color) => !COLORS.includes(color)) ?? "";

  const [sizes, setSizes] = useState<string[]>(selectedSizes);
  const [colors, setColors] = useState<string[]>(selectedColors);

  const [customSizeValue, setCustomSizeValue] =
    useState(initialCustomSize);

  const [customColorValue, setCustomColorValue] =
    useState(initialCustomColor);

  const toggleSize = (size: string) => {
    setSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  };

  const toggleColor = (color: string) => {
    setColors((current) =>
      current.includes(color)
        ? current.filter((item) => item !== color)
        : [...current, color]
    );
  };

  const handleCustomSizeChange = (value: string) => {
    setCustomSizeValue(value);

    setSizes((current) => {
      const standardSizes = current.filter((size) =>
        SIZES.includes(size)
      );

      const trimmed = value.trim();

      return trimmed
        ? [...standardSizes, trimmed]
        : standardSizes;
    });
  };

  const handleCustomColorChange = (value: string) => {
    setCustomColorValue(value);

    setColors((current) => {
      const standardColors = current.filter((color) =>
        COLORS.includes(color)
      );

      const trimmed = value.trim();

      return trimmed
        ? [...standardColors, trimmed]
        : standardColors;
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Sizes */}
      <div>
        <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55">
          Available sizes
        </label>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {SIZES.map((size) => {
            const selected = sizes.includes(size);

            return (
              <label
                key={size}
                className={[
                  "group flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-xs transition-all duration-200",
                  selected
                    ? "border-[#171717] bg-[#171717] text-white shadow-[0_6px_18px_rgba(23,23,23,0.08)]"
                    : "border-black/[0.08] bg-[#faf9f7] text-[#171717]/55 hover:border-black/[0.18] hover:bg-white hover:text-[#171717]",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  name="sizes"
                  value={size}
                  checked={selected}
                  onChange={() => toggleSize(size)}
                  className="sr-only"
                />

                {size}
              </label>
            );
          })}
        </div>

        <div className="mt-5">
          <label
            htmlFor="custom_size"
            className="mb-2 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/45"
          >
            Custom size
          </label>

          <div
            className={[
              "rounded-xl border transition-all duration-200",
              customSizeValue.trim()
                ? "border-[#171717] bg-[#171717] shadow-[0_6px_18px_rgba(23,23,23,0.08)]"
                : "border-black/[0.08] bg-[#faf9f7]",
            ].join(" ")}
          >
            <input
              id="custom_size"
              name="custom_size"
              type="text"
              value={customSizeValue}
              onChange={(event) =>
                handleCustomSizeChange(event.target.value)
              }
              placeholder="Example: 3XL"
              className={[
                "w-full rounded-xl bg-transparent px-4 py-3 text-xs outline-none transition-colors duration-200",
                customSizeValue.trim()
                  ? "text-white placeholder:text-white/25"
                  : "text-[#171717] placeholder:text-[#171717]/25",
              ].join(" ")}
            />
          </div>

          <p className="mt-2 text-[10px] leading-5 text-[#171717]/35">
            Add a size not listed above.
          </p>
        </div>
      </div>

      {/* Colours */}
      <div>
        <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55">
          Available colours
        </label>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {COLORS.map((color) => {
            const selected = colors.includes(color);

            return (
              <label
                key={color}
                className={[
                  "group flex cursor-pointer items-center rounded-xl border px-3 py-3 text-xs transition-all duration-200",
                  selected
                    ? "border-[#171717] bg-[#171717] text-white shadow-[0_6px_18px_rgba(23,23,23,0.08)]"
                    : "border-black/[0.08] bg-[#faf9f7] text-[#171717]/55 hover:border-black/[0.18] hover:bg-white hover:text-[#171717]",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  name="colors"
                  value={color}
                  checked={selected}
                  onChange={() => toggleColor(color)}
                  className="sr-only"
                />

                <span
                  className={[
                    "mr-2 h-3 w-3 shrink-0 rounded-full border",
                    color === "Black"
                      ? "border-black bg-black"
                      : color === "White"
                        ? "border-[#CCCCCC] bg-white"
                        : color === "Red"
                          ? "border-red-500 bg-red-500"
                          : color === "Blue"
                            ? "border-blue-500 bg-blue-500"
                            : color === "Green"
                              ? "border-green-500 bg-green-500"
                              : color === "Yellow"
                                ? "border-yellow-400 bg-yellow-400"
                                : color === "Pink"
                                  ? "border-pink-400 bg-pink-400"
                                  : color === "Grey"
                                    ? "border-gray-400 bg-gray-400"
                                    : color === "Brown"
                                      ? "border-amber-700 bg-amber-700"
                                      : "border-stone-300 bg-stone-200",
                  ].join(" ")}
                />

                {color}
              </label>
            );
          })}
        </div>

        <div className="mt-5">
          <label
            htmlFor="custom_color"
            className="mb-2 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/45"
          >
            Custom colour
          </label>

          <div
            className={[
              "rounded-xl border transition-all duration-200",
              customColorValue.trim()
                ? "border-[#171717] bg-[#171717] shadow-[0_6px_18px_rgba(23,23,23,0.08)]"
                : "border-black/[0.08] bg-[#faf9f7]",
            ].join(" ")}
          >
            <input
              id="custom_color"
              name="custom_color"
              type="text"
              value={customColorValue}
              onChange={(event) =>
                handleCustomColorChange(event.target.value)
              }
              placeholder="Example: Navy Blue"
              className={[
                "w-full rounded-xl bg-transparent px-4 py-3 text-xs outline-none transition-colors duration-200",
                customColorValue.trim()
                  ? "text-white placeholder:text-white/25"
                  : "text-[#171717] placeholder:text-[#171717]/25",
              ].join(" ")}
            />
          </div>

          <p className="mt-2 text-[10px] leading-5 text-[#171717]/35">
            Add a colour not listed above.
          </p>
        </div>
      </div>
    </div>
  );
}