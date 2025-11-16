
import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Real-Time Analysis',
      description: 'Our AI engine continuously analyzes overdose data, detecting statistical anomalies at the ZIP-code level as they emerge.',
    },
    {
      number: 2,
      title: 'Predictive Forecasting',
      description: 'Look ahead 3-7 days with predictive analytics that identify at-risk areas before a crisis escalates, allowing for proactive resource staging.',
    },
    {
      number: 3,
      title: 'Prioritized Recommendations',
      description: 'Receive clear, data-driven recommendations on where and how to deploy mobile teams and naloxone for maximum impact.',
    },
     {
      number: 4,
      title: 'Automated Communication',
      description: 'Instantly generate reports and outreach templates to ensure all stakeholders are informed for a rapid, coordinated response.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900">From Data to Life-Saving Action</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Our AI agent transforms raw data into a clear, strategic response with a streamlined workflow.
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
