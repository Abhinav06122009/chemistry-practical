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
            const pondHeight = (pond.amount / maxVal) * 95;
            const borewellHeight = (borewell.amount / maxVal) * 95;
            const sewageHeight = (sewage.amount / maxVal) * 95;

            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <title>Chemistry Bleaching Powder Estimation Project Report</title>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                  body {
                    font-family: 'Outfit', 'Segoe UI', system-ui, sans-serif;
                    color: #0f172a;
                    background-color: #f8fafc;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    -webkit-font-smoothing: antialiased;
                  }
                  .page {
                    background-color: #ffffff;
                    width: 210mm;
                    height: 297mm;
                    padding: 20mm;
                    margin: 30px auto;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
                    box-sizing: border-box;
                    background-image: radial-gradient(#e2e8f0 1.2px, transparent 1.2px);
                    background-size: 24px 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    position: relative;
                    page-break-after: always;
                    break-after: page;
                    border: 1px solid #e2e8f0;
                  }
                  .header { display: flex; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 15px; gap: 20px; }
                  .divider { width: 2px; height: 55px; background: linear-gradient(to bottom, #0284c7, #06b6d4); flex-shrink: 0; }
                  .header-text { text-align: left; display: flex; flex-direction: column; justify-content: center; }
                  .header h1 { margin: 0; font-size: 15px; color: #0f172a; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.2; }
                  .header h2 { margin: 4px 0 0 0; font-size: 10px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; line-height: 1.35; }
                  .meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #475569; margin-bottom: 15px; font-weight: 600; padding: 8px 14px; background-color: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0; }
                  .meta-badge { background-color: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 2px 8px; border-radius: 9999px; font-size: 8.5px; font-weight: 800; letter-spacing: 0.5px; }
                  .running-header { display: flex; justify-content: space-between; font-size: 8.5px; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 15px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
                  .section-block { margin-bottom: 14px; }
                  .section-title { font-size: 11.5px; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #f1f5f9; }
                  .section-title::before { content: ''; display: inline-block; width: 4px; height: 12px; background: linear-gradient(to bottom, #0284c7, #06b6d4); border-radius: 2px; }
                  .theory-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; padding: 10px 14px; border-radius: 4px 8px 8px 4px; font-size: 10.5px; color: #334155; line-height: 1.5; }
                  .theory-box.blue-theme { border-left-color: #0284c7; background: #f0f9ff; border-color: #bae6fd; color: #0369a1; }
                  .theory-box.emerald-theme { border-left-color: #059669; background: #f0fdf4; border-color: #bbf7d0; color: #14532d; }
                  .theory-box.amber-theme { border-left-color: #d97706; background: #fffbeb; border-color: #fde68a; color: #78350f; }
                  .theory-box.rose-theme { border-left-color: #e11d48; background: #fff1f2; border-color: #fecdd3; color: #881337; }
                  .theory-box p { margin: 0 0 5px 0; }
                  .theory-box p:last-child { margin-bottom: 0; }
                  .theory-box ol, .theory-box ul { margin: 4px 0 0 0; padding-left: 16px; }
                  .theory-box li { margin-bottom: 3px; }
                  .theory-box li:last-child { margin-bottom: 0; }
                  .formula-block { background: #f8fafc; border: 1px solid #e2e8f0; padding: 5px 10px; margin: 6px 0; font-family: 'Outfit', monospace; font-size: 11px; font-weight: 700; text-align: center; color: #0f172a; border-radius: 6px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
                  th { background: #0f172a; color: #ffffff; font-weight: 700; border: 1px solid #cbd5e1; padding: 5px 6px; text-transform: uppercase; font-size: 8px; letter-spacing: 0.5px; }
                  td { border: 1px solid #e2e8f0; padding: 5px 6px; color: #334155; text-align: center; }
                  tr:nth-child(even) td { background-color: #f8fafc; }
                  .footer { text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: auto; font-weight: 700; letter-spacing: 0.75px; text-transform: uppercase; }

                  @page {
                    size: A4;
                    margin: 0;
                  }
                  @media print {
                    body {
                      background-color: #ffffff !important;
                      display: block;
                      margin: 0;
                      padding: 0;
                    }
                    .page {
                      width: 210mm;
                      height: 297mm;
                      margin: 0;
                      padding: 20mm;
                      box-shadow: none !important;
                      background-image: none !important;
                      background-color: #ffffff !important;
                      border: none !important;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                      page-break-after: always !important;
                      break-after: page !important;
                      box-sizing: border-box;
                    }
                    .page:last-child {
                      page-break-after: avoid !important;
                      break-after: avoid !important;
                    }
                    .section-block {
                      page-break-inside: avoid;
                      break-inside: avoid;
                    }
                  }
                </style>
              </head>
              <body>
                <!-- PAGE 1: COVER PAGE -->
                <div class="page" style="border: 4px double #0f172a; padding: 25mm 20mm; justify-content: space-between; align-items: center; text-align: center;">
                  <div style="font-size: 14px; font-weight: 800; color: #475569; letter-spacing: 2px;">ACADEMIC YEAR 2026-2027</div>
                  
                  <div style="margin: 20px 0;">
                    <h1 style="font-size: 24px; color: #0f172a; font-weight: 900; letter-spacing: 1.5px; line-height: 1.3; margin: 0 0 10px 0; text-transform: uppercase;">Chemistry Investigatory Project</h1>
                    <div style="width: 80px; height: 4px; background: linear-gradient(to right, #0284c7, #06b6d4); margin: 0 auto; border-radius: 2px;"></div>
                  </div>

                  <div style="margin: 30px 0; border: 2px solid #cbd5e1; padding: 20px; border-radius: 12px; background-color: #f0f9ff; box-shadow: inset 0 0 10px rgba(0,0,0,0.02); width: 90%;">
                    <div style="font-size: 11px; font-weight: 850; color: #0369a1; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">TOPIC:</div>
                    <div style="font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.5; text-transform: uppercase;">
                      To Estimate the Amount of Bleaching Powder Required for the Disinfection of Different Samples of Water
                    </div>
                  </div>

                  <div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: left; font-size: 12px;">
                    <div style="border-left: 3px solid #0284c7; padding-left: 15px;">
                      <div style="font-weight: 800; color: #0284c7; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; margin-bottom: 4px;">Submitted By:</div>
                      <div style="font-weight: 800; color: #0f172a; font-size: 13px;">R.NITHYASREE</div>
                      <div style="color: #475569; font-weight: 600; margin-top: 2px;">Class XII-A &bull; Roll No: 12104</div>
                      <div style="color: #64748b; font-size: 10.5px; margin-top: 2px; font-weight: 500;">PM Shri K.V. Island Grounds</div>
                    </div>
                    <div style="border-left: 3px solid #06b6d4; padding-left: 15px;">
                      <div style="font-weight: 800; color: #06b6d4; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; margin-bottom: 4px;">Submitted To:</div>
                      <div style="font-weight: 800; color: #0f172a; font-size: 13px;">MR.YODDHA SIR</div>
                      <div style="color: #475569; font-weight: 600; margin-top: 2px;">Department of Chemistry</div>
                      <div style="color: #64748b; font-size: 10.5px; margin-top: 2px; font-weight: 500;">Chemistry Mentor & Guide</div>
                    </div>
                  </div>

                  <div class="footer" style="border: none; margin-top: 50px;">
                    PM SHRI K.V. ISLAND GROUNDS &copy; 2026-27
                  </div>
                </div>

                <!-- PAGE 2: CERTIFICATE & DECLARATION -->
                <div class="page" style="padding: 25mm 20mm; justify-content: flex-start;">
                  <div class="running-header">
                    <span>Chemistry Investigatory Project</span>
                    <span>Certificate & Declaration</span>
                  </div>

                  <div style="margin-top: 10px;">
                    <h2 style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 15px; text-align: center; letter-spacing: 1px;">BONAFIDE CERTIFICATE</h2>
                    <div class="theory-box blue-theme" style="text-align: justify; font-size: 11.5px; line-height: 1.7; padding: 15px;">
                      This is to certify that <strong>R.NITHYASREE</strong>, a student of Class XII, has successfully completed the Chemistry Investigatory Project titled <strong>&ldquo;TO ESTIMATE THE AMOUNT OF BLEACHING POWDER REQUIRED FOR THE DISINFECTION OF DIFFERENT SAMPLES OF WATER.&rdquo;</strong> under my guidance as per the CBSE syllabus during the academic year 2026-27.
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 45px; font-size: 10px;">
                      <div style="text-align: center; width: 160px;">
                        <div style="border-top: 1px solid #475569; padding-top: 5px; font-weight: 800; color: #0f172a;">Teacher's Signature</div>
                        <div style="color: #64748b; font-size: 9px; margin-top: 2px;">MR.YODDHA SIR</div>
                      </div>
                      <div style="text-align: center; width: 160px;">
                        <div style="border-top: 1px solid #475569; padding-top: 5px; font-weight: 800; color: #0f172a;">Examiner's Signature</div>
                        <div style="color: #64748b; font-size: 9px; margin-top: 2px;">Internal/External Examiner</div>
                      </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 35px; font-size: 10px;">
                      <div style="text-align: center; width: 160px;">
                        <div style="border-top: 1px solid #475569; padding-top: 5px; font-weight: 800; color: #0f172a;">School Seal</div>
                      </div>
                      <div style="text-align: center; width: 160px;">
                        <div style="border-top: 1px solid #475569; padding-top: 5px; font-weight: 800; color: #0f172a;">Date</div>
                      </div>
                    </div>
                  </div>

                  <div style="margin-top: 35px;">
                    <h2 style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 15px; text-align: center; letter-spacing: 1px;">DECLARATION</h2>
                    <div class="theory-box emerald-theme" style="text-align: justify; font-size: 11px; line-height: 1.6; padding: 15px;">
                      I hereby declare that the Chemistry Investigatory Project titled <strong>&ldquo;TO ESTIMATE THE AMOUNT OF BLEACHING POWDER REQUIRED FOR THE DISINFECTION OF DIFFERENT SAMPLES OF WATER.&rdquo;</strong> submitted by me is an original and genuine work carried out by me under the guidance of my Chemistry teacher. This project has not been copied from any source and has not been submitted earlier for any other examination or assessment.
                      <br/><br/>
                      All the information used in this project has been taken from standard textbooks, laboratory manuals, and reliable educational sources.
                    </div>

                    <div style="display: flex; justify-content: flex-end; margin-top: 30px; font-size: 10px;">
                      <div style="text-align: center; width: 200px;">
                        <div style="border-top: 1px solid #475569; padding-top: 5px; font-weight: 800; color: #0f172a;">Signature of the Student</div>
                        <div style="color: #64748b; font-size: 9px; margin-top: 2px;">R.NITHYASREE &bull; Class XII A</div>
                      </div>
                    </div>
                  </div>

                  <div class="footer">PAGE 2 OF 9</div>
                </div>

                <!-- PAGE 3: ACKNOWLEDGEMENT & INDEX -->
                <div class="page" style="padding: 25mm 20mm; justify-content: flex-start;">
                  <div class="running-header">
                    <span>Chemistry Investigatory Project</span>
                    <span>Acknowledgement & Index</span>
                  </div>

                  <div style="margin-top: 5px;">
                    <h2 style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 12px; text-align: center; letter-spacing: 1px;">ACKNOWLEDGEMENT</h2>
                    <div class="theory-box amber-theme" style="text-align: justify; font-size: 10.5px; line-height: 1.6; padding: 12px 15px;">
                      I would like to express my deep sense of gratitude and sincere thanks to my respected chemistry teacher, <strong>MR.YODDHA SIR</strong> for His valuable guidance, constant encouragement, and patient supervision throughout the completion of this investigatory project titled <strong>&ldquo;TO ESTIMATE THE AMOUNT OF BLEACHING POWDER REQUIRED FOR THE DISINFECTION OF DIFFERENT SAMPLES OF WATER.&rdquo;</strong> His insightful suggestions and continuous support helped me to understand the topic in depth and complete the project successfully.
                      <br/><br/>
                      I am also thankful to our respected Principal and the school authorities for providing a healthy learning environment and necessary laboratory facilities which made this work possible.
                      <br/><br/>
                      I would like to express my sincere appreciation to my parents and friends for their moral support, motivation, and help at various stages of this project.
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 10px;">
                      <div><strong>Date:</strong> ________________</div>
                      <div style="text-align: center;">
                        <strong>R.NITHYASREE</strong><br/>
                        Class XII-A &bull; Roll No: 12104
                      </div>
                    </div>
                  </div>

                  <div style="margin-top: 25px;">
                    <h2 style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 12px; text-align: center; letter-spacing: 1px;">INDEX</h2>
                    <div style="font-size: 11.5px; font-weight: 600; color: #334155; line-height: 2.0; width: 100%;">
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>1. AIM OF EXPERIMENT</span><span>Page 4</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>2. OBJECTIVES OF STUDY</span><span>Page 4</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>3. INTRODUCTION</span><span>Page 4</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>4. THEORETICAL PRINCIPLE</span><span>Page 5</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>5. APPARATUS & REAGENTS REQUIRED</span><span>Page 5</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>6. EXPERIMENTAL PROCEDURE</span><span>Page 6</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>7. OBSERVATION TABLES</span><span>Page 7</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>8. SAMPLE CALCULATIONS</span><span>Page 7</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>9. GRAPHICAL ANALYSIS (BAR CHART)</span><span>Page 8</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>10. EXPERIMENTAL RESULT</span><span>Page 8</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>11. PRECAUTIONS & SAFETY</span><span>Page 9</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>12. SOURCES OF ERROR</span><span>Page 9</span></div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 2px 0;"><span>13. BIBLIOGRAPHY</span><span>Page 9</span></div>
                    </div>
                  </div>

                  <div class="footer">PAGE 3 OF 9</div>
                </div>

                <!-- PAGE 4: AIM, OBJECTIVES & INTRODUCTION -->
                <div class="page" style="padding: 20mm; justify-content: flex-start; line-height: 1.5;">
                  <div class="running-header">
                    <span>Chemistry Investigatory Project</span>
                    <span>Aim, Objectives & Intro</span>
                  </div>

                  <div class="section-block">
                    <div class="section-title">AIM OF EXPERIMENT</div>
                    <div class="theory-box rose-theme" style="font-size: 11px; font-weight: 800; text-transform: uppercase;">
                      TO ESTIMATE THE AMOUNT OF BLEACHING POWDER REQUIRED FOR THE DISINFECTION OF DIFFERENT SAMPLES OF WATER.
                    </div>
                  </div>

                  <div class="section-block">
                    <div class="section-title">OBJECTIVES OF STUDY</div>
                    <div class="theory-box" style="font-size: 10.5px;">
                      <ol style="margin: 0; padding-left: 18px;">
                        <li>To prepare a stable standard solution of Bleaching Powder [Calcium Hypochlorite, Ca(OCl)2].</li>
                        <li>To standardize the bleaching powder solution using standard Sodium Thiosulfate (Na2S2O3) solution via iodometric titration (Blank Titration).</li>
                        <li>To treat distinct water samples (Pond, Borewell, and Sewage) with a constant volume of bleaching powder solution.</li>
                        <li>To titrate the residual chlorine remaining after the disinfection incubation period to estimate the amount consumed by pathogens and organic matter in each sample.</li>
                        <li>To determine and compare the dosage of bleaching powder required to sterilize 1 liter of each water sample.</li>
                      </ol>
                    </div>
                  </div>

                  <div class="section-block">
                    <div class="section-title">INTRODUCTION</div>
                    <div class="theory-box" style="font-size: 10.5px; text-align: justify;">
                      Safe drinking water is essential for human health and survival. Natural water resources such as ponds, wells, and rivers often contain suspended organic matter, minerals, and micro-organisms (bacteria, viruses, pathogens) that cause waterborne diseases like cholera, typhoid, and dysentery.
                      <br/><br/>
                      Disinfection or sterilization is the chemical process of killing these pathogenic micro-organisms to make water fit for domestic use. Chlorination is the most widely used water sterilization method globally. In small-scale treatment and rural communities, bleaching powder (also known as Calcium Hypochlorite or Chloride of Lime) is commonly used.
                      <br/><br/>
                      When bleaching powder is dissolved in water, it undergoes hydrolysis to produce hypochlorous acid (HOCl) and calcium hydroxide. Hypochlorous acid is a powerful oxidizing agent that easily penetrates the cell membranes of bacteria and destroys their vital enzymes, effectively killing them.
                      <br/><br/>
                      The amount of bleaching powder required for sterilization depends heavily on the quality of the water source. Water containing high concentrations of organic waste, suspended matter, and bacteria (like sewage or pond water) consumes a larger amount of chlorine due to side reactions. The quantity of chlorine consumed by these impurities is known as the "chlorine demand". Once the chlorine demand is satisfied, the remaining chlorine acts as a disinfectant.
                    </div>
                  </div>

                  <div class="footer">PAGE 4 OF 9</div>
                </div>

                <!-- PAGE 5: THEORY & PRINCIPLE -->
                <div class="page" style="padding: 20mm; justify-content: flex-start; line-height: 1.5;">
                  <div class="running-header">
                    <span>Chemistry Investigatory Project</span>
                    <span>Theory & Principle</span>
                  </div>

                  <div class="section-block">
                    <div class="section-title">THEORY & CHEMICAL PRINCIPLE</div>
                    <div class="theory-box" style="font-size: 10.5px; text-align: justify;">
                      Bleaching powder, chemically represented as \(Ca(OCl)_2\), is an active disinfectant. When added to water, it releases chlorine gas or hypochlorite ions. The chemical reactions involved in the volumetric estimation of active chlorine are based on **Iodometric Titration**.
                      <br/><br/>
                      First, a known excess volume of bleaching powder solution is treated with dilute Hydrochloric acid (\(HCl\)) in the presence of Potassium Iodide (\(KI\)). The bleaching powder reacts with acid to liberate free chlorine gas:
                      <div class="formula-block" style="margin: 8px 0;">
                        Ca(OCl)₂ + 2HCl &rarr; CaCl₂ + H₂O + Cl₂ &uarr;
                      </div>
                      This liberated chlorine gas immediately oxidizes iodide ions (from the added \(KI\)) into free iodine:
                      <div class="formula-block" style="margin: 8px 0;">
                        Cl₂ + 2KI &rarr; 2KCl + I₂
                      </div>
                      The liberated iodine, which imparts a dark reddish-brown color to the solution, is then titrated against a standard solution of **Sodium Thiosulfate** (\(Na_2S_2O_3\)) using starch as an indicator:
                      <div class="formula-block" style="margin: 8px 0; color: #0284c7;">
                        I₂ + 2Na₂S₂O₃ &rarr; Na₂S₄O₆ + 2NaI
                      </div>
                      As thiosulfate is added, the reddish-brown color fades to light yellow. Starch indicator is then added, forming a deep blue-black starch-iodine complex. The titration is continued until the blue color disappears completely (the endpoint), representing the reduction of all free iodine to iodide.
                      <br/><br/>
                      By comparing the volume of thiosulfate solution required to neutralize a blank bleaching powder solution (\(V_1\)) with the volume required to neutralize a water-sample-treated bleaching solution (\(V_2\)), the amount of bleaching powder consumed for disinfection can be calculated using the stoichiometric formula:
                      
                      <div class="formula-block" style="margin: 8px 0; color: #0284c7;">
                        Amount of Bleaching Powder Required (g/L) = 2 &times; (V₁ - V₂) / V₁ &times; Dilution Factor
                      </div>
                    </div>
                  </div>

                  <div class="section-block">
                    <div class="section-title">APPARATUS & REAGENTS REQUIRED</div>
                    <div class="theory-box blue-theme" style="font-size: 10px;">
                      <ol style="margin: 0; padding-left: 16px;">
                        <li><strong>Buret (50 ml):</strong> For dispensing standard Sodium Thiosulfate solution.</li>
                        <li><strong>Erlenmeyer Flasks (250 ml):</strong> For performing the titrations.</li>
                        <li><strong>Pipet (10 ml / 20 ml):</strong> For transferring precise volumes of bleach solution.</li>
                        <li><strong>Bleaching Powder:</strong> Commercial grade Calcium Hypochlorite.</li>
                        <li><strong>Sodium Thiosulfate:</strong> Standardized 0.1 N / 0.05 N solution.</li>
                        <li><strong>Potassium Iodide (KI) crystals / solution:</strong> Used to liberate iodine.</li>
                        <li><strong>Dilute Hydrochloric Acid (HCl):</strong> To acidify the reaction mixture.</li>
                        <li><strong>Starch Indicator:</strong> Prepared freshly, used to detect the iodine endpoint.</li>
                        <li><strong>Water Samples:</strong> Pond water, Borewell water, Sewage water.</li>
                      </ol>
                    </div>
                  </div>

                  <div class="footer">PAGE 5 OF 9</div>
                </div>

                <!-- PAGE 6: PROCEDURE -->
                <div class="page" style="padding: 20mm; justify-content: flex-start; line-height: 1.5;">
                  <div class="running-header">
                    <span>Chemistry Investigatory Project</span>
                    <span>Experimental Procedure</span>
                  </div>

                  <div class="section-block">
                    <div class="section-title">EXPERIMENTAL PROCEDURE</div>
                    <div class="theory-box" style="font-size: 10.5px;">
                      <ol style="margin: 0; padding-left: 16px;">
                        <li style="margin-bottom: 4px;"><strong>Preparation of Bleaching Powder Solution:</strong> Weigh 10.0 grams of commercial bleaching powder and grind it with a small amount of distilled water in a mortar to form a smooth paste. Transfer the paste to a 1000 ml volumetric flask, dilute it to the mark with distilled water, shake well, and allow the suspended particles to settle. Use the clear supernatant solution for the experiments.</li>
                        <li style="margin-bottom: 4px;"><strong>Standardization of Sodium Thiosulfate:</strong> Prepare standard Sodium Thiosulfate solution (\(Na_2S_2O_3\)) by dissolving a weighed amount in distilled water to achieve the target concentration (0.1 N). Fill the clean buret with this thiosulfate solution and remove air bubbles.</li>
                        <li style="margin-bottom: 4px;"><strong>Blank Titration (Standardization of Bleach):</strong> Pipet out 20 ml of the clear bleaching powder solution into a conical flask. Add 2 grams of Potassium Iodide crystals and 5 ml of dilute Hydrochloric acid. Titrate the liberated iodine (dark yellow-brown) against Sodium Thiosulfate until the solution becomes a light straw-yellow color. Add 1-2 ml of starch indicator. The solution turns deep blue. Continue titrating drop-wise until the blue color disappears. Record this concordant value as **\(V_1\)**. Repeat for three trials.</li>
                        <li style="margin-bottom: 4px;"><strong>Sterilization of Water Samples:</strong> Take 100 ml of each water sample (Pond, Borewell, Sewage) in separate conical flasks. Add exactly 20 ml of the prepared bleaching powder solution to each flask. Stopper the flasks and allow them to stand undisturbed for 30 minutes to complete the disinfection reaction.</li>
                        <li style="margin-bottom: 4px;"><strong>Titration of Water Samples:</strong> After 30 minutes, add 2 grams of KI and 5 ml of dilute HCl to the treated water samples. Titrate the remaining unreacted chlorine against Sodium Thiosulfate using starch indicator. Record the endpoint volume as **\(V_2\)**. Repeat for three trials for each water sample.</li>
                      </ol>
                    </div>
                  </div>

                  <div class="section-block" style="margin-top: 15px;">
                    <div class="section-title">MATHEMATICAL CALCULATION FORMAT</div>
                    <div class="theory-box rose-theme" style="font-size: 11px; text-align: justify;">
                      The mass of bleaching powder consumed in disinfecting a given volume of water is directly related to the change in titrant volume:
                      <div class="formula-block" style="margin: 6px 0; color: #b91c1c; background-color: #fef2f2; border-color: #fca5a5;">
                        Bleaching Powder Required (g/L) = 2 &times; (Mean V₁ - Mean V₂) / Mean V₁ &times; Dilution Factor
                      </div>
                      Where the Dilution Factor is tailored to the concentration of the prepared bleaching powder stock solution (typically 2.0 to account for standard dosage).
                    </div>
                  </div>

                  <div class="footer">PAGE 6 OF 9</div>
                </div>

                <!-- PAGE 7: OBSERVATIONS & CALCULATIONS -->
                <div class="page" style="padding: 20mm; justify-content: flex-start; line-height: 1.4;">
                  <div class="running-header">
                    <span>Chemistry Investigatory Project</span>
                    <span>Observations & Calculations</span>
                  </div>

                  <div class="section-block">
                    <div class="section-title">OBSERVATION TABLES</div>
                    <div style="font-size: 9.5px; color: #475569; margin-bottom: 5px; font-weight: bold;">
                      Table 1: Standardization of Bleaching Powder Solution (Blank V₁)
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Trial</th>
                          <th>Volume of Bleaching Powder (ml)</th>
                          <th>Initial Buret Reading (ml)</th>
                          <th>Final Buret Reading (ml)</th>
                          <th>Volume of Thiosulfate used (ml)</th>
                          <th>Mean V₁ (ml)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>1</td><td>20.0</td><td>0.0</td><td>${b1}</td><td>${b1}</td><td rowspan="3" style="font-weight: bold; background-color: #f1f5f9; font-size: 11px;">${meanV1.toFixed(2)} ml</td></tr>
                        <tr><td>2</td><td>20.0</td><td>0.0</td><td>${b2}</td><td>${b2}</td></tr>
                        <tr><td>3</td><td>20.0</td><td>0.0</td><td>${b3}</td><td>${b3}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="section-block" style="margin-top: 10px;">
                    <div style="font-size: 9.5px; color: #475569; margin-bottom: 5px; font-weight: bold;">
                      Table 2: Titration of Residual Chlorine in Water Samples (V₂)
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Water Sample</th>
                          <th>Trial #</th>
                          <th>Sample Vol (ml)</th>
                          <th>Bleach Vol (ml)</th>
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
                  </div>

                  <div class="section-block" style="margin-top: 10px;">
                    <div class="section-title">SAMPLE CALCULATIONS</div>
                    <div class="theory-box blue-theme" style="font-size: 9.5px; line-height: 1.5; padding: 8px 12px;">
                      <strong>Calculation Formula:</strong> Amount of Bleaching Powder Required (g/L) = 2 &times; (Mean V₁ - Mean V₂) / Mean V₁ &times; Dilution Factor
                      <br/>
                      1. <strong>Pond Water:</strong> 2 &times; (${meanV1.toFixed(2)} - ${pond.meanV2.toFixed(2)}) / ${meanV1.toFixed(2)} &times; 2 = <strong>${pond.amount.toFixed(3)} g/L</strong>
                      <br/>
                      2. <strong>Borewell Water:</strong> 2 &times; (${meanV1.toFixed(2)} - ${borewell.meanV2.toFixed(2)}) / ${meanV1.toFixed(2)} &times; 2 = <strong>${borewell.amount.toFixed(3)} g/L</strong>
                      <br/>
                      3. <strong>Sewage Water:</strong> 2 &times; (${meanV1.toFixed(2)} - ${sewage.meanV2.toFixed(2)}) / ${meanV1.toFixed(2)} &times; 2 = <strong>${sewage.amount.toFixed(3)} g/L</strong>
                    </div>
                  </div>

                  <div class="footer">PAGE 7 OF 9</div>
                </div>

                <!-- PAGE 8: GRAPH & RESULT -->
                <div class="page" style="padding: 20mm; justify-content: flex-start; line-height: 1.5;">
                  <div class="running-header">
                    <span>Chemistry Investigatory Project</span>
                    <span>Graphical Analysis & Results</span>
                  </div>

                  <div class="section-block">
                    <div class="section-title">GRAPHICAL ANALYSIS (BAR CHART)</div>
                    <div style="font-size: 9.5px; color: #475569; margin-bottom: 5px; font-weight: bold; text-align: center;">
                      Bleaching Powder Disinfection Dosage (g/L) Required for Different Water Samples
                    </div>
                    
                    <div style="width: 100%; display: flex; justify-content: center; margin: 15px 0;">
                      <div style="background-color: #ffffff; border: 1.5px solid #cbd5e1; padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <svg width="320" height="180" viewBox="0 0 320 180">
                          <!-- Grid Lines -->
                          <line x1="50" y1="20" x2="300" y2="20" stroke="#f1f5f9" stroke-width="1" />
                          <line x1="50" y1="70" x2="300" y2="70" stroke="#f1f5f9" stroke-width="1" />
                          <line x1="50" y1="120" x2="300" y2="120" stroke="#f1f5f9" stroke-width="1" />
                          
                          <!-- Axes -->
                          <line x1="50" y1="140" x2="300" y2="140" stroke="#475569" stroke-width="1.5" />
                          <line x1="50" y1="20" x2="50" y2="140" stroke="#475569" stroke-width="1.5" />
                          
                          <!-- Y-Axis Labels -->
                          <text x="42" y="24" fill="#64748b" font-size="8" text-anchor="end" font-family="sans-serif">${maxVal.toFixed(2)} g/L</text>
                          <text x="42" y="80" fill="#64748b" font-size="8" text-anchor="end" font-family="sans-serif">${(maxVal / 2).toFixed(2)} g/L</text>
                          <text x="42" y="144" fill="#64748b" font-size="8" text-anchor="end" font-family="sans-serif">0.00</text>
                          
                          <!-- Y-Axis Title -->
                          <text x="15" y="80" fill="#475569" font-size="8" font-weight="bold" transform="rotate(-90 15 80)" text-anchor="middle" font-family="sans-serif">Required Bleach (g/L)</text>
                          
                          <!-- Bars -->
                          <!-- Pond -->
                          <rect x="80" y="${140 - pondHeight}" width="40" height="${pondHeight}" fill="#3b82f6" rx="4" />
                          <text x="100" y="${135 - pondHeight}" fill="#1e3a8a" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">${pond.amount.toFixed(3)}</text>
                          <text x="100" y="152" fill="#475569" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">Pond</text>
                          
                          <!-- Borewell -->
                          <rect x="150" y="${140 - borewellHeight}" width="40" height="${borewellHeight}" fill="#10b981" rx="4" />
                          <text x="170" y="${135 - borewellHeight}" fill="#064e3b" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">${borewell.amount.toFixed(3)}</text>
                          <text x="170" y="152" fill="#475569" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">Borewell</text>
                          
                          <!-- Sewage -->
                          <rect x="220" y="${140 - sewageHeight}" width="40" height="${sewageHeight}" fill="#ef4444" rx="4" />
                          <text x="240" y="${135 - sewageHeight}" fill="#7f1d1d" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">${sewage.amount.toFixed(3)}</text>
                          <text x="240" y="152" fill="#475569" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">Sewage</text>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="section-block">
                    <div class="section-title">EXPERIMENTAL RESULT</div>
                    <div class="theory-box emerald-theme" style="font-size: 10.5px; text-align: justify; padding: 12px 14px;">
                      The amount of bleaching powder required to disinfect 1 Liter (1000 ml) of the respective water samples was estimated to be:
                      <ul style="margin: 6px 0 0 0; padding-left: 20px; list-style-type: square; font-weight: bold;">
                        <li style="color: #1e3a8a; margin-bottom: 2px;">Pond Water Sample: ${pond.amount.toFixed(3)} g</li>
                        <li style="color: #064e3b; margin-bottom: 2px;">Borewell Water Sample: ${borewell.amount.toFixed(3)} g</li>
                        <li style="color: #7f1d1d; margin-bottom: 2px;">Sewage Water Sample: ${sewage.amount.toFixed(3)} g</li>
                      </ul>
                      <p style="margin-top: 8px;">
                        <strong>Conclusion:</strong> Sewage water contains the highest concentration of organic impurities and pathogens, demanding the highest amount of bleaching powder for disinfection. Borewell water is relatively cleaner and requires the minimum amount of bleaching powder, while Pond water falls in the intermediate range.
                      </p>
                    </div>
                  </div>

                  <div class="footer">PAGE 8 OF 9</div>
                </div>

                <!-- PAGE 9: PRECAUTIONS, ERROR, CONCLUSION & BIBLIOGRAPHY -->
                <div class="page" style="padding: 20mm; justify-content: flex-start; line-height: 1.4;">
                  <div class="running-header">
                    <span>Chemistry Investigatory Project</span>
                    <span>Summary & Bibliography</span>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 9px;">
                    <div class="section-block">
                      <div class="section-title">PRECAUTIONS</div>
                      <div class="theory-box" style="padding: 8px 12px; border-left-color: #059669; font-size: 8.5px; line-height: 1.4; height: 180px; overflow: hidden;">
                        <ol style="margin: 0; padding-left: 12px;">
                          <li>Bleaching powder should be stored in an airtight container as it decomposes in contact with moist air, releasing chlorine gas.</li>
                          <li>Avoid contact of bleaching powder paste with hands or eyes due to its highly caustic nature.</li>
                          <li>The starch indicator must be prepared fresh and added only near the endpoint (straw-yellow stage) to prevent permanent starch-iodine binding.</li>
                          <li>Ensure KI is added in sufficient excess to ensure complete liberation of iodine.</li>
                          <li>All glass apparatus (buret, conical flasks) must be thoroughly cleaned and rinsed.</li>
                          <li>Keep the flasks stoppered during the 30-minute incubation period to prevent loss of liberated chlorine.</li>
                        </ol>
                      </div>
                    </div>

                    <div class="section-block">
                      <div class="section-title">SOURCES OF ERROR</div>
                      <div class="theory-box" style="padding: 8px 12px; border-left-color: #d97706; font-size: 8.5px; line-height: 1.4; height: 180px; overflow: hidden;">
                        <ul style="margin: 0; padding-left: 12px; list-style-type: disc;">
                          <li><strong>Chlorine Escape:</strong> Some chlorine gas might escape into the atmosphere if the conical flask is not stoppered immediately after adding acid.</li>
                          <li><strong>Impure KI:</strong> Potassium Iodide might contain trace iodate impurities, which react with acid to liberate extra iodine, inflating the reading.</li>
                          <li><strong>Indicator Addition Timing:</strong> Adding starch indicator too early can lock the iodine inside starch granules, yielding a premature endpoint.</li>
                          <li><strong>Moisture Absorption:</strong> The weight of the bleaching powder sample could be skewed if it has absorbed environmental moisture.</li>
                          <li><strong>Titration End-Point Judgment:</strong> Slight human error in identifying the exact moment the blue color disappears.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div class="section-block" style="margin-top: 5px;">
                    <div class="section-title">CONCLUDING SUMMARY</div>
                    <div class="theory-box blue-theme" style="font-size: 10px; text-align: justify; padding: 10px 14px; line-height: 1.45;">
                      Through this investigatory project, the disinfection capacities of commercial bleaching powder on three distinct water samples were successfully measured. A stock solution of bleaching powder was prepared and titrated as a blank against standard Sodium Thiosulfate to determine active chlorine concentration. The water samples were treated with the disinfectant and incubated for 30 minutes, after which the leftover chlorine was quantified.
                      <br/><br/>
                      As hypothesized, the water sample with high suspended impurities and microbial content (Sewage) consumed the highest concentration of active chlorine, requiring <strong>${sewage.amount.toFixed(3)} g/L</strong> of bleaching powder. The relatively clean groundwater source (Borewell) consumed the least, requiring only <strong>${borewell.amount.toFixed(3)} g/L</strong>, whereas surface pond water required <strong>${pond.amount.toFixed(3)} g/L</strong>. This project successfully establishes the volumetric model of chlorination demand for water purification.
                    </div>
                  </div>

                  <div class="section-block" style="margin-top: 5px;">
                    <div class="section-title">BIBLIOGRAPHY</div>
                    <div class="theory-box" style="font-size: 9.5px; padding: 8px 12px; line-height: 1.4;">
                      <ol style="margin: 0; padding-left: 12px;">
                        <li>NCERT Chemistry Part I & II, Class XII &mdash; Chapters on Chemical Kinetics and Electrochemistry.</li>
                        <li>Comprehensive Practical Chemistry for Class XII &mdash; Volumetric Analysis Section.</li>
                        <li>Vogel's Textbook of Quantitative Chemical Analysis (6th Edition).</li>
                        <li>Standard Methods for the Examination of Water and Wastewater &mdash; Chlorine Demand estimation references.</li>
                        <li>World Health Organization (WHO) Water Sanitation Guidelines &mdash; Guidelines for Drinking-water Quality.</li>
                      </ol>
                    </div>
                  </div>

                  <div class="footer">PAGE 9 OF 9 &bull; COPYRIGHT VSAV GYANTAPA AND MARGDARSHAK VLABS</div>
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
