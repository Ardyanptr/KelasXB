import { useState, useEffect } from 'react';

export default function ExamCountdown({ tasks = [], exams = [], onOpenModal }) {
  const [targetEvent, setTargetEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Find closest future task or exam
    const now = new Date();
    let events = [];

    exams.forEach(e => {
      if (e.date) {
        const d = new Date(e.date);
        if (d > now) {
          events.push({ title: `Ulangan ${e.subject}`, date: d, type: 'Ulangan', topic: e.topic });
        }
      }
    });

    tasks.forEach(t => {
      if (t.deadline) {
        const d = new Date(t.deadline);
        if (d > now) {
          events.push({ title: `Tugas ${t.subject}`, date: d, type: 'Tugas', topic: t.title });
        }
      }
    });

    // Fallback default if no future items in database yet
    if (events.length === 0) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      events.push({ title: 'Ulangan Tengah Semester', date: defaultDate, type: 'Ulangan', topic: 'Persiapan UTS X-B' });
    }

    events.sort((a, b) => a.date - b.date);
    const upcoming = events[0];
    setTargetEvent(upcoming);

    const updateCountdown = () => {
      const current = new Date();
      const diff = upcoming.date - current;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [tasks, exams]);

  if (!targetEvent) return null;

  return (
    <div className="w-full rounded-3xl bg-white text-black p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-semibold tracking-widest uppercase text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Tenggat terdekat
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
            {targetEvent.title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {targetEvent.topic ? `${targetEvent.topic}` : 'Mari persiapkan diri bersama-sama!'}
          </p>
        </div>

        {/* TIMER COUNTER BOXES */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {[
            { label: 'HARI', val: timeLeft.days },
            { label: 'JAM', val: timeLeft.hours },
            { label: 'MENIT', val: timeLeft.minutes },
            { label: 'DETIK', val: timeLeft.seconds }
          ].map((item, i) => (
            <div key={i} className="bg-black/5 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-white/10 min-w-[64px]">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-black block">
                {String(item.val).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase mt-0.5 block">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
