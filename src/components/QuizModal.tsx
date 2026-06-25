import React, { useState } from 'react';
import { useLabState } from '../context/LabStateContext';
import { Check, X, ShieldAlert, Award, RefreshCw, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export const QuizModal: React.FC = () => {
  const {
    isQuizActive,
    setIsQuizActive,
    quizScore,
    submitQuiz,
    resetLab
  } = useLabState();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const quizQuestions: Question[] = [
    {
      id: 1,
      question: "What is the primary role of Bleaching powder in municipal water treatment?",
      options: [
        { key: "A", text: "Coagulation and flocculation of suspended mud" },
        { key: "B", text: "Disinfection to kill pathogenic microorganisms" },
        { key: "C", text: "Aeration to remove dissolved iron and manganese gases" },
        { key: "D", text: "Filtration to separate particulate debris" }
      ],
      correctAnswer: "B",
      explanation: "Disinfection is the final, most crucial biological purification stage. While other chemicals act as coagulants, bleaching powder destroys cellular pathogens."
    },
    {
      id: 2,
      question: "What is the chemical formula for the active disinfecting component in bleaching powder?",
      options: [
        { key: "A", text: "Ca(OH)2 (Slaked Lime)" },
        { key: "B", text: "Ca(OCl)2 (Calcium Hypochlorite)" },
        { key: "C", text: "CaCl2 (Calcium Chloride)" },
        { key: "D", text: "CaO (Quicklime)" }
      ],
      correctAnswer: "B",
      explanation: "Commercial bleaching powder is represented as CaOCl2, but its active chlorine agent is Calcium Hypochlorite, Ca(OCl)2."
    },
    {
      id: 3,
      question: "During the iodometric titration, the sudden disappearance of the blue color indicates the complete reduction of what element?",
      options: [
        { key: "A", text: "Active Chlorine (Cl2)" },
        { key: "B", text: "Potassium Ions (K+)" },
        { key: "C", text: "Molecular Iodine (I2) to Iodide (I-)" },
        { key: "D", text: "Sodium Tetrathionate (Na2S4O6)" }
      ],
      correctAnswer: "C",
      explanation: "Starch forms a deep-blue complex with molecular iodine (I2). Once all iodine is reduced by thiosulfate to colorless iodide (I-), the blue-black color instantly vanishes."
    },
    {
      id: 4,
      question: "Define 'Residual Chlorine' and explain its environmental importance.",
      options: [
        { key: "A", text: "Chlorine lost to atmospheric evaporation" },
        { key: "B", text: "Active chlorine remaining after satisfying the organic impurity demand, protecting against future contamination" },
        { key: "C", text: "Inactive chloride ions deposited on the river bed" },
        { key: "D", text: "The initial mass of bleach powder dissolved in the stock solution" }
      ],
      correctAnswer: "B",
      explanation: "Residual chlorine serves as a critical biological buffer, maintaining sterility within the water distribution system from treatment plants to consumer taps."
    },
    {
      id: 5,
      question: "According to CDC guidelines, if you need a 0.5% chlorine solution for disinfection and your bulk bleach powder contains 35% active chlorine, how many grams do you add to 1 Liter of water?",
      options: [
        { key: "A", text: "5.0 grams" },
        { key: "B", text: "10.0 grams" },
        { key: "C", text: "14.3 grams" },
        { key: "D", text: "35.0 grams" }
      ],
      correctAnswer: "C",
      explanation: "CDC Formula: [Desired % / Active %] × 1000 = Grams per Liter. Here: [0.5 / 35] × 1000 = 14.28g ≈ 14.3g."
    }
  ];

  if (!isQuizActive) return null;

  const handleSelectOption = (optionKey: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [quizQuestions[currentQuestionIndex].id]: optionKey
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Submit
      submitQuiz(selectedAnswers);
      setShowResults(true);
      
      // Calculate score local check for instant effect
      let score = 0;
      quizQuestions.forEach(q => {
        if (selectedAnswers[q.id] === q.correctAnswer) {
          score++;
        }
      });
      
      if (score >= 4) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsQuizActive(false);
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    resetLab();
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const selectedOption = selectedAnswers[currentQuestion.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="bg-slate-955 p-5 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Award className="text-yellow-400" />
            <h2 className="text-base font-bold text-slate-200">Viva Voce Oral Assessment</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!showResults ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                  <span>{Math.round(((currentQuestionIndex) / quizQuestions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <h3 className="text-sm md:text-base font-bold text-slate-250 leading-snug">
                  {currentQuestion.question}
                </h3>
                
                {/* Options List */}
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOption === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleSelectOption(option.key)}
                        className={`flex items-start text-left p-4 rounded-xl border transition-all text-xs md:text-sm font-medium cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-sm ring-1 ring-blue-500/30'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {option.key}
                        </span>
                        <span className="leading-tight">{option.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // Results Mode
            <div className="space-y-6">
              {/* Score Display Card */}
              <div className="bg-slate-955 border border-slate-800/80 rounded-2xl p-6 text-center space-y-3 shadow-inner">
                <div className="inline-flex p-4 bg-yellow-950/20 rounded-full border border-yellow-900/50">
                  <Award size={40} className="text-yellow-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-200">
                    Your Score: {quizScore} / {quizQuestions.length}
                  </h3>
                  <p className="text-xs text-slate-450 max-w-sm mx-auto">
                    {quizScore && quizScore >= 4
                      ? "Outstanding work! You have a strong conceptual grasp of water sanitization chemistry."
                      : "Good attempt. Re-read the explanations below to reinforce your stoichiometry definitions."}
                  </p>
                </div>
              </div>

              {/* Review section */}
              <div className="space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Review Answers</h4>
                
                {quizQuestions.map((q) => {
                  const studentAns = selectedAnswers[q.id];
                  const isCorrect = studentAns === q.correctAnswer;
                  
                  return (
                    <div key={q.id} className="p-4 border border-slate-800/60 rounded-xl space-y-3 bg-slate-950/20">
                      <div className="flex items-start gap-3 justify-between">
                        <h5 className="font-bold text-xs md:text-sm text-slate-200 leading-snug">
                          {q.id}. {q.question}
                        </h5>
                        
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/30 py-1 px-2.5 rounded-full border border-emerald-900/40 shrink-0">
                            <Check size={10} /> Correct
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/30 py-1 px-2.5 rounded-full border border-rose-900/40 shrink-0">
                            <X size={10} /> Incorrect
                          </span>
                        )}
                      </div>

                      {/* Options table for clarity */}
                      <div className="space-y-1 text-xs pl-2 border-l-2 border-slate-800">
                        {q.options.map((opt) => (
                          <div
                            key={opt.key}
                            className={`${
                              opt.key === q.correctAnswer
                                ? 'text-emerald-400 font-bold'
                                : opt.key === studentAns
                                ? 'text-rose-400 line-through'
                                : 'text-slate-400'
                            }`}
                          >
                            {opt.key}: {opt.text}
                          </div>
                        ))}
                      </div>

                      {/* Explanation box */}
                      <div className="p-3 bg-slate-955 border border-slate-850 rounded-lg text-xs text-slate-350 leading-relaxed flex gap-2">
                        <ShieldAlert size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <strong>Scientific Rationale:</strong> {q.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-950 border-t border-slate-800/80 p-4 flex justify-between">
          {!showResults ? (
            <>
              <button
                disabled={currentQuestionIndex === 0}
                onClick={handlePrev}
                className="py-2 px-4 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              
              <button
                disabled={!selectedOption}
                onClick={handleNext}
                className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-40 cursor-pointer"
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? "Submit Assessment" : "Next Question"}
              </button>
            </>
          ) : (
            <div className="flex gap-3 w-full">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Report
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw size={12} />
                Restart Simulator
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
