
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-white pt-20 pb-24 text-center">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          From Days to Hours:
          <br />
          <span className="text-blue-600">Preventing Overdose Fatalities with AI</span>
        </h2>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          An AI-powered decision support system empowering public health teams to detect opioid spikes in real-time, forecast risks, and deploy life-saving interventions faster than ever before.
        </p>
        <div className="mt-10">
          <a
            href="#"
            className="bg-blue-600 text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Get a Live Demo
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
