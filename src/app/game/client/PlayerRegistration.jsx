"use client";
import { useState } from "react";
import "./Game.css";

const PlayerRegistration = ({ onRegister }) => {
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onRegister(playerName);
    }
  };

  return (
    <div className="registration-container">
      <h2>Enter Your Name</h2>
      <form onSubmit={handleSubmit} className="registration-form">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          className="name-input"
          required
        />
        <button type="submit" className="start-button">
          Start Game
        </button>
      </form>
    </div>
  );
};

export default PlayerRegistration;
