import React, { useState } from 'react';
import { useData, ProcessingStep } from '../../contexts/DataContext';
import { Incident } from '../../utils/analysis';
import { storage } from '../../firebase';

declare var Papa: any;

const DataUploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, addIncidents } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'text/csv') {
        setError("Invalid file type. Please upload a CSV file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const resetState = () => {
    setFile(null);
    setError(null);
    setProcessingStep('idle');
    setIsUploadModalOpen(false);
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    
    setError(null);

    try {
      setProcessingStep('parsing');
      const parsedData = await new Promise<any[]>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results: { data: any[], errors: any[] }) => {
            if (results.errors.length > 0) {
              reject(new Error(`CSV Parsing Error: ${results.errors[0].message}`));
            } else {
              resolve(results.data);
            }
          },
          error: (err: Error) => reject(new Error(`File Read Error: ${err.message}`))
        });
      });
      
      setProcessingStep('validating');
      const validatedData = validateData(parsedData);
      
      setProcessingStep('uploading');
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`uploads/${Date.now()}-${file.name}`);
      await fileRef.put(file);

      // addIncidents will now handle the subsequent processing steps
      await addIncidents(validatedData, setProcessingStep);

      resetState();

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred during processing.");
      }
      setProcessingStep('idle');
    }
  };
  
  const getButtonText = () => {
    switch(processingStep) {
        case 'parsing': return 'Parsing File...';
        case 'validating': return 'Validating Data...';
        case 'uploading': return 'Uploading to Cloud...';
        case 'analyzing': return 'Analyzing Incidents...';
        case 'generatingInsights': return 'Generating Insights...';
        default: return 'Upload & Analyze';
    }
  }


  const validateData = (data: any[]): (Omit<Incident, 'dateTime'> & { dateTime: Date })[] => {
    const requiredFields = ['date_time', 'zip_code', 'naloxone_administered', 'naloxone_doses', 'outcome'];
    
    if (data.length === 0) {
      throw new Error("Validation Error: CSV file is empty or contains no data rows.");
    }
    
    const sampleRow = data[0];
    for (const field of requiredFields) {
        if (!Object.prototype.hasOwnProperty.call(sampleRow, field)) {
            throw new Error(`Validation Error: Missing required column '${field}'.`);
        }
    }

    return data.map((row, index) => {
      for (const field of requiredFields) {
        if (row[field] === undefined || row[field] === '') {
          throw new Error(`Validation Error: Missing required field '${field}' on row ${index + 2}.`);
        }
      }
      
      const incident = {
        dateTime: new Date(row.date_time),
        zipCode: row.zip_code.toString(),
        naloxoneAdministered: String(row.naloxone_administered).toLowerCase() === 'true',
        naloxoneDoses: parseInt(row.naloxone_doses, 10),
        outcome: row.outcome,
      };

      if (isNaN(incident.dateTime.getTime())) {
        throw new Error(`Validation Error: Invalid date_time format on row ${index + 2}.`);
      }
      if (incident.dateTime > new Date()) {
         throw new Error(`Validation Error: Date cannot be in the future on row ${index + 2}.`);
      }
      if (!/^\d{5}$/.test(incident.zipCode)) {
        throw new Error(`Validation Error: Invalid zip_code format on row ${index + 2}. Must be 5 digits.`);
      }
      if (isNaN(incident.naloxoneDoses) || incident.naloxoneDoses < 0) {
        throw new Error(`Validation Error: Invalid naloxone_doses on row ${index + 2}. Must be a non-negative number.`);
      }

      return incident;
    });
  };

  if (!isUploadModalOpen) return null;
  
  const isProcessing = processingStep !== 'idle';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Overdose Data</h2>
        <p className="text-gray-600 mb-6">Upload a CSV file with incident data. Required columns: <code>date_time, zip_code, naloxone_administered, naloxone_doses, outcome</code></p>
        
        <div>
          <label className="block w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} disabled={isProcessing} />
            <span className="text-gray-500">{file ? file.name : "Click to select a CSV file"}</span>
          </label>
        </div>
        
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
        
        <div className="mt-6 flex justify-end space-x-4">
          <button 
            onClick={resetState}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 min-w-[150px]"
            disabled={!file || isProcessing}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataUploadModal;