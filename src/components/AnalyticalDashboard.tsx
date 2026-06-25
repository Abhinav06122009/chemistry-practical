import React from 'react';
import { useLabState } from '../context/LabStateContext';
import { Table, Award, AlertCircle, TrendingDown, HelpCircle, BookOpen, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AnalyticalDashboard: React.FC = () => {
  const {
    step,
    logs,
    buretVolume,
    v1,
    v2,
    selectedSampleId,
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

  const selectedSample = waterSamples.find(s => s.id === selectedSampleId);
  const isInputsFilled = studentV1 !== '' && studentV2 !== '' && studentCalculatedAmount !== '';
  const showVerifyGlow = step === 5 && isInputsFilled && isCalculationCorrect !== true;

  // Trigger confetti shower when calculation is correct
  const handleVerify = () => {
    verifyCalculation();
    // The check is state-based, but we can intercept or rely on a local trigger.
    // To make sure confetti fires immediately on success, we check the values.
    const sample = waterSamples.find(s => s.id === selectedSampleId);
    if (!sample) return;

    const sV1 = parseFloat(studentV1);
    const sV2 = parseFloat(studentV2);
    const sAmount = parseFloat(studentCalculatedAmount);

    if (!isNaN(sV1) && !isNaN(sV2) && !isNaN(sAmount)) {
      const expectedAmount = (2 * (v1 - v2!) / v1) * sample.dilutionFactor;

      if (
        Math.abs(sV1 - v1) <= 0.05 &&
        Math.abs(sV2 - v2!) <= 0.05 &&
        Math.abs(sAmount - expectedAmount) <= 0.05
      ) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
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
  let showMarker = false;

  // Find approximate redox potential for current buret volume
  if (buretVolume <= maxX) {
    const targetLimit = step === 2 ? v1 : (v2 || 10);
    const currentE = 0.46 - 0.28 / (1 + Math.exp(-2.2 * (buretVolume - targetLimit)));
    const coords = getSvgCoords(buretVolume, currentE);
    markerX = coords.px;
    markerY = coords.py;
    showMarker = true;
  }

  // Split logs into Titration I (Blank) and Titration II (Sample)
  const blankLogs = logs.filter(l => l.sampleName === 'Blank Standardization');
  const sampleLogs = logs.filter(l => l.sampleName === selectedSample?.name);

  // Pad logs so that we always show at least 3 rows in the table
  const renderTableRows = (activeLogs: typeof logs) => {
    const rows = [];
    const maxRows = Math.max(3, activeLogs.length);
    for (let i = 0; i < maxRows; i++) {
      if (i < activeLogs.length) {
        const log = activeLogs[i];
        rows.push(
          <tr key={i} className="hover:bg-slate-800/20 border-b border-slate-800/40 text-slate-300 font-semibold">
            <td className="py-2 px-3 border-r border-slate-800/60 text-slate-500 font-bold">{i + 1}</td>
            <td className="py-2 px-3 border-r border-slate-800/60 text-center font-mono">0.00</td>
            <td className="py-2 px-3 border-r border-slate-800/60 text-center font-mono">{log.volumeUsed.toFixed(2)}</td>
            <td className="py-2 px-3 text-right font-mono text-blue-400 font-bold">{log.volumeUsed.toFixed(2)} ml</td>
          </tr>
        );
      } else {
        rows.push(
          <tr key={i} className="border-b border-slate-800/40 text-slate-600 font-medium">
            <td className="py-2 px-3 border-r border-slate-800/60 font-bold">{i + 1}</td>
            <td className="py-2 px-3 border-r border-slate-800/60 text-center font-mono">—</td>
            <td className="py-2 px-3 border-r border-slate-800/60 text-center font-mono">—</td>
            <td className="py-2 px-3 text-right font-mono">—</td>
          </tr>
        );
      }
    }
    return rows;
  };

  const renderTitrationTable = (title: string, subtitle: React.ReactNode, activeLogs: typeof logs, concordantValue: string) => {
    return (
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-tight flex flex-col">
          <span>{title}</span>
          <span className="text-[9.5px] text-slate-400 font-medium normal-case italic mt-0.5 leading-relaxed">{subtitle}</span>
        </div>
        
        <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40 shadow-inner">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3 border-r border-slate-800" rowSpan={2}>S. No.</th>
                <th className="py-1 px-3 text-center border-r border-slate-800" colSpan={2}>Burette Readings (ml)</th>
                <th className="py-2 px-3 text-right" rowSpan={2}>Vol. of Na₂S₂O₃ used (ml)</th>
              </tr>
              <tr className="bg-slate-900/40 border-b border-slate-800 text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-1 px-2 text-center border-r border-slate-800">Initial</th>
                <th className="py-1 px-2 text-center border-r border-slate-800">Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {renderTableRows(activeLogs)}
            </tbody>
          </table>
        </div>
        <div className="text-right text-[10px] font-bold text-slate-300 pr-2">
          Concordant volume = <span className="font-mono text-blue-400 bg-blue-950/40 border border-blue-900/40 px-2 py-0.5 rounded">{concordantValue}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-auto glass-panel border border-slate-800/80 shadow-2xl rounded-2xl p-5 space-y-6">
      {/* 1. Titration Curve Display (Visual engine validation) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <TrendingDown size={14} className="text-blue-600" />
          Real-time Titration Curve
        </h3>
        
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 shadow-inner relative">
          <svg width="100%" height="150" viewBox="0 0 280 150" className="w-full">
            {/* Grid Lines */}
            <line x1={originX} y1={originY - graphHeight} x2={originX + graphWidth} y2={originY - graphHeight} stroke="#1e293b" strokeWidth="0.8" />
            <line x1={originX} y1={originY - graphHeight / 2} x2={originX + graphWidth} y2={originY - graphHeight / 2} stroke="#1e293b" strokeWidth="0.8" />
            
            {/* Axis Labels */}
            {/* Y Axis (Redox Potential, E) */}
            <text x="8" y="15" fill="#64748b" fontSize="8" transform="rotate(-90 8 15)" textAnchor="end" className="font-semibold">
              Redox E (Volts)
            </text>
            <text x={originX - 6} y={originY - graphHeight + 3} fill="#64748b" fontSize="7" textAnchor="end" className="font-mono">0.6 V</text>
            <text x={originX - 6} y={originY - graphHeight / 2 + 3} fill="#64748b" fontSize="7" textAnchor="end" className="font-mono">0.35 V</text>
            <text x={originX - 6} y={originY + 3} fill="#64748b" fontSize="7" textAnchor="end" className="font-mono">0.1 V</text>

            {/* X Axis (Volume added, ml) */}
            <text x={originX + graphWidth / 2} y={originY + 18} fill="#64748b" fontSize="8" textAnchor="middle" className="font-semibold">
              Volume of Thiosulfate (ml)
            </text>
            <text x={originX} y={originY + 9} fill="#64748b" fontSize="7" textAnchor="middle" className="font-mono">0</text>
            <text x={originX + graphWidth / 2} y={originY + 9} fill="#64748b" fontSize="7" textAnchor="middle" className="font-mono">{(maxX / 2).toFixed(0)}</text>
            <text x={originX + graphWidth} y={originY + 9} fill="#64748b" fontSize="7" textAnchor="middle" className="font-mono">{maxX.toFixed(0)}</text>

            {/* Axes */}
            <line x1={originX} y1={originY} x2={originX + graphWidth} y2={originY} stroke="#334155" strokeWidth="1" />
            <line x1={originX} y1={originY} x2={originX} y2={originY - graphHeight} stroke="#334155" strokeWidth="1" />

            {/* Curve line */}
            {curvePath && (
              <path d={curvePath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(14,165,233,0.5)]" />
            )}

            {/* Current titration volume position tracking */}
            {showMarker && (
              <g>
                {/* Vertical trace line */}
                <line
                  x1={markerX}
                  y1={originY}
                  x2={markerX}
                  y2={markerY}
                  stroke="#f43f5e"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                />
                {/* Curve dot */}
                <circle cx={markerX} cy={markerY} r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.2" className="animate-pulse" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* 2. Observation Log Data Tables */}
      <div className="space-y-4 flex flex-col">
        <div className="border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Table size={14} className="text-blue-600" />
            OBSERVATIONS
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Weight of the bleaching powder dissolved to prepare 250 ml of solution = 2.5 g
          </p>
        </div>

        {renderTitrationTable(
          "Titration I",
          "Bleaching powder solution against 0.1 N Na₂S₂O₃ solution (Volume BP taken = 20.0 ml, KI added = 20.0 ml)",
          blankLogs,
          blankLogs.length > 0 ? `${v1.toFixed(2)} ml (say V₁)` : "... ml (say V₁ ml)"
        )}

        {renderTitrationTable(
          "Titration II",
          selectedSample 
            ? `Titration of ${selectedSample.name} against 0.1 N Na₂S₂O₃ (Water taken = 100 ml, BP added = 20.0 ml, KI added = 20.0 ml)`
            : "Titration of water sample against 0.1 N Na₂S₂O₃ (Water taken = 100 ml, BP added = 20.0 ml, KI added = 20.0 ml)",
          sampleLogs,
          sampleLogs.length > 0 && v2 !== null ? `${v2.toFixed(2)} ml (say V₂)` : "... ml (say V₂ ml)"
        )}
      </div>

      {/* 3. Volumetric Calculations Block (Step 5 logic) */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Award size={14} className="text-blue-600" />
          Volumetric Analysis Calculation
        </h3>

        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-slate-300">CBSE Stoichiometry Equivalents:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold">
              <div>V1 (Blank): <strong className="text-slate-100 font-mono">{v1.toFixed(2)} ml</strong></div>
              <div>V2 (Sample): <strong className="text-slate-100 font-mono">{v2 ? `${v2.toFixed(2)} ml` : "Not Titrated"}</strong></div>
              <div>DF (Sample): <strong className="text-slate-100 font-mono">{selectedSample?.dilutionFactor || 1}</strong></div>
            </div>
            
            {/* Formulas Box */}
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/60 font-mono text-[9px] text-slate-400 leading-relaxed space-y-1">
              <div>1. Available Cl₂ % = 1.775 × V1 %</div>
              <div>2. Cl₂ consumed / L = (V1 - V2) × 0.0355 g</div>
              <div>3. Bleach Dosage = [Cl₂ consumed / Cl₂ %] × 100 × DF</div>
              <div className="text-blue-400 font-bold border-t border-slate-800/40 pt-1 mt-1">Dosage = 2 × (V1 - V2) / V1 × DF (g/L)</div>
            </div>
          </div>

          {/* Form input fields */}
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Enter Concordant V1 (ml)
              </label>
              <input
                disabled={step < 5}
                type="number"
                step="0.01"
                placeholder="e.g. 7.70"
                value={studentV1}
                onChange={(e) => setStudentV1(e.target.value)}
                className="w-full text-xs font-semibold py-2 px-3 bg-slate-900/40 border border-slate-800/80 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Enter Concordant V2 (ml)
              </label>
              <input
                disabled={step < 5}
                type="number"
                step="0.01"
                placeholder="e.g. 5.81"
                value={studentV2}
                onChange={(e) => setStudentV2(e.target.value)}
                className="w-full text-xs font-semibold py-2 px-3 bg-slate-900/40 border border-slate-800/80 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Sterilizing Bleaching Powder Required (g/L)
              </label>
              <input
                disabled={step < 5}
                type="number"
                step="0.001"
                placeholder="e.g. 0.245"
                value={studentCalculatedAmount}
                onChange={(e) => setStudentCalculatedAmount(e.target.value)}
                className="w-full text-xs font-semibold py-2 px-3 bg-slate-900/40 border border-slate-800/80 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 placeholder-slate-600"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="flex gap-2 p-3 bg-rose-950/30 border border-rose-900/60 rounded-xl text-xs text-rose-300 font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <p className="whitespace-pre-line font-medium">{errorMessage}</p>
            </div>
          )}

          {isCalculationCorrect === true && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-xs text-emerald-300 space-y-2 text-center font-medium">
              <p className="font-bold flex items-center justify-center gap-1 text-emerald-400">
                🎉 Calculations Verified!
              </p>
              <p className="text-[10px] text-emerald-400/80">
                Your titration stoichiometry checks out perfectly against physical properties.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                <button
                  onClick={() => setIsQuizActive(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 ring-4 ring-emerald-500/30 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                  <HelpCircle size={12} />
                  Launch Viva Voce Quiz
                </button>
                <button
                  onClick={startNextSample}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 border border-slate-700"
                >
                  <RefreshCw size={12} />
                  Test Another Water Sample
                </button>
              </div>
            </div>
          )}

          {step === 5 && isCalculationCorrect !== true && (
            <button
              onClick={handleVerify}
              className={`w-full py-2.5 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer ${
                showVerifyGlow
                  ? 'bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-500/30 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Verify Calculations
            </button>
          )}
        </div>
      </div>

      {/* 4. Experimental Results Report (Page 233 Result matching) */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <BookOpen size={14} className="text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            RESULT
          </h3>
        </div>
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2 text-xs">
          <p className="font-bold text-slate-300">
            Amount of the given sample of bleaching powder required to disinfect one Litre of water:
          </p>
          <div className="space-y-2 font-semibold text-slate-400 pt-1">
            {waterSamples.map((sample, idx) => {
              const verifiedAmount = verifiedResults[sample.id];
              
              // Calculate from logs if not verified yet
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
                <div key={sample.id} className="flex justify-between items-center py-1.5 border-b border-slate-800/40 last:border-0">
                  <span className="text-slate-300 font-semibold">Sample {idx + 1} ({sample.name}):</span>
                  <span className="font-mono font-bold">
                    {verifiedAmount !== undefined ? (
                      <span className="text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        {verifiedAmount.toFixed(3)} g (Verified)
                      </span>
                    ) : loggedAmount !== null ? (
                      <span className="text-blue-400 bg-blue-950/30 border border-blue-900/40 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                        {loggedAmount.toFixed(3)} g (Logged)
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">...... g</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
