import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, MessageCircle, Image, MapPin, Calendar, Heart, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageCircle, label: 'Chat', path: '/chat' },
  { icon: Image, label: 'Memories', path: '/feed' },
  { icon: Heart, label: 'Stories', path: '/stories' },
  { icon: MapPin, label: 'Location', path: '/location' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { couple, userProfile } = useStore();

  if (!couple) {
    return <div className="min-h-screen bg-[#020205] text-white">{children}</div>;
  }

  return (
    <div className="relative min-h-screen bg-[#020205] text-white overflow-hidden font-sans selection:bg-rose-500/30">
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-900/20 blur-[120px]" />
      </div>

      <div className="flex h-screen max-w-7xl mx-auto">
        {/* Desktop Sidebar (Floating Glass) */}
        <nav className="hidden md:flex flex-col w-24 items-center py-8 z-50 bg-white/5 border-r border-white/10 backdrop-blur-3xl shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center mb-12 shadow-lg shadow-rose-500/20">
            <span className="text-2xl font-semibold">S</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-8 w-full items-center">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "p-3 rounded-2xl transition-all cursor-pointer relative group",
                    isActive ? "bg-white/10" : "opacity-40 hover:opacity-100"
                  )}
                >
                  <item.icon className="w-6 h-6 relative z-10" />
                </NavLink>
              );
            })}
          </div>

          <NavLink to="/settings" className="mt-auto">
            {({ isActive }) => (
              <div className={cn(
                "p-3 rounded-2xl transition-all cursor-pointer",
                isActive ? "bg-white/10 opacity-100" : "opacity-40 hover:opacity-100"
              )}>
                <Settings className="w-6 h-6" />
              </div>
            )}
          </NavLink>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden flex flex-col p-4 md:p-8 gap-8 z-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
             {/* Mobile Header */}
             <div className="md:hidden flex items-center justify-between py-4 px-2 mb-2 sticky top-0 z-40 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-indigo-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                  <h1 className="text-lg font-medium tracking-tight">SoulSync</h1>
                </div>
                <NavLink to="/settings" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Settings className="w-5 h-5 text-white/80" />
                </NavLink>
             </div>
             
             {/* Page Content with Transitions */}
             <AnimatePresence mode="wait">
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0, y: 10, scale: 0.98 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: -10, scale: 0.98 }}
                 transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                 className="min-h-full pb-32 md:pb-0" // Padding for mobile nav
               >
                 {children}
               </motion.div>
             </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Floating Glass) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <nav className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-center justify-between shadow-2xl shadow-black/80">
          {NAV_ITEMS.slice(0, 5).map((item) => {
             const isActive = location.pathname === item.path;
             return (
               <NavLink 
                 key={item.path} 
                 to={item.path}
                 className="relative flex-1 flex justify-center py-3"
               >
                 {isActive && (
                    <motion.div
                      layoutId="active-nav-mobile"
                      className="absolute inset-0 bg-white/10 rounded-2xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                 )}
                 <item.icon className={cn("w-6 h-6 relative z-10 transition-colors", isActive ? "text-white" : "text-white/40")} />
               </NavLink>
             )
          })}
        </nav>
      </div>
    </div>
  );
}
