
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ProblemSolution from './components/ProblemSolution';
import HowItWorks from './components/HowItWorks';
import Testimonial from './components/Testimonial';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <Testimonial />
      </main>
      <Footer />
    </div>
  );
};

export default App;
