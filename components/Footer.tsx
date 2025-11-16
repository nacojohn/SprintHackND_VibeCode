
import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <ShieldCheckIcon className="w-7 h-7 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-800">OSDR AI Agent</h1>
            </div>
            <p className="text-gray-500 mt-2">Empowering Public Health. Saving Lives.</p>
          </div>
          <div className="flex space-x-6 text-gray-500">
            <a href="#" className="hover:text-blue-600">About</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Opioid Spike Detection & Response AI Agent. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
