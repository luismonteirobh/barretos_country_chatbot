
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ChatModule from './components/ChatModule';
import FeaturesGrid from './components/FeaturesGrid';
import RouletteModal from './components/RouletteModal';

const HERO_BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfvKAFalNSA2tnBcP2PO0EjRckfYg4r60mLh8RJ0ZJ8eOiGBLP6WNCZNy5NrLxkl4zu0rnsPI1fFWVFNCH1I3_NNYWMJYxFS6y1aZGzUfK83cXPtD3j8IQ-6ME630IPPe2WQhpfN5m3nhnnk53CxjA9fJ1ttY-K05_VyId1_TWL9bEO0yw0HVR6FpnjptOHMkNww_b3biSGKuj8twRuN_xG9xbKcAjcY6xRoKSDl-dZCMHxRi_MpMWi5qiJcyIMccf9emu8qGwKk5';

const App: React.FC = () => {
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0">
        {/* Camada de escurecimento sutil e uniforme, sem gradiente pesado no fundo */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-[10s] ease-out scale-105"
          style={{ backgroundImage: `url('${HERO_BG}')` }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-6xl mx-auto mt-4 lg:mt-0">
          {/* Headline */}
          <div className="text-center mb-10 max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-resort-brown/60 backdrop-blur-md border border-white/10 mb-6">
              <span className="material-symbols-outlined text-primary text-sm">sunny</span>
              <span className="text-xs font-bold text-white tracking-wide uppercase">Diversão para toda a família</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-xl mb-4">
              Descubra o Seu Pacote de Férias Perfeito no <span className="text-primary italic">Velho Oeste</span> Brasileiro.
            </h2>
          </div>

          {/* Interactive Chat Module */}
          <ChatModule onOpenRoulette={() => setIsRouletteOpen(true)} />
        </main>

        <footer className="w-full pb-8 px-6 mt-auto">
          <FeaturesGrid />
        </footer>
      </div>

      {/* Modals */}
      {isRouletteOpen && <RouletteModal onClose={() => setIsRouletteOpen(false)} />}
    </div>
  );
};

export default App;
