import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import OverviewPanel from '../components/dashboard/OverviewPanel';
import HeatMap from '../components/dashboard/HeatMap';
import TimeSeriesChart from '../components/dashboard/TimeSeriesChart';
import RecommendationsPanel from '../components/dashboard/RecommendationsPanel';
import { DataProvider } from '../contexts/DataContext';
import DataUploadModal from '../components/dashboard/DataUploadModal';
import ZipDetailModal from '../components/dashboard/ZipDetailModal';
import { User } from 'firebase/auth';

interface DashboardPageProps {
  user: User;
  handleLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, handleLogout }) => {
  return (
    <DataProvider user={user}>
      <div className="flex flex-col h-screen bg-gray-100">
        <DashboardHeader user={user} handleLogout={handleLogout} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                <OverviewPanel />
                <HeatMap />
                <TimeSeriesChart />
              </div>
              {/* Sidebar column */}
              <div className="lg:col-span-1">
                <RecommendationsPanel />
              </div>
            </div>
          </div>
        </main>
        <DataUploadModal />
        <ZipDetailModal />
      </div>
    </DataProvider>
  );
};

export default DashboardPage;