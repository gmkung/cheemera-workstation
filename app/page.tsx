'use client';

import { useState, useEffect } from 'react';
import { BeliefSetFile, ExploreTab, ExploreResult, Belief } from '@/app/types/beliefset';
import { extractUniqueSentences } from '@/app/utils/sentenceExtractor';

export default function Home() {
  const [beliefSets, setBeliefSets] = useState<BeliefSetFile[]>([]);
  const [selectedBeliefSet, setSelectedBeliefSet] = useState<BeliefSetFile | null>(null);
  const [availableSentences, setAvailableSentences] = useState<string[]>([]);
  const [tabs, setTabs] = useState<ExploreTab[]>([
    {
      id: '1',
      name: 'Explore 1',
      selectors: [],
      result: null,
      isLoading: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [showBeliefModal, setShowBeliefModal] = useState(false);
  const [hoveredBelief, setHoveredBelief] = useState<Belief | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Load belief sets on mount
  useEffect(() => {
    fetch('/api/beliefsets')
      .then(res => res.json())
      .then(data => setBeliefSets(data))
      .catch(err => console.error('Failed to load belief sets:', err));
  }, []);

  // Extract sentences when belief set is selected
  useEffect(() => {
    if (selectedBeliefSet) {
      const sentences = extractUniqueSentences(selectedBeliefSet.beliefSet);
      setAvailableSentences(sentences);
    }
  }, [selectedBeliefSet]);

  // Auto-run explore when selectors change
  useEffect(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && activeTab.selectors.length > 0 && selectedBeliefSet) {
      runExplore(activeTabId);
    }
  }, [tabs.find(t => t.id === activeTabId)?.selectors]);

  const handleBeliefSetChange = (fileName: string) => {
    const beliefSet = beliefSets.find(bs => bs.fileName === fileName);
    setSelectedBeliefSet(beliefSet || null);
    // Reset tabs
    setTabs([
      {
        id: '1',
        name: 'Explore 1',
        selectors: [],
        result: null,
        isLoading: false
      }
    ]);
    setActiveTabId('1');
  };

  const addSelector = (tabId: string, sentence?: string) => {
    setTabs(tabs.map(tab => {
      if (tab.id === tabId) {
        return {
          ...tab,
          selectors: [...tab.selectors, { sentence: sentence || availableSentences[0] || '', valence: true }]
        };
      }
      return tab;
    }));
  };

  const removeSelector = (tabId: string, index: number) => {
    setTabs(tabs.map(tab => {
      if (tab.id === tabId) {
        return {
          ...tab,
          selectors: tab.selectors.filter((_, i) => i !== index)
        };
      }
      return tab;
    }));
  };

  const updateSelector = (tabId: string, index: number, field: 'sentence' | 'valence', value: string | boolean) => {
    setTabs(tabs.map(tab => {
      if (tab.id === tabId) {
        const newSelectors = [...tab.selectors];
        newSelectors[index] = { ...newSelectors[index], [field]: value };
        return { ...tab, selectors: newSelectors };
      }
      return tab;
    }));
  };

  const runExplore = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !selectedBeliefSet) return;

    // Set loading state
    setTabs(tabs.map(t => t.id === tabId ? { ...t, isLoading: true } : t));

    try {
      const properties = tab.selectors.map(s => ({
        sentence: s.sentence,
        valence: s.valence
      }));

      const response = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beliefSet: selectedBeliefSet.beliefSet,
          properties
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result: ExploreResult = await response.json();

      console.log('Explore result:', result);

      setTabs(tabs.map(t =>
        t.id === tabId ? { ...t, result, isLoading: false } : t
      ));
    } catch (error) {
      console.error('Explore failed:', error);
      setTabs(tabs.map(t =>
        t.id === tabId ? { ...t, isLoading: false } : t
      ));
    }
  };

  const duplicateTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const newId = Date.now().toString();
    const newTab: ExploreTab = {
      ...tab,
      id: newId,
      name: `${tab.name} (copy)`,
      result: null
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Keep at least one tab

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const addNewTab = () => {
    const newId = Date.now().toString();
    const newTab: ExploreTab = {
      id: newId,
      name: `Explore ${tabs.length + 1}`,
      selectors: [],
      result: null,
      isLoading: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const findBeliefById = (beliefId: string): Belief | null => {
    if (!selectedBeliefSet) return null;
    return selectedBeliefSet.beliefSet.beliefs.find(b => b.beliefUniqueId === beliefId) || null;
  };

  const handleDeductionHover = (beliefId: string | undefined, event: React.MouseEvent) => {
    if (beliefId) {
      const belief = findBeliefById(beliefId);
      if (belief) {
        setHoveredBelief(belief);
      }
    }
  };

  // Helper function to format property display (DRY principle)
  const formatProperty = (sentence: string, valence: boolean) => {
    const lowercaseSentence = sentence.charAt(0).toLowerCase() + sentence.slice(1);
    return (
      <>
        {valence ? (
          <>
            <span style={{ fontStyle: 'italic', opacity: 0.8 }}>It is true that </span>
            {lowercaseSentence}
          </>
        ) : (
          <>
            <span style={{ fontStyle: 'italic', opacity: 0.8 }}>It is </span>
            <span style={{ fontWeight: 'bold', fontStyle: 'italic', opacity: 0.8 }}>not</span>
            <span style={{ fontStyle: 'italic', opacity: 0.8 }}> true that </span>
            {lowercaseSentence}
          </>
        )}
      </>
    );
  };


  const toggleStep = (stepKey: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepKey)) {
        newSet.delete(stepKey);
      } else {
        newSet.add(stepKey);
      }
      return newSet;
    });
  };

  const expandAllSteps = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.result) return;
    const allKeys = tab.result.results.reasoningSteps.map((_, i) => `${tabId}-${i}`);
    setExpandedSteps(new Set(allKeys));
  };

  const collapseAllSteps = () => {
    setExpandedSteps(new Set());
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'sans-serif', backgroundColor: '#0a1929' }}>
      {/* Left Sidebar - Belief Sets */}
      <div
        className="fixed left-0 top-0 bottom-0 w-80 p-4 border-r-2 overflow-y-auto"
        style={{
          backgroundColor: '#1e3a5f',
          borderColor: '#90caf9',
          boxShadow: '2px 0 8px rgba(144, 202, 249, 0.2)'
        }}
      >
        <h2 className="text-2xl font-bold mb-4 pb-2 border-b" style={{
          color: '#90caf9',
          borderColor: '#42a5f5'
        }}>
          Belief Sets
        </h2>

        <div className="space-y-2">
          {beliefSets.map(bs => (
            <button
              key={bs.fileName}
              onClick={() => handleBeliefSetChange(bs.fileName)}
              className="w-full text-left px-3 py-3 rounded-lg border transition-all"
              style={{
                backgroundColor: selectedBeliefSet?.fileName === bs.fileName ? '#42a5f5' : '#0a1929',
                borderColor: selectedBeliefSet?.fileName === bs.fileName ? '#90caf9' : '#1e3a5f',
                color: selectedBeliefSet?.fileName === bs.fileName ? 'white' : '#e3f2fd',
                boxShadow: selectedBeliefSet?.fileName === bs.fileName
                  ? '0 0 8px rgba(144, 202, 249, 0.4)'
                  : 'none'
              }}
            >
              <div className="font-medium">{bs.beliefSet.beliefSetName}</div>
              <div className="text-xs mt-1 opacity-70">{bs.fileName}</div>
            </button>
          ))}
        </div>

        {selectedBeliefSet && (
          <button
            onClick={() => setShowBeliefModal(true)}
            className="w-full mt-4 px-4 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: '#90caf9',
              color: '#0a1929',
              border: '1px solid #90caf9'
            }}
          >
            View All Beliefs
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="ml-80 flex-1 p-8" style={{ marginRight: '400px' }}>
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#90caf9' }}>
          Cheemera Belief Set Explorer
        </h1>

        {/* Tabs */}
        {selectedBeliefSet && (
          <div className="mb-4">
            <div className="flex gap-2 border-b-2" style={{ borderColor: '#90caf9' }}>
              {tabs.map(tab => (
                <div key={tab.id} className="flex items-center">
                  <button
                    onClick={() => setActiveTabId(tab.id)}
                    className="px-4 py-2 font-medium rounded-t-lg"
                    style={{
                      backgroundColor: activeTabId === tab.id ? '#42a5f5' : '#1e3a5f',
                      color: activeTabId === tab.id ? 'white' : '#90caf9',
                      border: '1px solid #1e3a5f'
                    }}
                  >
                    {tab.name}
                  </button>
                  {tabs.length > 1 && (
                    <button
                      onClick={() => closeTab(tab.id)}
                      className="px-2 py-2 text-sm"
                      style={{ color: '#90caf9' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addNewTab}
                className="px-4 py-2 font-medium rounded-t-lg"
                style={{
                  backgroundColor: '#90caf9',
                  color: '#0a1929',
                  border: '1px solid #90caf9'
                }}
              >
                + New Tab
              </button>
            </div>
          </div>
        )}

        {/* Active Tab Content */}
        {selectedBeliefSet && activeTab && (
          <div className="p-6 rounded-lg shadow-lg border-2" style={{
            backgroundColor: '#1e3a5f',
            borderColor: '#90caf9',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Tab Controls */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => duplicateTab(activeTab.id)}
                className="px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: '#90caf9',
                  color: '#0a1929',
                  border: '1px solid #90caf9'
                }}
              >
                Duplicate Tab
              </button>
            </div>

            {/* Sentence Selectors */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#90caf9' }}>
                Explore Properties
              </h2>

              {activeTab.selectors.map((selector, index) => {
                const bgColor = selector.valence ? '#4d7c8a' : '#8a5563';
                const borderColor = selector.valence ? '#4d7c8a' : '#8a5563';

                return (
                  <div key={index} className="flex gap-3 items-center mb-3">
                    <div
                      className="flex-1 p-3 rounded-lg border cursor-pointer"
                      style={{
                        backgroundColor: bgColor,
                        borderColor: borderColor
                      }}
                      onClick={() => updateSelector(activeTab.id, index, 'valence', !selector.valence)}
                    >
                      <p style={{ color: '#e3f2fd' }}>
                        {formatProperty(selector.sentence, selector.valence)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeSelector(activeTab.id, index)}
                      className="px-3 py-2 rounded-lg font-medium"
                      style={{
                        backgroundColor: '#8a5563',
                        color: 'white',
                        border: '1px solid #8a5563'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}

              {/* Search input for filtering sentences */}
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Search sentences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{
                    borderColor: '#1e3a5f',
                    backgroundColor: '#0a1929',
                    color: '#e3f2fd'
                  }}
                />

                {/* Filtered sentences list */}
                {isSearchFocused && (
                  <div
                    className="mt-2 border rounded-lg max-h-60 overflow-y-auto"
                    style={{
                      borderColor: '#1e3a5f',
                      backgroundColor: '#0a1929'
                    }}
                  >
                    {availableSentences
                      .filter(sentence =>
                        !activeTab.selectors.some(s => s.sentence === sentence) &&
                        sentence.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(sentence => (
                        <div
                          key={sentence}
                          className="px-3 py-2 cursor-pointer hover:bg-opacity-80"
                          style={{
                            color: '#e3f2fd',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1e3a5f';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onClick={() => {
                            addSelector(activeTab.id, sentence);
                            setSearchQuery('');
                          }}
                        >
                          {sentence}
                        </div>
                      ))}
                    {availableSentences
                      .filter(sentence =>
                        !activeTab.selectors.some(s => s.sentence === sentence) &&
                        sentence.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                      <div className="px-3 py-2" style={{ color: '#90caf9', opacity: 0.6 }}>
                        No sentences found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {activeTab.result && activeTab.result.results && (
              <div className="mt-6 border-t-2 pt-6" style={{
                borderColor: '#90caf9'
              }}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#90caf9' }}>
                  Results
                </h3>

                <div className="mb-4">
                  <p className="text-lg" style={{ color: '#e3f2fd' }}>
                    <span className="font-bold">Possible:</span>{' '}
                    <span style={{
                      color: activeTab.result.results.possible ? '#4d7c8a' : '#8a5563',
                      fontWeight: 'bold'
                    }}>
                      {activeTab.result.results.possible ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-3" style={{ color: '#42a5f5' }}>
                    Reasoning Steps
                  </h4>
                  {activeTab.result.results.reasoningSteps.map((step, index) => {
                    // Get all deduced properties for this step
                    const properties = step.deducedProperty || [];

                    return (
                      <div key={index} className="mb-3">
                        {properties.map((prop, propIndex) => {
                          // Use True button color (#4d7c8a) for true, Remove button (#8a5563) for false
                          const bgColor = prop.valence ? '#4d7c8a' : '#8a5563';
                          const borderColor = prop.valence ? '#4d7c8a' : '#8a5563';

                          return (
                            <div
                              key={propIndex}
                              className="p-3 rounded-lg border mb-2"
                              style={{
                                backgroundColor: bgColor,
                                borderColor: borderColor,
                                cursor: step.sourceBeliefId ? 'pointer' : 'default'
                              }}
                              onMouseEnter={(e) => step.sourceBeliefId && handleDeductionHover(step.sourceBeliefId, e)}
                            >
                              <p style={{ color: '#e3f2fd' }}>
                                <span className="font-medium" style={{ color: '#90caf9' }}>
                                  {index + 1}.
                                </span>{' '}
                                {formatProperty(prop.sentence, prop.valence)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Belief Modal */}
        {showBeliefModal && selectedBeliefSet && (
          <div
            className="fixed inset-0 flex items-center justify-center p-8"
            style={{ backgroundColor: 'rgba(10, 25, 41, 0.95)' }}
            onClick={() => setShowBeliefModal(false)}
          >
            <div
              className="p-8 rounded-lg shadow-2xl max-w-4xl max-h-[80vh] overflow-y-auto"
              style={{
                backgroundColor: '#1e3a5f',
                border: '2px solid #90caf9',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold" style={{ color: '#90caf9' }}>
                  {selectedBeliefSet.beliefSet.beliefSetName}
                </h2>
                <button
                  onClick={() => setShowBeliefModal(false)}
                  className="text-2xl"
                  style={{ color: '#90caf9' }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {selectedBeliefSet.beliefSet.beliefs.map((belief, index) => (
                  <div
                    key={belief.beliefUniqueId}
                    className="p-4 rounded-lg border-2"
                    style={{
                      borderColor: '#1e3a5f',
                      backgroundColor: '#0a1929'
                    }}
                  >
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#90caf9' }}>
                      Belief {index + 1}: {belief.beliefUniqueId}
                    </h3>
                    <p className="mb-2" style={{ color: '#e3f2fd' }}>
                      <span className="font-medium">Type:</span> {belief.scenario.type}
                    </p>

                    {belief.scenario.antecedents.length > 0 && (
                      <div className="mb-2">
                        <p className="font-medium" style={{ color: '#42a5f5' }}>Antecedents:</p>
                        <ul className="ml-4" style={{ color: '#e3f2fd' }}>
                          {belief.scenario.antecedents.map((antGroup, i) => (
                            <li key={i}>
                              {antGroup.map((prop, j) => (
                                <span key={j}>
                                  {j > 0 && ' AND '}
                                  {prop.valence ? '' : 'NOT '}
                                  {prop.sentence}
                                </span>
                              ))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {belief.scenario.consequences.length > 0 && (
                      <div>
                        <p className="font-medium" style={{ color: '#42a5f5' }}>Consequences:</p>
                        <ul className="ml-4" style={{ color: '#e3f2fd' }}>
                          {belief.scenario.consequences.map((cons, i) => (
                            <li key={i}>
                              <span className="italic">({cons.modal})</span>{' '}
                              {cons.properties.map((prop, j) => (
                                <span key={j}>
                                  {j > 0 && ' AND '}
                                  {prop.valence ? '' : 'NOT '}
                                  {prop.sentence}
                                </span>
                              ))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fixed Belief Inspector Panel */}
        <div
          className="fixed right-4 top-4 bottom-4 w-96 p-4 rounded-lg shadow-xl border-2 overflow-auto z-50"
          style={{
            backgroundColor: '#0a1929',
            borderColor: '#90caf9',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-lg" style={{ color: '#90caf9' }}>
              Belief Inspector
            </h4>
          </div>
          {hoveredBelief ? (
            <>
              <div className="mb-2 pb-2 border-b" style={{ borderColor: '#1e3a5f' }}>
                <p className="font-bold" style={{ color: '#42a5f5' }}>
                  {hoveredBelief.beliefUniqueId}
                </p>
              </div>
              <pre className="text-xs" style={{ color: '#e3f2fd', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(hoveredBelief, null, 2)}
              </pre>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-center" style={{ color: '#90caf9', opacity: 0.6 }}>
                Hover over a deduction to inspect its source belief
              </p>
            </div>
          )}
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
