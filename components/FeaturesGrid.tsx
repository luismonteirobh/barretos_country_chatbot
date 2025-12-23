
import React from 'react';

const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: 'waves',
      title: 'Praia Termal',
      subtitle: 'Ondas artificiais',
      color: 'text-resort-blue',
      bgColor: 'bg-resort-blue/20'
    },
    {
      icon: 'agriculture',
      title: 'Fazendinha',
      subtitle: 'Animais de verdade',
      color: 'text-resort-green',
      bgColor: 'bg-resort-green/20'
    },
    {
      icon: 'restaurant',
      title: 'Gastronomia',
      subtitle: 'Queima do Alho',
      color: 'text-primary',
      bgColor: 'bg-primary/20'
    },
    {
      icon: 'verified_user',
      title: 'Cancelamento',
      subtitle: 'Flexível e seguro',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
      {features.map((f, i) => (
        <div 
          key={i} 
          className="glass-panel rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default animate-fade-in-up"
          style={{ animationDelay: `${0.5 + i * 0.1}s` }}
        >
          <div className={`${f.bgColor} p-2 rounded-lg ${f.color}`}>
            <span className="material-symbols-outlined">{f.icon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-bold">{f.title}</span>
            <span className="text-white/60 text-[10px]">{f.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturesGrid;
