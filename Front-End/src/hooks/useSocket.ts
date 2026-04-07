import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connexion au serveur NestJS (Port 3000 par défaut)
    const newSocket = io('http://localhost:3000', {
      auth: {
        // On récupère le token JWT pour que le serveur sache qui est l'admin
        token: localStorage.getItem('access_token'), 
      },
    });

    setSocket(newSocket);

    // Nettoyage : on ferme la connexion quand on quitte la page
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket };
};