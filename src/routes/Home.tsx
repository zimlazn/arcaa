import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { differenceInDays } from 'date-fns';
import { Heart, MessageCircle, MapPin, Sparkles, Battery, BatteryCharging, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const { couple, currentUser, setPartnerProfile, setUserProfile, userProfile, partnerProfile } = useStore();
  const partnerId = couple?.user1Id === currentUser?.uid ? couple?.user2Id : couple?.user1Id;
  const [daysTogether, setDaysTogether] = useState(0);

  useEffect(() => {
    if (couple?.createdAt) {
      // Use firestore timestamp
      const date = couple.createdAt.toDate ? couple.createdAt.toDate() : new Date();
      setDaysTogether(differenceInDays(new Date(), date));
    }
  }, [couple]);

  useEffect(() => {
    if (!couple || !currentUser || !partnerId) return;

    // Listen to partner profile
    const unsubPartner = onSnapshot(doc(db, `couples/${couple.id}/users/${partnerId}`), (doc) => {
      setPartnerProfile({ id: doc.id, ...doc.data() } as any);
    });

    // Listen to our profile
    const unsubMe = onSnapshot(doc(db, `couples/${couple.id}/users/${currentUser.uid}`), (doc) => {
      setUserProfile({ id: doc.id, ...doc.data() } as any);
    });

    return () => {
      unsubPartner();
      unsubMe();
    };
  }, [couple, currentUser, partnerId, setPartnerProfile, setUserProfile]);

  return (
    <div className="w-full h-full flex flex-col gap-8">
      {/* Header Section */}
      <header className="flex items-center justify-between z-10 shrink-0">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Good morning, {userProfile?.displayName?.split(' ')[0] || 'User'}.</h1>
          <p className="text-white/50 text-sm">
            {partnerProfile?.displayName || 'Partner'} is currently {partnerProfile?.mood?.split(' ').slice(1).join(' ') || 'doing great'}.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2 px-4 border-r border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-medium">{partnerProfile?.displayName?.split(' ')[0] || 'Partner'} Online</span>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Together</span>
              <span className="text-sm font-semibold">{daysTogether} Days</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="flex-1 min-h-[500px] grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6 z-10">
        {/* Partner Spotlight Card */}
        <div className="md:col-span-8 md:row-span-3 bg-white/5 rounded-[32px] border border-white/10 p-8 flex flex-col relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-8 flex gap-2">
             <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium border border-white/10">
               {partnerProfile?.mood || '😊 Happy'}
             </span>
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative shrink-0">
              <div className="w-40 h-40 rounded-full bg-gradient-to-b from-rose-400 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden border-4 border-[#020205]">
                  {partnerProfile?.photoURL ? (
                    <img src={partnerProfile.photoURL} alt="Partner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-rose-500 p-3 rounded-2xl shadow-xl shadow-rose-500/40">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold">{partnerProfile?.displayName || 'Partner'}</h2>
              <p className="text-lg text-white/60 flex items-center gap-2">
                Currently at: <span className="text-white">Home</span>
              </p>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Battery</span>
                  <span className="font-medium">{partnerProfile?.battery || '100'}% • Charging</span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Mood</span>
                  <span className="font-medium">{partnerProfile?.mood || '😍 Feeling Loved'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Mini Widget */}
        <div className="md:col-span-4 md:row-span-3 bg-white/5 rounded-[32px] border border-white/10 p-6 flex flex-col backdrop-blur-xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Live Location</span>
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
           </div>
           <div className="flex-1 rounded-2xl bg-slate-900 border border-white/5 overflow-hidden flex flex-col items-center justify-center p-4">
              <div className="text-center">
                  <p className="text-white/60 text-xs px-4">Live map data protected by end-to-end encryption.</p>
                  <Link to="/location" className="mt-4 inline-block px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs transition-all">
                    Open Full Map
                  </Link>
              </div>
           </div>
        </div>

        {/* Recent Memory Card */}
        <div className="md:col-span-5 md:row-span-3 bg-white/5 rounded-[32px] border border-white/10 p-6 flex flex-col backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Recent Memory</h3>
            <Sparkles className="w-5 h-5 text-rose-400" />
          </div>
          <Link to="/feed" className="flex-1 bg-white/5 rounded-2xl border border-white/10 flex items-end p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:scale-105 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="relative z-20">
              <p className="text-lg font-medium">Shared Moments</p>
              <p className="text-xs text-white/60 mt-1">Tap to see your private feed.</p>
            </div>
          </Link>
        </div>

        {/* Quick Chat */}
        <div className="md:col-span-7 md:row-span-3 bg-white/5 rounded-[32px] border border-white/10 p-6 flex flex-col backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">
                Chatting with {partnerProfile?.displayName?.split(' ')[0] || 'Partner'}
              </h3>
            </div>
            <Link to="/chat" className="text-xs text-white/40 hover:text-white transition-colors">
              Open Chat
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-3 justify-end relative z-10">
            <div className="flex justify-start">
              <div className="bg-white/10 px-4 py-2.5 rounded-2xl rounded-bl-none text-sm border border-white/5 max-w-[80%]">
                Hey! See you soon? ❤️
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-rose-600/30 px-4 py-2.5 rounded-2xl rounded-br-none text-sm border border-rose-500/20 max-w-[80%]">
                Yes! On my way!
              </div>
            </div>
            <Link to="/chat" className="mt-4 flex gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white/40 text-left cursor-text">
                Say something sweet...
              </div>
              <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <footer className="h-12 flex items-center justify-between z-10 shrink-0 pb-4">
        <div className="flex gap-4 md:gap-8 text-[11px] text-white/30 uppercase tracking-[0.2em] font-semibold">
          <Link to="/feed" className="hover:text-white transition-colors">Memories</Link>
          <Link to="/stories" className="hover:text-white transition-colors">Stories</Link>
          <Link to="/calendar" className="hover:text-white transition-colors">Calendar</Link>
        </div>
        <div className="flex items-center gap-2 text-white/40 hidden md:flex">
          <span className="text-xs">SoulSync Secure Connection Active</span>
          <Heart className="w-4 h-4" />
        </div>
      </footer>
    </div>
  );
}
