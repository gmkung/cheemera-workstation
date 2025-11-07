// TypeScript types for Cheemera belief sets and exploration
// Based on server/src/types/interfaces.ts

export interface Property {
  valence: boolean;
  sentence: string;
}

export interface Consequence {
  modal: ModalType;
  properties: Property[];
}

export type ScenarioType = "IF_THEN" | "MUTUAL_EXCLUSION" | "MUTUAL_INCLUSION";
export type ModalType = "Always" | "Never";

export interface Scenario {
  type: ScenarioType;
  consequences: Consequence[];
  antecedents: Property[][];
}

export interface Belief {
  scenario: Scenario;
  beliefUniqueId: string;
  originatingRuleSystemName: string;
  originatingRuleSystemUuid: string;
}

export interface BeliefSet {
  beliefs: Belief[];
  beliefSetName: string;
  beliefSetOwner: string;
  beliefSetVersion: string;
  blindReferenceExternalIdArray: any[];
}

export interface Assertion {
  exclude: boolean;
  properties: Property[];
  sourceBeliefId?: string;
}

export interface AssertionSet {
  assertions: Assertion[];
}

// Explore-specific types
export interface ExploreResult {
  resultCode: string;
  resultReason: string;
  results: {
    possible: boolean;
    reasoningSteps: ReasoningStep[];
    arrayOfSecondaryResidues: string[];
  };
}

export interface ReasoningStep {
  deducedProperty?: Property[];
  inferenceStepType: string;
  sourceBeliefId?: string;
}

// UI-specific types
export interface SentenceSelector {
  sentence: string;
  valence: boolean;
}

export interface ExploreTab {
  id: string;
  name: string;
  selectors: SentenceSelector[];
  result: ExploreResult | null;
  isLoading: boolean;
}

export interface BeliefSetFile {
  fileName: string;
  beliefSet: BeliefSet;
}
