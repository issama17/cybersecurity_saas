"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-4">
        <Trophy size={40} className="text-secondary" />
        <div>
          <h1 className="text-4xl font-bold text-primary">Global Leaderboard</h1>
          <p className="text-text-muted mt-1">Top hackers ranked by reputation points.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 text-text-muted text-sm uppercase tracking-wider font-mono">
              <th className="p-4 w-20 text-center">Rank</th>
              <th className="p-4">Hacker Alias</th>
              <th className="p-4 text-right">Reputation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((u, i) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-center font-bold font-mono flex justify-center items-center">
                  {i === 0 ? <Medal className="text-yellow-500" size={24} /> :
                   i === 1 ? <Medal className="text-gray-400" size={24} /> :
                   i === 2 ? <Medal className="text-amber-600" size={24} /> :
                   <span className="text-gray-500">#{i + 1}</span>}
                </td>
                <td className="p-4 font-medium flex items-center gap-2">
                  <span className={i < 3 ? "text-primary" : "text-text"}>{u.username}</span>
                  {u.is_admin && <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">ADMIN</span>}
                </td>
                <td className="p-4 text-right font-mono font-bold text-secondary">{u.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
