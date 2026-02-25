"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface FollowCursorContextType {
  showFollowCursor: boolean;
  setShowFollowCursor: (show: boolean) => void;
  cursorScale: number;
  increaseCursorScale: (scale?: number) => void;
  resetCursorScale: () => void;
}

const FollowCursorContext = createContext<FollowCursorContextType | undefined>(undefined);

export const useFollowCursor = () => {
  const context = useContext(FollowCursorContext);
  if (!context) {
    throw new Error("useFollowCursor must be used within a FollowCursorProvider");
  }
  return context;
};

interface FollowCursorProviderProps {
  children: ReactNode;
}

export const FollowCursorProvider = ({ children }: FollowCursorProviderProps) => {
  const [showFollowCursor, setShowFollowCursor] = useState(true);
  const [cursorScale, setCursorScale] = useState<number>(16);

  const increaseCursorScale = (scale = 160) => {
    setCursorScale(scale);
  };

  const resetCursorScale = () => {
    setCursorScale(16);
  };

  return (
    <FollowCursorContext.Provider
      value={{
        showFollowCursor,
        setShowFollowCursor,
        cursorScale,
        increaseCursorScale,
        resetCursorScale,
      }}
    >
      {children}
    </FollowCursorContext.Provider>
  );
};
