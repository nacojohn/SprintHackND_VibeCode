import React from 'react';
import { TrendingUpIcon } from '../icons/TrendingUpIcon';
import { useData } from '../../contexts/DataContext';

const TimeSeriesChart: React.FC = () => {
  const { selectedZip, analysis } = useData();

  const zipData = analysis.zipAnalyses.find(z => z.zip === selectedZip);
  const dailyCounts = selectedZip && zipData ? zipData.dailyCounts : analysis.countyDailyCounts;
  
  const chartData = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date: new Date(date), count }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-60); // Get last 60 days

  const maxValue = Math.max(...chartData.map(d => d.count), 1); // Avoid division by zero
  
  // Spike threshold lines
  const mean = selectedZip && zipData ? zipData.rolling28DayMean : analysis.countyRolling28DayMean;
  const stdDev = selectedZip && zipData ? zipData.rolling28DayStdDev : analysis.countyRolling28DayStdDev;
  const oneSdLine = mean + stdDev;
  const twoSdLine = mean + 2 * stdDev;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <TrendingUpIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">
          {selectedZip ? `60-Day Incident Trend for ZIP ${selectedZip}` : 'County-Wide 60-Day Incident Trend'}
        </h3>
      </div>
      {chartData.length > 0 ? (
        <div className="h-64 bg-gray-50 rounded-lg p-4 relative">
          <svg width="100%" height="100%" viewBox={`0 0 ${chartData.length} ${maxValue * 1.1}`}>
            {/* Threshold Lines */}
            <line x1="0" y1={maxValue * 1.1 - oneSdLine} x2={chartData.length} y2={maxValue * 1.1 - oneSdLine} stroke="#facc15" strokeWidth="0.2" strokeDasharray="2,2" />
            <text x={chartData.length - 1} y={maxValue * 1.1 - oneSdLine - 0.5} fill="#ca8a04" fontSize="2" textAnchor="end">+1 SD</text>

            <line x1="0" y1={maxValue * 1.1 - twoSdLine} x2={chartData.length} y2={maxValue * 1.1 - twoSdLine} stroke="#f97316" strokeWidth="0.2" strokeDasharray="2,2" />
            <text x={chartData.length - 1} y={maxValue * 1.1 - twoSdLine - 0.5} fill="#c2410c" fontSize="2" textAnchor="end">+2 SD</text>

            {/* Data Bars */}
            {chartData.map((d, i) => (
              <rect
                key={i}
                x={i}
                y={maxValue * 1.1 - d.count}
                width="0.8"
                height={d.count}
                fill="#3b82f6"
              />
            ))}
          </svg>
        </div>
      ) : (
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">{selectedZip ? `No data for ZIP ${selectedZip}` : "Upload data to see incident trends."}</p>
        </div>
      )}
    </div>
  );
};

export default TimeSeriesChart;