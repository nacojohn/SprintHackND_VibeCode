
import React from 'react';

const Testimonial: React.FC = () => {
  return (
    <section className="bg-blue-600 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-2xl md:text-3xl font-light leading-snug">
            “For the first time, we're proactive instead of reactive. The AI agent identified a spike in a rural ZIP code two days before our manual systems would have. That's a 48-hour head start that saved lives.”
          </p>
          <div className="mt-8">
            <p className="font-bold text-lg">Jane Doe</p>
            <p className="text-blue-200">County Overdose Response Coordinator, Pilot County</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
