import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, or } from 'firebase/firestore';
import { useStore } from './store/useStore';

import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './routes/Landing';
import { Pairing } from './routes/Pairing';
import { Home } from './routes/Home';

import { Chat } from './routes/Chat';
import { Feed } from './routes/Feed';
import { SettingsPage } from './routes/Settings';

const Stories = () => <div className="p-4 text-white">Stories (Coming Soon)</div>;
import { LocationPage } from './routes/Location';
import { CalendarPage } from './routes/Calendar';

export default function App() {
  const { 
    currentUser, couple, isLoading, 
    setCurrentUser, setCouple, setLoading,
  } = useStore();

  const [authResolved, setAuthResolved] = useState(false);

  // Monitor Authentication
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthResolved(true);
      if (!user) {
        setCouple(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [setCurrentUser, setCouple, setLoading]);

  // Monitor Couple matching
  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);
    const q = query(
      collection(db, 'couples'),
      or(
        where('user1Id', '==', currentUser.uid),
        where('user2Id', '==', currentUser.uid)
      )
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const coupleDoc = snapshot.docs[0];
        const data = coupleDoc.data();
        setCouple({
          id: coupleDoc.id,
          user1Id: data.user1Id,
          user2Id: data.user2Id,
          code: data.code,
          createdAt: data.createdAt,
          anniversary: data.anniversary
        });
      } else {
        setCouple(null);
      }
      setLoading(false);
    }, (error) => {
       console.error("Error monitoring couples:", error);
       setLoading(false);
    });

    return () => unsub();
  }, [currentUser, setCouple, setLoading]);

  if (!authResolved || (currentUser && isLoading)) {
    return (
      <div className="h-screen w-screen bg-[#020205] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  // Routing Logic
  if (!currentUser) return <Landing />;
  
  // They are authenticated, but not paired in a complete couple?
  // A couple is fully paired if user2Id is present
  if (!couple || !couple.user2Id) {
    return <Pairing />;
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
