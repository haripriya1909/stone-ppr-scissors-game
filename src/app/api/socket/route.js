import { Server } from "socket.io";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    // Store waiting players
    const waitingPlayers = new Map();

    io.on("connection", (socket) => {
      console.log("Player connected");

      // Handle player registration
      socket.on("register-player", (data) => {
        const { playerName } = data;
        console.log(`Player registered: ${playerName}`);

        // If there are waiting players, match them
        if (waitingPlayers.size > 0) {
          const [opponentId, opponentName] = waitingPlayers
            .entries()
            .next().value;
          waitingPlayers.delete(opponentId);

          // Notify both players
          socket.emit("opponent-found", { opponentName });
          io.to(opponentId).emit("opponent-found", {
            opponentName: playerName,
          });
        } else {
          // Add player to waiting list
          waitingPlayers.set(socket.id, playerName);
        }
      });

      // Handle player moves
      socket.on("player-move", (data) => {
        // Broadcast the move to other players
        socket.broadcast.emit("opponent-move", data);
      });

      socket.on("disconnect", () => {
        console.log("Player disconnected");
        // Remove player from waiting list if they were waiting
        waitingPlayers.delete(socket.id);
      });
    });
  }
  res.end();
};

export default ioHandler;
