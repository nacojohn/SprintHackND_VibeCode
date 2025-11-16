
import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Upload Your Data',
      description: 'Easily upload your local ODMAP export (CSV/Excel). Our system validates and processes the data in seconds.',
    },
    {
      number: 2,
      title: 'AI Analyzes & Forecasts',
      description: 'Gemini API analyzes historical and current data to detect active spikes and forecast emerging risks by ZIP code.',
    },
    {
      number: 3,
      title: 'Get Actionable Insights',
      description: 'Receive a prioritized list of interventions, resource suggestions, and auto-generated reports on your dashboard.',
    },
     {
      number: 4,
      title: 'Deploy & Communicate',
      description: 'Use AI-generated templates to instantly alert partners and leadership, ensuring a coordinated and rapid response.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Get Started in 4 Simple Steps</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your data into life-saving action with a streamlined workflow.
        </p>
        <div className="mt-12 relative">
          {/* Dashed line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-transparent">
            <div className="absolute top-0 left-0 w-full border-t-2 border-dashed border-gray-300 -translate-y-1/2"></div>
          </div>
          <div className="grid md:grid-cols-4 gap-10">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 flex items-center justify-center bg-white border-2 border-blue-600 text-blue-600 rounded-full font-bold text-2xl mb-4 shadow-lg">
                  {step.number}
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
