import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link2, Sparkles, LogOut, Loader2, ArrowRight } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { generateCoupleCode } from '../lib/utils';
import { useStore } from '../store/useStore';

export function Pairing() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { currentUser } = useStore();

  useEffect(() => {
    // If we generated a code, listen to it to see if someone joins
    if (!generatedCode) return;
    const unsub = onSnapshot(doc(db, 'couples', generatedCode), (doc) => {
      if (doc.exists() && doc.data().user2Id) {
        // Someone joined! The root App listener will pick this up and redirect
      }
    });
    return () => unsub();
  }, [generatedCode]);

  const handleCreateCouple = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const newCode = generateCoupleCode();
      await setDoc(doc(db, 'couples', newCode), {
        user1Id: currentUser.uid,
        user2Id: null, // open for joining
        code: newCode,
        createdAt: serverTimestamp()
      });
      // Set own profile in the couple
      await setDoc(doc(db, `couples/${newCode}/users/${currentUser.uid}`), {
        displayName: currentUser.displayName || 'Partner',
        photoURL: currentUser.photoURL || '',
        mood: '😊 Happy',
        status: 'Online',
        lastActive: serverTimestamp()
      });
      setGeneratedCode(newCode);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !code) return;
    try {
      setLoading(true);
      setError('');
      const cleanCode = code.toUpperCase().trim();
      const coupleRef = doc(db, 'couples', cleanCode);
      const coupleDoc = await getDoc(coupleRef);

      if (!coupleDoc.exists()) {
        throw new Error('Invalid code. Please check and try again.');
      }
      
      const data = coupleDoc.data();
      if (data.user2Id) {
        throw new Error('This couple is already paired.');
      }
      if (data.user1Id === currentUser.uid) {
         throw new Error('You cannot pair with yourself.');
      }

      await updateDoc(coupleRef, {
        user2Id: currentUser.uid
      });
      // Add ourselves to the users subcollection
      await setDoc(doc(db, `couples/${cleanCode}/users/${currentUser.uid}`), {
        displayName: currentUser.displayName || 'Partner',
        photoURL: currentUser.photoURL || '',
        mood: '😊 Happy',
        status: 'Online',
        lastActive: serverTimestamp()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to join.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 flex flex-col gap-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Connect with your partner</h1>
          <p className="text-white/60">Generate a code for them, or enter their code below.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {generatedCode ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl shadow-black/50"
          >
            <p className="text-white/60 mb-4 font-medium">Your Couple Code</p>
            <div className="text-5xl font-mono tracking-widest text-white mb-8 bg-black/20 py-4 px-6 rounded-2xl border border-white/5">
              {generatedCode}
            </div>
            <div className="flex items-center justify-center gap-2 text-rose-400">
               <Loader2 className="w-4 h-4 animate-spin" />
               <span className="text-sm">Waiting for partner to join...</span>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div 
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-black/50"
            >
              <form onSubmit={handleJoinCouple} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Have a code?</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="ENTER 6-DIGIT CODE"
                      className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-5 text-center text-xl font-mono tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-medium"
                      maxLength={6}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-semibold hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Couple'}
                </button>
              </form>
            </motion.div>

            <div className="flex items-center gap-4 text-white/20 px-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs font-medium uppercase tracking-wider">Or</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button
              onClick={handleCreateCouple}
              disabled={loading}
              className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-400 py-4 rounded-[2rem] font-medium hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate New Code
            </button>
          </>
        )}

        <button 
          onClick={() => auth.signOut()}
          className="mt-8 flex items-center justify-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
