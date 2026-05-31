import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, LogIn, Mail } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function Landing() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Ensure user profile exists (Split collection pattern)
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white overflow-hidden flex flex-col relative font-sans selection:bg-rose-500/30">
      {/* Cinematic Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-900/20 blur-[120px] pointer-events-none" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-lg mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-400 to-indigo-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-rose-500/20 mb-8 relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </motion.div>
            <div className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-1.5 border border-white/10">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          
          <h1 className="text-5xl font-medium tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            SoulSync
          </h1>
          <p className="text-lg text-white/50 mb-0 font-medium tracking-wide">
            The private world for just the two of you.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-4 px-6 rounded-2xl font-semibold hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-white/10 transition-all active:scale-[0.98] opacity-50 cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continue with Apple
            </button>
          </div>
          
          <p className="text-center text-white/40 text-sm mt-8">
            By continuing, you agree to our Terms and Privacy Policy. Private and end-to-end encrypted.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
