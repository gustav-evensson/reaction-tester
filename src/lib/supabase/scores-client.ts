import { createClient } from "./client";
import { Score } from "../types";

// Client-side version of getScores for use in client components
export async function getScoresClient(): Promise<Score[]> {
  const supabase = createClient();

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
