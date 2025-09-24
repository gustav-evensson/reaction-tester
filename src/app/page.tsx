"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CurrentUser } from "@/lib/types";
import UserRegistration from "@/components/user-registration";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highscore, setHighscore] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      // Check if there's a current user in session storage
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          // Redirect to test page if user exists
          router.push('/test');
        } catch (error) {
          console.error('Error parsing stored user:', error);
          sessionStorage.removeItem('currentUser');
        }
      }

      // Fetch highscore
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
      }

      setIsLoading(false);
    };

    loadData();
  }, [router]);

  const handleUserRegistered = (user: CurrentUser) => {
    setCurrentUser(user);
    // Store user in session storage
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    // Redirect to test page after registration
    router.push('/test');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If no current user, show registration form with highscore and scores button
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <UserRegistration onUserRegistered={handleUserRegistered} />
      
      {/* Highscore and Scores Button */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {highscore && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-sm text-white/80 mb-1">Best Time</p>
            <p className="text-2xl font-bold text-yellow-300">
              {highscore}ms
            </p>
          </div>
        )}
        
        <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
          <Link href="/scores" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            View All Scores
          </Link>
        </Button>
      </div>
    </div>
  );
}
