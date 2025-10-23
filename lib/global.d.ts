declare global {
  interface Window {
    ym?: (
      id: number,
      event: "init" | "reachGoal" | "hit",
      goalName?: string,
      params?: Record<string, any>
    ) => void;
  }
}

export {};
