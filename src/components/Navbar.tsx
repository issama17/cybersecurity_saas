"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Terminal, LogOut, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-card sticky top-0 z-50 flex items-center justify-between px-8 py-4 mb-8">
      <Link href="/" className="flex items-center gap-2 group">
        <Terminal className="text-primary group-hover:text-primary-hover transition-colors" />
        <span className="font-bold text-xl tracking-wider text-primary group-hover:text-primary-hover transition-colors">
          SECLABS
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/labs" className="text-text hover:text-primary transition-colors">Labs</Link>
        <Link href="/leaderboard" className="text-text hover:text-primary transition-colors">Leaderboard</Link>
        <Link href="/study_hub" className="text-text hover:text-primary transition-colors">Study Hub</Link>
        
        {user ? (
          <div className="flex items-center gap-4 ml-4 border-l border-gray-700 pl-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors">
              <UserIcon size={18} />
              <span>{user.username}</span>
              <span className="bg-primary/10 px-2 py-0.5 rounded text-sm">{user.points} pts</span>
            </Link>
            <button 
              onClick={logout}
              className="text-text-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              <LogOut size={18} />
              <span className="text-sm">Exit</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 ml-4">
            <Link href="/login" className="text-text hover:text-primary transition-colors">Login</Link>
            <Link href="/register" className="cyber-button px-4 py-2 rounded font-medium text-sm">
              Initialize User
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
