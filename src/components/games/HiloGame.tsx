'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { secureRandom } from '@/lib/cryptoRandom';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';

interface Card {
  val: string;
  num: number;
  suit: '♠' | '♥' | '♦' | '♣';
  color: 'red' | 'black';
}

const SUITS: { suit: Card['suit']; color: Card['color'] }[] = [
  { suit: '♠', color: 'black' },
  { suit: '♥', color: 'red' },
  { suit: '♦', color: 'red' },
  { suit: '♣', color: 'black' },
];

const CARD_RANKS = [
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

function getRandomCard(): Card {
  const rank = CARD_RANKS[Math.floor(secureRandom() * CARD_RANKS.length)];
  const suit = SUITS[Math.floor(secureRandom() * SUITS.length)];
  return { ...rank, ...suit };
}

export default function HiloGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [currentCard, setCurrentCard] = useState<Card>({ val: '8', num: 8, suit: '♦', color: 'red' });
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const playGuess = useCallback((guess: 'higher' | 'lower') => {
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
    sound.playCard();

    const rolled = getRandomCard();
    const won = guess === 'higher' ? rolled.num >= currentCard.num : rolled.num <= currentCard.num;
    const mult = 1.68;

    setTimeout(() => {
      setNextCard(rolled);
      setLastWin(won);
      setIsDealing(false);

      if (won) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        if (nextStreak >= 3) {
          sound.playJackpot();
          confetti({ particleCount: 80, spread: 70 });
        } else {
          sound.playCashout();
          confetti({ particleCount: 45, spread: 50 });
        }
      } else {
        setStreak(0);
        sound.playBomb();
      }

      recordBet('hilo', betAmount, mult, won, { current: currentCard.val, next: rolled.val, guess });
      setCurrentCard(rolled);
    }, 700);
  }, [isDealing, user, betAmount, currentCard, streak, recordBet]);

  // Keyboard shortcut listener (ArrowUp = Higher, ArrowDown = Lower)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        playGuess('higher');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        playGuess('lower');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playGuess]);

  const setBetQuick = (val: number) => {
    sound.playChip();
    setBetAmount(Math.max(1, Math.floor(val)));
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
              UP TO 20.00x+
            </span>
            {streak > 1 && (
              <span className="bg-amber-500/20 text-amber-400 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 animate-pulse">
                <Flame className="w-3.5 h-3.5" /> {streak} STREAK
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Guess whether the next dealt card is higher or lower. [Shortcut: ↑ Up / ↓ Down]
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cards Arena */}
      <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-8 mb-6 flex items-center justify-center gap-8 min-h-[200px] relative">
        {/* Current Card */}
        <div className="w-28 h-40 bg-white rounded-2xl flex flex-col justify-between p-3.5 text-neutral-900 shadow-2xl border-2 border-neutral-300 transform -rotate-3 transition-transform hover:scale-105">
          <div className="flex justify-between items-start">
            <span className={`font-black text-xl leading-none ${currentCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
              {currentCard.val}
            </span>
            <span className={`text-base leading-none ${currentCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
              {currentCard.suit}
            </span>
          </div>
          <span className={`text-4xl text-center font-bold ${currentCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
            {currentCard.suit}
          </span>
          <div className="flex justify-between items-end rotate-180">
            <span className={`font-black text-xl leading-none ${currentCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
              {currentCard.val}
            </span>
            <span className={`text-base leading-none ${currentCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
              {currentCard.suit}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-black text-neutral-500">VS</span>
          {lastWin !== null && !isDealing && (
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              lastWin ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {lastWin ? 'WON!' : 'LOST'}
            </span>
          )}
        </div>

        {/* Next Card */}
        <div className={`w-28 h-40 rounded-2xl flex flex-col justify-between p-3.5 shadow-2xl border-2 transition-all duration-300 ${
          nextCard && !isDealing
            ? 'bg-white text-neutral-900 border-neutral-300 transform rotate-3 scale-105'
            : isDealing
            ? 'bg-[#1a1e2d] border-emerald-400/50 animate-pulse flex items-center justify-center'
            : 'bg-[#181a24] border-white/10 text-neutral-600 flex items-center justify-center'
        }`}>
          {nextCard && !isDealing ? (
            <>
              <div className="flex justify-between items-start">
                <span className={`font-black text-xl leading-none ${nextCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
                  {nextCard.val}
                </span>
                <span className={`text-base leading-none ${nextCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
                  {nextCard.suit}
                </span>
              </div>
              <span className={`text-4xl text-center font-bold ${nextCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
                {nextCard.suit}
              </span>
              <div className="flex justify-between items-end rotate-180">
                <span className={`font-black text-xl leading-none ${nextCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
                  {nextCard.val}
                </span>
                <span className={`text-base leading-none ${nextCard.color === 'red' ? 'text-red-600' : 'text-neutral-900'}`}>
                  {nextCard.suit}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-3xl">{isDealing ? '🃏' : '❓'}</span>
              <span className="text-[10px] font-mono text-neutral-500 font-bold">{isDealing ? 'Dealing...' : 'Hidden'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-neutral-400">BET:</span>
          <input
            type="number"
            min={1}
            disabled={isDealing}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
            className="w-24 bg-[#181a24] border border-white/10 rounded-lg py-1.5 px-3 text-white font-mono font-bold text-xs outline-none focus:border-green-500"
          />
          <div className="flex items-center gap-1">
            <button
              disabled={isDealing}
              onClick={() => setBetQuick(betAmount / 2)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              ½
            </button>
            <button
              disabled={isDealing}
              onClick={() => setBetQuick(betAmount * 2)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              2x
            </button>
            <button
              disabled={isDealing}
              onClick={() => setBetQuick(50)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              $50
            </button>
            <button
              disabled={isDealing}
              onClick={() => setBetQuick(250)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              $250
            </button>
            <button
              disabled={isDealing}
              onClick={() => setBetQuick(user?.balance ?? 1000)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-emerald-400"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => playGuess('higher')}
            disabled={isDealing}
            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" /> HIGHER (1.68x) [↑]
          </button>
          <button
            onClick={() => playGuess('lower')}
            disabled={isDealing}
            className="flex-1 sm:flex-none px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <TrendingDown className="w-4 h-4" /> LOWER (1.68x) [↓]
          </button>
        </div>
      </div>
    </div>
  );
}
