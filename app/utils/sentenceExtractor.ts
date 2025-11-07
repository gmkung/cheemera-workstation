import { BeliefSet, Property } from '@/app/types/beliefset';

/**
 * Extracts all unique sentences from a belief set's antecedents and consequences
 * @param beliefSet - The belief set to extract sentences from
 * @returns Array of unique sentences (deduplicated)
 */
export function extractUniqueSentences(beliefSet: BeliefSet): string[] {
  const sentenceSet = new Set<string>();

  beliefSet.beliefs.forEach(belief => {
    // Extract from antecedents
    belief.scenario.antecedents.forEach(antecedentArray => {
      antecedentArray.forEach((property: Property) => {
        sentenceSet.add(property.sentence);
      });
    });

    // Extract from consequences
    belief.scenario.consequences.forEach(consequence => {
      consequence.properties.forEach((property: Property) => {
        sentenceSet.add(property.sentence);
      });
    });
  });

  return Array.from(sentenceSet).sort();
}
