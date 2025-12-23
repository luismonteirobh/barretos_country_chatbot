
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
  const [currentStep, setCurrentStep] = useState(0); 
  const [isExplaining, setIsExplaining] = useState(false);
  const [showContinueExplanation, setShowContinueExplanation] = useState(false);
  const [selections, setSelections] = useState({ party: '', date: '', name: '' });
  
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
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const welcomeMsg: Message = {
      id: 'w1',
      sender: 'agent',
      text: 'Bem-vindo(a) ao Barretos Country Resort!\nO primeiro resort com temática country do Brasil 🤠',
      timestamp: Date.now(),
    };
    setMessages([welcomeMsg]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const knowPrompt: Message = {
      id: 'w2',
      sender: 'agent',
      text: 'Você já conhece o Barretos Country Resort?',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, knowPrompt]);
    setIsTyping(false);
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
      
      const combinedMsg: Message = {
        id: 'bridge-1',
        sender: 'agent',
        text: "Bão demais que você já conhece! ✨\n\nEntão vamos lá: essa viagem é para quem?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, combinedMsg]);
      setIsTyping(false);
      setCurrentStep(1);
    } else {
      explainResort();
    }
  };

  const explainResort = async () => {
    setIsExplaining(true);
    const sequence = [
      { text: "Perfeito 😊 Então deixa eu te explicar rapidinho o que é o Barretos Country Resort.", delay: 800 },
      { text: "Ele é o primeiro resort com temática country do Brasil 🤠", delay: 800 },
      { text: "Aqui adultos descansam e crianças se divertem o dia inteiro com piscinas termais, parque aquático e fazendinha. 🏊‍♂️🐄", delay: 1000 },
      { text: "Agora que você já sabe como funciona, deixa eu adaptar o pacote pro seu perfil 😉", delay: 800 }
    ];

    for (const item of sequence) {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, item.delay));
      const msg: Message = { id: Math.random().toString(), sender: 'agent', text: item.text, timestamp: Date.now() };
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
    }
    setShowContinueExplanation(true);
  };

  const handlePartyChoice = async (party: string) => {
    setSelections(prev => ({ ...prev, party }));
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: party, timestamp: Date.now() }]);
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const bridgeTexts: Record<string, string> = {
      'Família com crianças': "Maravilha! A criançada vai fazer a festa por aqui. 🐄🏊‍♂️",
      'Casal': "Nada como um descanso a dois nas nossas águas termais, né? Muito romântico! 💑",
      'Grupo de amigos': "A diversão tá garantida! O clima de festa aqui é contagiante. 🎉"
    };

    const combinedMsg: Message = {
      id: 'bridge-party',
      sender: 'agent',
      text: `${bridgeTexts[party] || "Entendido!"}\n\nJá tem uma data em mente para vir nos visitar?`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, combinedMsg]);
    setIsTyping(false);
    setCurrentStep(2);
  };

  const handleDateBinaryChoice = async (hasDate: boolean) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: hasDate ? '✅ Sim' : '❌ Não', timestamp: Date.now() }]);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    if (hasDate) {
      setMessages(prev => [...prev, { id: 'date-sim-resp', sender: 'agent', text: 'Perfeito 😊 Selecione as datas da sua estadia no calendário abaixo:', timestamp: Date.now() }]);
      setCurrentStep(2.1);
    } else {
      setMessages(prev => [...prev, { id: 'date-nao-resp', sender: 'agent', text: 'Sem problema 😊 Quando você imagina viajar?', timestamp: Date.now() }]);
      setCurrentStep(2.2);
    }
    setIsTyping(false);
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(selectedDate);
      setCheckOut(null);
    } else {
      if (selectedDate < checkIn) setCheckIn(selectedDate);
      else setCheckOut(selectedDate);
    }
  };

  const confirmCalendarDate = async () => {
    if (!checkIn || !checkOut) return;
    const nights = Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const dateRangeStr = `${checkIn.toLocaleDateString('pt-BR')} até ${checkOut.toLocaleDateString('pt-BR')} (${nights} noites)`;
    setSelections(prev => ({ ...prev, date: dateRangeStr }));
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: `Desejo ir de ${dateRangeStr}`, timestamp: Date.now() }]);
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const finalMsg: Message = {
      id: 'final-date-msg',
      sender: 'agent',
      text: "Excelente! Datas anotadas. ✅\n\nPra gente finalizar, como posso te chamar?",
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, finalMsg]);
    setIsTyping(false);
    setCurrentStep(3);
  };

  const handleDateChoice = async (dateLabel: string, dateValue: string) => {
    setSelections(prev => ({ ...prev, date: dateValue }));
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: dateLabel, timestamp: Date.now() }]);
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setMessages(prev => [...prev, { id: 'bridge-date', sender: 'agent', text: "Ótima escolha! ✅\n\nPra gente finalizar os detalhes, como posso te chamar?", timestamp: Date.now() }]);
    setIsTyping(false);
    setCurrentStep(3);
  };

  const startAIChat = async (userName: string) => {
    const finalSelections = { ...selections, name: userName };
    setSelections(finalSelections);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: `Meu nome é ${userName}`, timestamp: Date.now() }]);
    
    setIsTyping(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    chatInstanceRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `Você é o "Guia Country", assistente do Barretos Country Resort. O usuário é ${userName}. Vai viajar com ${finalSelections.party} ${finalSelections.date}. Use gírias caipiras ("Uai", "Bão", "Segura Peão"). Recomende a Praia Termal e a Fazendinha. Convide-o a girar a roleta ao final.`
      },
    });

    try {
      const resp = await chatInstanceRef.current.sendMessage({ message: `Sou ${userName}, receba-me!` });
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: resp.text || "Bão demais ter você aqui!", timestamp: Date.now() }]);
      setCurrentStep(4);
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: inputValue, timestamp: Date.now() }]);
    setInputValue('');
    setIsTyping(true);
    try {
      if (chatInstanceRef.current) {
        const resp = await chatInstanceRef.current.sendMessage({ message: inputValue });
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: resp.text || "Repete aí, peão!", timestamp: Date.now() }]);
      }
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

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
        <button key={d} onClick={() => handleDayClick(d)} className={`size-8 md:size-10 rounded-lg text-xs font-bold transition-all ${isCheckIn || isCheckOut ? 'bg-primary text-white scale-110 shadow-lg' : inRange ? 'bg-primary/20 text-primary' : 'text-white/80 hover:bg-white/10'}`}>
          {d}
        </button>
      );
    }
    return (
      <div className="glass-panel p-4 rounded-2xl animate-fade-in-up mt-2 w-full max-w-sm ml-12 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4 px-2">
          <button onClick={() => setCurrentCalendarDate(new Date(year, month - 1))} className="text-white/50 hover:text-white"><span className="material-symbols-outlined">chevron_left</span></button>
          <span className="font-bold capitalize text-sm">{monthName} {year}</span>
          <button onClick={() => setCurrentCalendarDate(new Date(year, month + 1))} className="text-white/50 hover:text-white"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/30 mb-2"><div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div></div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
        {checkIn && (
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <div className="flex justify-between text-xs font-bold text-primary px-2 mb-4">
              <span>{checkIn.toLocaleDateString('pt-BR')}</span>
              <span>{checkOut ? checkOut.toLocaleDateString('pt-BR') : '---'}</span>
            </div>
            {checkOut && <button onClick={confirmCalendarDate} className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20">👉 Continuar</button>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[550px] flex flex-col gap-6 relative">
      <div ref={chatContainerRef} className="h-[500px] overflow-y-auto space-y-4 pr-3 scroll-smooth flex flex-col py-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse animate-message-in-right' : 'animate-message-in-left'}`}>
            {msg.sender === 'agent' && (
              <div className="size-10 rounded-full bg-white border-2 border-primary overflow-hidden shrink-0 shadow-md animate-pop-avatar">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${AVATAR_URL}')` }} />
              </div>
            )}
            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl shadow-lg text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap ${msg.sender === 'agent' ? 'bg-white text-gray-800 chat-bubble-agent' : 'bg-primary text-white chat-bubble-user'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {!isTyping && currentStep === 0 && !isExplaining && (
          <div className="flex flex-col gap-2 pl-12 animate-fade-in-up">
            <button onClick={() => handleInitialChoice('sim', '✅ Já conheço')} className="glass-panel text-white py-4 rounded-xl font-bold flex items-center gap-3 px-5 hover:border-primary/50 transition-all active:scale-95"><span className="material-symbols-outlined text-primary">check_circle</span>✅ Já conheço</button>
            <button onClick={() => handleInitialChoice('nao', '👀 Ainda não conheço')} className="glass-panel text-white py-4 rounded-xl font-bold flex items-center gap-3 px-5 hover:border-primary/50 transition-all active:scale-95"><span className="material-symbols-outlined text-primary">visibility</span>👀 Ainda não conheço</button>
          </div>
        )}

        {!isTyping && showContinueExplanation && (
          <div className="pl-12 animate-fade-in-up">
            <button onClick={() => { setShowContinueExplanation(false); setCurrentStep(1); setMessages(prev => [...prev, { id: 'q-party', sender: 'agent', text: 'Então me conta: essa viagem é para quem?', timestamp: Date.now() }]); }} className="w-full bg-primary py-4 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95">👉 Continuar</button>
          </div>
        )}

        {!isTyping && currentStep === 1 && (
          <div className="flex flex-col gap-2 pl-12 animate-fade-in-up">
            {['Família com crianças', 'Casal', 'Grupo de amigos'].map((opt) => (
              <button key={opt} onClick={() => handlePartyChoice(opt)} className="glass-panel text-white py-4 rounded-xl font-bold hover:border-primary/50 transition-all active:scale-95 text-left px-5">{opt}</button>
            ))}
          </div>
        )}

        {!isTyping && currentStep === 2 && (
          <div className="flex gap-3 pl-12 animate-fade-in-up">
            <button onClick={() => handleDateBinaryChoice(true)} className="flex-1 glass-panel text-white py-4 rounded-xl font-bold hover:border-primary/50 active:scale-95">✅ Sim</button>
            <button onClick={() => handleDateBinaryChoice(false)} className="flex-1 glass-panel text-white py-4 rounded-xl font-bold hover:border-primary/50 active:scale-95">❌ Não</button>
          </div>
        )}

        {!isTyping && currentStep === 2.1 && renderCalendar()}

        {!isTyping && currentStep === 2.2 && (
          <div className="flex flex-col gap-2 pl-12 animate-fade-in-up">
            {['📅 Próximos 30 dias', '📅 Próximos 3 meses', '📅 Férias escolares', '📅 Só pesquisando'].map((opt) => (
              <button key={opt} onClick={() => handleDateChoice(opt, opt)} className="glass-panel text-white py-4 rounded-xl font-bold hover:border-primary/50 active:scale-95 text-left px-5">{opt}</button>
            ))}
          </div>
        )}

        {!isTyping && currentStep === 3 && (
          <div className="pl-12 animate-fade-in-up">
            <div className="glass-panel p-1.5 rounded-2xl flex items-center shadow-2xl border border-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <input autoFocus value={nameInputValue} onChange={(e) => setNameInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && nameInputValue.trim() && startAIChat(nameInputValue.trim())} className="bg-transparent border-none text-white w-full h-11 px-4 text-base focus:ring-0" placeholder="Digite seu nome..." />
              <button onClick={() => nameInputValue.trim() && startAIChat(nameInputValue.trim())} className="bg-primary px-5 h-11 rounded-xl font-bold text-sm active:scale-95 shadow-lg">Continuar</button>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex items-end gap-3 pl-12 animate-message-in-left">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex gap-1.5">
              <div className="size-2 bg-primary rounded-full animate-bounce" />
              <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className={`transition-all duration-500 ${currentStep < 4 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="glass-panel p-1.5 rounded-2xl flex items-center border border-white/10 focus-within:border-primary/50">
          <input disabled={currentStep < 4} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="bg-transparent border-none text-white w-full h-12 px-4 focus:ring-0" placeholder={currentStep < 4 ? "Aguardando perguntas..." : "Fale com o Guia Country..."} />
          <button disabled={currentStep < 4 || !inputValue.trim()} onClick={handleSendMessage} className="bg-primary px-6 h-12 rounded-xl font-bold active:scale-95 disabled:grayscale">Enviar</button>
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <button onClick={onOpenRoulette} className="flex items-center gap-4 bg-gradient-to-r from-resort-brown to-[#2d1b1a] text-white px-6 py-4 rounded-2xl border border-white/10 hover:border-primary/50 transition-all shadow-2xl active:scale-95">
          <div className="size-10 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse-ring"><span className="material-symbols-outlined text-white">stars</span></div>
          <div className="flex flex-col items-start"><span className="text-yellow-400 font-black text-[10px] uppercase tracking-widest">Sorte de Hoje</span><span className="text-sm font-bold">Girar Roleta de Benefícios</span></div>
        </button>
      </div>
    </div>
  );
};

export default ChatModule;
