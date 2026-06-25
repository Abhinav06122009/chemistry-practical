import React, { useState } from 'react';
import { useLabState } from '../context/LabStateContext';
import { BookOpen, ClipboardList, CheckCircle, ArrowRight, Activity } from 'lucide-react';

export const DidacticPanel: React.FC = () => {
  const { step, setStep, selectedSampleId, waterSamples, logs, isFlaskStoppered, reactionTimerActive, isFiltratePrepared } = useLabState();
  const [activeTab, setActiveTab] = useState<'theory' | 'procedure'>('procedure');

  const selectedSample = waterSamples.find(s => s.id === selectedSampleId);

  const isNextReady =
    (step === 1 && isFiltratePrepared) ||
    (step === 2 && logs.filter(l => l.sampleName === 'Blank Standardization').length >= 3) ||
    (step === 3 && isFlaskStoppered && !reactionTimerActive) ||
    (step === 4 && logs.filter(l => l.sampleName === selectedSample?.name).length >= 3);

  // Define steps for the procedure tab
  const stepsList = [
    {
      id: 1,
      title: "Reagent Preparation",
      description: "Prepare the 1% bleaching powder suspension and filter it to get a clear filtrate. Each 1 ml of filtrate will correspond to exactly 0.01 g of bleaching powder."
    },
    {
      id: 2,
      title: "Blank Titration (V1)",
      description: "Measure available chlorine in 20 ml bleaching powder solution. Add KI and Acetic Acid. Titrate with Hypo until pale yellow, THEN add Starch and titrate until colorless. Log V1."
    },
    {
      id: 3,
      title: "Sample Disinfection",
      description: "Select a water sample. Add 20 ml bleaching powder solution, stopper the flask, and let the chlorine react with the organic impurities for 30 minutes in dark."
    },
    {
      id: 4,
      title: "Sample Titration (V2)",
      description: "Add KI and Acetic Acid to the reacted flask. Titrate with Hypo until pale yellow, THEN add Starch indicator and titrate until colorless. Log V2."
    },
    {
      id: 5,
      title: "Calculations & Assessment",
      description: "Use your V1 and V2 values to calculate the grams of bleaching powder required to disinfect 1 Liter of the sample. Complete the final Viva Voce assessment."
    }
  ];

  return (
    <div className="flex flex-col h-auto glass-panel border border-slate-800/80 shadow-2xl rounded-2xl">
      {/* Sidebar Header Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 gap-2">
        <button
          onClick={() => setActiveTab('procedure')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'procedure'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
              : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <ClipboardList size={16} />
          Procedure
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'theory'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
              : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen size={16} />
          Theory
        </button>
      </div>

      {/* Panel Content Scrollable */}
      <div className="p-5 space-y-6">
        {activeTab === 'theory' ? (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <Activity size={18} className="text-blue-400" />
                Water Disinfection History
              </h3>
              <p className="mt-2 text-slate-300 font-medium">
                In 1854, during London's Broad Street cholera epidemic, <strong>Dr. John Snow</strong> traced the outbreak's source to a contaminated sewage-polluted water pump. By applying chlorine (a powerful oxidizer) to neutralize water pathogens, Snow established water disinfection as the cornerstone of global public health infrastructure, saving millions of lives.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800/80 pb-1 mt-4">
                Chemical Composition & Dissociation
              </h3>
              <p className="mt-2 text-slate-300 font-medium">
                Commercial bleaching powder is primarily <strong>Calcium Hypochlorite</strong>, represented chemically as:
              </p>
              <div className="my-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-center font-mono text-blue-300 text-xs shadow-inner">
                CaOCl<sub>2</sub> + H<sub>2</sub>O &rarr; Ca(OH)<sub>2</sub> + Cl<sub>2</sub>
              </div>
              <p className="text-slate-300 font-medium">
                When dissolved in water, it undergoes hydrolysis to release free chlorine gas. This active chlorine is the primary biocide that disrupts the biological membranes of bacteria. Due to atmospheric humidity and heat, commercial bleaching powder degrades, yielding only <strong>30-36% available chlorine</strong>.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800/80 pb-1 mt-4">
                Iodometric Redox Stoichiometry
              </h3>
              <p className="mt-2 text-slate-300 font-medium">
                We estimate available chlorine using a two-step iodometric redox process. First, standard bleaching powder solution is acidified with acetic acid in the presence of excess Potassium Iodide (KI). The chlorine oxidizes iodide to molecular iodine:
              </p>
              <div className="my-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-center font-mono text-blue-300 text-xs shadow-inner">
                Cl<sub>2</sub> + 2KI &rarr; 2KCl + I<sub>2</sub>
              </div>
              <p className="text-slate-300 font-medium">
                The liberated iodine (which tints the liquid brown) is then titrated against standard Sodium Thiosulfate (Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>) titrant:
              </p>
              <div className="my-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-center font-mono text-blue-300 text-xs shadow-inner">
                I<sub>2</sub> + 2Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub> &rarr; Na<sub>2</sub>S<sub>4</sub>O<sub>6</sub> + 2NaI
              </div>
              <p className="text-slate-300 font-medium">
                A starch indicator is added near the endpoint, forming a deep blue-black coordination complex with the iodine. Once all molecular iodine is reduced back to colorless iodide ions, the solution turns instantly transparent.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800/80 pb-1 mt-4">
                Disinfection Demand
              </h3>
              <p className="mt-2 text-slate-300 font-medium">
                When bleaching powder is added to environmental water, impurities (algae, bacteria, metal ions) consume chlorine. The amount of chlorine consumed is the <strong>chlorine demand</strong>. The remaining chlorine is called <strong>residual chlorine</strong>. Determining the exact dosage required to satisfy the demand is crucial to guarantee pathogen destruction without leaving excess toxic chlorine in the drinking water supply.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <ClipboardList size={18} className="text-blue-400" />
              Experiment Steps
            </h3>
            
            <div className="space-y-4">
              {stepsList.map((s) => {
                const isActive = step === s.id;
                const isCompleted = step > s.id;
                
                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-xl transition-all border ${
                      isActive
                        ? 'border-blue-500/40 border-l-4 border-l-blue-500 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.08)]'
                        : isCompleted
                        ? 'border-emerald-500/20 border-l-4 border-l-emerald-500 bg-emerald-950/10'
                        : 'border-slate-800/60 bg-slate-900/20 opacity-40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle size={20} className="text-emerald-400 fill-emerald-950/30" />
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {s.id}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h4
                          className={`font-bold text-sm transition-colors ${
                            isActive
                              ? 'text-blue-300'
                              : isCompleted
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          {s.description}
                        </p>
                      </div>
                    </div>

                    {/* Step specific alerts and helpful reminders */}
                    {isActive && s.id === 1 && (
                      <div className="mt-3 p-2.5 bg-blue-950/30 border border-blue-900/60 rounded-lg text-xs text-blue-300 font-medium">
                        <strong>Action Needed:</strong> Click on the filter button in the center panel to filter the 1% bleaching powder suspension.
                      </div>
                    )}
                    {isActive && s.id === 2 && (
                      <div className="mt-3 p-2.5 bg-blue-950/30 border border-blue-900/60 rounded-lg text-xs text-blue-300 font-medium">
                        <strong>Action Needed:</strong> Pour 20 ml of Bleaching Powder filtrate, add KI, Acetic Acid, and Starch. Titrate to colorless, then click <strong>'Log Reading'</strong> in the control deck to record V1 and proceed.
                      </div>
                    )}
                    {isActive && s.id === 3 && (
                      <div className="mt-3 p-2.5 bg-blue-950/30 border border-blue-900/60 rounded-lg text-xs text-blue-300 space-y-1 font-medium">
                        <div><strong>Selected sample:</strong> <span className="text-white font-bold">{selectedSample?.name}</span></div>
                        <div className="text-[11px]"><strong>Impurity Profile:</strong> <span className="text-slate-300">{selectedSample?.impurityProfile}</span></div>
                        {selectedSample && selectedSample.dilutionFactor > 1 && (
                          <p className="text-amber-300 font-bold mt-1 bg-amber-950/20 border border-amber-900/50 p-1.5 rounded">
                            ⚠️ This sample is highly impure. You must dilution-pipette it first (DF = {selectedSample.dilutionFactor}) before sterilization.
                          </p>
                        )}
                      </div>
                    )}
                    {isActive && s.id === 4 && (
                      <div className="mt-3 p-2.5 bg-blue-950/30 border border-blue-900/60 rounded-lg text-xs text-blue-300 font-medium">
                        <strong>Action Needed:</strong> Add KI, Acetic Acid, and Starch. Titrate the residual chlorine to colorless, then click <strong>'Log Reading'</strong> in the control deck to record V2 and proceed.
                      </div>
                    )}
                    {isActive && s.id === 5 && (
                      <div className="mt-3 p-2.5 bg-blue-950/30 border border-blue-900/60 rounded-lg text-xs text-blue-300 font-medium">
                        <strong>Action Needed:</strong> Enter your observations and calculate the required dosage in the dashboard on the right.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

        {/* Sticky Next Stage Action Footer */}
        {activeTab === 'procedure' && step < 5 && (
          <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 mt-auto">
            <button
              disabled={
                (step === 1 && !isFiltratePrepared) ||
                (step === 2 && logs.filter(l => l.sampleName === 'Blank Standardization').length < 3) ||
                (step === 3 && (!isFlaskStoppered || reactionTimerActive)) ||
                (step === 4 && logs.filter(l => l.sampleName === selectedSample?.name).length < 3)
              }
              onClick={() => setStep(step + 1)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer ${
                isNextReady
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/30 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              Next Stage
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
  );
};
