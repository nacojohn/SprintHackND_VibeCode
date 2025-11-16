
import React from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import { TargetIcon } from './icons/TargetIcon';
import { ZapIcon } from './icons/ZapIcon';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features: React.FC = () => {
  const features = [
    {
      icon: <AlertTriangleIcon className="w-6 h-6" />,
      title: "Real-Time Spike Detection",
      description: "Detects statistical anomalies in overdose patterns at the ZIP code level, flagging spikes as they emerge.",
    },
    {
      icon: <BarChartIcon className="w-6 h-6" />,
      title: "Predictive Risk Forecasting",
      description: "Forecasts spike risk 3-7 days in advance by analyzing leading indicators like naloxone usage and severity trends.",
    },
    {
      icon: <TargetIcon className="w-6 h-6" />,
      title: "Actionable Recommendations",
      description: "Recommends prioritized interventions and resource deployments based on historical effectiveness and current capacity.",
    },
    {
      icon: <ZapIcon className="w-6 h-6" />,
      title: "Automated Communication",
      description: "Auto-generates situational updates and partner outreach emails, drastically reducing manual reporting time.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900">A Smarter, Faster Response System</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Our platform is designed to give your team the critical intelligence needed to act decisively.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 text-left">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
