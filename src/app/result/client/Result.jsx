"use client";

import { useRouter, useSearchParams } from "next/navigation";
import "./Result.css";

const Result = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const player = searchParams.get("player");
  const computer = searchParams.get("computer");
  const result = searchParams.get("result");
  const opponent = searchParams.get("opponent");

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

  const getMessage = () => {
    switch (result) {
      case "player":
        return "🎉 You Won! 🎉";
      case "computer":
        return "😢 Computer Won 😢";
      case "tie":
        return "🤝 It's a Tie! 🤝";
      default:
        return "Game Over";
    }
  };

  if (!player || !computer || !result) {
    return (
      <div className="resultContainer">
        <h1 className="title">Invalid Game State</h1>
        <button className="playAgainButton" onClick={() => router.push("/")}>
          Start New Game
        </button>
      </div>
    );
  }

  return (
    <div className="resultContainer">
      <h1 className="title">Game Result</h1>
      <div className="resultBox">
        <div className="choice">
          <strong>You chose:</strong>
          <span className="emoji">{getEmoji(player)}</span>
          {player}
        </div>
        <div className="choice">
          <strong>Computer chose:</strong>
          <span className="emoji">{getEmoji(computer)}</span>
          {computer}
        </div>
        {opponent && (
          <div className="opponent-info">
            <strong>Opponent:</strong> {opponent}
          </div>
        )}
        <h2 className="resultMessage">{getMessage()}</h2>
      </div>
      <button className="playAgainButton" onClick={() => router.push("/")}>
        Play Again
      </button>
    </div>
  );
};

export default Result;
