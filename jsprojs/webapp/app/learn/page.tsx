'use client';

import { useState, useEffect } from 'react';

// List of 50 cognitive biases
const cognitiveBiases = [
  'Anchoring Bias',
  'Availability Heuristic',
  'Confirmation Bias',
  'Hindsight Bias',
  'Self-Serving Bias',
  'Negativity Bias',
  'Optimism Bias',
  'Dunning-Kruger Effect',
  'Fundamental Attribution Error',
  'Actor-Observer Bias',
  'False Consensus Effect',
  'In-Group Bias',
  'Out-Group Homogeneity Bias',
  'Halo Effect',
  'Horn Effect',
  'Stereotyping',
  'Implicit Association',
  'Status Quo Bias',
  'Loss Aversion',
  'Endowment Effect',
  'Sunk Cost Fallacy',
  'IKEA Effect',
  'Planning Fallacy',
  'Pro-innovation Bias',
  'Bandwagon Effect',
  'Authority Bias',
  'Obedience to Authority',
  'Appeal to Authority',
  'Appeal to Popularity',
  'Appeal to Tradition',
  'False Dilemma',
  'Straw Man',
  'Red Herring',
  'Ad Hominem',
  'Tu Quoque',
  'Slippery Slope',
  'Post Hoc',
  'Correlation vs Causation',
  'Gambler\'s Fallacy',
  'Regression to Mean',
  'Base Rate Neglect',
  'Conjunction Fallacy',
  'Representativeness Heuristic',
  'Framing Effect',
  'Anchoring and Adjustment',
  'Mental Accounting',
  'Hyperbolic Discounting',
  'Present Bias',
  'Choice-Supportive Bias',
  'Irrational Escalation',
  'Zero-Risk Bias',
];

// The composite image is 942x3156 pixels in a 10x5 grid (50 biases total)
const GRID_COLS = 10;
const GRID_ROWS = 5;
const TOTAL_BIASES = 50;

// Actual image dimensions (from file inspection)
const IMAGE_WIDTH = 942;
const IMAGE_HEIGHT = 3156;

// Calculate cell dimensions
const CELL_WIDTH = IMAGE_WIDTH / GRID_COLS;  // 94.2px per cell
const CELL_HEIGHT = IMAGE_HEIGHT / GRID_ROWS; // 631.2px per cell

export default function LearnPage() {
  const [selectedBias, setSelectedBias] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate grid position for CSS sprite using actual pixel dimensions
  const getBiasPosition = (index: number) => {
    const row = Math.floor(index / GRID_COLS);
    const col = index % GRID_COLS;
    // Calculate pixel positions
    const xPixels = col * CELL_WIDTH;
    const yPixels = row * CELL_HEIGHT;
    // Convert to percentage for background-position
    const xPercent = (xPixels / (IMAGE_WIDTH - CELL_WIDTH)) * 100;
    const yPercent = (yPixels / (IMAGE_HEIGHT - CELL_HEIGHT)) * 100;
    return {
      x: -xPercent,
      y: -yPercent,
    };
  };

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedBias((prev) => (prev + 1) % TOTAL_BIASES);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const position = getBiasPosition(selectedBias);

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-black mb-4 text-center">
          50 Cognitive Biases
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Explore the cognitive biases that shape our thinking
        </p>

        {/* Bias Slider */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col items-center">
            {/* Bias Image */}
            <div className="w-64 h-64 mb-6 overflow-hidden rounded-lg border-2 border-gray-200 relative">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: 'url(/biases.png)',
                  // Scale background to show exactly one cell (10x5 grid means each cell is 10% width, 20% height)
                  backgroundSize: `${GRID_COLS * 100}% ${GRID_ROWS * 100}%`,
                  // Position to show the correct cell (using calculated percentages)
                  backgroundPosition: `${position.x}% ${position.y}%`,
                  backgroundRepeat: 'no-repeat',
                  // Ensure the cell fills the container
                  backgroundOrigin: 'border-box',
                }}
              >
                {/* Invisible image to maintain aspect ratio and trigger onLoad */}
                <img
                  src="/biases.png"
                  alt="Cognitive biases"
                  className="opacity-0 w-full h-full object-none"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>

            {/* Bias Name */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              {cognitiveBiases[selectedBias]}
            </h2>

            {/* Navigation Dots */}
            <div className="flex gap-2 mb-6 flex-wrap justify-center max-w-2xl">
              {cognitiveBiases.map((bias, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedBias(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === selectedBias
                      ? 'bg-black w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`View ${bias}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedBias((prev) => (prev - 1 + TOTAL_BIASES) % TOTAL_BIASES)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => setSelectedBias((prev) => (prev + 1) % TOTAL_BIASES)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Bias List */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {cognitiveBiases.map((bias, index) => (
            <button
              key={index}
              onClick={() => setSelectedBias(index)}
              className={`p-3 text-sm rounded-lg text-left transition-colors ${
                index === selectedBias
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {bias}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
