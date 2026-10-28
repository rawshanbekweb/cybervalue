"use client";

// A header checkbox that ticks or clears every row checkbox of one form.
export function SelectAll({ form, label }: { form: string; label: string }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      onChange={(e) => {
        for (const box of document.querySelectorAll<HTMLInputElement>(
          `input[type="checkbox"][form="${form}"]`,
        ))
          box.checked = e.target.checked;
      }}
    />
  );
}
