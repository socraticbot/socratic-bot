'use client';

import { AVAILABLE_MODELS, TutorModel, getDefaultModel } from '@/lib/models';
import { useState, useEffect } from 'react';

interface ModelSelectorProps {
  selectedModel: TutorModel;
  onModelChange: (model: TutorModel) => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedModelId');
    if (saved) {
      const model = AVAILABLE_MODELS.find((m) => m.id === saved);
      if (model) {
        onModelChange(model);
      }
    }
  }, [onModelChange]);

  // Save to localStorage when model changes
  useEffect(() => {
    localStorage.setItem('selectedModelId', selectedModel.id);
  }, [selectedModel.id]);

  return (
    <div className="relative">
      {/* Selected Model Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
        aria-label="Select tutor model"
      >
        <span className="font-light">Your tutor:</span>
        <span className="font-medium">{selectedModel.name}</span>
        <span className="text-xs text-gray-400">({selectedModel.provider})</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 fade-in">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 mb-1">Choose your tutor</div>
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150 ${
                    selectedModel.id === model.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {model.provider}
                    {model.description && ` • ${model.description}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
