"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Zap, Target, CheckCircle, XCircle } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/dashboard", { headers: { "Authorization": "Bearer " + localStorage.getItem("token") } });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, [user]);

  if (loading || !user) return <div className="text-center mt-20 text-primary">Decrypting session...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-primary">Terminal Overview</h1>
          <p className="text-text-muted mt-1">Welcome back, {user.username}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-muted">Rank</p>
          <p className="text-2xl font-bold text-secondary">Hacker</p>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-card p-6 flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-full text-primary">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-text-muted text-sm">Total Rep</p>
                <p className="text-3xl font-bold">{data.points}</p>
              </div>
            </div>
            
            <div className="glass-card p-6 flex items-center gap-4">
              <div className="bg-secondary/20 p-4 rounded-full text-secondary">
                <Target size={24} />
              </div>
              <div>
                <p className="text-text-muted text-sm">Challenges Pwned</p>
                <p className="text-3xl font-bold">{data.total_completed}</p>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4">
              <div className="bg-accent/20 p-4 rounded-full text-accent">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-text-muted text-sm">Security Level</p>
                <p className="text-3xl font-bold">Level {Math.floor(data.points / 100) + 1}</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Recent Network Activity</h2>
          <div className="glass-card overflow-hidden">
            {data.recent_activity.length > 0 ? (
              <ul className="divide-y divide-gray-800">
                {data.recent_activity.map((act: any, i: number) => (
                  <li key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      {act.is_correct ? (
                        <CheckCircle className="text-primary" size={20} />
                      ) : (
                        <XCircle className="text-accent" size={20} />
                      )}
                      <span>
                        Attempted <span className="text-secondary font-medium">{act.challenge_title}</span>
                      </span>
                    </div>
                    <span className="text-sm text-text-muted">
                      {new Date(act.submitted_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-text-muted">No recent activity detected on the network.</div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
