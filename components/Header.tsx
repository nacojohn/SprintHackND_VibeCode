
import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { Page } from '../App';

interface HeaderProps {
  navigateTo: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">OSDR AI Agent</h1>
        </div>
        <nav>
          <button
            onClick={() => navigateTo('login')}
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
