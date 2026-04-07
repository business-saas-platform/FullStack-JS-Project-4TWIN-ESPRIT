import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message = {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Détection dynamique de l'URL API
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
  const SOCKET_URL = API_URL.replace('/api', '');

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrorStatus("Token manquant");
      return;
    }

    let mounted = true;

    const initChat = async () => {
      try {
        // 1. Appel au backend pour avoir le canal "reclamation"
        const res = await fetch(`${API_URL}/communication/reclamation`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Erreur ${res.status}`);
        }
        
        const ch = await res.json();
        if (!mounted || !ch?.id) return;
        
        setChannelId(ch.id);
        setErrorStatus(null);

        // 2. Connexion Socket.io
        const socket = io(`${SOCKET_URL}/communication`, { 
          auth: { token }, 
          transports: ['websocket'] 
        });
        
        socketRef.current = socket;

        socket.on("connect", () => {
          setIsConnected(true);
          // On rejoint la room NestJS
          socket.emit("channel:join", { channelId: ch.id });
          // Notification admin
          socket.emit("reclamation:notify", { channelId: ch.id });
        });

        socket.on("disconnect", () => setIsConnected(false));

        // Historique
        socket.on("channel:history", (history: Message[]) => {
          setMessages(history || []);
          setTimeout(scrollBottom, 100);
        });

        // Nouveau message
        socket.on("message:new", (m: Message) => {
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === m.id);
            return exists ? prev : [...prev, m];
          });
          setTimeout(scrollBottom, 50);
        });

      } catch (e: any) {
        console.error("ChatWidget Error:", e.message);
        setErrorStatus("Indisponible (404/Connexion)");
      }
    };

    initChat();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [open, API_URL]);

  function scrollBottom() {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }

  function sendMessage() {
    const s = socketRef.current;
    if (!s || !isConnected || !channelId || !input.trim()) return;

    const content = input.trim();

    // UI Optimiste
    const tmpMsg: Message = {
      id: `tmp-${Date.now()}`,
      channelId,
      senderId: 'me',
      senderName: 'Vous',
      content: content,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tmpMsg]);
    setInput(""); 

    // Envoi réel vers le Gateway NestJS
    s.emit("message:send", { channelId, content });
  }

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 9999, fontFamily: 'sans-serif' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "#4f46e5",
          color: "white",
          padding: "12px 24px",
          borderRadius: "50px",
          boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.4)",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {open ? "✖ Fermer" : "💬 Support Technique"}
      </button>

      {open && (
        <div style={{
          width: 350, height: 500, background: "white", borderRadius: 20, marginTop: 12,
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column",
          overflow: "hidden", border: "1px solid #e2e8f0"
        }}>
          {/* Header */}
          <div style={{ padding: "20px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "white" }}>
            <div style={{ fontWeight: "bold" }}>Assistance Directe</div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>
               {channelId ? (isConnected ? "● Mariem est en ligne" : "○ Reconnexion...") : `❌ ${errorStatus || 'Chargement...'}`}
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesRef} style={{ flex: 1, padding: 15, overflowY: "auto", background: "#f8fafc", display: 'flex', flexDirection: 'column' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 12, alignSelf: m.senderId === 'me' ? 'flex-end' : 'flex-start', maxWidth: "80%" }}>
                <div style={{ fontSize: 10, color: "#64748b", textAlign: m.senderId === 'me' ? 'right' : 'left' }}>{m.senderName}</div>
                <div style={{
                    background: m.senderId === 'me' ? "#4f46e5" : "white",
                    color: m.senderId === 'me' ? "white" : "#1e293b",
                    padding: "10px 14px", borderRadius: "12px", fontSize: "14px", border: "1px solid #e2e8f0"
                }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: 16, borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Décrivez votre problème..."
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", outline: 'none' }}
            />
            <button 
              disabled={!channelId || !input.trim() || !isConnected} 
              onClick={sendMessage} 
              style={{ 
                background: (channelId && input.trim() && isConnected) ? "#4f46e5" : "#cbd5e1", 
                color: "white", border: "none", padding: "0 18px", borderRadius: 12, cursor: "pointer"
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}