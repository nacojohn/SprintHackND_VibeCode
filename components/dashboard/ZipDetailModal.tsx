import React from 'react';
import { useData } from '../../contexts/DataContext';
import TimeSeriesChart from './TimeSeriesChart';

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const ZipDetailModal: React.FC = () => {
    const { selectedZip, setSelectedZip, analysis } = useData();
    const zipData = analysis.zipAnalyses.find(z => z.zip === selectedZip);

    if (!selectedZip || !zipData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl relative">
                <button 
                    onClick={() => setSelectedZip(null)} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    aria-label="Close"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Details for ZIP Code: {selectedZip}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Severity Level</p>
                        <p className={`text-xl font-bold ${zipData.severity === 'Critical' ? 'text-red-600' : 'text-gray-800'}`}>{zipData.severity || 'Normal'}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">7-Day Avg Incidents</p>
                        <p className="text-xl font-bold text-gray-800">{zipData.current7DayAvg.toFixed(2)}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Deviation from Mean</p>
                        <p className="text-xl font-bold text-gray-800">{zipData.stdDevsFromMean.toFixed(2)} SD</p>
                    </div>
                </div>

                <TimeSeriesChart />

            </div>
        </div>
    );
};

export default ZipDetailModal;