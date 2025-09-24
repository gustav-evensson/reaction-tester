"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CurrentUser } from "@/lib/types";
import Game from "@/components/game";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy } from "lucide-react";

export default function TestPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if there's a current user in session storage
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleUserCleared = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    router.push('/');
    return null;
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <Game currentUser={currentUser} onUserCleared={handleUserCleared} />
      
      {/* Floating Scores Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
          <Link href="/scores" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Scores
          </Link>
        </Button>
      </div>
    </div>
  );
}