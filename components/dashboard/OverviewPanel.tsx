import React from 'react';
import { LayoutDashboardIcon } from '../icons/LayoutDashboardIcon';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';
import { useData } from '../../contexts/DataContext';

const OverviewPanel: React.FC = () => {
  const { analysis, forecast, loading } = useData();

  const getRiskLevelDisplay = (risk: string | null) => {
    if (!risk) return { text: 'N/A', color: 'text-gray-700' };
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes('high')) return { text: 'High Risk', color: 'text-yellow-700' };
    if (lowerRisk.includes('moderate')) return { text: 'Moderate Risk', color: 'text-blue-700' };
    if (lowerRisk.includes('low')) return { text: 'Low Risk', color: 'text-green-700' };
    return { text: risk, color: 'text-gray-700' };
  };

  const threeDayForecast = getRiskLevelDisplay(forecast?.threeDay || null);
  const sevenDayForecast = getRiskLevelDisplay(forecast?.sevenDay || null);

  const criticalAlerts = analysis.zipAnalyses.filter(z => z.severity === 'Critical');
  const highAlerts = analysis.zipAnalyses.filter(z => z.severity === 'High');
  const activeAlerts = criticalAlerts.length + highAlerts.length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <LayoutDashboardIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">County Overview</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Total Incidents (7d)</p>
          <p className="text-2xl font-bold text-gray-900">{analysis.totalLast7Days}</p>
          <p className={`text-xs ${analysis.percentChangeLast7Days >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {analysis.percentChangeLast7Days >= 0 ? '+' : ''}
            {analysis.percentChangeLast7Days.toFixed(1)}% vs prior week
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Active Spike Alerts</p>
          <p className="text-2xl font-bold text-red-600">{activeAlerts}</p>
           <p className="text-xs text-red-600">{criticalAlerts.length} Critical, {highAlerts.length} High</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm font-medium text-gray-500">3-Day Forecast</p>
          <p className={`text-2xl font-bold ${threeDayForecast.color}`}>{loading.forecast ? '...' : threeDayForecast.text}</p>
           <p className="text-xs text-gray-500">{forecast?.threeDaySummary || ' '}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-gray-500">7-Day Forecast</p>
          <p className={`text-2xl font-bold ${sevenDayForecast.color}`}>{loading.forecast ? '...' : sevenDayForecast.text}</p>
          <p className="text-xs text-gray-500">{forecast?.sevenDaySummary || ' '}</p>
        </div>
      </div>
       {criticalAlerts.length > 0 && (
         <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertTriangleIcon className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800 font-medium">New <span className="font-bold">Critical</span> spike detected in ZIP {criticalAlerts[0].zip}.</p>
          <a href="#" className="text-sm text-red-900 font-bold hover:underline ml-auto" onClick={() => { /* Open detail view */ }}>View Details</a>
        </div>
       )}
    </div>
  );
};

export default OverviewPanel;