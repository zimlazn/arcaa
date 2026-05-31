import { useState } from 'react';
import { useStore } from '../store/useStore';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { LogOut, Smile, Link2, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

const MOODS = [
  '😊 Happy', '😍 In Love', '😴 Sleepy', '😢 Sad', '😡 Angry', '🤒 Sick'
];

export function SettingsPage() {
  const { couple, userProfile, currentUser } = useStore();
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleCopyCode = () => {
    if (!couple?.code) return;
    navigator.clipboard.writeText(couple.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMoodSelect = async (mood: string) => {
    if (!currentUser || !couple) return;
    try {
      setUpdating(true);
      await updateDoc(doc(db, `couples/${couple.id}/users/${currentUser.uid}`), {
        mood,
        lastActive: serverTimestamp() // Update active status at the same time
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-20 md:pb-6 relative px-4 md:px-0">
       <h2 className="text-2xl font-semibold tracking-tight text-white mb-6">Settings</h2>

       <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl">
         <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Smile className="w-4 h-4" /> Your Current Mood
         </h3>
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MOODS.map(mood => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                disabled={updating}
                className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-medium border
                  ${userProfile?.mood === mood
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' 
                    : 'bg-black/20 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
              >
                 {mood}
              </button>
            ))}
         </div>
       </div>

       <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl">
         <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Connection
         </h3>
         
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
           <div>
             <div className="text-white font-medium">Couple Code</div>
             <div className="text-white/50 text-sm">Use this if you ever need to reconnect on a new account</div>
           </div>
           
           <button 
             onClick={handleCopyCode}
             className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-mono tracking-widest font-semibold"
           >
             {couple?.code}
             {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
           </button>
         </div>
       </div>

       <button
         onClick={() => auth.signOut()}
         className="w-full flex items-center justify-center gap-2 py-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition-all font-medium"
       >
         <LogOut className="w-5 h-5" />
         Sign Out
       </button>
    </div>
  );
}
