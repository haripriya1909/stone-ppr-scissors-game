"use client";
import "./page.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="page">
      <main className="main">
        <h1 className="title">Rock Paper Scissors</h1>
        <p className="description">Ready to play?</p>
        <button
          className="startButton"
          onClick={() => {
            router.push("/game");
          }}>
          Start Game
        </button>
      </main>
    </div>
  );
}
