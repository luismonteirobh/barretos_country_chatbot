
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: number;
}

interface ChatModuleProps {
  onOpenRoulette: () => void;
}

const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6xq2dVc5DZm3jOYNGDhlAdfvNeMdm5cKoXAwm7U23pUopG0Q-X2117MAPSJU2Y7Wdo6V6NKG1_07QOIZAoPoWlV2pckvoEjRZydqenF3i8AXdAnMNZ7vFLkm0EQwMQSuyW-2IUKjC6PfD49F1NjLf4OsA4UZ5sVvHhGgWpBSgH2WrfxDYOtCjr6tbac9_w9OFtTXKWBIyJOGGl4ABP5OKSWTEbifbp8B2Q-L5WRuIz1cejsAOzRy-4K6ooHdZV6K7WHvHNGGYrHW3';

// Helper for calendar
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const ChatModule: React.FC<ChatModuleProps> = ({ onOpenRoulette }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [nameInputValue, setNameInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Onboarding, 1: Party, 2: Sim/Não Date, 2.1: Calendar, 2.2: Options Date, 3: Name, 4: AI Chat
  const [isExplaining, setIsExplaining] = useState(false);
  const [showContinueExplanation, setShowContinueExplanation] = useState(false);
  const [selections, setSelections] = useState({ party: '', date: '', name: '' });
  
  // Calendar States
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (currentStep === 0 && messages.length === 0) {
      startOnboarding();
    }
  }, [currentStep]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, currentStep, showContinueExplanation, checkIn, checkOut]);

  const startOnboarding = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const welcomeMsg: Message = {
      id: 'w1',
      sender: 'agent',
      text: 'Bem-vindo(a) ao Barretos Country Resort!\nO primeiro resort com temática country do Brasil 🤠',
      timestamp: Date.now(),
    };
    setMessages([welcomeMsg]);
    
    setIsTyping(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(true);

    const knowPrompt: Message = {
      id: 'w2',
      sender: 'agent',
      text: 'Você já conhece o Barretos Country Resort?',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, knowPrompt]);
    setIsTyping(false);
  };

  const explainResort = async () => {
    setIsExplaining(true);
    
    const sequence = [
      { text: "Perfeito 😊\nEntão deixa eu te explicar rapidinho o que é o Barretos Country Resort.", delay: 800 },
      { text: "Ele é o primeiro resort com temática country do Brasil 🤠", delay: 1000 },
      { text: "É aquele tipo de lugar onde adultos descansam\ne crianças se divertem o dia inteiro.", delay: 1000 },
      { text: "O resort conta com:\n♨️ Piscinas com águas termais naturais\n🏊 Parque aquático para todas as idades\n🌊 Piscina de ondas e rio lento\n🐄 Fazendinha com animais\n🎯 Recreação para crianças e adultos", delay: 1200 },
      { text: "Agora que você já sabe como funciona,\ndeixa eu adaptar o pacote pro seu perfil 😉", delay: 800 }
    ];

    for (const item of sequence) {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, item.delay));
      const msg: Message = {
        id: Math.random().toString(),
        sender: 'agent',
        text: item.text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setShowContinueExplanation(true);
  };

  const handleInitialChoice = async (choiceValue: string, label: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: label,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    if (label === '✅ Já conheço') {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const bridgeMsg: Message = {
        id: 'bridge-1',
        sender: 'agent',
        text: "Bão demais que você já conhece! Então vamos direto ao ponto pra gente não perder tempo...",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, bridgeMsg]);
      setIsTyping(false);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      triggerStep1();
    } else {
      explainResort();
    }
  };

  const triggerStep1 = async () => {
    setCurrentStep(1);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const partyPrompt: Message = {
      id: 'w3',
      sender: 'agent',
      text: 'Me conta uma coisa...\nEssa viagem é para quem?',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, partyPrompt]);
    setIsTyping(false);
  };

  const handlePartyChoice = async (party: string) => {
    setSelections(prev => ({ ...prev, party }));
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: party,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const bridgeTexts: Record<string, string> = {
      'Família com crianças': "Maravilha! A criançada vai fazer a festa na nossa Fazendinha e no Parque Aquático. 🐄🏊‍♂️",
      'Casal': "Nada como um descanso a dois nas nossas águas termais, né? Muito romântico! 💑✨",
      'Grupo de amigos': "A diversão tá garantida! O clima de festa aqui é contagiante. 🎉🍻"
    };

    const bridgeMsg: Message = {
      id: 'bridge-party',
      sender: 'agent',
      text: bridgeTexts[party] || "Entendido! Vai ser uma viagem inesquecível.",
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, bridgeMsg]);
    setIsTyping(false);

    await new Promise(resolve => setTimeout(resolve, 800));
    triggerStep2();
  };

  const triggerStep2 = async () => {
    setCurrentStep(2);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const datePrompt: Message = {
      id: 'w4',
      sender: 'agent',
      text: 'Já tem uma data em mente para vir nos visitar?',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, datePrompt]);
    setIsTyping(false);
  };

  const handleDateBinaryChoice = async (hasDate: boolean) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: hasDate ? '✅ Sim' : '❌ Não',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (hasDate) {
      const simMsg: Message = {
        id: 'date-sim-resp',
        sender: 'agent',
        text: 'Perfeito 😊\nSelecione as datas da sua estadia no calendário abaixo:',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, simMsg]);
      setCurrentStep(2.1);
    } else {
      const naoMsg: Message = {
        id: 'date-nao-resp',
        sender: 'agent',
        text: 'Sem problema 😊 Quando você imagina viajar?',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, naoMsg]);
      setCurrentStep(2.2);
    }
    setIsTyping(false);
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
    
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(selectedDate);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (selectedDate < checkIn) {
        setCheckIn(selectedDate);
      } else {
        setCheckOut(selectedDate);
      }
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const confirmCalendarDate = async () => {
    if (!checkIn || !checkOut) return;
    
    const dateRangeStr = `${checkIn.toLocaleDateString('pt-BR')} até ${checkOut.toLocaleDateString('pt-BR')} (${calculateNights()} noites)`;
    setSelections(prev => ({ ...prev, date: dateRangeStr }));
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Desejo ir de ${dateRangeStr}`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const bridgeMsg: Message = {
      id: 'bridge-calendar',
      sender: 'agent',
      text: "Excelente! Já anotei essas datas por aqui. ✅",
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, bridgeMsg]);
    setIsTyping(false);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    triggerStep3();
  };

  const handleDateChoice = async (dateLabel: string, dateValue: string) => {
    setSelections(prev => ({ ...prev, date: dateValue }));
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: dateLabel,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const bridgeMsg: Message = {
      id: 'bridge-date',
      sender: 'agent',
      text: "Ótima escolha! Já registrei seu interesse para esse período. ✅",
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, bridgeMsg]);
    setIsTyping(false);

    await new Promise(resolve => setTimeout(resolve, 800));
    triggerStep3();
  };

  const triggerStep3 = async () => {
    setCurrentStep(3);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const namePrompt: Message = {
      id: 'w5',
      sender: 'agent',
      text: 'Quase lá! Pra gente finalizar os detalhes, como posso te chamar?',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, namePrompt]);
    setIsTyping(false);
  };

  const startAIChat = async (userName: string) => {
    const finalSelections = { ...selections, name: userName };
    setSelections(finalSelections);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Meu nome é ${userName}`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    
    setCurrentStep(4);
    setIsTyping(true);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    chatInstanceRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `Você é o "Guia Country", o assistente virtual oficial do Barretos Country Resort. 
        O usuário se chama ${userName}. Ele vai viajar com ${finalSelections.party} e planeja ir ${finalSelections.date}.
        Sua missão é dar as boas vindas personalizadas, usar gírias do interior ("Uai", "Bão", "Segura Peão") e recomendar atrações (Praia Termal, Fazendinha, Queima do Alho).
        Ao final da primeira resposta, agradeça a atenção e convide-o a girar a roleta para ganhar um presente especial.`
      },
    });

    try {
      const response = await chatInstanceRef.current.sendMessage({ 
        message: `Sou ${userName}, vou viajar com ${finalSelections.party} ${finalSelections.date}. Me receba bem!` 
      });
      const agentText = response.text || "Eita peão, perdi o fôlego aqui. Pode repetir?";
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: agentText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || currentStep < 4) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (chatInstanceRef.current) {
        const response = await chatInstanceRef.current.sendMessage({ message: inputValue });
        const agentText = response.text || "Opa, deu um erro no rádio. Pode falar de novo?";
        
        const delay = Math.min(Math.max(agentText.length * 15, 800), 2000);
        await new Promise(resolve => setTimeout(resolve, delay));

        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: agentText,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, agentMessage]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const welcomeOptions = [
    { label: '✅ Já conheço', icon: 'check_circle', value: 'Já conheço o resort!' },
    { label: '🤠 Conheço só por fotos', icon: 'sentiment_very_satisfied', value: 'Conheço só por fotos!' },
    { label: '👀 Ainda não conheço', icon: 'visibility', value: 'Ainda não conheço nada!' }
  ];

  const partyOptions = [
    { label: 'Família com crianças', icon: '👨‍👩‍👧', color: 'bg-resort-blue/20 text-resort-blue' },
    { label: 'Casal', icon: '💑', color: 'bg-primary/20 text-primary' },
    { label: 'Grupo de amigos', icon: '🎉', color: 'bg-yellow-500/20 text-yellow-500' }
  ];

  const dateGenericOptions = [
    { label: '📅 Próximos 30 dias', value: 'nos próximos 30 dias' },
    { label: '📅 Nos próximos 3 meses', value: 'nos próximos 3 meses' },
    { label: '📅 Férias escolares', value: 'nas férias escolares' },
    { label: '📅 Só pesquisando valores', value: 'apenas pesquisando valores' }
  ];

  // Calendar rendering helper
  const renderCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentCalendarDate);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isCheckIn = checkIn && date.getTime() === checkIn.getTime();
      const isCheckOut = checkOut && date.getTime() === checkOut.getTime();
      const inRange = checkIn && checkOut && date > checkIn && date < checkOut;
      
      days.push(
        <button
          key={d}
          onClick={() => handleDayClick(d)}
          className={`size-8 md:size-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center
            ${isCheckIn || isCheckOut ? 'bg-primary text-white scale-110 shadow-lg z-10' : ''}
            ${inRange ? 'bg-primary/20 text-primary' : 'text-white/80 hover:bg-white/10'}
          `}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="glass-panel p-4 rounded-2xl animate-fade-in-up mt-2 w-full max-w-sm ml-12 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4 px-2">
          <button onClick={() => setCurrentCalendarDate(new Date(year, month - 1))} className="text-white/50 hover:text-white transition-colors">
             <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="font-bold capitalize text-sm">{monthName} {year}</span>
          <button onClick={() => setCurrentCalendarDate(new Date(year, month + 1))} className="text-white/50 hover:text-white transition-colors">
             <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold text-white/30">
          <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SAB</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        {checkIn && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/40">
              <span>Check-in</span>
              <span>Check-out</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white">
              <span className="text-primary">{checkIn.toLocaleDateString('pt-BR')}</span>
              <span className={checkOut ? "text-primary" : "text-white/20"}>{checkOut ? checkOut.toLocaleDateString('pt-BR') : '---'}</span>
            </div>
            
            {checkOut && (
              <div className="mt-2 text-center">
                <p className="text-xs font-bold text-white mb-3">Estadia selecionada: <span className="text-primary">{calculateNights()} noites</span></p>
                <button 
                  onClick={confirmCalendarDate}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
                >
                  👉 Continuar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[550px] flex flex-col gap-6 relative">
      {/* Decorative Icons */}
      <div className="absolute -left-16 top-10 text-resort-green/60 animate-bounce-slow hidden xl:block">
        <span className="material-symbols-outlined text-5xl">nature_people</span>
      </div>
      <div className="absolute -right-16 bottom-32 text-primary/60 animate-bounce-slow hidden xl:block" style={{ animationDelay: '2s' }}>
        <span className="material-symbols-outlined text-5xl">bedroom_parent</span>
      </div>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className="h-[500px] overflow-y-auto space-y-4 pr-3 scroll-smooth flex flex-col py-2"
      >
        {messages.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse animate-message-in-right' : 'animate-message-in-left'}`}
          >
            {msg.sender === 'agent' && (
              <div className="size-10 rounded-full bg-white border-2 border-primary overflow-hidden shrink-0 shadow-md animate-pop-avatar">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: `url('${AVATAR_URL}')` }}
                />
              </div>
            )}
            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl shadow-lg text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap transition-transform hover:scale-[1.01] duration-300 ${
                msg.sender === 'agent' 
                ? 'bg-white text-gray-800 chat-bubble-agent border border-black/5' 
                : 'bg-primary text-white chat-bubble-user shadow-primary/20'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Step 0: Welcome Choice */}
        {currentStep === 0 && !isTyping && !isExplaining && messages.length > 1 && (
          <div className="flex flex-col gap-3 animate-fade-in-up mt-2 pl-12">
            {welcomeOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleInitialChoice(opt.value, opt.label)}
                className="w-full glass-panel border border-white/20 hover:border-primary/50 text-white px-6 py-5 rounded-2xl font-bold text-base transition-all active:scale-[0.98] flex items-center gap-4 group"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                  {opt.icon}
                </span>
                <span className="text-white/90 group-hover:text-white transition-colors">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Continue Explanation Button */}
        {currentStep === 0 && showContinueExplanation && !isTyping && (
          <div className="flex flex-col gap-3 animate-fade-in-up mt-2 pl-12">
            <button
              onClick={() => {
                setShowContinueExplanation(false);
                triggerStep1();
              }}
              className="w-full bg-primary hover:bg-primary-dark text-white px-5 py-4 rounded-xl font-bold text-base transition-all active:scale-95 flex items-center justify-between group shadow-lg shadow-primary/20"
            >
              <span>👉 Continuar</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Step 1: Party Selection Cards */}
        {currentStep === 1 && !isTyping && (
          <div className="grid grid-cols-1 gap-4 animate-fade-in-up mt-2 pl-12">
            {partyOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handlePartyChoice(opt.label)}
                className="w-full glass-panel border border-white/10 hover:border-primary/50 text-white p-5 rounded-2xl transition-all active:scale-95 flex items-center gap-5 group text-left"
              >
                <div className={`size-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${opt.color}`}>
                  {opt.icon}
                </div>
                <div className="flex flex-col">
                   <span className="text-lg font-extrabold group-hover:text-primary transition-colors">{opt.label}</span>
                   <span className="text-xs text-white/50 font-medium">Melhores pacotes disponíveis</span>
                </div>
                <span className="material-symbols-outlined ml-auto text-primary/40 group-hover:text-primary transition-colors">arrow_forward</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Binary Date Choice */}
        {currentStep === 2 && !isTyping && (
          <div className="flex gap-4 animate-fade-in-up mt-2 pl-12">
            <button
              onClick={() => handleDateBinaryChoice(true)}
              className="flex-1 glass-panel border border-white/20 hover:border-primary/50 text-white px-6 py-4 rounded-2xl font-bold transition-all active:scale-[0.95] flex items-center justify-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">✅</span>
              <span>Sim</span>
            </button>
            <button
              onClick={() => handleDateBinaryChoice(false)}
              className="flex-1 glass-panel border border-white/20 hover:border-primary/50 text-white px-6 py-4 rounded-2xl font-bold transition-all active:scale-[0.95] flex items-center justify-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">❌</span>
              <span>Não</span>
            </button>
          </div>
        )}

        {/* Step 2.1: Calendar */}
        {currentStep === 2.1 && !isTyping && renderCalendar()}

        {/* Step 2.2: Date Selection Buttons (Manual Options) */}
        {currentStep === 2.2 && !isTyping && (
          <div className="flex flex-col gap-3 animate-fade-in-up mt-2 pl-12">
            {dateGenericOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleDateChoice(opt.label, opt.value)}
                className="w-full text-left bg-white/10 hover:bg-white/20 border border-white/20 hover:border-primary/50 text-white px-5 py-4 rounded-xl font-bold text-sm md:text-base transition-all active:scale-95 flex items-center justify-between group"
              >
                <span>{opt.label}</span>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">event_available</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Name Input (Inline) */}
        {currentStep === 3 && !isTyping && (
          <div className="flex flex-col gap-3 animate-fade-in-up mt-2 pl-12 w-full max-w-sm">
            <div className="glass-panel rounded-2xl p-1.5 flex items-center shadow-2xl ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all bg-white/5">
              <input 
                autoFocus
                value={nameInputValue}
                onChange={(e) => setNameInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && nameInputValue.trim() && startAIChat(nameInputValue.trim())}
                className="bg-transparent border-none text-white placeholder-white/30 focus:ring-0 w-full h-11 px-4 text-base" 
                placeholder="Digite seu nome..." 
                type="text"
              />
              <button 
                onClick={() => nameInputValue.trim() && startAIChat(nameInputValue.trim())}
                disabled={!nameInputValue.trim()}
                className="bg-primary hover:bg-primary-dark text-white rounded-xl h-11 px-5 font-bold text-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 active:scale-95 shadow-lg"
              >
                <span>Continuar</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex items-end gap-3 animate-message-in-left">
            <div className="size-10 rounded-full bg-white/10 shrink-0 flex items-center justify-center border border-white/10">
               <span className="material-symbols-outlined text-white/40 text-sm animate-spin">smart_toy</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl rounded-bl-none border border-white/10">
              <div className="flex gap-1.5">
                <div className="size-2 bg-primary rounded-full animate-bounce [animation-duration:1s]" />
                <div className="size-2 bg-primary rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
                <div className="size-2 bg-primary rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section (Bottom) */}
      <div className={`transition-opacity duration-300 ${currentStep < 4 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="rounded-2xl p-1.5 flex items-center border border-white/10 focus-within:border-primary/50 transition-all bg-transparent shadow-none">
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="bg-transparent border-none text-white placeholder-white/40 focus:ring-0 w-full h-12 px-4 text-base" 
            placeholder={currentStep < 4 ? "Complete as perguntas acima..." : "Responda aqui, peão..."} 
            type="text"
            disabled={isTyping || currentStep < 4}
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={isTyping || !inputValue.trim() || currentStep < 4}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl h-12 px-6 font-bold text-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:grayscale active:scale-95"
          >
            <span>Enviar</span>
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>

      {/* Roleta CTA */}
      <div className="flex justify-center mt-2">
        <button 
          onClick={onOpenRoulette}
          className="group relative flex items-center gap-4 bg-gradient-to-r from-resort-brown to-[#2d1b1a] text-white px-6 py-4 rounded-2xl border border-white/10 hover:border-primary/50 transition-all shadow-2xl overflow-hidden active:scale-95"
        >
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors"></div>
          <div className="size-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-ring shrink-0">
            <span className="material-symbols-outlined text-white text-2xl">stars</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-yellow-400 font-black text-[10px] uppercase tracking-widest mb-0.5">Sorte de Hoje</span>
            <span className="text-sm font-bold">Girar Roleta de Benefícios</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatModule;
