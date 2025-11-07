'use client';

export default function ThemeSwatches() {
  const themes = [
    {
      name: "Terminal Precision",
      description: "Classic terminal aesthetic with refined contrast",
      colors: {
        background: '#0d1117',
        backgroundSecondary: '#161b22',
        primaryText: '#c9d1d9',
        accent: '#58a6ff',
        success: '#3fb950',
        error: '#f85149',
        border: '#30363d',
        highlight: '#161b22'
      }
    },
    {
      name: "Blueprint/Drafting",
      description: "Technical drawing aesthetic",
      colors: {
        background: '#0a1929',
        backgroundSecondary: '#1e3a5f',
        primaryText: '#e3f2fd',
        accent: '#90caf9',
        success: '#66bb6a',
        error: '#ef5350',
        border: '#1e3a5f',
        highlight: '#42a5f5'
      }
    },
    {
      name: "Monochrome Industrial",
      description: "Minimalist grayscale with single accent",
      colors: {
        background: '#121212',
        backgroundSecondary: '#1e1e1e',
        primaryText: '#e0e0e0',
        accent: '#ffa726',
        success: '#66bb6a',
        error: '#ef5350',
        border: '#424242',
        highlight: '#9e9e9e'
      }
    },
    {
      name: "Scientific Instrument",
      description: "Lab equipment display inspired",
      colors: {
        background: '#000000',
        backgroundSecondary: '#0a0a0a',
        primaryText: '#00ff00',
        accent: '#ffaa00',
        success: '#00ff00',
        error: '#ff3333',
        border: '#003300',
        highlight: '#33cc33'
      }
    },
    {
      name: "Blueprint Refined",
      description: "Stark blue palette with subtle status indicators",
      colors: {
        background: '#0a1929',
        backgroundSecondary: '#1e3a5f',
        primaryText: '#e3f2fd',
        accent: '#90caf9',
        success: '#4d7c8a',
        error: '#8a5563',
        border: '#1e3a5f',
        highlight: '#42a5f5'
      }
    }
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#1a1a1a' }}>
      <h1 className="text-4xl font-bold mb-2 text-center" style={{ color: '#ffffff' }}>
        Theme Swatches
      </h1>
      <p className="text-center mb-8" style={{ color: '#cccccc' }}>
        Preview all available themes - Click to navigate to full demo
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {themes.map((theme, index) => (
          <div
            key={index}
            className="border-2 rounded-lg overflow-hidden"
            style={{ borderColor: '#444444' }}
          >
            {/* Theme Header */}
            <div className="p-4" style={{ backgroundColor: theme.colors.background }}>
              <h2 className="text-2xl font-bold mb-1" style={{ color: theme.colors.accent }}>
                {theme.name}
              </h2>
              <p className="text-sm" style={{ color: theme.colors.primaryText, opacity: 0.7 }}>
                {theme.description}
              </p>
            </div>

            {/* Color Swatches */}
            <div className="p-4" style={{ backgroundColor: theme.colors.background }}>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Object.entries(theme.colors).map(([name, color]) => (
                  <div key={name} className="text-center">
                    <div
                      className="w-full h-16 rounded border mb-1"
                      style={{
                        backgroundColor: color,
                        borderColor: theme.colors.border
                      }}
                    />
                    <p className="text-xs" style={{ color: theme.colors.primaryText, opacity: 0.6 }}>
                      {name.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                ))}
              </div>

              {/* UI Preview */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border
                }}
              >
                <h3 className="text-lg font-bold mb-3" style={{ color: theme.colors.accent }}>
                  Sample UI Elements
                </h3>

                {/* Buttons */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <button
                    className="px-4 py-2 rounded font-medium"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color: theme.colors.background,
                      border: `1px solid ${theme.colors.accent}`
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded font-medium"
                    style={{
                      backgroundColor: theme.colors.success,
                      color: theme.colors.background,
                      border: `1px solid ${theme.colors.success}`
                    }}
                  >
                    Success
                  </button>
                  <button
                    className="px-4 py-2 rounded font-medium"
                    style={{
                      backgroundColor: theme.colors.error,
                      color: 'white',
                      border: `1px solid ${theme.colors.error}`
                    }}
                  >
                    Error
                  </button>
                </div>

                {/* Text samples */}
                <div className="space-y-2">
                  <p style={{ color: theme.colors.primaryText }}>
                    Primary text: The quick brown fox jumps over the lazy dog
                  </p>
                  <p style={{ color: theme.colors.accent }}>
                    Accent text: Important highlighted information
                  </p>
                  <p style={{ color: theme.colors.primaryText, opacity: 0.6 }}>
                    Secondary text: Additional details and metadata
                  </p>
                </div>

                {/* Input field */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Sample input field"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primaryText,
                      border: `1px solid ${theme.colors.border}`
                    }}
                  />
                </div>

                {/* Collapsible item preview */}
                <div className="mt-4">
                  <div
                    className="p-3 rounded border"
                    style={{
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <p style={{ color: theme.colors.accent }}>
                        ▶ Collapsible Section
                      </p>
                      <span style={{ color: theme.colors.highlight, fontSize: '0.875rem' }}>
                        (3 items)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="mt-4 flex gap-4">
                  <div className="flex items-center gap-2">
                    <span style={{ color: theme.colors.success }}>✓</span>
                    <span style={{ color: theme.colors.primaryText, fontSize: '0.875rem' }}>
                      Valid
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: theme.colors.error }}>✗</span>
                    <span style={{ color: theme.colors.primaryText, fontSize: '0.875rem' }}>
                      Invalid
                    </span>
                  </div>
                </div>
              </div>

              {/* Color codes */}
              <div className="mt-4 p-3 rounded text-xs" style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border
              }}>
                <p className="font-mono mb-1" style={{ color: theme.colors.primaryText, opacity: 0.8 }}>
                  <span style={{ color: theme.colors.highlight }}>Background:</span> {theme.colors.background}
                </p>
                <p className="font-mono mb-1" style={{ color: theme.colors.primaryText, opacity: 0.8 }}>
                  <span style={{ color: theme.colors.highlight }}>Text:</span> {theme.colors.primaryText}
                </p>
                <p className="font-mono" style={{ color: theme.colors.primaryText, opacity: 0.8 }}>
                  <span style={{ color: theme.colors.highlight }}>Accent:</span> {theme.colors.accent}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <a
          href="/"
          className="inline-block px-6 py-3 rounded-lg font-bold"
          style={{
            backgroundColor: '#58a6ff',
            color: '#0d1117',
            textDecoration: 'none'
          }}
        >
          ← Back to Belief Explorer
        </a>
      </div>
    </div>
  );
}
