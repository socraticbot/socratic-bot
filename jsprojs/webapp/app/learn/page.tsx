'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// List of all cognitive bias images - using all available images
const cognitiveBiases = [
  { name: 'Anchoring', image: 'anchoring.png' },
  { name: 'Authority Bias', image: 'authority_bias.png' },
  { name: 'Automation Bias', image: 'automation_bias.png' },
  { name: 'Availability Cascade', image: 'availability_cascade_tied.png' },
  { name: 'Availability Heuristic', image: 'availability_heuristic.png' },
  { name: 'Belief Bias', image: 'belief_bias.png' },
  { name: 'Ben Franklin Effect', image: 'ben_franklin_effect.png' },
  { name: 'Self-Serving Bias', image: 'bias_self.png' },
  { name: 'Zero-Risk Bias', image: 'bias_zero.png' },
  { name: 'Blind Spot Bias', image: 'blind_spot_bias.png' },
  { name: 'Clustering Illusion', image: 'clustering_illusion.png' },
  { name: 'Confirmation Bias', image: 'confirmation_bias.png' },
  { name: 'Cryptomnesia', image: 'cryptomnesia.png' },
  { name: 'Curse of Knowledge', image: 'curse_of_knowledge.png' },
  { name: 'Declinism', image: 'declinism.png' },
  { name: 'Defensive Attribution', image: 'defensive_attribution.png' },
  { name: 'Bystander Effect', image: 'effect_bystander.png' },
  { name: 'Dunning-Kruger Effect', image: 'effect_dunning.png' },
  { name: 'Backfire Effect', image: 'effect_of_backfire.png' },
  { name: 'Bandwagon Effect', image: 'effect_of_bandwagon.png' },
  { name: 'Forer Effect', image: 'effect_of_forer.png' },
  { name: 'Framing Effect', image: 'effect_of_framing.png' },
  { name: 'Halo Effect', image: 'effect_of_halo.png' },
  { name: 'Placebo Effect', image: 'effect_of_placebo.png' },
  { name: 'Spotlight Effect', image: 'effect_spotlight.png' },
  { name: 'Third-Person Effect', image: 'effect_third.png' },
  { name: 'Zeigarnik Effect', image: 'effect_zeigarnik.png' },
  { name: 'Gambler\'s Fallacy', image: 'fallacy_fallacy.png' },
  { name: 'False Memory', image: 'false memory.png' },
  { name: 'False Consensus', image: 'false_consensus.png' },
  { name: 'Fundamental Attribution Error', image: 'fundamental_attribution_error.png' },
  { name: 'Google Effect', image: 'google effect.png' },
  { name: 'Groupthink', image: 'groupthink.png' },
  { name: 'IKEA Effect', image: 'ikea_effect.png' },
  { name: 'In-Group Favoritism', image: 'in_group_favoritism.png' },
  { name: 'Just-World Hypothesis', image: 'just_world_hypothesis.png' },
  { name: 'Law of Triviality', image: 'law_of_triviality.png' },
  { name: 'Moral Luck', image: 'moral_luck.png' },
  { name: 'Naive Cynicism', image: 'naive_cynicism.png' },
  { name: 'Optimism Bias', image: 'optimism_bias.png' },
  { name: 'Out-Group Homogeneity Bias', image: 'outgroup_homogeneity_bias.png' },
  { name: 'Pessimism Bias', image: 'pessimism_bias.png' },
  { name: 'Reactance', image: 'reactance.png' },
  { name: 'Realism', image: 'realism.png' },
  { name: 'Status Quo Bias', image: 'status_quo_bias.png' },
  { name: 'Stereotyping', image: 'stereotyping.png' },
  { name: 'Suggestibility', image: 'suggestibility.png' },
  { name: 'Sunk Cost Fallacy', image: 'sunk_cost_fallacy.png' },
  { name: 'Survivorship Bias', image: 'survivorship_bias.png' },
  { name: 'Tachypsychia', image: 'tachypsychia.png' },
];

const TOTAL_BIASES = cognitiveBiases.length;

export default function LearnPage() {
  const [selectedBias, setSelectedBias] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timerDuration, setTimerDuration] = useState(8); // Default 8 seconds

  // Auto-advance slider
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setSelectedBias((prev) => (prev + 1) % TOTAL_BIASES);
    }, timerDuration * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timerDuration]);

  const currentBias = cognitiveBiases[selectedBias];

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-black mb-4 text-center">
          Cognitive Biases
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Explore the cognitive biases that shape our thinking
        </p>

        {/* Bias Key */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap justify-center">
              <div className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: '#E63946' }}>
                Memory
              </div>
              <div className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: '#1D3557' }}>
                Social
              </div>
              <div className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: '#A8DADC' }}>
                Learning
              </div>
              <div className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: '#457B9D' }}>
                Belief
              </div>
              <div className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: '#90EE90' }}>
                Money
              </div>
              <div className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: '#FFD700' }}>
                Politics
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-4 items-center justify-center flex-wrap">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isPlaying 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isPlaying ? 'Stop' : 'Start'}
              </button>
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-medium">Timer:</label>
                <select
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={8}>8 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={20}>20 seconds</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bias Slider */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col items-center">
            {/* Bias Image */}
            <div className="w-64 h-96 mb-6 overflow-hidden rounded-lg border-2 border-gray-200 relative bg-gray-50 flex items-center justify-center">
              <Image
                src={`/biases/${currentBias.image}`}
                alt={currentBias.name}
                width={256}
                height={384}
                className="w-full h-full object-contain"
                onLoad={() => setImageLoaded(true)}
                unoptimized
              />
            </div>

            {/* Bias Name */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              {currentBias.name}
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
                  aria-label={`View ${bias.name}`}
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
              {bias.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
