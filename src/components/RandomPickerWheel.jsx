import { useState } from 'react';
import { soundEngine } from '../lib/audio';
import { fireConfetti } from '../lib/confetti';

const CLASS_MEMBERS = [
  'Adid', 'Ardyan', 'Alena', 'Vita', 'Abel', 'Cellen', 'Citra',
  'Clara', 'Fahri', 'Faishal', 'Faris', 'Hanun', 'Jasmine',
  'Jelita', 'Ami', 'Naila', 'Kayla', 'Khalista', 'Keke', 'Laila',
  'Balqhis', 'Lintang', 'Elin', 'Zaka', 'Rama', 'Rizki', 'Lala',
  'Nadin', 'Nazril', 'Qina', 'Maulida', 'Rafa', 'Angga', 'Arka', 'Shinta',
  'Shofi'
];

export default function RandomPickerWheel() {
  const [spinning, setSpinning] = useState(false);
  const [selectedName, setSelectedName] = useState(null);
  const [displayIndex, setDisplayIndex] = useState(0);

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedName(null);
    soundEngine.playPop();

    let speed = 40;
    let count = 0;
    const maxSteps = 30 + Math.floor(Math.random() * 15);

    const spinInterval = () => {
      soundEngine.playTick();
      const nextIdx = Math.floor(Math.random() * CLASS_MEMBERS.length);
      setDisplayIndex(nextIdx);
      count++;

      if (count < maxSteps) {
        speed += 6;
        setTimeout(spinInterval, speed);
      } else {
        const finalWinner = CLASS_MEMBERS[nextIdx];
        setSelectedName(finalWinner);
        setSpinning(false);
        soundEngine.playFanfare();
        fireConfetti({ count: 50 });
      }
    };

    spinInterval();
  };

  return (
    <div className="w-full rounded-3xl bg-white text-black p-6 sm:p-8 border border-white/10 shadow-xl overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
            Spin Wheel
          </span>
          <h3 className="text-2xl font-bold tracking-tight mt-2">Spin & Pick Acak Siswa</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Pilihan acak sesuai dengan data yang tersedia
          </p>
        </div>

        <button
          onClick={startSpin}
          disabled={spinning}
          className={`px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-200 touch-manipulation active:scale-95 flex items-center justify-center gap-2 ${
            spinning
              ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200 shadow-lg hover:shadow-white/20'
          }`}
        >
          {spinning ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Memutar...</span>
            </>
          ) : (
            <>
              <span>Acak Sekarang!</span>
            </>
          )}
        </button>
      </div>

      {/* DISPLAY CARD */}
      <div className="mt-6 flex flex-col items-center justify-center p-8 bg-white/10 rounded-2xl border border-white/10 min-h-[160px] text-center">
        {selectedName ? (
          <div className="space-y-2 animate-bounce">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Terpilih
            </span>
            <h4 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mt-2">
              {selectedName}
            </h4>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-5xl opacity-80 transition-transform duration-100">
              {spinning ? CLASS_MEMBERS[displayIndex] : '👤'}
            </span>
            <h4 className="text-2xl font-bold text-zinc-300">
              {spinning ? CLASS_MEMBERS[displayIndex] : 'Klik "Acak Sekarang" untuk Memulai'}
            </h4>
            <p className="text-xs text-zinc-500">
              {spinning ? 'Mengacak dari 36 anggota kelas...' : 'Pilihan dilakukan secara acak & adil.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
