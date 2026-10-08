import { useState, useEffect } from 'react';
import { soundEngine } from '../lib/audio';
import { fireConfetti } from '../lib/confetti';

const MOODS = [
  { id: 'semangat', emoji: '🔥', label: 'Semangat', color: 'from-orange-500 to-amber-400' },
  { id: 'gaskeun', emoji: '🚀', label: 'Gaskeun', color: 'from-blue-500 to-cyan-400' },
  { id: 'ambisius', emoji: '📚', label: 'Ambisius', color: 'from-purple-500 to-indigo-400' },
  { id: 'ngantuk', emoji: '😴', label: 'Ngantuk', color: 'from-zinc-500 to-slate-400' },
  { id: 'santai', emoji: '🎉', label: 'Santai', color: 'from-emerald-500 to-teal-400' }
];

const DEFAULT_VOTES = { semangat: 14, gaskeun: 18, ambisius: 9, ngantuk: 6, santai: 12 };

export default function ClassMoodTracker() {
  const [votes, setVotes] = useState(DEFAULT_VOTES);
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem('xb_mood_votes');
      const savedSelected = localStorage.getItem('xb_user_mood');
      if (savedVotes) setVotes(JSON.parse(savedVotes));
      if (savedSelected) setSelectedMood(savedSelected);
    } catch {}
  }, []);

  const handleVote = (moodId, emoji, e) => {
    soundEngine.playPop();

    // Trigger floating emoji burst
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    fireConfetti({ count: 18, emojis: [emoji], x, y });

    const isSame = selectedMood === moodId;
    const newSelected = isSame ? null : moodId;
    
    setVotes(prev => {
      const updated = { ...prev };
      if (selectedMood && updated[selectedMood] > 0) {
        updated[selectedMood] -= 1;
      }
      if (!isSame) {
        updated[moodId] = (updated[moodId] || 0) + 1;
      }
      try {
        localStorage.setItem('xb_mood_votes', JSON.stringify(updated));
        localStorage.setItem('xb_user_mood', newSelected || '');
      } catch {}
      return updated;
    });

    setSelectedMood(newSelected);
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="w-full rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 shadow-xl border border-white/10 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            ⚡ Interactive Class Bar
          </span>
          <h3 className="text-2xl font-bold tracking-tight mt-2">Bagaimana Mood X-B Hari Ini?</h3>
          <p className="text-xs text-zinc-400 mt-1">Pilih reaksimu untuk mengekspresikan suasana kelas saat ini!</p>
        </div>
        <div className="text-right self-start sm:self-auto">
          <span className="text-xs font-mono text-zinc-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            👥 {totalVotes} Suara Masuk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {MOODS.map(m => {
          const count = votes[m.id] || 0;
          const pct = Math.round((count / totalVotes) * 100);
          const isChosen = selectedMood === m.id;

          return (
            <button
              key={m.id}
              onClick={(e) => handleVote(m.id, m.emoji, e)}
              className={`flex flex-col items-center justify-between p-4 rounded-2xl border transition-all duration-200 touch-manipulation active:scale-95 ${
                isChosen
                  ? 'border-white bg-white/15 shadow-lg scale-[1.02]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-4xl mb-2 transition-transform group-hover:scale-110">
                {m.emoji}
              </span>
              <span className="text-sm font-semibold">{m.label}</span>

              <div className="w-full mt-3 bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${m.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="text-xs font-mono text-zinc-400 mt-2">
                {count} ({pct}%)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
