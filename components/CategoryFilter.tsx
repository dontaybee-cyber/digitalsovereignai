"use client";

import { CATEGORIES, type Category } from "@/lib/posts";

interface CategoryFilterProps {
  active: Category | "All";
  onChange: (category: Category | "All") => void;
}

export default function CategoryFilter({
  active,
  onChange,
}: CategoryFilterProps) {
  const options: (Category | "All")[] = ["All", ...CATEGORIES];

  return (
    <div
      role="tablist"
      aria-label="Filter articles by category"
      className="mx-auto flex max-w-6xl flex-wrap gap-2 border-b border-deep-claret-border/60 px-6 pb-6"
    >
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150 ${
              isActive
                ? "border-ocean-blue bg-ocean-blue/15 text-ocean-blue-bright"
                : "border-deep-claret-border bg-deep-claret/20 text-text-muted hover:border-ocean-blue/50 hover:text-text-primary"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
