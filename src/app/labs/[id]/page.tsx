"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Terminal, CheckCircle, AlertTriangle } from "lucide-react";

export default function LabDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [lab, setLab] = useState<any>(null);
  const [flag, setFlag] = useState("");
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [sandboxCode, setSandboxCode] = useState("");
  const [sandboxResult, setSandboxResult] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch(`/api/labs/${params.id}`, { headers: { "Authorization": "Bearer " + localStorage.getItem("token") } })
        .then(res => res.json())
        .then(data => {
          if (!data.error) setLab(data);
        });
    }
  }, [params.id, user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/labs/${params.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag }),
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    const data = await res.json();
    setMessage({ text: data.message || data.error, type: res.ok ? 'success' : 'error' });
    if (res.ok) setLab({ ...lab, already_solved: true });
  };

  const runSandbox = () => {
    // Simple client-side simulation for "vibe coding" feel
    if (!sandboxCode) return;
    if (sandboxCode.includes("' OR 1=1") || sandboxCode.includes("; ls")) {
      setSandboxResult("EXPLOIT SUCCESS: Root Access Granted.\nFound flag in /root/flag.txt");
    } else {
      setSandboxResult(`Executing query: ${sandboxCode}\nResult: Normal behavior. Try thinking like an attacker.`);
    }
  };

  if (!lab) return <div className="text-primary text-center mt-20">Accessing Target...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Briefing */}
        <div className="w-full md:w-1/3">
          <div className="glass-card p-6 mb-6 border border-primary/30">
            <h1 className="text-2xl font-bold text-primary mb-2">{lab.title}</h1>
            <div className="flex gap-2 mb-4">
              <span className="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded">{lab.category}</span>
              <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">{lab.points} pts</span>
            </div>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">{lab.description}</p>
            
            <div className="bg-bg-dark border border-gray-700 p-4 rounded text-sm text-gray-400 mb-6 font-mono">
              <p className="text-yellow-500 mb-1 flex items-center gap-1"><AlertTriangle size={14}/> INTEL:</p>
              {lab.hint}
            </div>

            {lab.already_solved ? (
              <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded flex items-center gap-2">
                <CheckCircle size={20} />
                <span className="font-bold">Target Compromised</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="FLAG{...}" 
                  className="w-full bg-bg-dark border border-gray-700 rounded p-2 text-text font-mono focus:border-primary outline-none"
                />
                <button type="submit" className="cyber-button w-full py-2 rounded font-bold">Submit Flag</button>
              </form>
            )}

            {message && (
              <div className={`mt-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sandbox */}
        <div className="w-full md:w-2/3">
          <div className="glass-card h-full flex flex-col border border-gray-800 overflow-hidden">
            <div className="bg-black/50 p-3 border-b border-gray-800 flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Terminal size={14} /> Interactive Payload Sandbox
            </div>
            
            <div className="p-4 flex-grow flex flex-col gap-4">
              <div className="flex-grow flex flex-col">
                <label className="text-xs text-primary mb-2 font-mono">Payload Injection Point:</label>
                <textarea 
                  className="flex-grow bg-[#0a0a0f] border border-gray-800 rounded p-4 font-mono text-sm text-green-400 focus:outline-none focus:border-primary resize-none"
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  placeholder="Enter your payload here..."
                />
              </div>
              
              <button onClick={runSandbox} className="cyber-button-secondary py-2 rounded font-bold font-mono text-sm">
                EXECUTE PAYLOAD
              </button>

              <div className="h-48 bg-black rounded border border-gray-800 p-4 font-mono text-sm overflow-y-auto">
                <p className="text-gray-500 mb-2"># Output Console</p>
                {sandboxResult ? (
                  <pre className="text-gray-300 whitespace-pre-wrap">{sandboxResult}</pre>
                ) : (
                  <p className="text-gray-600 italic">Waiting for execution...</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
