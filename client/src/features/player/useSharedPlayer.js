import { useContext } from "react";
import { PlayerContext } from "./playerContextDefinition";

export const useSharedPlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("useSharedPlayer must be used within a PlayerProvider");
  }
  return context;
};
