"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface BestScoreProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function BestScore({ 
  className = "", 
  showLabel = true, 
  size = "md" 
}: BestScoreProps) {
  const [highscore, setHighscore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHighscore = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('scores')
          .select('score')
          .order('score', { ascending: true })
          .limit(1)
          .single();

        if (data) {
          setHighscore(data.score);
        }
      } catch (error) {
        console.error('Error fetching highscore:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighscore();
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-white/80 mb-1">Loading...</p>
      </div>
    );
  }

  if (!highscore) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center ${className}`}>
        {showLabel && (
          <p className="text-sm text-white/80 mb-1">Best Time</p>
        )}
        <p className={`font-bold text-yellow-300 ${size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl"}`}>
          None
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center ${className}`}>
      {showLabel && (
        <p className="text-sm text-white/80 mb-1">Best Time</p>
      )}
      <p className={`font-bold text-yellow-300 ${size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl"}`}>
        {highscore}ms
      </p>
    </div>
  );
}
