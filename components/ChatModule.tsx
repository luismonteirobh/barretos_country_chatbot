
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

const ChatModule: React.FC<ChatModuleProps> = ({ onOpenRoulette }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [nameInputValue, setNameInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Know, 1: Party, 2: Date, 3: Name, 4: AI Chat
  const [selections, setSelections] = useState({ party: '', date: '', name: '' });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (currentStep === 0) {
      startOnboarding();
    }
  }, [currentStep]);

  const startOnboarding = async () => {
    setMessages([]);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const combinedWelcome: Message = {
      id: 'w1',
      sender: 'agent',
      text: 'Bem-vindo(a) ao Barretos Country Resort\nO primeiro resort com temática country do Brasil 🤠',
      timestamp: Date.now(),
    };
    setMessages([combinedWelcome]);
    
    setIsTyping(false);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(true);
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

  const handleInitialChoice = async (choiceValue: string) => {
    setMessages([]); 
    setCurrentStep(1);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const partyPrompt: Message = {
      id: 'w3',
      sender: 'agent',
      text: 'Que bão saber! Agora me conta...\nEssa viagem é para quem?',
      timestamp: Date.now(),
    };
    setMessages([partyPrompt]);
    setIsTyping(false);
  };

  const handlePartyChoice = async (party: string) => {
    setSelections(prev => ({ ...prev, party }));
    setMessages([]);
    setCurrentStep(2);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const datePrompt: Message = {
      id: 'w4',
      sender: 'agent',
      text: 'Entendido! E quando você pretende viajar?',
      timestamp: Date.now(),
    };
    setMessages([datePrompt]);
    setIsTyping(false);
  };

  const handleDateChoice = async (date: string) => {
    setSelections(prev => ({ ...prev, date }));
    setMessages([]);
    setCurrentStep(3);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const namePrompt: Message = {
      id: 'w5',
      sender: 'agent',
      text: 'Antes de continuar, como podemos te chamar?',
      timestamp: Date.now(),
    };
    setMessages([namePrompt]);
    setIsTyping(false);
  };

  const startAIChat = async (userName: string) => {
    const finalSelections = { ...selections, name: userName };
    setSelections(finalSelections);
    
    setCurrentStep(4);
    setIsTyping(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Meu nome é ${userName}`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

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
        
        const delay = Math.min(Math.max(agentText.length * 15, 1000), 2500);
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
    { label: '✅ Já conheço', value: 'Já conheço o resort!' },
    { label: '🤠 Conheço só por fotos', value: 'Conheço só por fotos!' },
    { label: '👀 Ainda não conheço', value: 'Ainda não conheço nada!' }
  ];

  const partyOptions = [
    { label: 'Família com crianças', icon: '👨‍👩‍👧', color: 'bg-resort-blue/20 text-resort-blue' },
    { label: 'Casal', icon: '💑', color: 'bg-primary/20 text-primary' },
    { label: 'Grupo de amigos', icon: '🎉', color: 'bg-yellow-500/20 text-yellow-500' }
  ];

  const dateOptions = [
    { label: '📅 Próximos 30 dias', value: 'nos próximos 30 dias' },
    { label: '📅 Nos próximos 3 meses', value: 'nos próximos 3 meses' },
    { label: '📅 Férias escolares', value: 'nas férias escolares' },
    { label: '📅 Só pesquisando valores', value: 'apenas pesquisando valores' }
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, currentStep]);

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
        className="h-[480px] overflow-y-auto space-y-4 pr-3 scroll-smooth flex flex-col py-2"
      >
        {messages.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-3 animate-fade-in-up ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.sender === 'agent' && (
              <div className="size-10 rounded-full bg-white border-2 border-primary overflow-hidden shrink-0 shadow-md">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: `url('${AVATAR_URL}')` }}
                />
              </div>
            )}
            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl shadow-lg text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap ${
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
        {currentStep === 0 && !isTyping && messages.length > 1 && (
          <div className="flex flex-col gap-3 animate-fade-in-up mt-2 pl-12">
            {welcomeOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleInitialChoice(opt.value)}
                className="w-full text-left bg-white/10 hover:bg-white/20 border border-white/20 hover:border-primary/50 text-white px-5 py-4 rounded-xl font-bold text-sm md:text-base transition-all active:scale-95 flex items-center justify-between group"
              >
                <span>{opt.label}</span>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
              </button>
            ))}
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

        {/* Step 2: Date Selection Buttons */}
        {currentStep === 2 && !isTyping && (
          <div className="flex flex-col gap-3 animate-fade-in-up mt-2 pl-12">
            {dateOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleDateChoice(opt.value)}
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
            <div className="glass-panel rounded-2xl p-1.5 flex items-center shadow-2xl ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
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
          <div className="flex items-end gap-3">
            <div className="size-10 rounded-full bg-white/10 shrink-0 flex items-center justify-center border border-white/10">
               <span className="material-symbols-outlined text-white/40 text-sm animate-spin">smart_toy</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl rounded-bl-none border border-white/10">
              <div className="flex gap-1.5">
                <div className="size-2 bg-primary rounded-full animate-bounce [animation-duration:0.8s]" />
                <div className="size-2 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                <div className="size-2 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section (Bottom - Active for Step 4 only) */}
      <div className={`transition-opacity duration-300 ${currentStep < 4 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="glass-panel rounded-2xl p-1.5 flex items-center shadow-2xl focus-within:ring-2 ring-primary/50 transition-all">
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
            className="bg-primary hover:bg-primary-dark text-white rounded-xl h-12 px-6 font-bold text-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:grayscale active:scale-95 shadow-lg shadow-primary/20"
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
