"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocket } from "../../hook/useSocket";
import PlayerRegistration from "./PlayerRegistration";
import "./Game.css";

const Game = () => {
  const router = useRouter();
  const socket = useSocket();
  const [isWaiting, setIsWaiting] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLookingForOpponent, setIsLookingForOpponent] = useState(false);
  const choices = ["rock", "paper", "scissors"];

  useEffect(() => {
    if (socket) {
      socket.on("opponent-found", (data) => {
        setOpponentName(data.opponentName);
        setIsLookingForOpponent(false);
      });

      socket.on("opponent-move", (data) => {
        console.log("Opponent chose:", data.move);
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        const result = getResult(data.move, computerChoice);
        router.push(
          `/result?player=${data.move}&computer=${computerChoice}&result=${result}&opponent=${opponentName}`
        );
      });

      return () => {
        socket.off("opponent-found");
        socket.off("opponent-move");
      };
    }
  }, [socket, opponentName]);

  const handleRegister = (name) => {
    setPlayerName(name);
    setIsRegistered(true);
    setIsLookingForOpponent(true);
    if (socket) {
      socket.emit("register-player", { playerName: name });
    }
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
        playerName: playerName,
      });
      setIsWaiting(true);
    }

    const computerChoice = choices[Math.floor(Math.random() * 3)];
    const result = getResult(choice, computerChoice);
    router.push(
      `/result?player=${choice}&computer=${computerChoice}&result=${result}&opponent=${opponentName}`
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

  if (!isRegistered) {
    return <PlayerRegistration onRegister={handleRegister} />;
  }

  return (
    <div className="container">
      <div className="player-info">
        <h2>You: {playerName}</h2>
        {isLookingForOpponent ? (
          <div className="waiting-message">Looking for opponent...</div>
        ) : (
          <h2>Opponent: {opponentName}</h2>
        )}
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
            disabled={isWaiting || isLookingForOpponent}>
            <span className="emoji">{getEmoji(choice)}</span>
            <span className="choiceText">{choice}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Game;
