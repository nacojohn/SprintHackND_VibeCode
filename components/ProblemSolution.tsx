
import React from 'react';

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ProblemSolution: React.FC = () => {
  const problems = [
    "1-3 day delays in spike detection",
    "Manual data downloads & cleaning",
    "Fragmented data sources",
    "Lagged intelligence for deployment",
  ];

  const solutions = [
    "Detects spikes in under 24 hours",
    "Automates data ingestion & analysis",
    "Forecasts spike risk 3-7 days in advance",
    "Recommends prioritized interventions",
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">The Problem: Delayed Action</h3>
            <p className="text-gray-600 mb-6">County public health teams face critical delays that lead to preventable deaths. Manual processes and fragmented data mean action is taken too late.</p>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start">
                  <XCircleIcon className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{problem}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-600">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">The Solution: AI-Powered Response</h3>
             <p className="text-gray-600 mb-6">Our AI agent transforms your workflow, providing the tools to get ahead of overdose spikes and save lives.</p>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
