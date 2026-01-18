'use client';

import { AVAILABLE_MODELS, TutorModel } from '@/lib/models';
import Image from 'next/image';

interface ModelSelectorProps {
  selectedModel: TutorModel;
  onModelChange: (model: TutorModel) => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-serif text-gray-800 mb-6 text-center">Select your tutor</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {AVAILABLE_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedModel.id === model.id
                ? 'border-black bg-gray-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              {/* Model Avatar */}
              <div className="w-16 h-16 mx-auto mb-3">
                <Image
                  src={model.avatar}
                  alt={model.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Model Name */}
              <div className="font-medium text-sm text-gray-800 mb-1">{model.name}</div>
              {/* Provider */}
              <div className="text-xs text-gray-500">{model.provider}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
