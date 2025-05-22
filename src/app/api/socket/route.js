import { Server } from "socket.io";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    // Store active rooms
    const rooms = new Map();

    io.on("connection", (socket) => {
      console.log("Player connected");

      // Create a new game room
      socket.on("create-room", (data) => {
        const { playerName } = data;
        const roomCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        rooms.set(roomCode, {
          players: [{ id: socket.id, name: playerName }],
          gameState: "waiting",
        });

        socket.join(roomCode);
        socket.emit("room-created", { roomCode });
        console.log(`Room created: ${roomCode} by ${playerName}`);
      });

      // Join an existing room
      socket.on("join-room", (data) => {
        const { roomCode, playerName } = data;
        const room = rooms.get(roomCode);

        if (room && room.players.length < 2) {
          room.players.push({ id: socket.id, name: playerName });
          socket.join(roomCode);

          // Notify both players
          io.to(roomCode).emit("player-joined", {
            roomCode,
            players: room.players,
          });

          console.log(`${playerName} joined room ${roomCode}`);
        } else {
          socket.emit("join-error", { message: "Room not found or full" });
        }
      });

      // Handle player moves
      socket.on("player-move", (data) => {
        const { move, playerName, roomCode } = data;
        socket.to(roomCode).emit("opponent-move", { move, playerName });
      });

      // Get available rooms
      socket.on("get-rooms", () => {
        const availableRooms = Array.from(rooms.entries())
          .filter(([_, room]) => room.players.length < 2)
          .map(([code, room]) => ({
            code,
            players: room.players,
          }));

        socket.emit("available-rooms", availableRooms);
      });

      socket.on("disconnect", () => {
        // Remove player from rooms
        rooms.forEach((room, code) => {
          const playerIndex = room.players.findIndex((p) => p.id === socket.id);
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
            if (room.players.length === 0) {
              rooms.delete(code);
            } else {
              io.to(code).emit("player-left", {
                message: "Opponent left the game",
              });
            }
          }
        });
      });
    });
  }
  res.end();
};

export default ioHandler;
