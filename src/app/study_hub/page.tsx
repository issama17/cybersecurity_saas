"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { BookOpen, User as UserIcon, Calendar } from "lucide-react";

export default function StudyHub() {
  const [notes, setNotes] = useState<any[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch("/api/study_hub", { headers: { "Authorization": "Bearer " + localStorage.getItem("token") } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNotes(data);
        });
    }
  }, [user, loading, router]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-4">
        <BookOpen size={40} className="text-accent" />
        <div>
          <h1 className="text-4xl font-bold text-primary">Community Study Hub</h1>
          <p className="text-text-muted mt-1">Shared intelligence, writeups, and field notes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length > 0 ? notes.map((note) => (
          <motion.div 
            key={note.id}
            whileHover={{ y: -5 }}
            className="glass-card p-6 flex flex-col h-full border border-gray-800 hover:border-accent/50 transition-all"
          >
            <h3 className="text-xl font-bold text-primary mb-3">{note.title}</h3>
            <p className="text-text-muted flex-grow mb-6 whitespace-pre-wrap">{note.content}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800 font-mono">
              <div className="flex items-center gap-1">
                <UserIcon size={12} /> {note.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} /> {note.created_at}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full p-10 text-center glass-card text-text-muted">
            No intel has been shared yet. Be the first to publish field notes!
          </div>
        )}
      </div>
    </motion.div>
  );
}
