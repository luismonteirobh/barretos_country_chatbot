
import React, { useState } from 'react';

interface RouletteModalProps {
  onClose: () => void;
}

const RouletteModal: React.FC<RouletteModalProps> = ({ onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const bonuses = [
    "10% de Desconto",
    "Upgrade de Quarto",
    "Drink Cortesia",
    "Passeio a Cavalo",
    "Ingresso Parque Aquático",
    "Café da Manhã Extra"
  ];

  const handleSpin = () => {
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * bonuses.length);
      setResult(bonuses[randomIdx]);
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative glass-panel rounded-3xl p-8 w-full max-w-md flex flex-col items-center text-center animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full p-4 shadow-xl mb-6">
          <span className="material-symbols-outlined text-white text-5xl">casino</span>
        </div>

        <h3 className="text-2xl font-extrabold mb-2">Roleta Country</h3>
        <p className="text-white/70 text-sm mb-8">
          Gire para ganhar um benefício exclusivo para suas férias!
        </p>

        <div className="relative size-48 mb-8">
          <div className={`w-full h-full border-8 border-primary rounded-full flex items-center justify-center relative overflow-hidden transition-transform duration-[2000ms] ease-in-out ${spinning ? 'rotate-[1080deg]' : ''}`}>
             <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="bg-primary/20 border border-primary/20"></div>
                <div className="bg-resort-brown/20 border border-primary/20"></div>
                <div className="bg-resort-brown/20 border border-primary/20"></div>
                <div className="bg-primary/20 border border-primary/20"></div>
             </div>
             <span className="material-symbols-outlined text-primary text-6xl relative z-10">stars</span>
          </div>
          {/* Arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-primary">
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </div>
        </div>

        {result ? (
          <div className="animate-fade-in-up">
            <p className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-1">Você ganhou!</p>
            <h4 className="text-3xl font-extrabold text-white mb-6">{result}</h4>
            <button 
              onClick={onClose}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              Usar Bônus Agora
            </button>
          </div>
        ) : (
          <button 
            disabled={spinning}
            onClick={handleSpin}
            className={`bg-primary hover:bg-primary-dark text-white px-12 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50`}
          >
            {spinning ? 'Girando...' : 'Girar Roleta!'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RouletteModal;
