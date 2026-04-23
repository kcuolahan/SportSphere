"use client";

import { useState, useEffect } from "react";

export function useProAccess(): boolean {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    try {
      setIsPro(localStorage.getItem("ss_pro_access") === "1");
    } catch { /* ignore SSR */ }
  }, []);

  return isPro;
}
