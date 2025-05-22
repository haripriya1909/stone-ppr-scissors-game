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
  const [myMove, setMyMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const choices = ["rock", "paper", "scissors"];

  useEffect(() => {
    if (socket) {
      socket.on("player-left", ({ message }) => {
        alert(message);
        setGameStarted(false);
        setPlayers([]);
        setRoomCode("");
        setMyMove(null);
        setOpponentMove(null);
      });

      socket.on("opponent-move", ({ move, playerName }) => {
        setOpponentMove(move);
        if (myMove) {
          const result = getResult(myMove, move);
          router.push(
            `/result?player=${myMove}&computer=${move}&result=${result}&opponent=${playerName}`
          );
        }
      });

      return () => {
        socket.off("player-left");
        socket.off("opponent-move");
      };
    }
  }, [socket, myMove, router]);

  const handleGameStart = (gamePlayers, code) => {
    setPlayers(gamePlayers);
    setRoomCode(code);
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
      setMyMove(choice);
      socket.emit("player-move", {
        move: choice,
        playerName: players.find((p) => p.id === socket.id)?.name,
        roomCode,
      });
      setIsWaiting(true);
    }
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
        <h3>Room Code: {roomCode}</h3>
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
