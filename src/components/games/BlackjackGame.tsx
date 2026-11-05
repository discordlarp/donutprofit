'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Club, Coins, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { secureRandom } from '@/lib/cryptoRandom';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  num: number;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: '2', num: 2 },
  { val: '3', num: 3 },
  { val: '4', num: 4 },
  { val: '5', num: 5 },
  { val: '6', num: 6 },
  { val: '7', num: 7 },
  { val: '8', num: 8 },
  { val: '9', num: 9 },
  { val: '10', num: 10 },
  { val: 'J', num: 10 },
  { val: 'Q', num: 10 },
  { val: 'K', num: 10 },
  { val: 'A', num: 11 },
];

function drawCard(): Card {
  const suit = SUITS[Math.floor(secureRandom() * SUITS.length)];
  const cardVal = VALUES[Math.floor(secureRandom() * VALUES.length)];
  return { suit, value: cardVal.val, num: cardVal.num };
}

function calculateHand(cards: Card[]): number {
  let sum = cards.reduce((acc, c) => acc + c.num, 0);
  let aces = cards.filter(c => c.value === 'A').length;
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces -= 1;
  }
  return sum;
}

export default function BlackjackGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'dealer_turn' | 'finished'>('idle');
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [resultMsg, setResultMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const playerTotal = calculateHand(playerCards);
  const dealerTotal = calculateHand(dealerCards);

  const startHand = () => {
    if (gameState === 'playing') return;
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

    const p1 = drawCard();
    const d1 = drawCard();
    const p2 = drawCard();
    const d2 = drawCard();

    const initialPlayer = [p1, p2];
    const initialDealer = [d1, d2];

    setPlayerCards(initialPlayer);
    setDealerCards(initialDealer);
    setGameState('playing');
    setResultMsg('');

    // Check Natural Blackjack
    if (calculateHand(initialPlayer) === 21) {
      if (calculateHand(initialDealer) === 21) {
        finishGame(initialPlayer, initialDealer, 'push');
      } else {
        finishGame(initialPlayer, initialDealer, 'blackjack');
      }
    }
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    const newCard = drawCard();
    const nextPlayer = [...playerCards, newCard];
    setPlayerCards(nextPlayer);

    const total = calculateHand(nextPlayer);
    if (total > 21) {
      finishGame(nextPlayer, dealerCards, 'player_bust');
    } else if (total === 21) {
      stand(nextPlayer);
    }
  };

  const stand = (activePlayerCards = playerCards) => {
    setGameState('dealer_turn');

    let currentDealer = [...dealerCards];
    while (calculateHand(currentDealer) < 17) {
      currentDealer.push(drawCard());
    }
    setDealerCards(currentDealer);

    const pScore = calculateHand(activePlayerCards);
    const dScore = calculateHand(currentDealer);

    if (dScore > 21) {
      finishGame(activePlayerCards, currentDealer, 'dealer_bust');
    } else if (pScore > dScore) {
      finishGame(activePlayerCards, currentDealer, 'win');
    } else if (pScore < dScore) {
      finishGame(activePlayerCards, currentDealer, 'loss');
    } else {
      finishGame(activePlayerCards, currentDealer, 'push');
    }
  };

  const doubleDown = () => {
    if (gameState !== 'playing' || playerCards.length !== 2) return;
    if (!user || betAmount * 2 > user.balance) {
      setErrorMsg('Not enough balance to double down!');
      return;
    }

    setBetAmount(prev => prev * 2);
    const newCard = drawCard();
    const nextPlayer = [...playerCards, newCard];
    setPlayerCards(nextPlayer);

    const total = calculateHand(nextPlayer);
    if (total > 21) {
      finishGame(nextPlayer, dealerCards, 'player_bust');
    } else {
      stand(nextPlayer);
    }
  };

  const finishGame = (pCards: Card[], dCards: Card[], outcome: string) => {
    setGameState('finished');

    let won = false;
    let multiplier = 0;
    let msg = '';

    if (outcome === 'blackjack') {
      won = true;
      multiplier = 1.90;
      msg = '🎉 BLACKJACK! Winner!';
      confetti({ particleCount: 80, spread: 60 });
    } else if (outcome === 'dealer_bust') {
      won = true;
      multiplier = 1.70;
      msg = '🎉 Dealer Busted! You Win!';
      confetti({ particleCount: 70, spread: 60 });
    } else if (outcome === 'win') {
      won = true;
      multiplier = 1.70;
      msg = '🎉 You beat the dealer!';
      confetti({ particleCount: 70, spread: 60 });
    } else if (outcome === 'push') {
      won = true;
      multiplier = 1.0; // Push returns bet
      msg = '🤝 Push (Tie). Bet returned.';
    } else {
      won = false;
      multiplier = 0;
      msg = outcome === 'player_bust' ? '💥 Busted! Over 21.' : '💀 Dealer had higher hand.';
    }

    setResultMsg(msg);
    recordBet('blackjack', betAmount, multiplier, won, { pScore: calculateHand(pCards), dScore: calculateHand(dCards) });
  };

  return (
    <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Club className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-white tracking-wide">DONUT BLACKJACK</h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              DEALER STANDS ON 17
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Classic 21. Beat the DonutSMP Dealer without busting.</p>
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#081e14] via-[#0b281b] to-[#071710] border-2 border-emerald-900/60 rounded-3xl p-6 mb-6 flex flex-col gap-8 min-h-[340px] justify-between shadow-2xl relative overflow-hidden">
        {/* Felt Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-9xl font-black font-mono text-white">DONUT SMP</span>
        </div>

        {/* Dealer Section */}
        <div className="z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Dealer Hand {gameState === 'playing' ? '' : `(${dealerTotal})`}
            </span>
            <span className="text-[10px] bg-black/40 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-bold">
              STANDS ON SOFT 17
            </span>
          </div>

          <div className="flex items-center gap-3">
            {dealerCards.map((c, i) => {
              const hide = gameState === 'playing' && i === 1;
              const isRed = c.suit === '♥' || c.suit === '♦';
              return (
                <div
                  key={i}
                  className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl border flex flex-col justify-between p-2 font-bold shadow-2xl transition-all ${
                    hide
                      ? 'bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-800 border-amber-300/60 text-white items-center justify-center shadow-amber-500/20'
                      : 'bg-gradient-to-b from-white to-neutral-100 border-neutral-300 shadow-md'
                  }`}
                >
                  {hide ? (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-3xl filter drop-shadow">🍩</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-200">DONUT</span>
                    </div>
                  ) : (
                    <>
                      {/* Top Left Pip */}
                      <div className={`flex flex-col items-start leading-none ${isRed ? 'text-red-600' : 'text-neutral-900'}`}>
                        <span className="text-sm font-black font-mono">{c.value}</span>
                        <span className="text-xs">{c.suit}</span>
                      </div>
                      {/* Center Suit Watermark */}
                      <div className={`self-center text-2xl opacity-20 ${isRed ? 'text-red-600' : 'text-neutral-900'}`}>
                        {c.suit}
                      </div>
                      {/* Bottom Right Pip */}
                      <div className={`flex flex-col items-end leading-none rotate-180 ${isRed ? 'text-red-600' : 'text-neutral-900'}`}>
                        <span className="text-sm font-black font-mono">{c.value}</span>
                        <span className="text-xs">{c.suit}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {dealerCards.length === 0 && (
              <span className="text-xs text-emerald-300/40 italic">Cards will appear once dealt</span>
            )}
          </div>
        </div>

        {/* Status Message */}
        {resultMsg && (
          <div className="text-center py-2.5 px-4 bg-black/60 border border-amber-500/30 rounded-xl z-10 shadow-lg animate-fadeIn">
            <span className="text-sm font-black text-amber-400">{resultMsg}</span>
          </div>
        )}

        {/* Player Section */}
        <div className="z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Your Hand {playerCards.length > 0 ? `(${playerTotal})` : ''}
            </span>
            <span className="text-xs font-mono font-black text-amber-400 bg-black/40 px-3 py-1 rounded-lg border border-amber-500/20">
              Bet: ${betAmount}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {playerCards.map((c, i) => {
              const isRed = c.suit === '♥' || c.suit === '♦';
              return (
                <div
                  key={i}
                  className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border bg-gradient-to-b from-white to-neutral-100 border-neutral-300 flex flex-col justify-between p-2 font-bold shadow-2xl transition-transform hover:scale-105"
                >
                  {/* Top Left Pip */}
                  <div className={`flex flex-col items-start leading-none ${isRed ? 'text-red-600' : 'text-neutral-900'}`}>
                    <span className="text-sm font-black font-mono">{c.value}</span>
                    <span className="text-xs">{c.suit}</span>
                  </div>
                  {/* Center Suit Watermark */}
                  <div className={`self-center text-2xl opacity-20 ${isRed ? 'text-red-600' : 'text-neutral-900'}`}>
                    {c.suit}
                  </div>
                  {/* Bottom Right Pip */}
                  <div className={`flex flex-col items-end leading-none rotate-180 ${isRed ? 'text-red-600' : 'text-neutral-900'}`}>
                    <span className="text-sm font-black font-mono">{c.value}</span>
                    <span className="text-xs">{c.suit}</span>
                  </div>
                </div>
              );
            })}
            {playerCards.length === 0 && (
              <span className="text-xs text-emerald-300/40 italic">Press Deal Hand to start playing</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {gameState === 'playing' ? (
          <div className="grid grid-cols-3 gap-3 w-full">
            <button
              type="button"
              onClick={hit}
              className="py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-black shadow-lg shadow-emerald-500/20"
            >
              HIT
            </button>
            <button
              type="button"
              onClick={() => stand()}
              className="py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 text-white shadow-lg"
            >
              STAND
            </button>
            <button
              type="button"
              onClick={doubleDown}
              disabled={playerCards.length !== 2}
              className="py-3.5 rounded-xl font-black text-sm bg-amber-500 hover:bg-amber-600 text-black shadow-lg disabled:opacity-50"
            >
              DOUBLE (2X)
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-full sm:w-1/2">
              <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white font-mono font-bold outline-none focus:border-orange-500 transition"
              />
            </div>

            <button
              type="button"
              onClick={startHand}
              disabled={!user || user.balance <= 0}
              className="w-full sm:w-1/2 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 transform active:scale-[0.98] transition cursor-pointer"
            >
              DEAL CARDS
            </button>
          </>
        )}
      </div>

      {/* Quick Bet Presets when not in hand */}
      {gameState !== 'playing' && (
        <div className="grid grid-cols-5 gap-1.5 mt-2">
          {[
            { label: '1M', val: 1000000 },
            { label: '5M', val: 5000000 },
            { label: '10M', val: 10000000 },
            { label: '25M', val: 25000000 },
            { label: 'MAX', val: user?.balance ?? 0 },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setBetAmount(Math.max(1, Math.min(user?.balance ?? 0, p.val)))}
              className="py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono font-bold text-neutral-300 hover:text-white border border-white/5 transition cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
