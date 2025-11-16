
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import ProblemSolution from '../components/ProblemSolution';
import HowItWorks from '../components/HowItWorks';
import Testimonial from '../components/Testimonial';
import Footer from '../components/Footer';
import { Page } from '../App';

interface LandingPageProps {
  navigateTo: (page: Page) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ navigateTo }) => {
  return (
    <>
      <Header navigateTo={navigateTo} />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <Testimonial />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
