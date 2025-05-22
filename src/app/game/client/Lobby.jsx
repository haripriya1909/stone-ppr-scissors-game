"use client";
import { useState, useEffect } from "react";
import { useSocket } from "../../hook/useSocket";
import "./Game.css";

const Lobby = ({ onGameStart }) => {
  const socket = useSocket();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [error, setError] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on("room-created", ({ roomCode }) => {
        setRoomCode(roomCode);
        setIsCreatingRoom(false);
      });

      socket.on("player-joined", ({ players }) => {
        onGameStart(players);
      });

      socket.on("join-error", ({ message }) => {
        setError(message);
      });

      socket.on("available-rooms", (rooms) => {
        setAvailableRooms(rooms);
      });

      // Get available rooms every 5 seconds
      const interval = setInterval(() => {
        socket.emit("get-rooms");
      }, 5000);

      return () => {
        clearInterval(interval);
        socket.off("room-created");
        socket.off("player-joined");
        socket.off("join-error");
        socket.off("available-rooms");
      };
    }
  }, [socket]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      setIsCreatingRoom(true);
      socket.emit("create-room", { playerName });
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      socket.emit("join-room", { roomCode, playerName });
    }
  };

  return (
    <div className="lobby-container">
      <h1 className="title">Rock Paper Scissors</h1>

      <form onSubmit={handleCreateRoom} className="lobby-form">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="name-input"
          required
        />
        <button
          type="submit"
          className="create-room-button"
          disabled={isCreatingRoom}>
          {isCreatingRoom ? "Creating Room..." : "Create New Game"}
        </button>
      </form>

      {roomCode && (
        <div className="room-code">
          <h2>Your Room Code:</h2>
          <div className="code-display">{roomCode}</div>
          <p>Share this code with your friend to play together!</p>
        </div>
      )}

      <div className="join-section">
        <h2>Join Existing Game</h2>
        <form onSubmit={handleJoinRoom} className="join-form">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="room-input"
            required
          />
          <button type="submit" className="join-button">
            Join Game
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {availableRooms.length > 0 && (
        <div className="available-rooms">
          <h2>Available Rooms</h2>
          <div className="room-list">
            {availableRooms.map((room) => (
              <div key={room.code} className="room-item">
                <span>Room: {room.code}</span>
                <span>Players: {room.players.length}/2</span>
                <button
                  onClick={() => {
                    setRoomCode(room.code);
                    handleJoinRoom({ preventDefault: () => {} });
                  }}
                  className="join-room-button">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
