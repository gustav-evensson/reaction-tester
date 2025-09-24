import { createClient } from "./server";
import { cookies } from "next/headers";
import { Score } from "../types";

export async function getScores(): Promise<Score[]> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from('scores')
    .select('id, score, user_name, user_email, created_at')
    .order('score', { ascending: true }) // Best scores first (lowest reaction time)
    .limit(50); // Limit to top 50 scores

  if (error) {
    console.error('Error fetching scores:', error);
    return [];
  }

  return data || [];
}

export async function saveScore(score: number, userName: string, userEmail: string): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from('scores')
    .insert({
      score: score,
      user_name: userName,
      user_email: userEmail,
    });

  if (error) {
    console.error('Error saving score:', error);
    return false;
  }

  return true;
}
