"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Terminal, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        <div className="flex justify-center mb-6">
          <Terminal size={64} className="text-primary drop-shadow-[0_0_15px_rgba(0,255,204,0.8)]" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Master Cybersecurity
        </h1>
        
        <p className="text-xl text-text-muted mb-10 leading-relaxed">
          The most advanced, interactive platform for learning ethical hacking, cryptography, and network defense. 
          Vibe-coded for the modern hacker.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/register" className="cyber-button px-8 py-4 rounded font-bold text-lg w-full sm:w-auto">
            Initialize Session
          </Link>
          <Link href="/labs" className="cyber-button-secondary px-8 py-4 rounded font-bold text-lg w-full sm:w-auto">
            Explore Labs
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
      >
        <div className="glass-card p-6 text-left hover:scale-105 transition-transform duration-300">
          <Terminal className="text-primary mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Interactive Shells</h3>
          <p className="text-text-muted">Execute real commands against live virtual machines in our isolated browser-based sandboxes.</p>
        </div>
        <div className="glass-card p-6 text-left hover:scale-105 transition-transform duration-300">
          <Shield className="text-secondary mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Real Vulnerabilities</h3>
          <p className="text-text-muted">Exploit OWASP Top 10 vulnerabilities including SQLi, XSS, and Command Injection.</p>
        </div>
        <div className="glass-card p-6 text-left hover:scale-105 transition-transform duration-300">
          <Zap className="text-accent mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
          <p className="text-text-muted">Get immediate validation on your flags and watch your score rise on the live leaderboard.</p>
        </div>
      </motion.div>
    </div>
  );
}
