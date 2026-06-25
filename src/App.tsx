import { LabStateProvider } from './context/LabStateContext';
import { DidacticPanel } from './components/DidacticPanel';
import { LaboratoryCanvas } from './components/LaboratoryCanvas';
import { AnalyticalDashboard } from './components/AnalyticalDashboard';
import { QuizModal } from './components/QuizModal';
import { ShieldCheck } from 'lucide-react';
import './App.css';
import GlobalFooter from './components/GlobalFooter';

function BleachingPowderLab() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans select-none antialiased text-slate-100 relative overflow-hidden">
      {/* Ambient laboratory glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-blue-900/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-indigo-950/15 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vh] rounded-full bg-emerald-900/5 blur-[140px] pointer-events-none z-0" />

      {/* 1. Header Bar */}
      <header className="bg-slate-900/80 backdrop-blur-md py-4 px-6 shadow-lg border-b border-slate-800/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a href="https://margdarshak.live" target="_blank" rel="noopener noreferrer" className="mr-3 flex items-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ height: '60px', width: 'auto', display: 'block', objectFit: 'contain', imageRendering: '-webkit-optimize-contrast' as any, transform: 'translateZ(0)', backfaceVisibility: 'hidden' as any }}
                className="cursor-pointer transition-transform duration-300 hover:scale-105" 
              />
            </a>
            <div>
              <h1 className="text-base md:text-lg font-extrabold tracking-tight text-slate-100 m-0 leading-tight">
                Water Sterilization using Bleaching Powder
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                Class 12 Chemistry Investigatory Practical &bull; CBSE Volumetric Analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] font-bold py-1 px-3 bg-slate-800/80 border border-slate-700/80 text-blue-300 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              <ShieldCheck size={12} className="text-emerald-400" />
              Syllabus Aligned
            </span>
          </div>
        </div>
      </header>

      {/* 2. Interactive Canvas Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
        {/* Left column: Didactic / Instruction Panel */}
        <div className="lg:col-span-1">
          <DidacticPanel />
        </div>

        {/* Center column: Simulation Canvas */}
        <div className="lg:col-span-2">
          <LaboratoryCanvas />
        </div>

        {/* Right column: Analytical Dashboard */}
        <div className="lg:col-span-1">
          <AnalyticalDashboard />
        </div>
      </main>

      {/* 4. Viva Voce Quiz Dialog Overlay */}
      <QuizModal />
      <GlobalFooter />
    </div>
  );
}

function App() {
  return (
    <LabStateProvider>
      <BleachingPowderLab />
    </LabStateProvider>
  );
}

export default App;
