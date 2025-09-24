"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CurrentUser } from "@/lib/types";
import { useRouter } from "next/navigation";
import BestScore from "./best-score";

interface GameProps {
  currentUser: CurrentUser;
  onUserCleared: () => void;
}

export default function Game({ currentUser, onUserCleared }: GameProps) {
  const [state, setState] = useState<
    "start" | "waiting" | "play" | "finish" | "fail"
  >("start");

  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Sound effects
  const playSound = (type: "success" | "fail" | "start") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case "success":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case "fail":
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case "start":
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
    }
  };

  const getWaitTime = () => {
    return Math.random() * 3000 + 1000; // 1-4 seconds
  };

  const handleStartClick = () => {
    setState("waiting");
    playSound("start");
    console.log("waiting");
    const id = setTimeout(() => {
      console.log("timeout executed");
      setTime(new Date().getTime());
      setState("play");
    }, getWaitTime());
    setTimeoutId(id);
  };

  const handleWaitClick = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setState("fail");
    playSound("fail");
  };

  const handlePlayClick = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    const newScore = new Date().getTime() - time;
    console.log(newScore);
    setScore(newScore);
    playSound("success");
    setState("finish");

    // Save score to Supabase
    try {
      const supabase = createClient();
      
      await supabase
        .from('scores')
        .insert({
          score: newScore,
          user_name: currentUser.name,
          user_email: currentUser.email,
        });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleFinishClick = () => {
    // Clear the current user and redirect to home page
    onUserCleared();
    router.push('/');
  };

  const handleFailClick = () => {
    setState("start");
  };

  const handleClick = () => {
    switch (state) {
      case "start":
        handleStartClick();
        break;
      case "waiting":
        handleWaitClick();
        break;
      case "play":
        handlePlayClick();
        break;
      case "finish":
        handleFinishClick();
        break;
      case "fail":
        handleFailClick();
        break;
    }
  };


  return (
    <div
      onClick={() => handleClick()}
      className={cn(
        "w-full h-screen flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out",
        state === "start" && "bg-gradient-to-br from-slate-900 to-slate-800",
        state === "waiting" && "bg-gradient-to-br from-yellow-400 to-yellow-600",
        state === "play" && "bg-gradient-to-br from-green-400 to-green-600",
        state === "finish" && "bg-gradient-to-br from-blue-400 to-blue-600",
        state === "fail" && "bg-gradient-to-br from-red-400 to-red-600"
      )}
    >
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-white mb-8 animate-pulse">
          {(() => {
            switch (state) {
              case "start":
                return "Click to Start";
              case "waiting":
                return "Wait...";
              case "play":
                return "CLICK NOW!";
              case "finish":
                return "Great!";
              case "fail":
                return "Too Early!";
            }
          })()}
        </h1>
        
        {state === "start" && (
          <p className="text-xl text-white/80">
            Click anywhere to start
          </p>
        )}
        
        {state === "waiting" && (
          <p className="text-xl text-yellow-100 animate-bounce">
            Wait for the screen to turn green...
          </p>
        )}
        
        {state === "play" && (
          <p className="text-2xl text-green-100 animate-pulse">
            Click as fast as you can!
          </p>
        )}
        
        {state === "finish" && (
          <div className="space-y-4">
            <p className="text-3xl text-blue-100">
              Your reaction time:
            </p>
            <p className="text-6xl font-bold text-white">
              {score}ms
            </p>
            <p className="text-xl text-blue-200">
              Click to continue
            </p>
          </div>
        )}
        
        {state === "fail" && (
          <div className="space-y-4">
            <p className="text-3xl text-red-100">
              You clicked too early!
            </p>
            <p className="text-xl text-red-200">
              Click to try again
            </p>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <BestScore className="mb-4" />
        <p className="text-sm text-white/60">
          Click anywhere to {state === "start" ? "start" : state === "finish" ? "continue" : "continue"}
        </p>
      </div>
    </div>
  );
}
