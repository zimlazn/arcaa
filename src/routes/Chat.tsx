import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Send, Image as ImageIcon, Smile, Mic, Check, CheckCheck } from 'lucide-react';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function Chat() {
  const { couple, currentUser, partnerProfile } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!couple || !currentUser) return;
    
    const q = query(
      collection(db, `couples/${couple.id}/messages`),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    });

    return () => unsub();
  }, [couple, currentUser]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || !couple || !currentUser) return;

    try {
      const msgText = text;
      setText('');
      await addDoc(collection(db, `couples/${couple.id}/messages`), {
        senderId: currentUser.uid,
        text: msgText,
        type: 'text',
        createdAt: serverTimestamp(),
      });
      // Scroll done by snapshot effect
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] relative mx-auto max-w-3xl bg-black/20 backdrop-blur-3xl md:rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border-b border-white/5 shrink-0 z-10 backdrop-blur-xl">
         <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-white/10 relative">
           {partnerProfile?.photoURL ? (
              <img src={partnerProfile.photoURL} alt="Partner" className="w-full h-full object-cover" />
           ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-rose-400" />
           )}
           <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
         </div>
         <div>
            <h3 className="font-semibold text-white tracking-tight">
               {partnerProfile?.displayName || 'Partner'}
            </h3>
            <p className="text-xs text-white/50 font-medium tracking-wide flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               Online
            </p>
         </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0">
         <AnimatePresence initial={false}>
           {messages.map((msg, index) => {
             const isMe = msg.senderId === currentUser?.uid;
             const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId === currentUser?.uid);
             const timeStr = msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'h:mm a') : 'Now';
             
             return (
               <motion.div
                 key={msg.id}
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 className={cn("flex w-full gap-2", isMe ? "justify-end" : "justify-start")}
               >
                 {!isMe && showAvatar && (
                   <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 self-end mb-1 shrink-0">
                      {partnerProfile?.photoURL && <img src={partnerProfile.photoURL} className="w-full h-full object-cover" />}
                   </div>
                 )}
                 
                 {!isMe && !showAvatar && <div className="w-8 shrink-0" />}

                 <div className={cn(
                   "relative max-w-[75%] px-5 py-3 rounded-[1.5rem]",
                   isMe 
                    ? "bg-gradient-to-bl from-indigo-500 to-blue-600 text-white rounded-br-md shadow-lg shadow-blue-500/20" 
                    : "bg-white/10 backdrop-blur-md text-white/90 border border-white/10 rounded-bl-md"
                 )}>
                   <p className="leading-snug">{msg.text}</p>
                   <div className={cn(
                     "text-[10px] mt-1.5 flex items-center gap-1 justify-end font-medium",
                     isMe ? "text-blue-100" : "text-white/40"
                   )}>
                     <span>{timeStr}</span>
                     {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                   </div>
                 </div>
               </motion.div>
             );
           })}
         </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-t from-slate-950/80 to-transparent shrink-0">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-2xl rounded-full p-2 border border-white/20 shadow-xl">
           <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors shrink-0">
             <ImageIcon className="w-5 h-5" />
           </button>
           
           <form onSubmit={handleSend} className="flex-1 flex">
             <input
               type="text"
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Message..."
               className="w-full bg-transparent border-none focus:outline-none text-white placeholder:text-white/40 px-2"
             />
           </form>

           {text.trim() ? (
              <motion.button 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleSend}
                className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </motion.button>
           ) : (
             <div className="flex items-center gap-1 shrink-0">
               <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                 <Mic className="w-5 h-5" />
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
