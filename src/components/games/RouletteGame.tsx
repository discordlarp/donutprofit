'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Disc, Coins, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';

type BetOption = 'red' | 'black' | 'gold';

interface RollItem {
  num: number;
  color: BetOption;
}

const WHEEL_ITEMS: RollItem[] = [
  { num: 0, color: 'gold' },
  { num: 1, color: 'red' },
  { num: 14, color: 'black' },
  { num: 2, color: 'red' },
  { num: 13, color: 'black' },
  { num: 3, color: 'red' },
  { num: 12, color: 'black' },
  { num: 4, color: 'red' },
  { num: 11, color: 'black' },
  { num: 5, color: 'red' },
  { num: 10, color: 'black' },
  { num: 6, color: 'red' },
  { num: 9, color: 'black' },
  { num: 7, color: 'red' },
  { num: 8, color: 'black' },
];

export default function RouletteGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [selectedBet, setSelectedBet] = useState<BetOption>('red');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinOffset, setSpinOffset] = useState<number>(0);
  const [history, setHistory] = useState<RollItem[]>([
    { num: 3, color: 'red' },
    { num: 11, color: 'black' },
    { num: 0, color: 'gold' },
    { num: 6, color: 'red' },
    { num: 14, color: 'black' }
  ]);
  const [lastWin, setLastWin] = useState<RollItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSpin = () => {
    if (isSpinning) return;
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please sign in to play.');
      return;
    }

    if (betAmount <= 0) {
      setErrorMsg('Enter a valid bet amount.');
      return;
    }
    if (betAmount > user.balance) {
      setErrorMsg('Insufficient Cash balance!');
      return;
    }

    sound.playClick();
    setIsSpinning(true);

    // Pick random outcome
    // Pick outcome: RIGGED so if user bets on gold, it NEVER lands on gold!
    let winIndex = Math.floor(Math.random() * WHEEL_ITEMS.length);
    if (selectedBet === 'gold') {
      const nonGold = WHEEL_ITEMS.map((item, idx) => item.color !== 'gold' ? idx : -1).filter(i => i !== -1);
      winIndex = nonGold[Math.floor(Math.random() * nonGold.length)];
    }
    const winningItem = WHEEL_ITEMS[winIndex];

    // Compute pixel offset for smooth horizontal rolling (each card is 72px + 8px gap = 80px)
    const cardWidth = 80;
    const baseSpins = 4 * WHEEL_ITEMS.length;
    const targetOffset = (baseSpins + winIndex) * cardWidth + Math.floor(Math.random() * 20 - 10);

    setSpinOffset(prev => prev + targetOffset);

    const isWin = winningItem.color === selectedBet;
    const multiplier = selectedBet === 'gold' ? 5.0 : 2.0;

    setTimeout(() => {
      setIsSpinning(false);
      setLastWin(winningItem);
      setHistory(prev => [winningItem, ...prev.slice(0, 9)]);

      recordBet('roulette', betAmount, multiplier, isWin, { chosenColor: selectedBet, winningItem });

      if (isWin) {
        sound.playWin();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        sound.playBomb();
      }
    }, 4000);
  };

  return (
    <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Disc className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-white tracking-wide">DONUT ROULETTE</h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              CLASSIC WHEEL
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Bet on Red (2x), Black (2x), or Golden Donut (14x).</p>
        </div>

        {/* History */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          <span className="text-[11px] font-bold text-neutral-500 uppercase mr-1">Previous:</span>
          {history.map((h, i) => (
            <span
              key={i}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-extrabold text-xs border ${
                h.color === 'red'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : h.color === 'black'
                  ? 'bg-neutral-800 border-neutral-600 text-white'
                  : 'bg-amber-500/20 border-amber-500/60 text-amber-400 glow-gold'
              }`}
            >
              {h.num}
            </span>
          ))}
        </div>
      </div>

      {/* Horizontal Roulette Spinner Wheel */}
      <div className="relative w-full bg-[#0b0c10] border border-white/10 rounded-2xl p-4 overflow-hidden mb-8">
        {/* Center Target Needle */}
        <div className="absolute left-1/2 -top-1 -bottom-1 w-1 bg-amber-400 z-20 shadow-lg shadow-amber-400/50 -translate-x-1/2">
          <div className="w-4 h-4 bg-amber-400 rotate-45 -top-2 left-1/2 -translate-x-1/2 absolute" />
          <div className="w-4 h-4 bg-amber-400 rotate-45 -bottom-2 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* Scrolling Strip */}
        <div className="relative overflow-hidden w-full h-24 flex items-center">
          <div
            className="flex items-center gap-2 transition-transform duration-[4000ms] cubic-bezier(0.12, 0.8, 0.25, 1)"
            style={{
              transform: `translateX(calc(50% - ${spinOffset}px - 36px))`,
            }}
          >
            {/* Repeat wheel items 15 times for continuous look */}
            {Array(15).fill(WHEEL_ITEMS).flat().map((item, idx) => (
              <div
                key={idx}
                className={`w-[72px] h-[72px] shrink-0 rounded-xl flex flex-col items-center justify-center border font-mono font-black text-lg transition-transform ${
                  item.color === 'red'
                    ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-400/40 text-white'
                    : item.color === 'black'
                    ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 border-white/10 text-neutral-300'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-black shadow-lg shadow-amber-500/30'
                }`}
              >
                <span>{item.num}</span>
                <span className="text-[10px] font-sans uppercase font-bold tracking-widest opacity-80">
                  {item.color === 'gold' ? '🍩 5X' : '2X'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bet Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setSelectedBet('red')}
          disabled={isSpinning}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
            selectedBet === 'red'
              ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20'
              : 'bg-[#151821] border-white/5 text-neutral-400 hover:border-white/20'
          }`}
        >
          <span className="text-xl font-black">RED (1-7)</span>
          <span className="text-xs font-bold text-red-300 mt-1">PAYS 2x</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedBet('gold')}
          disabled={isSpinning}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
            selectedBet === 'gold'
              ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/20'
              : 'bg-[#151821] border-white/5 text-neutral-400 hover:border-white/20'
          }`}
        >
          <span className="text-xl font-black text-amber-400">GOLDEN DONUT (0)</span>
          <span className="text-xs font-bold text-amber-300 mt-1">PAYS 14x</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedBet('black')}
          disabled={isSpinning}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
            selectedBet === 'black'
              ? 'bg-neutral-800 border-neutral-400 text-white shadow-lg'
              : 'bg-[#151821] border-white/5 text-neutral-400 hover:border-white/20'
          }`}
        >
          <span className="text-xl font-black">BLACK (8-14)</span>
          <span className="text-xs font-bold text-neutral-300 mt-1">PAYS 2x</span>
        </button>
      </div>

      {/* Bet Amount & Roll Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-1/2">
          <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="number"
            min="1"
            disabled={isSpinning}
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 pl-9 pr-24 text-white font-mono font-bold outline-none focus:border-orange-500 transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
              className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold"
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => setBetAmount(prev => Math.min(user?.balance ?? 0, prev * 2))}
              className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold"
            >
              2x
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning || !user || user.balance <= 0}
          className="w-full sm:w-1/2 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 transform active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          {isSpinning ? 'SPINNING ROULETTE...' : `SPIN FOR ${selectedBet.toUpperCase()}`}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {lastWin && !isSpinning && (
        <div className="mt-4 text-center">
          <span className="text-xs text-neutral-400">Result: </span>
          <span className="font-bold text-white uppercase">{lastWin.color} ({lastWin.num})</span>
          {lastWin.color === selectedBet ? (
            <span className="text-emerald-400 font-bold ml-2">
              🎉 YOU WON {formatCash(betAmount * (selectedBet === 'gold' ? 5 : 2), { showPlus: true })} CASH!
            </span>
          ) : (
            <span className="text-neutral-500 ml-2">No win this round</span>
          )}
        </div>
      )}
    </div>
  );
}
