'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { TrendingUp, TrendingDown, Coins, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const CARDS = [
  { val: '2', num: 2 },
  { val: '3', num: 3 },
  { val: '4', num: 4 },
  { val: '5', num: 5 },
  { val: '6', num: 6 },
  { val: '7', num: 7 },
  { val: '8', num: 8 },
  { val: '9', num: 9 },
  { val: '10', num: 10 },
  { val: 'J', num: 11 },
  { val: 'Q', num: 12 },
  { val: 'K', num: 13 },
  { val: 'A', num: 14 },
];

export default function HiloGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [currentCard, setCurrentCard] = useState(CARDS[6]); // 8
  const [nextCard, setNextCard] = useState<typeof CARDS[0] | null>(null);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const playGuess = (guess: 'higher' | 'lower') => {
    if (isDealing) return;
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

    setIsDealing(true);

    const rolled = CARDS[Math.floor(Math.random() * CARDS.length)];
    const won = guess === 'higher' ? rolled.num >= currentCard.num : rolled.num <= currentCard.num;
    const mult = 1.92;

    setTimeout(() => {
      setNextCard(rolled);
      setLastWin(won);
      setIsDealing(false);

      if (won) {
        confetti({ particleCount: 70, spread: 60 });
      }

      recordBet('hilo', betAmount, mult, won, { current: currentCard.val, next: rolled.val, guess });
      setCurrentCard(rolled);
    }, 800);
  };

  return (
    <div className="bg-[#12141a] border border-green-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-black text-white tracking-wide">DONUT HILO</h2>
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-500/30">
              HIGH / LOW CARDS
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Guess whether the next dealt card is higher or lower.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cards Arena */}
      <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-8 mb-6 flex items-center justify-center gap-8 min-h-[180px]">
        {/* Current Card */}
        <div className="w-24 h-36 bg-white rounded-xl flex flex-col justify-between p-3 text-neutral-900 shadow-xl border-2 border-neutral-300 transform -rotate-3">
          <span className="font-black text-lg">{currentCard.val}</span>
          <span className="text-3xl text-center text-red-600">♦</span>
          <span className="font-black text-lg text-right">{currentCard.val}</span>
        </div>

        <span className="text-2xl font-black text-neutral-500">VS</span>

        {/* Next Card */}
        <div className={`w-24 h-36 rounded-xl flex flex-col justify-between p-3 shadow-xl border-2 transition ${
          nextCard
            ? 'bg-white text-neutral-900 border-neutral-300 transform rotate-3'
            : 'bg-[#181a24] border-white/10 text-neutral-600 flex items-center justify-center'
        }`}>
          {nextCard ? (
            <>
              <span className="font-black text-lg">{nextCard.val}</span>
              <span className="text-3xl text-center text-neutral-900">♠</span>
              <span className="font-black text-lg text-right">{nextCard.val}</span>
            </>
          ) : (
            <span className="text-3xl">❓</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-neutral-400">BET:</span>
          <input
            type="number"
            min={1}
            disabled={isDealing}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
            className="w-28 bg-[#181a24] border border-white/10 rounded-lg py-2 px-3 text-white font-mono font-bold text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => playGuess('higher')}
            disabled={isDealing}
            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" /> HIGHER (1.92x)
          </button>
          <button
            onClick={() => playGuess('lower')}
            disabled={isDealing}
            className="flex-1 sm:flex-none px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <TrendingDown className="w-4 h-4" /> LOWER (1.92x)
          </button>
        </div>
      </div>
    </div>
  );
}
