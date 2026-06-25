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
          onClick={() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
              alert("Please allow popups to export the PDF report!");
              return;
            }

            const blankLogs = logs.filter(l => l.sampleName === 'Blank Standardization');
            const b1 = blankLogs[0] ? blankLogs[0].volumeUsed.toFixed(2) : '—';
            const b2 = blankLogs[1] ? blankLogs[1].volumeUsed.toFixed(2) : '—';
            const b3 = blankLogs[2] ? blankLogs[2].volumeUsed.toFixed(2) : '—';
            const meanV1 = blankLogs.length > 0 ? (blankLogs.reduce((sum, l) => sum + l.volumeUsed, 0) / blankLogs.length) : 0;

            const getSampleStats = (sampleId: string) => {
              const sample = waterSamples.find(s => s.id === sampleId);
              if (!sample) return { trial1: '—', trial2: '—', trial3: '—', meanV2: 0, amount: 0 };
              const sLogs = logs.filter(l => l.sampleName === sample.name);
              
              const trial1 = sLogs[0] ? sLogs[0].volumeUsed.toFixed(2) : '—';
              const trial2 = sLogs[1] ? sLogs[1].volumeUsed.toFixed(2) : '—';
              const trial3 = sLogs[2] ? sLogs[2].volumeUsed.toFixed(2) : '—';
              const meanV2 = sLogs.length > 0 ? (sLogs.reduce((sum, l) => sum + l.volumeUsed, 0) / sLogs.length) : 0;

              let amount = verifiedResults[sampleId] !== undefined ? verifiedResults[sampleId] : null;
              if (amount === null && meanV1 > 0 && meanV2 > 0) {
                amount = (2 * (meanV1 - meanV2) / meanV1) * sample.dilutionFactor;
              }
              return { trial1, trial2, trial3, meanV2, amount: amount || 0 };
            };

            const pond = getSampleStats('pond');
            const borewell = getSampleStats('borewell');
            const sewage = getSampleStats('sewage');

            const maxVal = Math.max(pond.amount, borewell.amount, sewage.amount, 0.1);
            const pondHeight = (pond.amount / maxVal) * 85;
            const borewellHeight = (borewell.amount / maxVal) * 85;
            const sewageHeight = (sewage.amount / maxVal) * 85;

            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <title>Observation Record - Chemistry Practical</title>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                  body {
                    font-family: 'Outfit', 'Segoe UI', system-ui, sans-serif;
                    color: #0f172a;
                    background-color: #ffffff;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                  }
                  .page {
                    background-color: #ffffff;
                    width: 210mm;
                    height: 297mm;
                    padding: 15mm 20mm;
                    margin: 0 auto;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    position: relative;
                  }
                  .header { display: flex; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 12px; gap: 20px; }
                  .divider { width: 2px; height: 50px; background: linear-gradient(to bottom, #0284c7, #06b6d4); flex-shrink: 0; }
                  .header-text { text-align: left; display: flex; flex-direction: column; justify-content: center; }
                  .header h1 { margin: 0; font-size: 16px; color: #0f172a; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
                  .header h2 { margin: 2px 0 0 0; font-size: 9px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                  .student-slip {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px 20px;
                    border: 1.5px solid #cbd5e1;
                    padding: 10px 14px;
                    border-radius: 8px;
                    background-color: #f8fafc;
                    font-size: 9.5px;
                    color: #334155;
                    margin-bottom: 12px;
                    font-weight: 600;
                  }
                  .student-slip span { color: #0f172a; font-weight: 800; }
                  .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; margin: 10px 0 6px 0; padding-bottom: 2px; border-bottom: 1px solid #e2e8f0; }
                  .section-title::before { content: ''; display: inline-block; width: 3px; height: 10px; background: linear-gradient(to bottom, #0284c7, #06b6d4); border-radius: 1px; }
                  table { width: 100%; border-collapse: collapse; margin: 4px 0 8px 0; font-size: 8.5px; border-radius: 6px; overflow: hidden; border: 1px solid #cbd5e1; }
                  th { background: #0f172a; color: #ffffff; font-weight: 700; border: 1px solid #cbd5e1; padding: 4px 6px; text-transform: uppercase; font-size: 7.5px; }
                  td { border: 1px solid #cbd5e1; padding: 4px 6px; color: #334155; text-align: center; }
                  tr:nth-child(even) td { background-color: #f8fafc; }
                  .theory-box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 4px solid #0284c7; padding: 8px 12px; border-radius: 4px; font-size: 9.5px; color: #334155; line-height: 1.45; }
                  .theory-box.blue-theme { border-left-color: #0284c7; background: #f0f9ff; border-color: #bae6fd; color: #0369a1; }
                  .theory-box.emerald-theme { border-left-color: #059669; background: #f0fdf4; border-color: #bbf7d0; color: #14532d; }
                  .formula-block { background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 8px; margin: 5px 0; font-family: monospace; font-size: 10px; font-weight: 700; text-align: center; color: #0f172a; border-radius: 4px; }
                  .footer { text-align: center; font-size: 7.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: auto; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
                  @page {
                    size: auto;
                    margin: 0;
                  }
                  @media print {
                    body {
                      margin: 0;
                    }
                    .page {
                      width: 210mm;
                      height: 297mm;
                      margin: 0;
                      padding: 15mm 20mm;
                      box-sizing: border-box;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="page">
                   <!-- Header -->
                    <div class="header">
                      <img src="${window.location.origin}/logo.png" alt="Margdarshak Logo" style="height: 45px; width: auto; display: block; object-fit: contain;" />
                      <div class="divider"></div>
                     <div class="header-text">
                       <h1>OBSERVATION RECORD</h1>
                       <h2>Estimation of Bleaching Powder for Water Disinfection</h2>
                     </div>
                   </div>


                  <!-- Table 1: Blank standardization -->
                  <div class="section-title">Standardization of Bleaching Powder Solution (Blank V₁)</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Trial #</th>
                        <th>Volume of Bleaching Powder Stock (ml)</th>
                        <th>Initial Buret Reading (ml)</th>
                        <th>Final Buret Reading (ml)</th>
                        <th>Volume of Sodium Thiosulfate used (ml)</th>
                        <th>Concordant Mean V₁ (ml)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>20.0</td><td>0.0</td><td>${b1}</td><td>${b1}</td><td rowspan="3" style="font-weight: bold; background-color: #f1f5f9; font-size: 10px;">${meanV1.toFixed(2)} ml</td></tr>
                      <tr><td>2</td><td>20.0</td><td>0.0</td><td>${b2}</td><td>${b2}</td></tr>
                      <tr><td>3</td><td>20.0</td><td>0.0</td><td>${b3}</td><td>${b3}</td></tr>
                    </tbody>
                  </table>

                  <!-- Table 2: Water samples -->
                  <div class="section-title">Disinfection Titration of Water Samples (V₂)</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Water Sample</th>
                        <th>Trial #</th>
                        <th>Water Sample Volume (ml)</th>
                        <th>Added Bleach Volume (ml)</th>
                        <th>Buret Reading (Initial)</th>
                        <th>Buret Reading (Final)</th>
                        <th>Thiosulfate Vol V₂ (ml)</th>
                        <th>Mean V₂ (ml)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Pond -->
                      <tr><td rowspan="3" style="font-weight: bold; color: #0284c7;">Pond Water</td><td>1</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${pond.trial1}</td><td>${pond.trial1}</td><td rowspan="3" style="font-weight: bold; background-color: #f1f5f9;">${pond.meanV2.toFixed(2)}</td></tr>
                      <tr><td>2</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${pond.trial2}</td><td>${pond.trial2}</td></tr>
                      <tr><td>3</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${pond.trial3}</td><td>${pond.trial3}</td></tr>
                      <!-- Borewell -->
                      <tr><td rowspan="3" style="font-weight: bold; color: #059669;">Borewell Water</td><td>1</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${borewell.trial1}</td><td>${borewell.trial1}</td><td rowspan="3" style="font-weight: bold; background-color: #f1f5f9;">${borewell.meanV2.toFixed(2)}</td></tr>
                      <tr><td>2</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${borewell.trial2}</td><td>${borewell.trial2}</td></tr>
                      <tr><td>3</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${borewell.trial3}</td><td>${borewell.trial3}</td></tr>
                      <!-- Sewage -->
                      <tr><td rowspan="3" style="font-weight: bold; color: #e11d48;">Sewage Water</td><td>1</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${sewage.trial1}</td><td>${sewage.trial1}</td><td rowspan="3" style="font-weight: bold; background-color: #f1f5f9;">${sewage.meanV2.toFixed(2)}</td></tr>
                      <tr><td>2</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${sewage.trial2}</td><td>${sewage.trial2}</td></tr>
                      <tr><td>3</td><td>100.0</td><td>20.0</td><td>0.0</td><td>${sewage.trial3}</td><td>${sewage.trial3}</td></tr>
                    </tbody>
                  </table>

                  <!-- Section 3: Calculations & chart -->
                  <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 15px; margin-top: 5px;">
                    <div>
                      <div class="section-title" style="margin-top: 0;">Calculations & Formula</div>
                      <div class="theory-box blue-theme">
                        <strong>Stoichiometric Formula:</strong>
                        <div class="formula-block">Amount (g/L) = 2 &times; (V₁ - V₂) / V₁ &times; Dilution Factor</div>
                        1. <strong>Pond Water:</strong> 2 &times; (${meanV1.toFixed(2)} - ${pond.meanV2.toFixed(2)}) / ${meanV1.toFixed(2)} &times; 2 = <strong>${pond.amount.toFixed(3)} g/L</strong>
                        <br/>
                        2. <strong>Borewell Water:</strong> 2 &times; (${meanV1.toFixed(2)} - ${borewell.meanV2.toFixed(2)}) / ${meanV1.toFixed(2)} &times; 2 = <strong>${borewell.amount.toFixed(3)} g/L</strong>
                        <br/>
                        3. <strong>Sewage Water:</strong> 2 &times; (${meanV1.toFixed(2)} - ${sewage.meanV2.toFixed(2)}) / ${meanV1.toFixed(2)} &times; 2 = <strong>${sewage.amount.toFixed(3)} g/L</strong>
                      </div>
                      
                      <div class="section-title">Estimation Result</div>
                      <div class="theory-box emerald-theme">
                        Dosage of bleaching powder required to sterilize 1 Liter of water:
                        <ul style="margin: 4px 0 0 0; padding-left: 14px; list-style-type: square; font-weight: 700;">
                          <li>Pond Water: <span style="color: #0284c7;">${pond.amount.toFixed(3)} g</span></li>
                          <li>Borewell Water: <span style="color: #059669;">${borewell.amount.toFixed(3)} g</span></li>
                          <li>Sewage Water: <span style="color: #b91c1c;">${sewage.amount.toFixed(3)} g</span></li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <div class="section-title" style="margin-top: 0; text-align: center;">Dosage Comparison Chart</div>
                      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; display: flex; justify-content: center;">
                        <svg width="240" height="150" viewBox="0 0 240 150">
                          <!-- Grid Lines -->
                          <line x1="40" y1="15" x2="220" y2="15" stroke="#f1f5f9" stroke-width="1" />
                          <line x1="40" y1="60" x2="220" y2="60" stroke="#f1f5f9" stroke-width="1" />
                          <line x1="40" y1="105" x2="220" y2="105" stroke="#f1f5f9" stroke-width="1" />
                          
                          <!-- Axes -->
                          <line x1="40" y1="120" x2="220" y2="120" stroke="#475569" stroke-width="1.2" />
                          <line x1="40" y1="15" x2="40" y2="120" stroke="#475569" stroke-width="1.2" />
                          
                          <!-- Y Labels -->
                          <text x="34" y="18" fill="#64748b" font-size="7" text-anchor="end">${maxVal.toFixed(2)}</text>
                          <text x="34" y="63" fill="#64748b" font-size="7" text-anchor="end">${(maxVal / 2).toFixed(2)}</text>
                          <text x="34" y="123" fill="#64748b" font-size="7" text-anchor="end">0.00</text>
                          
                          <!-- Bars -->
                          <!-- Pond -->
                          <rect x="65" y="${120 - pondHeight}" width="28" height="${pondHeight}" fill="#3b82f6" rx="2" />
                          <text x="79" y="${115 - pondHeight}" fill="#1e3a8a" font-size="7" font-weight="bold" text-anchor="middle">${pond.amount.toFixed(2)}</text>
                          <text x="79" y="130" fill="#475569" font-size="7" font-weight="bold" text-anchor="middle">Pond</text>
                          
                          <!-- Borewell -->
                          <rect x="115" y="${120 - borewellHeight}" width="28" height="${borewellHeight}" fill="#10b981" rx="2" />
                          <text x="129" y="${115 - borewellHeight}" fill="#064e3b" font-size="7" font-weight="bold" text-anchor="middle">${borewell.amount.toFixed(2)}</text>
                          <text x="129" y="130" fill="#475569" font-size="7" font-weight="bold" text-anchor="middle">Borewell</text>
                          
                          <!-- Sewage -->
                          <rect x="165" y="${120 - sewageHeight}" width="28" height="${sewageHeight}" fill="#ef4444" rx="2" />
                          <text x="179" y="${115 - sewageHeight}" fill="#7f1d1d" font-size="7" font-weight="bold" text-anchor="middle">${sewage.amount.toFixed(2)}</text>
                          <text x="179" y="130" fill="#475569" font-size="7" font-weight="bold" text-anchor="middle">Sewage</text>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="footer" style="margin-top: 15px;">
                    COPYRIGHT VSAV GYANTAPA AND MARGDARSHAK VLABS &bull; designed by ABHINAV JHA
                  </div>
                </div>

                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                    }, 300);
                  }
                </script>
              </body>
              </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
          }}
          className="w-full py-2 bg-black hover:bg-gray-900 text-white border-2 border-black font-bold text-xs uppercase cursor-pointer"
        >
          Export as PDF / Print
        </button>
      </div>
    </div>
  );
};
