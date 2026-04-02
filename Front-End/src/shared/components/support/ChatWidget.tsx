import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send, Sparkles, Headset } from 'lucide-react';

// Export nommé pour DashboardLayout.tsx
export const ChatWidget = ({ user, aiInsights }: { user: any, aiInsights: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'chat'>('ai');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 1. GESTION DE LA CONNEXION (SOCKET.IO)
  useEffect(() => {
    // On se connecte uniquement si l'onglet CHAT est actif
    if (isOpen && activeTab === 'chat' && !socketRef.current) {
      const token = localStorage.getItem('access_token');
 socketRef.current = io('http://localhost:3000', { // Retirer /support ici
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
});
      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Connecté au serveur de support NestJS');
      });

      socketRef.current.on('chatToClient', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    // Nettoyage de la connexion quand on ferme ou change d'onglet
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, activeTab]);

  // 2. AUTO-SCROLL (Toujours voir le dernier message)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isOpen, activeTab]);

  // 3. FONCTION D'ENVOI
  const sendMessage = (e: React.FormEvent) => {
  e.preventDefault();
  if (input.trim()) {
    const payload = { 
      content: input, 
      isAdminMessage: false,
      createdAt: new Date().toISOString()
    };
    
    // Étape A : On l'ajoute direct dans la liste locale pour qu'il s'affiche
    setMessages((prev) => [...prev, payload]);

    // Étape B : On l'envoie au serveur si le socket est prêt
    if (socketRef.current?.connected) {
      socketRef.current.emit('chatToServer', payload);
    }

    setInput('');
  }
};

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* FENÊTRE DE CHAT */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[600px] bg-white shadow-2xl rounded-[32px] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300">
          
          {/* HEADER GRADIENT */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-5 shadow-lg">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="font-bold text-xl tracking-tight">Centre d'Aide</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-80">
                    {isConnected ? 'Support Live Connecté' : 'Mode Consultation'}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            {/* TABS SWITCHER (IA / CHAT) */}
            <div className="flex bg-black/20 backdrop-blur-md rounded-2xl p-1.5 border border-white/10">
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'ai' ? 'bg-white text-indigo-700 shadow-xl scale-[1.02]' : 'text-white hover:bg-white/5'}`}
              >
                <Sparkles size={14} /> ANALYSE IA
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'chat' ? 'bg-white text-indigo-700 shadow-xl scale-[1.02]' : 'text-white hover:bg-white/5'}`}
              >
                <Headset size={14} /> SUPPORT LIVE
              </button>
            </div>
          </div>

          {/* ZONE DE CONTENU DYNAMIQUE */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50" ref={scrollRef}>
            {activeTab === 'ai' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-sm text-indigo-700 text-[11px] leading-relaxed font-medium">
                  🤖 <span className="font-bold">Assistant Predict :</span> J'ai analysé vos données financières et logistiques. Voici vos opportunités :
                </div>
                
                {aiInsights?.map((insight, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-400 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center mb-2.5">
                      <h4 className="font-bold text-slate-800 text-sm uppercase">{insight.title}</h4>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Confiance</span>
                        <span className="text-xs font-black text-green-600">{insight.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex-1 space-y-4 pb-4">
                  {messages.length === 0 && (
                    <div className="text-center py-16 opacity-30">
                      <div className="bg-slate-200 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={32} className="text-slate-500" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">Aucun message</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.isAdminMessage ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-[20px] text-sm font-medium shadow-sm ${
                        msg.isAdminMessage 
                        ? 'bg-white text-slate-700 border border-slate-200 rounded-tl-none' 
                        : 'bg-indigo-600 text-white rounded-tr-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* INPUT FIELD */}
                <form onSubmit={sendMessage} className="mt-auto pt-5 border-t border-slate-200 flex gap-3">
                  <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder="Posez votre question..." 
                    className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner" 
                  />
                  <button 
  type="submit" 
  disabled={!input.trim()} // Retire "&& !isConnected"
  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
>
  <Send size={20} />
</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOUTON FLOTTANT PRINCIPAL */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group p-4 rounded-full shadow-2xl text-white transition-all duration-300 transform hover:scale-110 active:scale-90 flex items-center gap-3 ${
          isOpen ? 'bg-slate-900 rotate-0' : 'bg-indigo-600'
        }`}
      >
        {isOpen ? <X size={30} /> : (
          <>
            <div className="relative">
              <Sparkles size={30} className="animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
            </div>
            {!isOpen && <span className="font-bold text-sm pr-2 hidden md:block uppercase tracking-wider">Assistant IA</span>}
          </>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;