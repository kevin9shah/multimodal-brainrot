import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Dashboard() {
  const [formData, setFormData] = useState({
    temperature: '', age: '', gender: 'Male', bmi: '', headache: 'No', bodyAche: 'No', fatigue: 'No', aqi: '', humidity: '', physicalActivity: 'Moderate', heartRate: '', bloodPressure: '',
    redPixel: '', greenPixel: '', bluePixel: '', hb: ''
  });
  const [files, setFiles] = useState({
    leukemiaImage: null,
    retinopathyImage: null,
    coronaAudio: null,
    asthmaAudio: null
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      if (files.leukemiaImage) submitData.append('leukemiaImage', files.leukemiaImage);
      if (files.retinopathyImage) submitData.append('retinopathyImage', files.retinopathyImage);
      if (files.coronaAudio) submitData.append('coronaAudio', files.coronaAudio);
      if (files.asthmaAudio) submitData.append('asthmaAudio', files.asthmaAudio);

      // Points to Flask port 8080
      const response = await fetch('http://localhost:8080/predict', {
        method: 'POST',
        body: submitData
      });
      const data = await response.json();
      
      if (response.ok) {
        setPrediction(data);
      } else {
        alert("Error from backend: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error making prediction:", error);
      alert("Error: Make sure your Flask backend is running on port 8080!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <header className="flex flex-col items-center justify-center text-center space-y-2 py-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Activity className="w-10 h-10 text-healthcare-accent" />
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            AI-Based Medical Disease Simulation
          </h1>
        </div>
        <p className="text-gray-400 text-lg">Multimodal AI Healthcare Prototype</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Form */}
        <div className="bg-healthcare-card p-6 rounded-2xl shadow-xl border border-gray-800 transition-all hover:border-healthcare-accent/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <Zap className="w-5 h-5 mr-2 text-healthcare-warning" /> Patient Data Input
          </h2>
          <form onSubmit={handlePredict} className="space-y-6">
            
            {/* Fever Inputs */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-healthcare-accent mb-3">Fever Diagnosis (Tabular)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Age</label><input type="number" name="age" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Temp (°F)</label><input type="number" step="0.1" name="temperature" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Heart Rate</label><input type="number" name="heartRate" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Gender</label><select name="gender" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"><option>Male</option><option>Female</option></select></div>
                <div><label className="block text-xs text-gray-400 mb-1">BMI</label><input type="number" step="0.1" name="bmi" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">BP</label><input type="text" name="bloodPressure" placeholder="120/80" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Headache</label><select name="headache" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"><option>No</option><option>Yes</option></select></div>
                <div><label className="block text-xs text-gray-400 mb-1">Body Ache</label><select name="bodyAche" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"><option>No</option><option>Yes</option></select></div>
                <div><label className="block text-xs text-gray-400 mb-1">Fatigue</label><select name="fatigue" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"><option>No</option><option>Yes</option></select></div>
              </div>
            </div>

            {/* Anaemia Inputs */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-healthcare-danger mb-3">Anaemia Prediction (Tabular)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Hb Level</label><input type="number" step="0.1" name="hb" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">% Red Pixel</label><input type="number" step="0.1" name="redPixel" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">% Green Pixel</label><input type="number" step="0.1" name="greenPixel" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">% Blue Pixel</label><input type="number" step="0.1" name="bluePixel" onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" /></div>
              </div>
            </div>

            {/* Media Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-healthcare-warning mb-3">Medical Imaging</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Leukemia Scan</label>
                    <input type="file" name="leukemiaImage" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Diabetic Retinopathy</label>
                    <input type="file" name="retinopathyImage" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-400 mb-3">Respiratory Audio</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Coronahack Sound</label>
                    <input type="file" name="coronaAudio" accept="audio/*" onChange={handleFileChange} className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Asthma Sound</label>
                    <input type="file" name="asthmaAudio" accept="audio/*" onChange={handleFileChange} className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white" />
                  </div>
                </div>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-healthcare-accent hover:bg-cyan-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 mt-4">
              {loading ? (
                <span className="flex items-center"><Activity className="animate-spin w-5 h-5 mr-2" /> Processing Multi-Model Input...</span>
              ) : (
                "Run Comprehensive Prediction"
              )}
            </button>
          </form>
        </div>

        {/* Prediction Result Card */}
        <div className="bg-healthcare-card p-6 rounded-2xl shadow-xl border border-gray-800 transition-all">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <ShieldCheck className="w-5 h-5 mr-2 text-healthcare-success" /> AI Analysis Results
          </h2>
          {prediction ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-500">
              <div className="flex flex-col p-4 bg-gray-900 rounded-lg border border-gray-700">
                <span className="text-gray-400 text-sm mb-1">Disease Risk</span>
                <span className="text-3xl font-bold text-healthcare-danger">{prediction.disease_risk}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-900 rounded-lg border border-gray-700">
                <span className="text-gray-400 text-sm mb-1">Severity</span>
                <span className={`text-2xl font-bold ${prediction.severity === 'Severe' ? 'text-healthcare-danger' : prediction.severity === 'Moderate' ? 'text-healthcare-warning' : 'text-healthcare-success'}`}>{prediction.severity}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-900 rounded-lg border border-gray-700">
                <span className="text-gray-400 text-sm mb-1">Confidence Score</span>
                <span className="text-3xl font-bold text-healthcare-accent">{prediction.confidence}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-gray-500 text-center border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50">
              Submit patient data and media files to view comprehensive AI analysis results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
