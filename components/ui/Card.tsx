import React from "react";

interface CardProps {
  children: React.ReactNode;
  orange?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function Card({ children, orange = false, style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: orange ? "#0d0800" : "#080808",
        border: orange ? "1px solid #f9731630" : "1px solid #111",
        borderRadius: 10,
        padding: "16px",
        cursor: onClick ? "pointer" : undefined,
        position: "relative",
        ...style,
      }}
    >
      {orange && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#f97316", borderRadius: "10px 0 0 10px" }} />
      )}
      {children}
    </div>
  );
}
