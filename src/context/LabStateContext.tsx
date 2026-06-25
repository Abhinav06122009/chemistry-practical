import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { playDripSound, startBubbleSound, stopBubbleSound, playClickSound, playPourSound } from '../utils/audio';

// Water sample configuration interface
export interface WaterSample {
  id: string;
  name: string;
  impurityProfile: string;
  targetAmount: number; // grams per Liter
  dilutionFactor: number; // DF (1, 2, or 10)
  description: string;
}

// Observation log entry interface
export interface ObservationLog {
  trialNo: number;
  sampleName: string;
  initialReading: number;
  finalReading: number;
  volumeUsed: number;
}

// Lab state interface
interface LabState {
  step: number;
  setStep: (step: number) => void;
  isFiltratePrepared: boolean;
  setIsFiltratePrepared: (prepared: boolean) => void;
  
  // Reagents & flask state
  flaskReagents: string[];
  addReagent: (reagent: string) => void;
  clearFlask: () => void;
  isFlaskStoppered: boolean;
  setFlaskStoppered: (stoppered: boolean) => void;
  isStirring: boolean;
  setIsStirring: (stirring: boolean) => void;
  
  // Dilution state
  dilutionCompleted: boolean;
  runDilution: () => void;
  
  // Waiting/Reaction timer
  reactionTimerActive: boolean;
  reactionProgress: number;
  triggerReaction: () => void;

  // Buret controls
  buretVolume: number; // Volume of titrant delivered (ml)
  setBuretVolume: (vol: number) => void;
  isStopcockOpen: boolean;
  setIsStopcockOpen: (open: boolean) => void;
  flowSpeed: 'drop' | 'continuous' | 'off';
  setFlowSpeed: (speed: 'drop' | 'continuous' | 'off') => void;
  refillBuret: () => void;
  addTitrantManual: (amount: number) => void;

  // Experiment data
  waterSamples: WaterSample[];
  selectedSampleId: string;
  setSelectedSampleId: (id: string) => void;
  v1: number; // Blank titration endpoint (ml)
  v2: number | null; // Selected sample titration endpoint (ml)
  logs: ObservationLog[];
  addLog: (log: ObservationLog) => void;
  clearLogs: () => void;
  
  // Student verification state
  studentV1: string;
  setStudentV1: (val: string) => void;
  studentV2: string;
  setStudentV2: (val: string) => void;
  studentCalculatedAmount: string;
  setStudentCalculatedAmount: (val: string) => void;
  isCalculationCorrect: boolean | null;
  verifyCalculation: () => void;
  errorMessage: string | null;
  verifiedResults: Record<string, number>;
  
  // Quiz state
  isQuizActive: boolean;
  setIsQuizActive: (active: boolean) => void;
  quizSubmitted: boolean;
  setQuizSubmitted: (submitted: boolean) => void;
  quizScore: number | null;
  submitQuiz: (answers: Record<number, string>) => void;
  
  // Helpers
  resetLab: () => void;
  startNextSample: () => void;
  getCurrentTargetV2: () => number;
  getCurrentLiquidColor: () => { color: string; opacity: number };
  getCurveData: () => { x: number; y: number }[];
}

const LabStateContext = createContext<LabState | undefined>(undefined);

export const LabStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State Configuration
  const [step, setStep] = useState<number>(1);
  const [isFiltratePrepared, setIsFiltratePrepared] = useState<boolean>(false);
  const [flaskReagents, setFlaskReagents] = useState<string[]>([]);
  const [isFlaskStoppered, setFlaskStoppered] = useState<boolean>(false);
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [dilutionCompleted, setDilutionCompleted] = useState<boolean>(false);
  const [reactionTimerActive, setReactionTimerActive] = useState<boolean>(false);
  const [reactionProgress, setReactionProgress] = useState<number>(0);
  
  // Buret State
  const [buretVolume, setBuretVolume] = useState<number>(0); // 0ml delivered (buret is full)
  const [isStopcockOpen, setIsStopcockOpen] = useState<boolean>(false);
  const [flowSpeed, setFlowSpeed] = useState<'drop' | 'continuous' | 'off'>('off');
  
  // Water samples database
  const waterSamples: WaterSample[] = [
    { id: 'distilled', name: 'Distilled / Bisleri Water', impurityProfile: 'Highly pure, minimal organic load', targetAmount: 0.245, dilutionFactor: 1, description: 'Purified water with almost no active impurities or organic load. Requires very little chlorine.' },
    { id: 'tap', name: 'Municipal Tap Water', impurityProfile: 'Pre-treated, moderate residual demand', targetAmount: 0.463, dilutionFactor: 1, description: 'Chlorinated municipal water. Has been treated but still contains a minor organic/mineral load.' },
    { id: 'pond', name: 'Pond Water / Rain Water', impurityProfile: 'High organic matter, algae presence', targetAmount: 0.850, dilutionFactor: 2, description: 'Contains significant organic impurities, micro-algae, and bacteria. Diluted 1:2 for accurate titration.' },
    { id: 'borewell', name: 'Borewell Water', impurityProfile: 'High dissolved minerals, potential biological load', targetAmount: 1.150, dilutionFactor: 2, description: 'High in dissolved mineral salts and metal ions. Diluted 1:2 to ensure chemical equilibrium.' },
    { id: 'sewage', name: 'Highly Impure Sewage Runoff', impurityProfile: 'Extreme organic and biological demand', targetAmount: 2.620, dilutionFactor: 10, description: 'Untreated domestic wastewater with massive organic pollutants. Diluted 1:10 to prevent total chlorine depletion.' }
  ];
  
  const [selectedSampleId, setSelectedSampleId] = useState<string>('distilled');
  
  // Randomize V1 between 15.2 and 16.8 ml on load (Standard for 20 ml Bleaching Powder solution)
  const [v1, setV1] = useState<number>(15.8);
  useEffect(() => {
    const randomV1 = parseFloat((15.2 + Math.random() * 1.6).toFixed(2));
    setV1(randomV1);
  }, []);

  const getCurrentTargetV2 = (): number => {
    const sample = waterSamples.find(s => s.id === selectedSampleId);
    if (!sample) return 0;
    // CBSE Formula Adjusted for 20ml BP: V2 = V1 * (1 - Amount / (2 * DF))
    const targetV2 = v1 * (1 - sample.targetAmount / (2 * sample.dilutionFactor));
    return parseFloat(targetV2.toFixed(2));
  };
  
  const [logs, setLogs] = useState<ObservationLog[]>([]);
  
  // Student Calculations State
  const [studentV1, setStudentV1] = useState<string>('');
  const [studentV2, setStudentV2] = useState<string>('');
  const [studentCalculatedAmount, setStudentCalculatedAmount] = useState<string>('');
  const [isCalculationCorrect, setIsCalculationCorrect] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedResults, setVerifiedResults] = useState<Record<string, number>>({});

  // Quiz State
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Titrant flow interval ref
  const timerRef = useRef<any | null>(null);

  // Automatically manage flask and buret state at step transitions
  useEffect(() => {
    if (step === 1) {
      setFlaskReagents([]);
      setBuretVolume(0);
      setFlaskStoppered(false);
      setDilutionCompleted(false);
      setIsStirring(false);
      setFlowSpeed('off');
      setIsStopcockOpen(false);
    } else if (step === 3) {
      setFlaskReagents([]);
      setFlaskStoppered(false);
      setReactionProgress(0);
      setReactionTimerActive(false);
      setBuretVolume(0);
      setFlowSpeed('off');
      setIsStopcockOpen(false);
      setIsStirring(false);
      setDilutionCompleted(false);
    } else if (step === 4) {
      setFlaskStoppered(false);
      setBuretVolume(0);
      setFlowSpeed('off');
      setIsStopcockOpen(false);
      setIsStirring(false);
    } else if (step === 5) {
      const sample = waterSamples.find(s => s.id === selectedSampleId);
      if (sample) {
        const targetV2 = getCurrentTargetV2();
        const calculatedAmount = (2 * (v1 - targetV2) / v1) * sample.dilutionFactor;
        
        setStudentV1(v1.toFixed(2));
        setStudentV2(targetV2.toFixed(2));
        setStudentCalculatedAmount(calculatedAmount.toFixed(3));
        setIsCalculationCorrect(true);
        setVerifiedResults(prev => ({
          ...prev,
          [selectedSampleId]: calculatedAmount
        }));
      }
    }
  }, [step, selectedSampleId, v1]);



  // Link stirring state to continuous bubble sound
  useEffect(() => {
    if (isStirring) {
      startBubbleSound();
    } else {
      stopBubbleSound();
    }
    return () => {
      stopBubbleSound();
    };
  }, [isStirring]);

  // Click sound on stopcock state transitions
  useEffect(() => {
    if (isStopcockOpen !== undefined) {
      playClickSound();
    }
  }, [isStopcockOpen]);

  // 2. Reacting to stopcock status
  useEffect(() => {
    if (isStopcockOpen && flowSpeed !== 'off') {
      const intervalDuration = flowSpeed === 'continuous' ? 60 : 120;
      const stepAmount = flowSpeed === 'continuous' ? 0.1 : 0.02;

      timerRef.current = setInterval(() => {
        // Play titrant drip sound
        playDripSound();
        
        setBuretVolume(prev => {
          const nextVol = parseFloat((prev + stepAmount).toFixed(2));
          const targetLimit = step === 2 ? v1 : getCurrentTargetV2();

          // Check if we hit the endpoint
          const isAtEndpoint = prev < targetLimit && nextVol >= targetLimit;

          if (nextVol >= 50.0) {
            clearInterval(timerRef.current!);
            setIsStopcockOpen(false);
            setFlowSpeed('off');
            return 50.0;
          }

          if (isAtEndpoint) {
            // Pause flow momentarily at the endpoint for visualization
            clearInterval(timerRef.current!);
            setIsStopcockOpen(false);
            setFlowSpeed('off');
            return targetLimit;
          }

          return nextVol;
        });
      }, intervalDuration);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStopcockOpen, flowSpeed, step, selectedSampleId, v1]);


  // 3. Methods & Actions
  const addReagent = (reagent: string) => {
    if (flaskReagents.includes(reagent)) return;
    setFlaskReagents(prev => [...prev, reagent]);
  };

  const clearFlask = () => {
    playClickSound();
    setFlaskReagents([]);
    setFlaskStoppered(false);
    setReactionProgress(0);
    setReactionTimerActive(false);
    setBuretVolume(0);
  };

  const runDilution = () => {
    playPourSound();
    setDilutionCompleted(true);
    addReagent('diluted_water');
  };

  const triggerReaction = () => {
    playClickSound();
    setReactionTimerActive(true);
    setReactionProgress(0);
    const interval = setInterval(() => {
      setReactionProgress(prev => {
        if (prev % 20 === 0) {
          playClickSound();
        }
        if (prev >= 100) {
          clearInterval(interval);
          setReactionTimerActive(false);
          setFlaskStoppered(true);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const refillBuret = () => {
    playPourSound();
    setBuretVolume(0);
  };

  const addTitrantManual = (amount: number) => {
    playDripSound();
    setBuretVolume(prev => {
      const nextVol = parseFloat((prev + amount).toFixed(2));
      const targetLimit = step === 2 ? v1 : getCurrentTargetV2();
      if (prev < targetLimit && nextVol >= targetLimit) {
        return targetLimit;
      }
      return nextVol > 50 ? 50 : nextVol;
    });
  };

  const addLog = (log: ObservationLog) => {
    playClickSound();
    setLogs(prev => {
      const currentTrials = prev.filter(l => l.sampleName === log.sampleName);
      if (currentTrials.length >= 4) return prev;
      return [
        ...prev,
        {
          trialNo: currentTrials.length + 1,
          sampleName: log.sampleName,
          initialReading: 0,
          finalReading: log.volumeUsed,
          volumeUsed: log.volumeUsed
        }
      ];
    });
  };


  const clearLogs = () => {
    setLogs([]);
  };

  // 4. Calculations Verification
  const verifyCalculation = () => {
    setErrorMessage(null);
    setIsCalculationCorrect(null);

    const sV1 = parseFloat(studentV1);
    const sV2 = parseFloat(studentV2);
    const sAmount = parseFloat(studentCalculatedAmount);

    if (isNaN(sV1) || isNaN(sV2) || isNaN(sAmount)) {
      setErrorMessage("Please enter valid numerical values for all fields.");
      return;
    }

    // 1. Verify V1 input matches V1 concordance
    if (Math.abs(sV1 - v1) > 0.05) {
      setErrorMessage(`Your recorded V1 value (${sV1} ml) does not match the experiment results. Check your data table.`);
      setIsCalculationCorrect(false);
      return;
    }

    // 2. Verify V2 input matches V2 concordance
    const expectedV2 = getCurrentTargetV2();
    if (Math.abs(sV2 - expectedV2) > 0.05) {
      setErrorMessage(`Your recorded V2 value (${sV2} ml) does not match the titration endpoint for the water sample.`);
      setIsCalculationCorrect(false);
      return;
    }

    // 3. Verify final dosage formula calculation
    // Amount = 2 * (V1 - V2) / V1 * DF
    const sample = waterSamples.find(s => s.id === selectedSampleId);
    if (!sample) return;

    const expectedAmount = (2 * (v1 - expectedV2) / v1) * sample.dilutionFactor;

    if (Math.abs(sAmount - expectedAmount) > 0.02) {
      setErrorMessage(`Calculation error. Use the CBSE formula:\nAmount = 2 × (V1 - V2) / V1 × DF (g/L)`);
      setIsCalculationCorrect(false);
      return;
    }

    setIsCalculationCorrect(true);
    setVerifiedResults(prev => ({
      ...prev,
      [selectedSampleId]: expectedAmount
    }));
  };

  // 5. Quiz scoring
  const submitQuiz = (answers: Record<number, string>) => {
    const correctAnswers = {
      1: 'B', // Disinfection
      2: 'B', // Ca(OCl)2
      3: 'C', // Iodine
      4: 'B', // Active chlorine left
      5: 'C'  // 14.3g
    };

    let score = 0;
    Object.keys(correctAnswers).forEach((key) => {
      const qNum = parseInt(key) as 1;
      if (answers[qNum] === correctAnswers[qNum]) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);
  };

  // 6. Fluid Color Dynamics
  const getCurrentLiquidColor = (): { color: string; opacity: number } => {
    // Check if starch has been added
    const hasStarch = flaskReagents.includes('starch');
    const hasKI = flaskReagents.includes('ki');
    const hasAcid = flaskReagents.includes('acid');
    const hasBP = flaskReagents.includes('bleaching_powder');
    const hasSample = flaskReagents.includes('water_sample');

    // Liquid base colors based on active step
    if (step === 2) {
      // Blank Titration
      if (!hasBP) return { color: '#ffffff', opacity: 0.1 }; // empty flask
      if (hasBP && !hasKI) return { color: '#e2e8f0', opacity: 0.45 }; // Cloudy white BP suspension

      // Iodine liberated
      if (hasBP && hasKI && hasAcid) {
        const targetLimit = v1;
        const progress = buretVolume / targetLimit;

        if (hasStarch) {
          // Blue-Black Starch-Iodine Complex fading to colorless
          if (progress >= 1.0) {
            return { color: '#ffffff', opacity: 0.15 }; // colorless
          } else {
            // Blue black fades as we approach endpoint
            const opacity = Math.max(0, 0.95 - (progress * 0.95));
            return { color: '#1e1b4b', opacity }; // Indigo-950 blue black
          }
        } else {
          // Yellow-brown iodine color fading
          const opacity = Math.max(0.15, 0.8 - (progress * 0.6));
          return { color: '#b45309', opacity }; // Amber-700
        }
      }

      return { color: '#e2e8f0', opacity: 0.45 };
    } else if (step === 3 || step === 4) {
      // Water sample phases
      if (!hasSample) return { color: '#ffffff', opacity: 0.1 };
      
      // Base water color
      let baseColor = '#e2e8f0'; // default tap
      let baseOpacity = 0.2;
      if (selectedSampleId === 'pond') { baseColor = '#eab308'; baseOpacity = 0.35; } // greenish yellow
      if (selectedSampleId === 'borewell') { baseColor = '#ca8a04'; baseOpacity = 0.25; } // yellowish
      if (selectedSampleId === 'sewage') { baseColor = '#78716c'; baseOpacity = 0.55; } // muddy grey

      if (!hasBP) return { color: baseColor, opacity: baseOpacity };
      
      // After Bleaching Powder added
      if (hasBP && !hasKI) {
        return { color: baseColor, opacity: baseOpacity + 0.15 }; // slightly cloudier
      }

      // Iodine liberated
      if (hasBP && hasKI && hasAcid) {
        const targetLimit = getCurrentTargetV2();
        const progress = buretVolume / targetLimit;

        if (hasStarch) {
          if (progress >= 1.0) {
            return { color: baseColor, opacity: baseOpacity * 0.5 }; // returns to clean water base
          } else {
            const opacity = Math.max(baseOpacity * 0.5, 0.9 - (progress * 0.9));
            return { color: '#1e1b4b', opacity }; // Starch complex
          }
        } else {
          const opacity = Math.max(baseOpacity * 0.5, 0.75 - (progress * 0.65));
          return { color: '#d97706', opacity }; // Iodine color
        }
      }

      return { color: baseColor, opacity: baseOpacity + 0.1 };
    }

    return { color: '#ffffff', opacity: 0.1 };
  };

  // 7. Redox Titration Curve Generation
  const getCurveData = (): { x: number; y: number }[] => {
    const targetLimit = step === 2 ? v1 : getCurrentTargetV2();
    const dataPoints: { x: number; y: number }[] = [];
    
    // Generate redox potential E (Volts) vs Volume (ml)
    // E(x) = E_start - (E_jump) / (1 + exp(-4 * (x - V_eq)))
    // Let's generate data points from x = 0 to x = targetLimit + 5 (or 25 max)
    const maxX = Math.max(25, targetLimit + 5);
    
    for (let x = 0; x <= maxX; x += 0.5) {
      // sigmoid function centered at targetLimit
      const E = 0.46 - 0.28 / (1 + Math.exp(-2.2 * (x - targetLimit)));
      dataPoints.push({ x, y: parseFloat(E.toFixed(3)) });
    }
    
    return dataPoints;
  };

  const resetLab = () => {
    setStep(1);
    clearFlask();
    setLogs([]);
    setSelectedSampleId('distilled');
    setStudentV1('');
    setStudentV2('');
    setStudentCalculatedAmount('');
    setIsCalculationCorrect(null);
    setErrorMessage(null);
    setIsQuizActive(false);
    setQuizSubmitted(false);
    setQuizScore(null);
    setDilutionCompleted(false);
    setIsFiltratePrepared(false);
    setVerifiedResults({});
    // Re-randomize V1 on reset (between 15.2 and 16.8 ml for 20ml BP)
    setV1(parseFloat((15.2 + Math.random() * 1.6).toFixed(2)));
  };

  const startNextSample = () => {
    setStep(3);
    clearFlask();
    setStudentV2('');
    setStudentCalculatedAmount('');
    setIsCalculationCorrect(null);
    setErrorMessage(null);
    setDilutionCompleted(false);
  };

  return (
    <LabStateContext.Provider value={{
      step, setStep,
      flaskReagents, addReagent, clearFlask,
      isFlaskStoppered, setFlaskStoppered,
      isStirring, setIsStirring,
      dilutionCompleted, runDilution,
      reactionTimerActive, reactionProgress, triggerReaction,
      buretVolume, setBuretVolume,
      isStopcockOpen, setIsStopcockOpen,
      flowSpeed, setFlowSpeed,
      refillBuret, addTitrantManual,
      waterSamples, selectedSampleId, setSelectedSampleId,
      v1, v2: getCurrentTargetV2(), logs, addLog, clearLogs,
      studentV1, setStudentV1,
      studentV2, setStudentV2,
      studentCalculatedAmount, setStudentCalculatedAmount,
      isCalculationCorrect, verifyCalculation, errorMessage,
      isQuizActive, setIsQuizActive,
      quizSubmitted, setQuizSubmitted,
      quizScore, submitQuiz,
      isFiltratePrepared, setIsFiltratePrepared,
      verifiedResults,
      resetLab, startNextSample, getCurrentTargetV2, getCurrentLiquidColor, getCurveData
    }}>
      {children}
    </LabStateContext.Provider>
  );
};

export const useLabState = () => {
  const context = useContext(LabStateContext);
  if (context === undefined) {
    throw new Error('useLabState must be used within a LabStateProvider');
  }
  return context;
};
