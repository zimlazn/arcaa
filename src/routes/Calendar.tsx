import { CalendarHeart } from 'lucide-react';

export function CalendarPage() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center min-h-[50vh]">
      <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center">
         <CalendarHeart className="w-12 h-12 text-rose-400" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Calendar</h2>
      <p className="text-white/50 w-full max-w-sm">
         Keep track of your anniversaries, birthdays, and planned dates. Coming in the next update!
      </p>
    </div>
  );
}
