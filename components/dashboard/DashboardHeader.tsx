import React from 'react';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { LogOutIcon } from '../icons/LogOutIcon';
import { useData } from '../../contexts/DataContext';
import { User } from 'firebase/auth';

interface DashboardHeaderProps {
  user: User;
  handleLogout: () => void;
}

const UserCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UploadCloudIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, handleLogout }) => {
  const { setIsUploadModalOpen } = useData();
  
  return (
    <header className="bg-white shadow-md z-10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">OSDR AI Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
           <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <UploadCloudIcon className="w-5 h-5" />
            <span>Upload Data</span>
          </button>
          <div className="flex items-center space-x-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
            ) : (
              <UserCircleIcon className="w-8 h-8 text-gray-500" />
            )}
            <span className="font-semibold text-gray-700 hidden sm:block">{user.displayName || user.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            aria-label="Logout"
            >
            <LogOutIcon className="w-6 h-6" />
            <span className="hidden md:block font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;