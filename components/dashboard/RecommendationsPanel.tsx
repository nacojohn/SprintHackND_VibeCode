import React from 'react';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { useData } from '../../contexts/DataContext';

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const RecommendationsPanel: React.FC = () => {
    const { recommendations, loading, toggleRecommendationCompleted, rawData } = useData();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-28">
      <div className="flex items-center space-x-3 mb-4">
        <ClipboardListIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">AI-Powered Recommendations</h3>
      </div>
      <div className="space-y-4">
        {loading.recommendations && (
            <div className="text-center py-4">
                <p className="text-gray-500">Generating recommendations...</p>
            </div>
        )}

        {!loading.recommendations && rawData.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Upload data to generate recommendations.
          </div>
        )}

       {!loading.recommendations && recommendations.length > 0 && recommendations.map((action, index) => (
           <div key={index} className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${action.completed ? 'bg-gray-50 border-gray-400 opacity-60' : 'bg-blue-50 border-blue-500'}`}>
                <div className="flex justify-between items-start">
                    <p className={`font-semibold ${action.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>{action.action}</p>
                    {!action.completed && <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${action.priorityScore > 80 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{action.priorityScore > 80 ? 'High' : 'Medium'}</span>}
                </div>
                <p className={`text-sm mt-1 ${action.completed ? 'text-gray-500' : 'text-gray-600'}`}>{action.rationale}</p>
                {!action.completed && (
                     <button onClick={() => toggleRecommendationCompleted(index)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 mt-2 flex items-center space-x-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Mark as Completed</span>
                    </button>
                )}
           </div>
       ))}

       {!loading.recommendations && recommendations.length === 0 && rawData.length > 0 && (
         <div className="text-center py-4 text-gray-500">
            No critical spikes detected that require immediate action.
         </div>
       )}
      </div>
    </div>
  );
};

export default RecommendationsPanel;