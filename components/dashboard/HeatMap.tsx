import React from 'react';
import { MapIcon } from '../icons/MapIcon';
import { useData } from '../../contexts/DataContext';

const HeatMap: React.FC = () => {
  const { analysis, setSelectedZip, rawData, loading } = useData();

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'High': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'Moderate': return 'bg-yellow-400 hover:bg-yellow-500 text-gray-800';
      case 'Watch': return 'bg-blue-400 hover:bg-blue-500 text-white';
      default: return 'bg-gray-300 hover:bg-gray-400 text-gray-700';
    }
  };

  const sortedZips = [...analysis.zipAnalyses].sort((a, b) => a.zip.localeCompare(b.zip));
  const showPlaceholder = loading.analysis || rawData.length === 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <MapIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">Interactive ZIP Code Heat Map</h3>
      </div>
      
      {showPlaceholder ? (
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <img 
              src="https://storage.googleapis.com/aistudio-project-files/8e1c6e1c-71e1-4122-9218-a62009214d02/85a1a2e9-5777-40b9-873b-5517b62ca708" 
              alt="Heatmap placeholder" 
              className="absolute inset-0 w-full h-full object-cover opacity-40" 
            />
             <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
                  <h4 className="font-bold text-lg text-gray-800">
                    {loading.analysis ? 'Analyzing Data...' : 'Awaiting Data'}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1 max-w-xs">
                    {loading.analysis ? 'The heat map will appear here once processing is complete.' : 'Upload a CSV file to generate the interactive heat map.'}
                  </p>
                </div>
              </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {sortedZips.map(({ zip, severity, current7DayAvg }) => (
            <button 
              key={zip}
              onClick={() => setSelectedZip(zip)}
              className={`p-2 rounded-lg text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${getSeverityColor(severity)}`}
              aria-label={`View details for ZIP code ${zip}`}
            >
              <div className="font-bold text-sm">{zip}</div>
              <div className="text-xs opacity-80">{current7DayAvg.toFixed(1)}/day</div>
            </button>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">Incidents</button>
            <button className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full">Naloxone Usage</button>
            <button className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full">Forecast</button>
        </div>
         <div className="flex space-x-2 items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-gray-300"></span><span className="text-gray-600">Normal</span>
            <span className="w-3 h-3 rounded-full bg-blue-400"></span><span className="text-gray-600">Watch</span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span><span className="text-gray-600">Moderate</span>
            <span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-gray-600">High</span>
            <span className="w-3 h-3 rounded-full bg-red-600"></span><span className="text-gray-600">Critical</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;