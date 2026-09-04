"use client";

import { useState } from "react";

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
};

export function PasswordField({
  value,
  onChange,
  autoComplete,
  required,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-2">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input mt-0 pr-14"
        autoComplete={autoComplete}
        required={required}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted hover:text-foreground"
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {visible ? "숨김" : "보기"}
      </button>
    </div>
  );
}
