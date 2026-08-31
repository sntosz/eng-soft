"use client";

import { useAuth } from "@/contexts/AuthContext";

export function useCurrentUser() {
  return useAuth();
}

