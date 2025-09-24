"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CurrentUser } from "@/lib/types";
import { useRouter } from "next/navigation";
import BestScore from "./best-score";
import { Phone, PhoneCall, PhoneMissed } from "lucide-react";

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

  // Sound effects for call simulation
  const playSound = (type: "incoming_call" | "missed_call" | "start") => {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case "incoming_call":
        // Ringtone simulation - alternating frequencies
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.6);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        break;
      case "missed_call":
        // Missed call sound - descending tone
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case "start":
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
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
    console.log("waiting for call");
    const id = setTimeout(() => {
      console.log("incoming call");
      setTime(new Date().getTime());
      setState("play");
      playSound("incoming_call");
    }, getWaitTime());
    setTimeoutId(id);
  };

  const handleWaitClick = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setState("fail");
    playSound("missed_call");
  };

  const handlePlayClick = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    const newScore = new Date().getTime() - time;
    console.log(newScore);
    setScore(newScore);
    playSound("missed_call");
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
        state === "waiting" && "bg-gradient-to-br from-slate-900 to-slate-800",
        state === "play" && "bg-gradient-to-br from-slate-900 to-slate-800",
        state === "finish" && "bg-gradient-to-br from-slate-900 to-slate-800",
        state === "fail" && "bg-gradient-to-br from-slate-900 to-slate-800"
      )}
    >
      {/* Call notification overlay */}
      {state === "play" && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Inkommande samtal</h3>
                <p className="text-sm text-gray-600">+46 70 123 45 67</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2">
                <PhoneMissed className="w-5 h-5" />
                <span>Miss</span>
              </button>
              <button className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Svara</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-white mb-8">
          {(() => {
            switch (state) {
              case "start":
                return "Klicka för att börja";
              case "waiting":
                return "Väntar på samtal...";
              case "play":
                return "INKOMMANDE SAMTAL!";
              case "finish":
                return "Samtal missat!";
              case "fail":
                return "För tidigt!";
            }
          })()}
        </h1>
        
        {state === "start" && (
          <div className="space-y-4">
            <p className="text-xl text-white/80">
              Klicka för att starta reaktionstestet
            </p>
            <p className="text-lg text-white/60">
              Du kommer att få en inkommande samtalsnotis - klicka så snabbt som möjligt när samtalet &quot;missas&quot;
            </p>
          </div>
        )}
        
        {state === "waiting" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-8 h-8 text-white/60 animate-pulse" />
              <span className="text-xl text-white/80">Väntar på inkommande samtal...</span>
            </div>
            <p className="text-lg text-white/60">
              Klicka så snabbt som möjligt när samtalet &quot;missas&quot;
            </p>
          </div>
        )}
        
        {state === "play" && (
          <p className="text-2xl text-white animate-pulse">
            Klicka så snabbt som möjligt!
          </p>
        )}
        
        {state === "finish" && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-3xl text-white mb-4">
                Din reaktionstid:
              </p>
              <p className="text-6xl font-bold text-white mb-6">
                {score}ms
              </p>
              
              {/* AI Comparison */}
              <div className="border-t border-white/20 pt-6">
                <p className="text-xl text-white/80 mb-4">Jämförelse med AI:</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Din tid:</span>
                    <span className="text-white font-semibold">{score}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">AI (blixtsnabb):</span>
                    <span className="text-green-400 font-semibold">~50ms</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-white">Skillnad:</span>
                    <span className="text-yellow-400 font-bold">+{score - 50}ms</span>
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-4">
                  Vår AI-lösning hjälper företag att aldrig missa leads!
                </p>
              </div>
            </div>
            
            <p className="text-xl text-white/80">
              Klicka för att fortsätta
            </p>
          </div>
        )}
        
        {state === "fail" && (
          <div className="space-y-4">
            <p className="text-3xl text-white">
              Du klickade för tidigt!
            </p>
            <p className="text-xl text-white/80">
              Klicka för att försöka igen
            </p>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <BestScore className="mb-4" />
        <p className="text-sm text-white/60">
          Klicka för att {state === "start" ? "starta" : state === "finish" ? "fortsätta" : "fortsätta"}
        </p>
      </div>
    </div>
  );
}
