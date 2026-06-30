"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Database, TerminalSquare, Lock } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const iconMap: any = {
  "Injection": <Database size={20} className="text-primary" />,
  "Cross-Site Scripting (XSS)": <TerminalSquare size={20} className="text-secondary" />,
  "Cryptography": <Lock size={20} className="text-accent" />,
};

export default function Labs() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch("/api/labs", { headers: { "Authorization": "Bearer " + localStorage.getItem("token") } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setLabs(data);
          }
          setLoadingLabs(false);
        });
    }
  }, [user, loading, router]);

  if (loading || loadingLabs) return <div className="text-center mt-20 text-primary">Scanning network for targets...</div>;

  const categories = Array.from(new Set(labs.map(l => l.category)));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-primary mb-2">Vulnerability Labs</h1>
      <p className="text-text-muted mb-10">Select a target system to begin your authorized penetration test.</p>

      {categories.map((cat, i) => (
        <div key={i} className="mb-12">
          <h2 className="text-2xl font-bold border-b border-gray-800 pb-2 mb-6 flex items-center gap-2 text-secondary">
            {iconMap[cat as string] || <ShieldAlert size={20} />}
            {cat as string}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.filter(l => l.category === cat).map((lab) => (
              <Link href={`/labs/${lab.id}`} key={lab.id}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 h-full border border-gray-800 hover:border-primary transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{lab.title}</h3>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-mono">
                      {lab.points} pts
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mb-4">{lab.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      lab.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      lab.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {lab.difficulty}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
