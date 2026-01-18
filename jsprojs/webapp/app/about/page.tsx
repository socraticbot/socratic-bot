'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What do we do?',
    answer: 'We use AI to build and evaluate human capabilities related to critical thinking.',
  },
  {
    question: 'What is our story?',
    answer: 'After years of teaching critical thinking skills and exploring LLM progress, especially guiding middle and high school students to use LLMs to boost their thinking and study skills, Veronica Schrenk had the idea to create an LLM-powered chatbot for teaching critical thinking. Socratic.bot was born in 2023 at Zuzalu, a 2-month experiment that brought together builders and thinkers in frontier industries, and originally had the title Paideia AI. We started building a critical thinking tutor and researching rationality pedagogy, exploring how emerging LLM capabilities can be directed towards evaluating and improving human reasoning. We built and launched our prototype during the HackZuzalu hackathon in November 2023, where we were awarded 1st place for the AI track and facilitated a community governance discussion with 20 Zuzaluans using our bot to refine their arguments. In early 2024 we participated in the Vitalia and MiraclePlus Startup Accelerator programs. When Paideia decided to pursue a different path, Veronica founded Socratic.Bot to pursue the original mission of building an open-source critical thinking AI tutor. We recently launched our free-to-use tutor, open sourced our code, and integrated as a module with the discussion forum Agora.city.',
  },
  {
    question: 'How does it work?',
    answer: 'Socratic.bot is an LLM-powered rules-based expert system. We combine rigid conversational focus with the context dependency of natural language programming. We embed human expert interviewer logic by replicating the internal thought processes and behavior of a critical thinking progressor, using an agent-based cognitive infrastructure. Socratic.bot acts as a language agent and treats the interview as a language game, with the objective to extract information from its interlocutor.',
  },
  {
    question: 'What are we up to now?',
    answer: `We are currently migrating to a fully decentralized stack:

**Current State:**
- **Hosting**: Framer (to be migrated)
- **LLM**: OpenAI GPT-4 via direct API
- **Storage**: PostgreSQL (centralized)
- **Identity**: Email-based authentication
- **Frontend**: Remix app (MVP in jsprojs/mvp/)
- **Backend**: FastAPI chat server (in pyprojs/chatserver/)

**Target State:**
- **Hosting**: Vercel (initial), exploring fully decentralized with ENS + Arkiv decentralized database + Swarm storage
- **LLM**: Multiple models via Vercel AI Gateway (users can choose their preferred model)
- **Storage**: Swarm (decentralized) for persistent memory
- **Identity**: EVM-compatible wallet (MetaMask, WalletConnect)
- **Frontend**: Next.js on Vercel
- **Backend**: Vercel Serverless Functions + Edge Functions

**Model Selection & User Choice**: Users will be able to select between AI models to be their Socratic tutor, allowing user-choice with regards to privacy & overall comparison of model capabilities.`,
  },
];

export default function AboutPage() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Office Image */}
      <div className="w-full">
        <Image
          src="/socraticoffice.png"
          alt="Socratic Office"
          width={1200}
          height={600}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto p-8 space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-green-50 border border-green-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full text-left p-4 flex items-center justify-between hover:bg-green-100 transition-colors"
            >
              <span className="text-lg font-medium text-gray-800">
                {expandedItems.has(index) ? '−' : '+'} {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                  expandedItems.has(index) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedItems.has(index) && (
              <div className="px-4 pb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
