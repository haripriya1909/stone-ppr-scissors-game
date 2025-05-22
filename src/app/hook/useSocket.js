import { useEffect, useState } from "react";
import io from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInitializer = async () => {
      await fetch("/api/socket");
      const socket = io();

      socket.on("connect", () => {
        console.log("Connected to WebSocket");
      });

      socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
      });

      setSocket(socket);
    };

    socketInitializer();

    // Cleanup on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return socket;
}
