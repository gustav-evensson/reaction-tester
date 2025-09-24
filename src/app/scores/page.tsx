"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getScoresClient } from "@/lib/supabase/scores-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy, Medal, Award, Clock, User } from "lucide-react";
import { Score } from "@/lib/types";

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadScores = async () => {
      try {
        const scoresData = await getScoresClient();
        setScores(scoresData);
      } catch (error) {
        console.error('Error loading scores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScores();
  }, []);

  const handleHomeClick = () => {
    // Clear the current user from session storage
    sessionStorage.removeItem('currentUser');
    // Redirect to the registration page (home page)
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading scores...</div>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">
          {index + 1}
        </span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 border-yellow-400/30";
      case 1:
        return "bg-gradient-to-r from-gray-500/20 to-gray-400/20 border-gray-400/30";
      case 2:
        return "bg-gradient-to-r from-amber-500/20 to-amber-400/20 border-amber-400/30";
      default:
        return "bg-white/10 border-white/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Top reaction times from players
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleHomeClick}
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Home
            </Button>
          </div>
        </div>

        {/* Scores Table */}
        <div className="max-w-4xl mx-auto">
          {scores.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No scores yet</h3>
              <p className="text-gray-400 mb-6">Be the first to set a record!</p>
              <Button asChild>
                <Link href="/test">Start Playing</Link>
              </Button>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Top Scores
                </h2>
                <p className="text-gray-400 mt-1">
                  Showing {scores.length} best reaction times
                </p>
              </div>
              
              <div className="divide-y divide-white/10">
                {scores.map((score, index) => (
                  <div
                    key={score.id}
                    className={`p-6 flex items-center justify-between transition-all duration-200 hover:bg-white/10 ${getRankColor(index)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {score.user_name || "Anonymous Player"}
                          </h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-2xl font-bold text-white">
                          {score.score}ms
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {new Date(score.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {scores.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {scores[0]?.score}ms
              </div>
              <div className="text-gray-300">Best Time</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {scores.length}
              </div>
              <div className="text-gray-300">Total Scores</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {scores.length > 0 ? Math.round(scores.reduce((acc, score) => acc + score.score, 0) / scores.length) : 0}ms
              </div>
              <div className="text-gray-300">Average Time</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
