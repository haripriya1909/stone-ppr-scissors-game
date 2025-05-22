"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocket } from "../../hook/useSocket";
import Lobby from "./Lobby";
import "./Game.css";

const Game = () => {
  const router = useRouter();
  const socket = useSocket();
  const [isWaiting, setIsWaiting] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [roomCode, setRoomCode] = useState("");
  const choices = ["rock", "paper", "scissors"];

  useEffect(() => {
    if (socket) {
      socket.on("player-left", ({ message }) => {
        alert(message);
        setGameStarted(false);
        setPlayers([]);
      });

      return () => {
        socket.off("player-left");
      };
    }
  }, [socket]);

  const handleGameStart = (gamePlayers) => {
    setPlayers(gamePlayers);
    setGameStarted(true);
  };

  const getResult = (player, computer) => {
    if (player === computer) return "tie";
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "player";
    }
    return "computer";
  };

  const handleClick = (choice) => {
    if (socket) {
      socket.emit("player-move", {
        move: choice,
        playerName: players.find((p) => p.id === socket.id)?.name,
        roomCode,
      });
      setIsWaiting(true);
    }

    const computerChoice = choices[Math.floor(Math.random() * 3)];
    const result = getResult(choice, computerChoice);
    const opponent = players.find((p) => p.id !== socket.id)?.name;

    router.push(
      `/result?player=${choice}&computer=${computerChoice}&result=${result}&opponent=${opponent}`
    );
  };

  const getEmoji = (choice) => {
    switch (choice) {
      case "rock":
        return "🪨";
      case "paper":
        return "📄";
      case "scissors":
        return "✂️";
      default:
        return "";
    }
  };

  if (!gameStarted) {
    return <Lobby onGameStart={handleGameStart} />;
  }

  return (
    <div className="container">
      <div className="player-info">
        <h2>You: {players.find((p) => p.id === socket?.id)?.name}</h2>
        <h2>Opponent: {players.find((p) => p.id !== socket?.id)?.name}</h2>
      </div>
      <h1 className="title">Choose Your Move</h1>
      {isWaiting && (
        <div className="waiting-message">Waiting for opponent's move...</div>
      )}
      <div className="choices">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => handleClick(choice)}
            className="choiceButton"
            disabled={isWaiting}>
            <span className="emoji">{getEmoji(choice)}</span>
            <span className="choiceText">{choice}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Game;
