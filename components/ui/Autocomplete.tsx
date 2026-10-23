"use client";

import { useId, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { findExact, prefixSearch, type Searchable } from "@/lib/text";

export interface AutocompleteProps<T extends Searchable = Searchable> {
  items: readonly T[];
  onSubmit: (item: T | null, rawText: string) => void;
  placeholder?: string;
  minChars?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  submitLabel?: string;
  suggestions?: boolean;
}

export default function Autocomplete<T extends Searchable = Searchable>({
  items,
  onSubmit,
  placeholder = "Type your guess...",
  minChars = 3,
  disabled = false,
  autoFocus = false,
  submitLabel = "Submit",
  suggestions = true,
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    if (!suggestions) return [];
    return prefixSearch(items, query, { minChars, limit: 8 });
  }, [items, query, minChars, suggestions]);

  const showDropdown =
    suggestions && !disabled && isOpen && matches.length > 0;

  const activeIndex =
    showDropdown && highlightedIndex >= 0 && highlightedIndex < matches.length
      ? highlightedIndex
      : -1;

  const commitSelection = (picked: T | null, raw: string) => {
    const trimmed = raw.trim();
    if (!picked && !trimmed) return;
    const resolved = picked ?? findExact(items, trimmed);
    onSubmit(resolved, trimmed);
    setQuery("");
    setHighlightedIndex(-1);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          value={query}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing slightly so option mouseDown/click registers
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              if (showDropdown) {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                  prev < matches.length - 1 ? prev + 1 : 0
                );
              }
            } else if (e.key === "ArrowUp") {
              if (showDropdown) {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                  prev > 0 ? prev - 1 : matches.length - 1
                );
              }
            } else if (e.key === "Escape") {
              if (showDropdown) {
                e.preventDefault();
                setIsOpen(false);
                setHighlightedIndex(-1);
              }
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (activeIndex >= 0 && matches[activeIndex]) {
                const picked = matches[activeIndex]!;
                commitSelection(picked, picked.label);
              } else {
                commitSelection(null, query);
              }
            }
          }}
          className="flex-1 px-3 py-2 rounded-md bg-white text-black font-semibold text-sm sm:text-base border-2 border-slate-500 focus:border-accent focus:outline-none disabled:opacity-50"
        />

        <Button
          variant="primary"
          disabled={disabled || !query.trim()}
          onClick={() => {
            if (activeIndex >= 0 && matches[activeIndex]) {
              const picked = matches[activeIndex]!;
              commitSelection(picked, picked.label);
            } else {
              commitSelection(null, query);
            }
          }}
        >
          {submitLabel}
        </Button>
      </div>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-md bg-white text-black shadow-xl border-2 border-slate-400 divide-y divide-gray-200"
        >
          {matches.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <li
                key={item.id}
                id={`${listboxId}-opt-${idx}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitSelection(item, item.label);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={cn(
                  "px-3 py-2 text-sm sm:text-base font-medium cursor-pointer text-left transition",
                  isActive ? "bg-primary text-white font-bold" : "hover:bg-gray-100"
                )}
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
