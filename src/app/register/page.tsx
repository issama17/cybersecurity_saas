"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { checkAuth } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        await checkAuth(); // Update global context
        router.push("/dashboard");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-secondary mb-6 text-center">Initialize User</h2>
        
        {error && (
          <div className="bg-accent/20 border border-accent text-accent px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-text-muted mb-1 text-sm">Alias (Username)</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-dark border border-gray-700 rounded p-2 text-text focus:outline-none focus:border-secondary transition-colors"
              placeholder="zerocool"
            />
          </div>

          <div>
            <label className="block text-text-muted mb-1 text-sm">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-dark border border-gray-700 rounded p-2 text-text focus:outline-none focus:border-secondary transition-colors"
              placeholder="hacker@seclabs.io"
            />
          </div>
          
          <div>
            <label className="block text-text-muted mb-1 text-sm">Passphrase</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-dark border border-gray-700 rounded p-2 text-text focus:outline-none focus:border-secondary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="cyber-button-secondary w-full py-3 rounded font-bold mt-4">
            Generate Keypair & Join
          </button>
        </form>
      </motion.div>
    </div>
  );
}
