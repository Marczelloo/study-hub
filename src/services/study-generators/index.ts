// Study generation providers index

import type { StudyGenerationProvider, GeneratorType } from "./types";
import { aiProvider } from "./ai.provider";
import { heuristicProvider } from "./heuristic.provider";

export * from "./types";
export { aiProvider, heuristicProvider };

export function getStudyGenerationProvider(type: GeneratorType): StudyGenerationProvider {
  switch (type) {
    case "ai":
      return aiProvider;
    case "basic":
    default:
      return heuristicProvider;
  }
}
