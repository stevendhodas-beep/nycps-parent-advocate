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
  workflowResetCount: number;
  signOut: () => void;
  refreshRecordsShared: () => void;
  resetWorkflow: () => void;
}

const AuthContext = createContext<AuthState>({
  lane: "lane1",
  recordsShared: false,
  workflowResetCount: 0,
  signOut: () => {},
  refreshRecordsShared: () => {},
  resetWorkflow: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [lane, setLane] = useState<LaneId>("lane1");
  const [recordsShared, setRecordsShared] = useState(false);
  const [workflowResetCount, setWorkflowResetCount] = useState(0);

  const resetWorkflow = useCallback(() => setWorkflowResetCount(c => c + 1), []);

  useEffect(() => {
    initAutoSession().then((token) => {
      setLane(token.lane);
      setRecordsShared(hasSharedRecords());
    });
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
    <AuthContext.Provider value={{ lane, recordsShared, workflowResetCount, signOut, refreshRecordsShared, resetWorkflow }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
