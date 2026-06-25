import React, { useState } from 'react';
import { useLabState } from '../context/LabStateContext';
import { Beaker, ShieldAlert, RotateCcw, Play, Plus, Sliders, Info } from 'lucide-react';
import { playClickSound, playPourSound } from '../utils/audio';

export const LaboratoryCanvas: React.FC = () => {
  const {
    step,
    flaskReagents,
    addReagent,
    clearFlask,
    isFlaskStoppered,
    setFlaskStoppered,
    isStirring,
    setIsStirring,
    dilutionCompleted,
    runDilution,
    reactionTimerActive,
    reactionProgress,
    triggerReaction,
    buretVolume,
    isStopcockOpen,
    setIsStopcockOpen,
    flowSpeed,
    setFlowSpeed,
    refillBuret,
    addTitrantManual,
    waterSamples,
    selectedSampleId,
    setSelectedSampleId,
    addLog,
    logs,
    getCurrentLiquidColor,
    isFiltratePrepared,
    setIsFiltratePrepared,
    v1,
    v2
  } = useLabState();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pouringReagent, setPouringReagent] = useState<string | null>(null);

  const selectedSample = waterSamples.find(s => s.id === selectedSampleId);
  const liquidStyle = getCurrentLiquidColor();

  const getLiquidFill = (color: string) => {
    if (color === '#1e1b4b') return 'url(#starchGrad)';
    if (color === '#b45309' || color === '#d97706') return 'url(#iodineGrad)';
    if (color === '#e2e8f0') return 'url(#bleachGrad)';
    if (color === '#eab308') return 'url(#pondGrad)';
    if (color === '#ca8a04') return 'url(#borewellGrad)';
    if (color === '#78716c') return 'url(#sewageGrad)';
    if (color === '#ffffff') return 'url(#colorlessGrad)';
    return color;
  };

  const getBottleLabel = (reagent: string) => {
    if (reagent === 'bleaching_powder') return 'BP';
    if (reagent === 'ki') return 'KI';
    if (reagent === 'acid') return 'HAc';
    if (reagent === 'starch') return 'ST';
    if (reagent === 'water_sample') return 'H2O';
    return '';
  };

  const getReagentColor = (reagent: string) => {
    if (reagent === 'bleaching_powder') return '#f8fafc'; // cloudy white
    if (reagent === 'ki') return '#38bdf8'; // light blue
    if (reagent === 'acid') return '#ffffff'; // colorless clear
    if (reagent === 'starch') return '#c7d2fe'; // starch tint
    if (reagent === 'water_sample') {
      if (selectedSampleId === 'pond') return '#eab308'; // pond yellow-green
      if (selectedSampleId === 'borewell') return '#ca8a04';
      if (selectedSampleId === 'sewage') return '#78716c';
      return '#38bdf8';
    }
    return '#38bdf8';
  };

  const triggerPourAnimation = (reagent: string, onComplete: () => void) => {
    if (pouringReagent) return;
    setPouringReagent(reagent);
    playPourSound();
    setTimeout(() => {
      onComplete();
      setPouringReagent(null);
    }, 1200);
  };

  // Dynamic action glows to guide user
  const showBPGlow = step === 2 && !flaskReagents.includes('bleaching_powder') && isFiltratePrepared;
  const showKIGlow = (step === 2 && flaskReagents.includes('bleaching_powder') && !flaskReagents.includes('ki')) ||
                     (step === 4 && flaskReagents.includes('water_sample') && !flaskReagents.includes('ki'));
  const showAcidGlow = (step === 2 && flaskReagents.includes('bleaching_powder') && !flaskReagents.includes('acid')) ||
                       (step === 4 && flaskReagents.includes('water_sample') && !flaskReagents.includes('acid'));
  const showStarchGlow = (step === 2 || step === 4) &&
                         flaskReagents.includes('ki') &&
                         flaskReagents.includes('acid') &&
                         !flaskReagents.includes('starch') &&
                         buretVolume > 0;

  const hasAllReagents = step === 2
    ? flaskReagents.includes('bleaching_powder') && flaskReagents.includes('ki') && flaskReagents.includes('acid')
    : flaskReagents.includes('water_sample') && flaskReagents.includes('bleaching_powder') && flaskReagents.includes('ki') && flaskReagents.includes('acid');


  const showTitrationGlow = (step === 2 || step === 4) &&
                            hasAllReagents &&
                            buretVolume === 0 &&
                            !isStopcockOpen;

  const targetLimit = step === 2 ? v1 : v2 || 10;
  const reachedEndpoint = buretVolume >= targetLimit;
  
  const blankLogs = logs.filter(l => l.sampleName === 'Blank Standardization');
  const sampleLogs = logs.filter(l => l.sampleName === selectedSample?.name);
  const currentStepLogsCount = step === 2 ? blankLogs.length : sampleLogs.length;
  const hasLogForCurrentBuretVol = logs.some(l => l.sampleName === (step === 2 ? 'Blank Standardization' : selectedSample?.name) && l.volumeUsed === buretVolume);

  const showLogGlow = (step === 2 || step === 4) &&
                       reachedEndpoint &&
                       currentStepLogsCount < 3 &&
                       !hasLogForCurrentBuretVol;

  const showCleanFlaskGlow = (step === 2 || step === 4) &&
                             hasLogForCurrentBuretVol &&
                             currentStepLogsCount < 3;

  const showDilutionGlow = step === 3 &&
                           selectedSample &&
                           selectedSample.dilutionFactor > 1 &&
                           !dilutionCompleted;

  const showPourGlow = step === 3 &&
                       !flaskReagents.includes('water_sample') &&
                       (dilutionCompleted || (selectedSample && selectedSample.dilutionFactor === 1));

  const showStopperGlow = step === 3 &&
                          flaskReagents.includes('water_sample') &&
                          !isFlaskStoppered &&
                          !reactionTimerActive;

  const showPourReactedGlow = step === 4 && !flaskReagents.includes('water_sample');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Enforces sequencing checks
  const handleToggleStopcock = (speed: 'drop' | 'continuous') => {
    if (step === 1) {
      showToast("Protocol Error: You must complete reagent filtration first.");
      return;
    }

    if (step === 2) {
      const hasBP = flaskReagents.includes('bleaching_powder');
      const hasKI = flaskReagents.includes('ki');
      const hasAcid = flaskReagents.includes('acid');

      if (!hasBP) {
        showToast("Protocol Error: Add 20 ml of Bleaching Powder filtrate to the flask first.");
        return;
      }
      if (!hasKI || !hasAcid) {
        showToast("Protocol Error: Add Potassium Iodide (KI) and Glacial Acetic Acid to liberate iodine first.");
        return;
      }
    }

    if (step === 3) {
      showToast("Protocol Error: Standard disinfection period is active. Stopper the flask and wait.");
      return;
    }

    if (step === 4) {
      const hasSample = flaskReagents.includes('water_sample');
      const hasBP = flaskReagents.includes('bleaching_powder');
      const hasKI = flaskReagents.includes('ki');
      const hasAcid = flaskReagents.includes('acid');

      if (!hasSample || !hasBP) {
        showToast("Protocol Error: Ensure water sample and bleaching powder are added.");
        return;
      }
      if (isFlaskStoppered) {
        showToast("Protocol Error: Remove the rubber stopper before adding reagents and titrating.");
        return;
      }
      if (!hasKI || !hasAcid) {
        showToast("Protocol Error: Add KI and Acetic Acid to liberate residual iodine.");
        return;
      }
    }

    if (step === 5) {
      showToast("Experiment Complete: Titrations are locked. Please complete the calculations.");
      return;
    }

    // Toggle flow
    if (isStopcockOpen && flowSpeed === speed) {
      setIsStopcockOpen(false);
      setFlowSpeed('off');
    } else {
      setIsStopcockOpen(true);
      setFlowSpeed(speed);
      setIsStirring(true);
    }
  };

  const handleManualAdd = (amount: number) => {
    // Check reagents first
    if (step === 2) {
      if (!flaskReagents.includes('bleaching_powder') || !flaskReagents.includes('ki') || !flaskReagents.includes('acid')) {
        showToast("Protocol Error: Complete reagent addition sequence first.");
        return;
      }
    } else if (step === 4) {
      if (isFlaskStoppered || !flaskReagents.includes('water_sample') || !flaskReagents.includes('ki') || !flaskReagents.includes('acid')) {
        showToast("Protocol Error: Unstopper flask and complete reagent additions first.");
        return;
      }
    } else {
      showToast("Protocol Error: Manual titrant addition is only active during titration phases.");
      return;
    }

    addTitrantManual(amount);
    setIsStirring(true);
    setTimeout(() => setIsStirring(false), 500);
  };

  const handleRecordLog = () => {
    if (step === 2) {
      if (buretVolume === 0) {
        showToast("Error: No titrant has been added yet.");
        return;
      }
      addLog({
        trialNo: logs.length + 1,
        sampleName: "Blank Standardization",
        initialReading: 0,
        finalReading: buretVolume,
        volumeUsed: buretVolume
      });
      showToast(`Successfully logged V1 = ${buretVolume} ml for Blank Standardization.`);
    } else if (step === 4) {
      if (buretVolume === 0) {
        showToast("Error: No titrant has been added yet.");
        return;
      }
      if (!selectedSample) return;
      addLog({
        trialNo: logs.length + 1,
        sampleName: selectedSample.name,
        initialReading: 0,
        finalReading: buretVolume,
        volumeUsed: buretVolume
      });
      showToast(`Successfully logged V2 = ${buretVolume} ml for ${selectedSample.name}.`);
    } else {
      showToast("Error: Logging is only active during the active titration phases.");
    }
  };

  const handleAddSampleBP = () => {
    if (!selectedSample) return;
    
    // Check if dilution is required and completed
    if (selectedSample.dilutionFactor > 1 && !dilutionCompleted) {
      showToast(`Protocol Error: ${selectedSample.name} is too concentrated. You must perform a 1:${selectedSample.dilutionFactor} dilution first.`);
      return;
    }

    triggerPourAnimation('water_sample', () => {
      addReagent('water_sample');
      addReagent('bleaching_powder');
      showToast("Added 100 ml of sample and 20 ml of 1% Bleaching Powder filtrate.");
    });
  };

  const getFlaskContentsHUD = () => {
    if (flaskReagents.length === 0) {
      return (
        <div className="text-[10px] text-slate-400 italic font-semibold">
          Flask is clean and empty.
        </div>
      );
    }

    const hasStarch = flaskReagents.includes('starch');
    const hasKI = flaskReagents.includes('ki');
    const hasAcid = flaskReagents.includes('acid');
    const hasBP = flaskReagents.includes('bleaching_powder');
    const hasSample = flaskReagents.includes('water_sample');
    const targetLimit = step === 2 ? v1 : (v2 || 10);
    const titrationDone = buretVolume >= targetLimit;

    return (
      <div className="space-y-1.5 text-[10px]">
        {/* Base mix */}
        {hasSample && selectedSample && (
          <div className="flex justify-between gap-2 border-b border-slate-800/40 pb-0.5">
            <span className="text-slate-400 font-semibold">Sample:</span>
            <span className="text-blue-300 font-bold text-right truncate max-w-[90px]" title={selectedSample.name}>
              100 ml {selectedSample.name.split(' ')[0]}
            </span>
          </div>
        )}
        {hasBP && (
          <div className="flex justify-between gap-2 border-b border-slate-800/40 pb-0.5">
            <span className="text-slate-400 font-semibold">Bleach Solution:</span>
            <span className="text-amber-300 font-bold">20.0 ml 1%</span>
          </div>
        )}
        {hasKI && (
          <div className="flex justify-between gap-2 border-b border-slate-800/40 pb-0.5">
            <span className="text-slate-400 font-semibold">Iodide Salt:</span>
            <span className="text-sky-300 font-bold">20.0 ml 10% KI</span>
          </div>
        )}
        {hasAcid && (
          <div className="flex justify-between gap-2 border-b border-slate-800/40 pb-0.5">
            <span className="text-slate-400 font-semibold">Acidifier:</span>
            <span className="text-stone-300 font-bold">2.0 ml HAc</span>
          </div>
        )}
        {hasStarch && (
          <div className="flex justify-between gap-2 border-b border-slate-800/40 pb-0.5">
            <span className="text-slate-400 font-semibold">Indicator:</span>
            <span className="text-indigo-400 font-bold">1.0 ml Starch</span>
          </div>
        )}

        {/* Dynamic Chemical Status */}
        <div className="pt-1 mt-1 border-t border-slate-800/60">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Chemical State:</span>
          {titrationDone ? (
            <span className="text-emerald-400 font-black flex items-center gap-1 mt-0.5">
              ● Colorless Iodide (Endpoint)
            </span>
          ) : hasKI && hasAcid ? (
            hasStarch ? (
              <span className="text-indigo-400 font-black flex items-center gap-1 mt-0.5 animate-pulse">
                ● Starch Complex (Blue-Black)
              </span>
            ) : (
              <span className="text-amber-500 font-black flex items-center gap-1 mt-0.5">
                ● Liberated I₂ (Yellow-Brown)
              </span>
            )
          ) : hasBP ? (
            <span className="text-slate-350 font-bold flex items-center gap-1 mt-0.5">
              ● Cloudy BP Solution
            </span>
          ) : (
            <span className="text-slate-450 font-medium flex items-center gap-1 mt-0.5">
              ● Ready for Reagents
            </span>
          )}
        </div>
      </div>
    );
  };

  return (

    <div className="flex flex-col h-auto glass-panel border border-slate-800/80 shadow-2xl p-5 space-y-4 rounded-2xl relative overflow-hidden glass-panel-glow">
      {/* Toast Alert Notice */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-rose-600 text-white py-3 px-5 rounded-xl shadow-lg border border-rose-500 animate-bounce">
          <ShieldAlert size={20} />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between bg-slate-900/60 py-3 px-5 rounded-xl shadow-md border border-slate-800/60">
        <div>
          <h2 className="text-sm font-bold text-slate-200">Laboratory Workbench</h2>
          <p className="text-xs text-slate-400 font-medium">Virtual Chemistry Simulator</p>
        </div>
        <div className="flex items-center gap-2">
          {step === 1 && (
            <button
              onClick={() => {
                playPourSound();
                setIsFiltratePrepared(true);
                showToast("Bleaching powder suspension filtered. 1% clear filtrate ready on shelf.");
              }}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer hover:shadow-blue-500/20"
            >
              Filter & Prepare Filtrate
            </button>
          )}
          
          <button
            onClick={clearFlask}
            className={`flex items-center gap-1 py-2 px-3 border rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              showCleanFlaskGlow
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent ring-4 ring-blue-500/30 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                : 'border-slate-700 hover:bg-slate-800 text-slate-300'
            }`}
            title="Reset flask reagents"
          >
            <RotateCcw size={14} />
            Clean Flask
          </button>
        </div>
      </div>

      {/* Workspace Canvas (Flask and Buret display) */}
      <div className="flex-1 grid grid-cols-3 bg-slate-950/60 rounded-xl shadow-inner border border-slate-900/80 p-5 relative min-h-[440px] overflow-hidden">
        {/* Shelf of Reagent Bottles (Left side of workspace) */}
        <div className="flex flex-col justify-center gap-4 wood-shelf-rack border border-stone-900 rounded-xl p-4 shadow-2xl">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80 border-b border-amber-900/40 pb-1 text-center">Reagent Shelf</h4>
          
          {/* Bleaching Powder Filtrate Bottle */}
          <button
            disabled={!isFiltratePrepared || pouringReagent !== null}
            onClick={() => {
              if (step === 2) {
                triggerPourAnimation('bleaching_powder', () => {
                  addReagent('bleaching_powder');
                  showToast("Added 20 ml of Bleaching Powder solution to the flask.");
                });
              } else if (step === 3) {
                showToast("Use the water sample panel below to add both water and bleaching powder.");
              } else {
                showToast("Bleaching powder filtrate prepared. Good job.");
              }
            }}
            className={`flex flex-col items-center p-2.5 rounded-xl border bg-slate-950/20 backdrop-blur-sm transition-all text-center group cursor-pointer bottle-premium disabled:opacity-40 disabled:cursor-not-allowed ${
              showBPGlow
                ? 'ring-4 ring-blue-500/80 shadow-[0_0_15px_#3b82f6] border-blue-500 scale-105 animate-pulse'
                : isFiltratePrepared && step === 1
                ? 'border-blue-500 shadow-sm'
                : 'border-slate-800/50 hover:border-blue-500/30'
            }`}
          >
            {/* BP Amber Glass Bottle Drawing */}
            <div className="relative w-10 h-14 bg-gradient-to-b from-amber-900/40 to-amber-950/80 border border-amber-800/30 rounded-md shadow-lg flex items-center justify-center transition-all">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-stone-700 rounded-sm border border-stone-800 shadow-sm"></div>
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-950/30 border-x border-amber-850/45"></div>
              <div className="w-8 h-8 bg-amber-50/95 border border-amber-250 rounded-sm shadow-sm flex flex-col items-center justify-center p-0.5 select-none">
                <span className="text-[7.5px] font-black text-amber-900 leading-none">BP</span>
                <span className="text-[4px] font-bold text-amber-700 leading-none mt-0.5 scale-90">Bleach</span>
              </div>
              <div className="absolute top-0.5 left-0.5 w-1 h-[90%] bg-white/10 rounded-full"></div>
            </div>
            <span className="text-[9.5px] font-bold text-slate-300 mt-1">1% Bleaching Powder</span>
            {step === 1 && !isFiltratePrepared && (
              <span className="text-[8.5px] text-amber-500 animate-pulse font-bold mt-0.5">Needs Filtration</span>
            )}
          </button>

          {/* KI Bottle */}
          <button
            disabled={step < 2 || pouringReagent !== null}
            onClick={() => {
              if (step === 2 || step === 4) {
                triggerPourAnimation('ki', () => {
                  addReagent('ki');
                  showToast("Added 20 ml of 10% KI solution to the flask.");
                });
              } else {
                showToast("KI addition is only active during the active titration phases.");
              }
            }}
            className={`flex flex-col items-center p-2.5 rounded-xl border bg-slate-950/20 backdrop-blur-sm transition-all text-center group cursor-pointer bottle-premium disabled:opacity-30 disabled:cursor-not-allowed ${
              showKIGlow
                ? 'ring-4 ring-blue-500/80 shadow-[0_0_15px_#3b82f6] border-blue-500 scale-105 animate-pulse'
                : 'border-slate-800/50 hover:border-blue-500/30'
            }`}
          >
            {/* KI Cobalt Glass Bottle Drawing */}
            <div className="relative w-10 h-14 bg-gradient-to-b from-blue-900/40 to-blue-950/80 border border-blue-800/30 rounded-md shadow-lg flex items-center justify-center transition-all">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-stone-700 rounded-sm border border-stone-800 shadow-sm"></div>
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-950/40 border-x border-blue-800/30"></div>
              <div className="w-8 h-8 bg-blue-50/95 border border-blue-250 rounded-sm shadow-sm flex flex-col items-center justify-center p-0.5 select-none">
                <span className="text-[7.5px] font-black text-blue-900 leading-none">KI</span>
                <span className="text-[4px] font-bold text-blue-700 leading-none mt-0.5 scale-90">Iodide</span>
              </div>
              <div className="absolute top-0.5 left-0.5 w-1 h-[90%] bg-white/10 rounded-full"></div>
            </div>
            <span className="text-[9.5px] font-bold text-slate-300 mt-1">10% Potassium Iodide</span>
          </button>

          {/* Glacial Acetic Acid Bottle */}
          <button
            disabled={step < 2 || pouringReagent !== null}
            onClick={() => {
              if (step === 2 || step === 4) {
                triggerPourAnimation('acid', () => {
                  addReagent('acid');
                  showToast("Added 2 ml of Glacial Acetic Acid to the flask.");
                });
              } else {
                showToast("Acid addition is only active during titration phases.");
              }
            }}
            className={`flex flex-col items-center p-2.5 rounded-xl border bg-slate-950/20 backdrop-blur-sm transition-all text-center group cursor-pointer bottle-premium disabled:opacity-30 disabled:cursor-not-allowed ${
              showAcidGlow
                ? 'ring-4 ring-blue-500/80 shadow-[0_0_15px_#3b82f6] border-blue-500 scale-105 animate-pulse'
                : 'border-slate-800/50 hover:border-blue-500/30'
            }`}
          >
            {/* HAc Glass Bottle Drawing */}
            <div className="relative w-10 h-14 bg-gradient-to-b from-slate-800/30 to-slate-900/60 border border-slate-700/30 rounded-md shadow-lg flex items-center justify-center transition-all">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-stone-600 rounded-sm border border-stone-700 shadow-sm"></div>
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-slate-900/30 border-x border-slate-700/30"></div>
              <div className="w-8 h-8 bg-slate-100/95 border border-slate-200 rounded-sm shadow-sm flex flex-col items-center justify-center p-0.5 select-none">
                <span className="text-[7.5px] font-black text-slate-800 leading-none">HAc</span>
                <span className="text-[4px] font-bold text-slate-600 leading-none mt-0.5 scale-90">Acetic</span>
              </div>
              <div className="absolute top-0.5 left-0.5 w-1 h-[90%] bg-white/15 rounded-full"></div>
            </div>
            <span className="text-[9.5px] font-bold text-slate-300 mt-1">Acetic Acid</span>
          </button>

          {/* Starch Indicator Bottle */}
          <button
            disabled={step < 2 || pouringReagent !== null}
            onClick={() => {
              if (step === 2 || step === 4) {
                if (!flaskReagents.includes('ki') || !flaskReagents.includes('acid')) {
                  showToast("Chemistry Error: Add KI and Acetic Acid to liberate iodine before adding starch indicator.");
                  return;
                }
                if (buretVolume === 0) {
                  showToast("Chemistry Warning: In real labs, Starch is added when the solution turns pale yellow. Adding it now may form insoluble complexes.");
                }
                triggerPourAnimation('starch', () => {
                  addReagent('starch');
                  showToast("Added 1 ml of Starch indicator. Complex turned blue-black.");
                });

              } else {
                showToast("Starch indicator is only active during active titration steps.");
              }
            }}
            className={`flex flex-col items-center p-2.5 rounded-xl border bg-slate-950/20 backdrop-blur-sm transition-all text-center group cursor-pointer bottle-premium disabled:opacity-30 disabled:cursor-not-allowed ${
              showStarchGlow
                ? 'ring-4 ring-blue-500/80 shadow-[0_0_15px_#3b82f6] border-blue-500 scale-105 animate-pulse'
                : 'border-slate-800/50 hover:border-blue-500/30'
            }`}
          >
            {/* Starch Glass Bottle Drawing */}
            <div className="relative w-10 h-14 bg-gradient-to-b from-indigo-900/30 to-purple-900/60 border border-indigo-500/20 rounded-md shadow-lg flex items-center justify-center transition-all">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-stone-700 rounded-sm border border-stone-800 shadow-sm"></div>
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-indigo-900/30 border-x border-indigo-500/20"></div>
              <div className="w-8 h-8 bg-indigo-50/95 border border-indigo-200 rounded-sm shadow-sm flex flex-col items-center justify-center p-0.5 select-none">
                <span className="text-[7px] font-black text-indigo-900 leading-none">Starch</span>
                <span className="text-[4px] font-bold text-indigo-700 leading-none mt-0.5 scale-90">Indicator</span>
              </div>
              <div className="absolute top-0.5 left-0.5 w-1 h-[90%] bg-white/10 rounded-full"></div>
            </div>
            <span className="text-[9.5px] font-bold text-slate-300 mt-1">Starch Indicator</span>
          </button>
        </div>

        {/* Central Display: SVG Apparatus Stand, Buret, Flask, and Drops */}
        <div className="col-span-2 flex justify-center items-center relative select-none">
          
          {/* HUD overlay for Buret Contents */}
          <div className="absolute top-[50px] left-2 bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl shadow-2xl w-[120px] text-left backdrop-blur-md hover:border-blue-500/40 hover:shadow-blue-500/5 transition-all z-10">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-400 block border-b border-blue-900/30 pb-0.5 mb-1 text-center">
              Buret Contents
            </span>
            <div className="text-[10px] text-slate-100 font-bold text-center">
              0.1 N Na₂S₂O₃
            </div>
            <div className="text-[8px] text-slate-400 font-semibold mt-0.5 leading-tight text-center">
              Sodium Thiosulfate (Standard Titrant)
            </div>
          </div>

          {/* HUD overlay for Flask Contents */}
          <div className="absolute bottom-[40px] right-2 bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-xl shadow-2xl w-[145px] text-left backdrop-blur-md hover:border-indigo-500/40 hover:shadow-indigo-500/5 transition-all z-10">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 block border-b border-indigo-900/30 pb-0.5 mb-1.5 text-center">
              Flask Contents
            </span>
            {getFlaskContentsHUD()}
          </div>

          {/* SVG Renderings of the Apparatus */}
          <svg width="240" height="400" viewBox="0 0 240 400" className="w-full h-full max-w-[280px]">

            <defs>
              {/* Metallic clamp / rod gradient */}
              <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="35%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="65%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Dark Cast Iron Base Gradient */}
              <linearGradient id="metalDarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="35%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="65%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Brass Screw Gradient */}
              <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="30%" stopColor="#eab308" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Clamp Rubber Cover Gradient */}
              <linearGradient id="clampRubber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>

              {/* Glass backing gradient with reflections */}
              <linearGradient id="glassBackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.06)" />
                <stop offset="25%" stopColor="rgba(255, 255, 255, 0.18)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.02)" />
                <stop offset="80%" stopColor="rgba(255, 255, 255, 0.12)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.04)" />
              </linearGradient>

              {/* Glass border gradient */}
              <linearGradient id="glassBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.65)" />
                <stop offset="50%" stopColor="rgba(148, 163, 184, 0.22)" />
                <stop offset="100%" stopColor="rgba(100, 116, 139, 0.45)" />
              </linearGradient>

              {/* Buret Liquid Gradient */}
              <linearGradient id="buretLiquid" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
              </linearGradient>

              {/* Starch Complex Gradient */}
              <linearGradient id="starchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#08071a" />
                <stop offset="35%" stopColor="#120e36" />
                <stop offset="65%" stopColor="#1e1859" />
                <stop offset="100%" stopColor="#03020c" />
              </linearGradient>

              {/* Iodine/Amber Gradient */}
              <linearGradient id="iodineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5c1f0b" />
                <stop offset="30%" stopColor="#9a3412" />
                <stop offset="60%" stopColor="#c2410c" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>

              {/* Bleach/Cloudy Gradient */}
              <linearGradient id="bleachGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#f8fafc" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.55" />
              </linearGradient>

              {/* Pond Water Gradient */}
              <linearGradient id="pondGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#713f12" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#854d0e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a16207" stopOpacity="0.35" />
              </linearGradient>

              {/* Borewell Water Gradient */}
              <linearGradient id="borewellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b45309" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.33" />
                <stop offset="100%" stopColor="#a16207" stopOpacity="0.2" />
              </linearGradient>

              {/* Sewage Water Gradient */}
              <linearGradient id="sewageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#44403c" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#78716c" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#292524" stopOpacity="0.55" />
              </linearGradient>

              {/* Colorless Gradient */}
              <linearGradient id="colorlessGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#f0f9ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.1" />
              </linearGradient>

              {/* Cork Gradient */}
              <linearGradient id="corkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5c2509" />
                <stop offset="50%" stopColor="#7c2d12" />
                <stop offset="100%" stopColor="#3c1203" />
              </linearGradient>

              {/* Reagent Amber Glass Bottle Gradient */}
              <linearGradient id="amberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#451a03" />
                <stop offset="25%" stopColor="#78350f" />
                <stop offset="65%" stopColor="#b45309" />
                <stop offset="90%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>

              {/* Reagent Cobalt Glass Bottle Gradient */}
              <linearGradient id="cobaltGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#172554" />
                <stop offset="25%" stopColor="#1e3a8a" />
                <stop offset="65%" stopColor="#2563eb" />
                <stop offset="90%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
            </defs>

            {/* Table Surface Backdrop */}
            <rect x="0" y="375" width="240" height="25" fill="#090d16" />
            <line x1="0" y1="375" x2="240" y2="375" stroke="#1e293b" strokeWidth="1" />

            {/* 1. Metal Stand Base & Support Rod */}
            {/* Cast Iron Plate Base (3D beveled look) */}
            <path d="M 12 380 L 228 380 L 212 396 L 28 396 Z" fill="url(#metalDarkGrad)" stroke="#0f172a" strokeWidth="1.2" />
            <path d="M 28 396 L 212 396 L 212 399 L 28 399 Z" fill="#090d16" />
            {/* Steel Support Rod */}
            <rect x="117" y="30" width="6" height="350" fill="url(#metalGrad)" stroke="#334155" strokeWidth="0.5" />
            {/* Metal screw joint at base */}
            <circle cx="120" cy="380" r="4.5" fill="url(#metalGrad)" stroke="#1e293b" />
            <rect x="118.5" y="373" width="3" height="4" fill="url(#metalGrad)" />

            {/* Stand Clamps holding buret */}
            <g id="clamps">
              {/* Clamp 1 (Top) */}
              <g transform="translate(90, 80)">
                {/* Arm from rod to buret */}
                <rect x="5" y="-3.5" width="25" height="5" fill="url(#metalGrad)" stroke="#334155" strokeWidth="0.4" />
                {/* Screw Knob */}
                <circle cx="20" cy="-6" r="3.5" fill="url(#brassGrad)" stroke="#854d0e" strokeWidth="0.5" />
                <line x1="20" y1="-9.5" x2="20" y2="-2.5" stroke="#854d0e" strokeWidth="0.8" />
                {/* Clamp Claws wrapping the buret tube */}
                <path d="M -7 -6 C -3 -6, -2.5 -3.5, -3 -1.5 C -3.5 0.5, -7 0.5, -7 0.5" fill="none" stroke="url(#clampRubber)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 7 -6 C 3 -6, 2.5 -3.5, 3 -1.5 C 3.5 0.5, 7 0.5, 7 0.5" fill="none" stroke="url(#clampRubber)" strokeWidth="2" strokeLinecap="round" />
                {/* Central bracket block */}
                <rect x="-4" y="-3.5" width="8" height="5" rx="1" fill="url(#metalGrad)" stroke="#334155" strokeWidth="0.4" />
              </g>

              {/* Clamp 2 (Bottom) */}
              <g transform="translate(90, 190)">
                {/* Arm from rod to buret */}
                <rect x="5" y="-3.5" width="25" height="5" fill="url(#metalGrad)" stroke="#334155" strokeWidth="0.4" />
                {/* Screw Knob */}
                <circle cx="20" cy="-6" r="3.5" fill="url(#brassGrad)" stroke="#854d0e" strokeWidth="0.5" />
                <line x1="20" y1="-9.5" x2="20" y2="-2.5" stroke="#854d0e" strokeWidth="0.8" />
                {/* Clamp Claws */}
                <path d="M -7 -6 C -3 -6, -2.5 -3.5, -3 -1.5 C -3.5 0.5, -7 0.5, -7 0.5" fill="none" stroke="url(#clampRubber)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 7 -6 C 3 -6, 2.5 -3.5, 3 -1.5 C 3.5 0.5, 7 0.5, 7 0.5" fill="none" stroke="url(#clampRubber)" strokeWidth="2" strokeLinecap="round" />
                {/* Central bracket block */}
                <rect x="-4" y="-3.5" width="8" height="5" rx="1" fill="url(#metalGrad)" stroke="#334155" strokeWidth="0.4" />
              </g>
            </g>

            {/* 2. Glass Buret Rendering */}
            <g id="buret">
              {/* Buret tube glass back */}
              <rect x="85.5" y="10" width="9" height="228" rx="0.5" fill="url(#glassBackGrad)" />
              
              {/* Liquid Level in Buret (Thiosulfate) */}
              {buretVolume < 50 && (
                <path
                  d={`M 85.5 ${12 + (buretVolume / 50) * 218} 
                      Q 90 ${12 + (buretVolume / 50) * 218 + 1.5} 94.5 ${12 + (buretVolume / 50) * 218} 
                      L 94.5 230 L 85.5 230 Z`}
                  fill="url(#buretLiquid)"
                />
              )}

              {/* Double outlines representing glass thickness */}
              <line x1="85.5" y1="10" x2="85.5" y2="238" stroke="url(#glassBorderGrad)" strokeWidth="0.8" />
              <line x1="94.5" y1="10" x2="94.5" y2="238" stroke="url(#glassBorderGrad)" strokeWidth="0.8" />
              <line x1="86.2" y1="10" x2="86.2" y2="238" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
              <line x1="93.8" y1="10" x2="93.8" y2="238" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />

              {/* Buret Graduation ticks (0 to 50 ml) */}
              {Array.from({ length: 51 }).map((_, i) => {
                const yPos = 12 + i * (218 / 50);
                const isMajor = i % 10 === 0;
                const isMedium = i % 5 === 0 && !isMajor;
                const tickWidth = isMajor ? 6.5 : isMedium ? 4.5 : 2.5;
                const tickColor = isMajor ? '#f1f5f9' : isMedium ? '#94a3b8' : '#64748b';
                const strokeWidth = isMajor ? 0.9 : 0.5;
                return (
                  <g key={i}>
                    <line x1="85.5" y1={yPos} x2={85.5 + tickWidth} y2={yPos} stroke={tickColor} strokeWidth={strokeWidth} />
                    {isMajor && (
                      <text x="81" y={yPos + 2} fill="#e2e8f0" fontSize="5.5" fontFamily="monospace" textAnchor="end" fontWeight="black" opacity="0.9">
                        {i}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Buret Tip and Valve glass assembly */}
              <path d="M 85.5 238 L 94.5 238 L 93 248 L 93.5 248 L 91.5 253 L 91.5 268 L 90.7 271 L 90.7 274 L 89.3 274 L 89.3 271 L 88.5 268 L 88.5 248 Z" fill="url(#glassBackGrad)" stroke="url(#glassBorderGrad)" strokeWidth="0.6" />
              <path d="M 89.3 250 L 89.3 268" stroke="rgba(255,255,255,0.22)" strokeWidth="0.4" />
              
              {/* Teflon stopcock blue joint housing */}
              <rect x="83.5" y="244.5" width="13" height="9" rx="1.2" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.6" />
              <circle cx="90" cy="249" r="2.8" fill="#1e3a8a" />

              {/* Stopcock red handle (rotates 90 deg when open vs closed) */}
              <g transform={`translate(90, 249) rotate(${isStopcockOpen ? 90 : 0})`}>
                <rect x="-8.5" y="-1.5" width="17" height="3" rx="0.8" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.4" className="cursor-pointer" onClick={() => handleToggleStopcock('drop')} />
                <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
              </g>
            </g>

            {/* 3. Animated Falling Drops (Active Titrant Flow) */}
            {isStopcockOpen && (
              <g id="falling-drops">
                <path d="M 90 278 C 89 278, 88.5 279.5, 90 281.5 C 91.5 279.5, 91 278, 90 278 Z" fill="#38bdf8" className="animate-drop" />
                <path d="M 90 305 C 89 305, 88.5 306.5, 90 308.5 C 91.5 306.5, 91 305, 90 305 Z" fill="#38bdf8" className="animate-drop" style={{ animationDelay: '0.1s' }} />
                <path d="M 90 332 C 89 332, 88.5 333.5, 90 335.5 C 91.5 333.5, 91 332, 90 332 Z" fill="#38bdf8" className="animate-drop" style={{ animationDelay: '0.2s' }} />
              </g>
            )}

            {/* 4. Conical Flask Rendering */}
            <g id="conical-flask" transform="translate(50, 290)">
              <g className={isStirring ? 'shake-stir' : ''}>

              {/* Flask Outer Glass Outline */}
              <path
                d="M 31 0 H 49 L 49 18 L 73 85 C 76.5 93, 70 95.5, 59 95.5 H 21 C 10 95.5, 3.5 93, 7 85 L 31 18 Z"
                fill="url(#glassBackGrad)"
                stroke="url(#glassBorderGrad)"
                strokeWidth="1.8"
              />
              {/* Flask Inner Glass thickness highlight */}
              <path
                d="M 32.2 1 L 47.8 1 L 47.8 17 L 71 83.5 C 74 89, 69.5 93.5, 58.5 93.5 H 21.5 C 10.5 93.5, 6 89, 9 83.5 L 32.2 17 Z"
                fill="none"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="0.6"
              />
              
              {/* Etched measurements */}
              <line x1="28" y1="73" x2="33" y2="73" stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
              <text x="35" y="75" fill="rgba(255,255,255,0.6)" fontSize="4.5" fontFamily="sans-serif" fontWeight="bold">100ml</text>
              <line x1="31" y1="52" x2="36" y2="52" stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
              <text x="38" y="54" fill="rgba(255,255,255,0.6)" fontSize="4.5" fontFamily="sans-serif" fontWeight="bold">150ml</text>
              <line x1="34" y1="31" x2="39" y2="31" stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
              <text x="41" y="33" fill="rgba(255,255,255,0.6)" fontSize="4.5" fontFamily="sans-serif" fontWeight="bold">200ml</text>
              
              <text x="40" y="20" fill="rgba(255,255,255,0.3)" fontSize="4.2" fontFamily="sans-serif" fontWeight="black" textAnchor="middle" letterSpacing="0.1">BOROSIL®</text>
              <text x="40" y="25" fill="rgba(255,255,255,0.25)" fontSize="3.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">250ml Class A</text>

              {/* Dynamic Fluid fill path */}
              {flaskReagents.length > 0 && (
                <g>
                  <path
                    d={isStirring 
                      ? "M 22 84 C 30 80, 50 87, 58 84 L 66.8 84 C 69.2 89.5, 65.5 93.5, 57 93.5 H 23 C 14.5 93.5, 10.8 89.5, 13.2 84 Z"
                      : "M 22.8 84.5 C 30 83.5, 50 83.5, 57.2 84.5 L 66.8 84.5 C 69.2 89.5, 65.5 93.5, 57 93.5 H 23 C 14.5 93.5, 10.8 89.5, 13.2 84.5 Z"
                    }
                    fill={getLiquidFill(liquidStyle.color)}
                    fillOpacity={liquidStyle.opacity}
                    className="transition-all duration-300"
                  />
                  {/* Meniscus wave highlight */}
                  <path 
                    d={isStirring 
                      ? "M 22 84 C 30 80, 50 87, 58 84" 
                      : "M 22.8 84.5 C 30 83.5, 50 83.5, 57.2 84.5"
                    }
                    stroke="#ffffff" 
                    strokeWidth="1.2" 
                    strokeOpacity="0.5" 
                    fill="none" 
                  />
                </g>
              )}

              {/* Glass Reflection Highlight stripe */}
              <path
                d="M 34.2 21 L 35.8 21 L 14.5 82 C 14.5 82, 17 86, 22.5 86 L 21 88 C 13 88, 10.5 82, 13.5 82 Z"
                fill="#ffffff"
                fillOpacity="0.22"
                pointerEvents="none"
              />

              {/* Magnetic Stirrer bar inside flask */}
              {isStirring && (
                <g transform="translate(40, 89.6)">
                  <rect
                    x="-7"
                    y="-1.1"
                    width="14"
                    height="2.2"
                    rx="1"
                    fill="#ffffff"
                    stroke="#64748b"
                    strokeWidth="0.5"
                    className="spinning-stir-bar"
                    style={{ transformOrigin: '0px 0px' }}
                  />
                </g>
              )}

              {/* Stirring bubbles */}
              {isStirring && (
                <g opacity="0.8">
                  <circle cx="33" cy="87" r="0.8" fill="#ffffff" className="animate-bubble-1" />
                  <circle cx="47" cy="89" r="1.1" fill="#ffffff" className="animate-bubble-2" />
                  <circle cx="40" cy="85" r="0.6" fill="#ffffff" className="animate-bubble-3" />
                </g>
              )}

              {/* Flask Rubber Stopper */}
              {isFlaskStoppered && (
                <g transform="translate(32, -12)">
                  {/* Cork body */}
                  <path d="M 0 0 L 16 0 L 14 18 L 2 18 Z" fill="url(#corkGrad)" stroke="#270c04" strokeWidth="0.8" />
                  {/* Ribbed lines */}
                  <line x1="2.5" y1="6" x2="13.5" y2="6" stroke="#431407" strokeWidth="0.5" opacity="0.6" />
                  <line x1="3" y1="12" x2="13" y2="12" stroke="#431407" strokeWidth="0.5" opacity="0.6" />
                  {/* Metal loop ring on top */}
                  <circle cx="8" cy="-3" r="3.5" fill="none" stroke="url(#metalGrad)" strokeWidth="1" />
                  <rect x="7" y="0" width="2" height="2" fill="url(#metalGrad)" />
                </g>
              )}
            </g>
          </g>


            {/* Interactive Pouring Reagent overlay */}
            {pouringReagent && (
              <g>
                {/* Reagent Pouring Stream */}
                <line
                  x1="112"
                  y1="272"
                  x2="90"
                  y2="292"
                  stroke={getReagentColor(pouringReagent)}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-pour-stream"
                />
                
                {/* Splash circle */}
                <circle cx="90" cy="292" r="1.8" fill={getReagentColor(pouringReagent)} className="animate-ping" />
                
                {/* Tilted Pouring Bottle */}
                <g transform="translate(132, 258) rotate(-40)">
                  {/* Bottle Shadow */}
                  <rect x="-13" y="-31" width="26" height="42" rx="4" fill="rgba(0,0,0,0.35)" filter="blur(3px)" />
                  
                  {/* Amber/Cobalt Glass container */}
                  <rect 
                    x="-12" 
                    y="-30" 
                    width="24" 
                    height="40" 
                    rx="3" 
                    fill={pouringReagent === 'ki' ? 'url(#cobaltGlass)' : 'url(#amberGlass)'} 
                    stroke="rgba(255,255,255,0.25)" 
                    strokeWidth="0.8" 
                  />
                  {/* Cork Cap */}
                  <path d="M -6 -30 H 6 L 4 -36 H -4 Z" fill="url(#corkGrad)" stroke="#431407" strokeWidth="0.5" />
                  {/* Label */}
                  <rect x="-10" y="-18" width="20" height="20" fill="#f8fafc" rx="1.5" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
                  <text x="0" y="-5" fill="#1e293b" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.2">
                    {getBottleLabel(pouringReagent)}
                  </text>
                  {/* Shine reflection */}
                  <rect x="-10" y="-28" width="4" height="36" fill="rgba(255,255,255,0.18)" rx="1" />
                </g>
              </g>
            )}
          </svg>

          {/* Quick HUD Readouts overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <span className="text-[10px] font-bold text-slate-400">Buret Reading</span>
            <span className="text-xl font-mono font-bold text-blue-600 bg-blue-50 py-1 px-3 rounded-lg border border-blue-100 shadow-md">
              {buretVolume.toFixed(2)} ml
            </span>
          </div>

          {/* Reagents present in flask overlay */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[150px]">
            {flaskReagents.map(r => {
              let label = r;
              let color = "bg-slate-100 text-slate-700";
              if (r === 'bleaching_powder') { label = "Bleach Filtrate"; color = "bg-amber-100 text-amber-800 border-amber-200"; }
              if (r === 'ki') { label = "KI"; color = "bg-blue-100 text-blue-800 border-blue-200"; }
              if (r === 'acid') { label = "Acetic Acid"; color = "bg-stone-100 text-stone-700 border-stone-200"; }
              if (r === 'starch') { label = "Starch Complex"; color = "bg-indigo-100 text-indigo-800 border-indigo-200"; }
              if (r === 'water_sample') { label = selectedSample?.name || "Water Sample"; color = "bg-sky-100 text-sky-800 border-sky-200"; }
              if (r === 'diluted_water') { label = "Diluted Sample"; color = "bg-emerald-100 text-emerald-800 border-emerald-200"; }
              return (
                <span key={r} className={`text-[8px] font-semibold py-0.5 px-1.5 rounded-full border ${color}`}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Deck (Bottom panel of workspace) */}
      <div className="bg-slate-900/60 p-4 rounded-xl shadow-md border border-slate-800/60 space-y-3">
        {/* Dynamic State controls depending on active step */}
        
        {/* Step 3: Water Sample Selection, Dilution, and Stopper timer */}
        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-800/40 pb-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Beaker size={10} />
                Select Water Source
              </label>
              <select
                disabled={flaskReagents.includes('water_sample')}
                value={selectedSampleId}
                onChange={(e) => {
                  setSelectedSampleId(e.target.value);
                  clearFlask();
                  showToast(`Selected ${waterSamples.find(s => s.id === e.target.value)?.name}. Flask cleaned.`);
                }}
                className="w-full text-xs font-semibold py-2 px-3 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {waterSamples.map(sample => (
                  <option key={sample.id} value={sample.id}>
                    {sample.name} (DF = {sample.dilutionFactor})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end gap-2">
              {selectedSample && selectedSample.dilutionFactor > 1 && (
                <button
                  disabled={dilutionCompleted || pouringReagent !== null}
                  onClick={runDilution}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    showDilutionGlow
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/30 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {dilutionCompleted ? `Diluted 1:${selectedSample.dilutionFactor} ✓` : `Pipette & Dilute 1:${selectedSample.dilutionFactor}`}
                </button>
              )}
              
              <button
                disabled={
                  flaskReagents.includes('water_sample') ||
                  pouringReagent !== null ||
                  (!dilutionCompleted && selectedSample && selectedSample.dilutionFactor > 1)
                }
                onClick={handleAddSampleBP}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  showPourGlow
                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-500/30 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.5)] border-transparent'
                    : 'border border-blue-500/50 text-blue-400 hover:bg-blue-950/30'
                }`}
              >
                Pour Sample & Bleach
              </button>
            </div>
          </div>
        )}

        {/* Stopper reaction timer for Step 3 */}
        {step === 3 && flaskReagents.includes('water_sample') && (
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-xs font-bold text-slate-200">
                {isFlaskStoppered ? "Disinfection Process Completed" : "Sterilization (30 Mins Waiting Period)"}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {isFlaskStoppered ? "✓ Residual Chlorine Safeguard Established" : "⌛ Incubating pathogen kill..."}
              </span>
            </div>
            
            {!isFlaskStoppered && (
              <button
                disabled={reactionTimerActive}
                onClick={triggerReaction}
                className={`flex items-center gap-1 py-1.5 px-3 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                  showStopperGlow
                    ? 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-500/30 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Play size={12} fill="white" />
                {reactionTimerActive ? `Incubating (${reactionProgress}%)` : "Stopper & Wait"}
              </button>
            )}
            
            {isFlaskStoppered && (
              <button
                onClick={() => {
                  playClickSound();
                  setFlaskStoppered(false);
                  showToast("Stopper removed. Ready to add KI & Acid to liberate residual chlorine.");
                }}
                className="py-1.5 px-3 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Remove Stopper
              </button>
            )}
          </div>
        )}

        {/* Step 4: Pour Reacted Sample if flask is empty */}
        {step === 4 && !flaskReagents.includes('water_sample') && (
          <div className="flex items-center justify-between bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60 shadow-[0_0_15px_rgba(59,130,246,0.05)] my-2">
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-xs font-bold text-slate-200">Flask is Cleaned & Empty</span>
              <span className="text-[10px] text-slate-450 font-semibold">Pour the next aliquot of disinfected sample mixture for this trial.</span>
            </div>
            <button
              disabled={pouringReagent !== null}
              onClick={() => {
                triggerPourAnimation('water_sample', () => {
                  addReagent('water_sample');
                  addReagent('bleaching_powder');
                  showToast("Poured 100 ml of reacted sample mixture into the flask. Ready for reagents.");
                });
              }}
              className={`py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer border-transparent ${
                showPourReactedGlow
                  ? 'ring-4 ring-blue-500/30 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : ''
              }`}
            >
              Pour Reacted Sample
            </button>
          </div>
        )}

        {/* Titration volume controls (Available in steps 2 and 4) */}
        {(step === 2 || step === 4) && (
          <div className="space-y-3">
            {/* Flow settings */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sliders size={12} />
                Buret Flow Regulator
              </span>
              
              <div className="flex bg-slate-950 p-1 rounded-lg gap-1 border border-slate-900">
                <button
                  onClick={() => {
                    setIsStopcockOpen(false);
                    setFlowSpeed('off');
                    setIsStirring(false);
                  }}
                  className={`py-1 px-3 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    flowSpeed === 'off' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => handleToggleStopcock('drop')}
                  className={`py-1 px-3 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    flowSpeed === 'drop'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : showTitrationGlow
                      ? 'bg-blue-950 text-blue-300 ring-2 ring-blue-500/50 animate-pulse'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  Dropwise
                </button>
                <button
                  onClick={() => handleToggleStopcock('continuous')}
                  className={`py-1 px-3 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    flowSpeed === 'continuous'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : showTitrationGlow
                      ? 'bg-blue-600 text-white ring-2 ring-blue-500/50 animate-pulse shadow-[0_0_8px_#3b82f6]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  Continuous
                </button>
              </div>
            </div>

            {/* Manual dials */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleManualAdd(0.1)}
                  className="flex items-center gap-1 py-1.5 px-3 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus size={12} />
                  0.1 ml
                </button>
                <button
                  onClick={() => handleManualAdd(1.0)}
                  className="flex items-center gap-1 py-1.5 px-3 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus size={12} />
                  1.0 ml
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={refillBuret}
                  className="py-1.5 px-3 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer hover:bg-slate-850"
                >
                  Refill Buret
                </button>
                
                <button
                  onClick={handleRecordLog}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    showLogGlow
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/30 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                  }`}
                >
                  Log Reading
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informative notice block */}
        <div className="flex gap-2.5 p-3.5 bg-blue-950/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] rounded-xl text-[10.5px] leading-relaxed text-blue-300 font-bold transition-all">
          <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <p>
            {step === 1 && "Start by converting bleaching powder into the active sterilizing filtrate by clicking 'Filter & Prepare Filtrate'."}
            {step === 2 && (
              currentStepLogsCount > 0 && hasLogForCurrentBuretVol
                ? `Trial ${currentStepLogsCount} logged successfully! Click the glowing 'Clean Flask' button to reset the apparatus for Trial ${currentStepLogsCount + 1}.`
                : `Perform Blank Titration (Trial ${currentStepLogsCount + 1}/3). Add 20 ml BP, KI, and Acid. Titrate until pale yellow, THEN add Starch and titrate to colorless.`
            )}
            {step === 3 && "Impure water requires dilution. Perform Pipette & Dilute, Pour Sample & Bleach, and click 'Stopper & Wait' for disinfection."}
            {step === 4 && (
              currentStepLogsCount > 0 && hasLogForCurrentBuretVol
                ? `Trial ${currentStepLogsCount} logged successfully! Click the glowing 'Clean Flask' button to reset the apparatus for Trial ${currentStepLogsCount + 1}.`
                : `Perform Sample Titration (Trial ${currentStepLogsCount + 1}/3). Add KI and Acid. Titrate until pale yellow, THEN add Starch and titrate to colorless.`
            )}
            {step === 5 && "Titration is finished. Move to the next page and calculate the dosage per Liter."}
          </p>
        </div>
      </div>
    </div>
  );
};
