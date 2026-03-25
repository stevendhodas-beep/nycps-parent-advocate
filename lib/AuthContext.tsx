"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  initAutoSession,
  clearSession,
  hasSharedRecords,
  type LaneId,
} from "./lane-manager";

interface AuthState {
  lane: LaneId;
  recordsShared: boolean;
  signOut: () => void;
  refreshRecordsShared: () => void;
}

const AuthContext = createContext<AuthState>({
  lane: "lane1",
  recordsShared: false,
  signOut: () => {},
  refreshRecordsShared: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [lane, setLane] = useState<LaneId>("lane1");
  const [recordsShared, setRecordsShared] = useState(false);

  useEffect(() => {
    initAutoSession().then((token) => setLane(token.lane));
    setRecordsShared(hasSharedRecords());
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setLane("lane1");
    // recordsShared intentionally persists — consent grants survive sign-out
  }, []);

  const refreshRecordsShared = useCallback(() => {
    setRecordsShared(hasSharedRecords());
  }, []);

  return (
    <AuthContext.Provider value={{ lane, recordsShared, signOut, refreshRecordsShared }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
