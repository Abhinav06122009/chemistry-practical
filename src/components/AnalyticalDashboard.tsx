// TODO: Find a better color than this ugly blue for the button
// Yaar ye layout mobile pe break ho raha hai, baad mein fix karunga
import React from 'react';
import { useLabState } from '../context/LabStateContext';

export const AnalyticalDashboard: React.FC = () => {
  const {
    step,
    logs,
    buretVolume,
    v1,
    v2,
    waterSamples,
    studentV1,
    setStudentV1,
    studentV2,
    setStudentV2,
    studentCalculatedAmount,
    setStudentCalculatedAmount,
    isCalculationCorrect,
    verifyCalculation,
    errorMessage,
    setIsQuizActive,
    getCurveData,
    verifiedResults,
    startNextSample
  } = useLabState();

  const isInputsFilled = studentV1 !== '' && studentV2 !== '' && studentCalculatedAmount !== '';

  const handleVerify = () => {
    verifyCalculation();
  };

  // Titration Curve rendering parameters
  const curvePoints = getCurveData();
  const maxX = curvePoints.length > 0 ? curvePoints[curvePoints.length - 1].x : 25;
  const minE = 0.1;
  const maxE = 0.6;
  const graphWidth = 220;
  const graphHeight = 110;
  const originX = 40;
  const originY = 130;

  // Convert (volume, potential) coordinates to SVG space
  const getSvgCoords = (x: number, y: number) => {
    const px = originX + (x / maxX) * graphWidth;
    const py = originY - ((y - minE) / (maxE - minE)) * graphHeight;
    return { px, py };
  };

  // Generate path for the titration curve line
  let curvePath = '';
  if (curvePoints.length > 0) {
    curvePath = curvePoints.map((pt, idx) => {
      const { px, py } = getSvgCoords(pt.x, pt.y);
      return `${idx === 0 ? 'M' : 'L'} ${px} ${py}`;
    }).join(' ');
  }

  // Get current buret volume marker coordinates on the curve
  let markerX = 0;
  let markerY = 0;

  if (buretVolume <= maxX) {
    const targetLimit = step === 2 ? v1 : (v2 || 10);
    const currentE = 0.46 - 0.28 / (1 + Math.exp(-2.2 * (buretVolume - targetLimit)));
    const coords = getSvgCoords(buretVolume, currentE);
    markerX = coords.px;
    markerY = coords.py;
  }

  return (
    <div className="flex flex-col p-4 bg-gray-100 border-2 border-gray-400 font-sans text-black rounded-none">
      
      {/* Title */}
      <h2 className="text-lg font-bold border-b-2 border-black pb-1 mb-3">
        Chemistry Lab: Volumetric Analysis
      </h2>

      {/* Observation Table */}
      <div className="space-y-1 bg-white border border-black p-2">
        <span className="text-xs font-bold uppercase block border-b border-black pb-1 mb-1">
          Logged Observations
        </span>

        <div className="bg-white min-h-[90px] border border-black">
          {logs.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-500 font-bold uppercase">
              No titration readings logged yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-[10px] font-mono">
              <thead>
                <tr className="bg-gray-200 border-b border-black text-black">
                  <th className="p-1 font-bold uppercase border-r border-black">Sample</th>
                  <th className="p-1 font-bold uppercase border-r border-black">Trial</th>
                  <th className="p-1 font-bold uppercase text-right">Vol used</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="border-b border-gray-200 text-black">
                    <td className="p-1 border-r border-black">{log.sampleName}</td>
                    <td className="p-1 border-r border-black">Trial #{log.trialNo}</td>
                    <td className="p-1 text-right font-bold">{log.volumeUsed.toFixed(1)} ml</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Redox Titration Curve Section */}
      <div className="bg-white border border-black p-2 mt-2">
        <span className="text-xs font-bold uppercase block border-b border-black pb-1 mb-1">
          Potentiometric Curve
        </span>
        <div className="flex justify-center bg-white py-1">
          <svg width="270" height="150" className="border border-black bg-white">
            {/* Grid line */}
            <line x1={originX} y1={originY} x2={originX + graphWidth} y2={originY} stroke="#000" strokeWidth="1.5" />
            <line x1={originX} y1={originY - graphHeight} x2={originX} y2={originY} stroke="#000" strokeWidth="1.5" />

            {/* Labels */}
            <text x={originX + graphWidth / 2} y={originY + 16} fontSize="8" textAnchor="middle" fontWeight="bold">Titrant Volume (ml)</text>
            <text x="8" y={originY - graphHeight / 2} fontSize="8" textAnchor="middle" fontWeight="bold" transform={`rotate(-90 8 ${originY - graphHeight / 2})`}>E (V)</text>

            <text x={originX} y={originY + 9} fontSize="7" textAnchor="middle">0</text>
            <text x={originX + graphWidth} y={originY + 9} fontSize="7" textAnchor="middle">{maxX.toFixed(1)}</text>
            <text x={originX - 6} y={originY} fontSize="7" textAnchor="end">{minE.toFixed(1)}</text>
            <text x={originX - 6} y={originY - graphHeight} fontSize="7" textAnchor="end">{maxE.toFixed(1)}</text>

            {/* Titration line */}
            {curvePath && (
              <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2" />
            )}

            {/* Marker */}
            {buretVolume > 0 && buretVolume <= maxX && (
              <circle cx={markerX} cy={markerY} r="4" fill="#dc2626" stroke="#000" strokeWidth="1" />
            )}
          </svg>
        </div>
      </div>

      {/* Yield / Disinfection Calculation Box */}
      <div className="bg-white border border-black p-3 mt-2 space-y-2">
        <h4 className="text-[10px] uppercase font-bold text-black border-b border-black pb-1">
          Stoichiometric Calculations
        </h4>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase">Blank V1 (ml)</label>
              <input
                disabled={step < 5}
                type="number"
                step="0.1"
                placeholder="e.g. 10.0"
                value={studentV1}
                onChange={(e) => setStudentV1(e.target.value)}
                className="w-full bg-white border border-black p-1 text-xs text-black font-mono font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase">Sample V2 (ml)</label>
              <input
                disabled={step < 5}
                type="number"
                step="0.1"
                placeholder="e.g. 8.5"
                value={studentV2}
                onChange={(e) => setStudentV2(e.target.value)}
                className="w-full bg-white border border-black p-1 text-xs text-black font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase">Sterilizing Bleach Needed (g/L)</label>
            <input
              disabled={step < 5}
              type="number"
              step="0.001"
              placeholder="e.g. 0.245"
              value={studentCalculatedAmount}
              onChange={(e) => setStudentCalculatedAmount(e.target.value)}
              className="w-full bg-white border border-black p-1.5 text-xs text-black font-mono font-bold focus:outline-none"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-2 bg-red-50 border border-red-500 text-red-900 text-[10px] font-mono font-bold leading-normal">
            {errorMessage}
          </div>
        )}

        {isCalculationCorrect === true && (
          <div className="p-3 bg-green-50 border border-black text-black text-xs space-y-2 text-center">
            <p className="font-bold text-green-700">✓ Calculations Verified!</p>
            <p className="text-[10px]">Your disinfection calculations match the volumetric measurements.</p>
            
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={() => setIsQuizActive(true)}
                className="w-full py-1.5 bg-black hover:bg-gray-900 text-white font-bold text-xs border border-black uppercase cursor-pointer"
              >
                Launch Viva Voce Quiz
              </button>
              <button
                onClick={startNextSample}
                className="w-full py-1.5 bg-white hover:bg-gray-100 text-black border border-black font-bold text-xs uppercase cursor-pointer"
              >
                Test Next Water Sample
              </button>
            </div>
          </div>
        )}

        {step === 5 && isCalculationCorrect !== true && (
          <button
            onClick={handleVerify}
            disabled={!isInputsFilled}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white border border-black font-bold text-xs uppercase cursor-pointer disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            Verify Calculations
          </button>
        )}
      </div>

      {/* Teacher Reference & Formula */}
      <div className="bg-white border border-black p-3 mt-2 space-y-2">
        <h4 className="text-[10px] uppercase font-bold text-black border-b border-black pb-1">
          Teacher Reference: Formula
        </h4>
        <div className="text-[9px] text-gray-800 font-bold space-y-1">
          <p>
            Formula: <span className="font-mono text-blue-700">Amount (g/L) = 2 × (V1 - V2) / V1 × DF</span>
          </p>
          {v2 !== null && (
            <p>
              Expected values: <span className="font-mono text-blue-700">V1 = {v1.toFixed(1)} ml, V2 = {v2.toFixed(1)} ml</span>
            </p>
          )}
        </div>
      </div>

      {/* Experimental Results Report */}
      <div className="space-y-2 pt-2 border-t border-black mt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-black">
          Disinfection Result Summary
        </h3>
        <div className="p-3 bg-white border border-black space-y-2 text-[10px]">
          <p className="font-bold text-gray-800">
            Amount of bleaching powder required to disinfect 1 Liter of water:
          </p>
          <div className="space-y-1.5 font-mono">
            {waterSamples.map((sample) => {
              const verifiedAmount = verifiedResults[sample.id];
              
              const sampleLogs = logs.filter(l => l.sampleName === sample.name);
              const blankLogs = logs.filter(l => l.sampleName === 'Blank Standardization');
              
              let loggedAmount: number | null = null;
              if (blankLogs.length > 0 && sampleLogs.length > 0) {
                const loggedV1 = blankLogs[blankLogs.length - 1].volumeUsed;
                const loggedV2 = sampleLogs[sampleLogs.length - 1].volumeUsed;
                if (loggedV1 > 0) {
                  loggedAmount = (2 * (loggedV1 - loggedV2) / loggedV1) * sample.dilutionFactor;
                }
              }

              return (
                <div key={sample.id} className="flex justify-between items-center py-1 border-b border-dashed border-gray-300 last:border-0">
                  <span className="font-bold">{sample.name}:</span>
                  <span className="font-bold">
                    {verifiedAmount !== undefined ? (
                      <span className="text-green-700 border border-green-700 px-1 bg-green-50">
                        {verifiedAmount.toFixed(3)} g (Verified)
                      </span>
                    ) : loggedAmount !== null ? (
                      <span className="text-blue-700 border border-blue-700 px-1 bg-blue-50">
                        {loggedAmount.toFixed(3)} g (Logged)
                      </span>
                    ) : (
                      <span className="text-gray-400">...... g</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => window.print()}
          className="w-full py-2 bg-black hover:bg-gray-900 text-white border-2 border-black font-bold text-xs uppercase cursor-pointer"
        >
          Export as PDF / Print
        </button>
      </div>
    </div>
  );
};
