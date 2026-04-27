"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface ProAccess {
  isPro: boolean;
  loading: boolean;
  isLoggedIn: boolean;
}

export function useProAccess(): ProAccess {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      if (!supabase) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user?.email);
      if (!user?.email) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_profiles")
        .select("is_pro, pro_until")
        .eq("email", user.email)
        .maybeSingle();

      if (data?.is_pro && data?.pro_until) {
        const proUntil = new Date(data.pro_until);
        setIsPro(proUntil > new Date());
      }

      setLoading(false);
    }

    checkAccess();

    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAccess();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isPro, loading, isLoggedIn };
}
