"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrentUser } from "@/lib/types";

interface UserRegistrationProps {
  onUserRegistered: (user: CurrentUser) => void;
}

export default function UserRegistration({ onUserRegistered }: UserRegistrationProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Vänligen fyll i både namn och e-post");
      setIsLoading(false);
      return;
    }

    try {
      // Create user object with current timestamp
      const user: CurrentUser = {
        id: Date.now().toString(), // Simple ID generation
        name: name.trim(),
        email: email.trim(),
        created_at: new Date().toISOString(),
      };

      onUserRegistered(user);
    } catch (err) {
      console.error('Error registering user:', err);
      setError("Misslyckades att registrera användare. Försök igen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Reaktionstest - Samtal
        </h1>
        <p className="text-white/80 mb-4 text-center">
          Ange dina uppgifter för att starta testet
        </p>
        <p className="text-white/60 mb-6 text-center text-sm">
          Du kommer att få en inkommande samtalsnotis - klicka så snabbt som möjligt när samtalet "missas". 
          Vi jämför din tid med vår AI som alltid är blixtsnabb!
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
              Namn
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              placeholder="Ange ditt namn"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              E-post
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              placeholder="Ange din e-post"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-300 text-sm text-center">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            {isLoading ? "Registrerar..." : "Starta Test"}
          </Button>
        </form>
    </div>
  );
}
