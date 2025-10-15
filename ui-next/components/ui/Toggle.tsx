"use client";
import React from "react";

type ToggleProps = {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export default function Toggle({ id, checked, onChange, label, description, disabled, className }: ToggleProps) {
  const toggleId = id || React.useId();
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={toggleId} className="block text-sm text-slate-500 mb-1">
          {label}
        </label>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={toggleId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-slate-300",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </button>
      {description ? (
        <div className="mt-1 text-xs text-slate-500">{description}</div>
      ) : null}
    </div>
  );
}

