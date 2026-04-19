"use client";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return (
    <div style={{ position: "relative" }}>
      <svg
        style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }}
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f0f0f0" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 8,
          padding: "9px 12px 9px 32px",
          fontSize: 13,
          color: "#f0f0f0",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={e => (e.target.style.borderColor = "#f97316")}
        onBlur={e => (e.target.style.borderColor = "#1a1a1a")}
      />
    </div>
  );
}
