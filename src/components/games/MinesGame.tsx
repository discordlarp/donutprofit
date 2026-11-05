'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Bomb, Gem, Coins, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

interface TileState {
  revealed: boolean;
  isMine: boolean;
}

export default function MinesGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [mineCount, setMineCount] = useState<number>(3);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [grid, setGrid] = useState<TileState[]>(Array(25).fill({ revealed: false, isMine: false }));
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Progressive multiplier:
  // Smooth natural scaling: Tile 1: 1.05x | Tile 2: 1.11x | Tile 3: 1.18x | Tile 4: 1.27x | Tile 5: 1.38x ...
  const calculateMultiplier = (mines: number, revealed: number) => {
    if (revealed === 0) return 1.0;
    if (revealed === 1) return 1.05;
    if (revealed === 2) return 1.11;
    if (revealed === 3) return 1.18;
    if (revealed === 4) return 1.27;
    // Gradual smooth progression without abrupt jumps
    let mult = 1.27;
    for (let i = 5; i <= revealed; i++) {
      mult += 0.08 + (i - 4) * 0.025;
    }
    return Number(mult.toFixed(2));
  };

  const currentMultiplier = calculateMultiplier(mineCount, revealedCount);
  const nextMultiplier = calculateMultiplier(mineCount, revealedCount + 1);

  const startGame = () => {
    if (gameActive) return;
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

    // Place mines using cryptographically secure hardware RNG (resistant to console overrides)
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(secureRandom() * 25));
    }

    const newGrid: TileState[] = Array(25).fill(null).map((_, i) => ({
      revealed: false,
      isMine: mineIndices.has(i),
    }));

    setGrid(newGrid);
    setRevealedCount(0);
    setGameOver(false);
    setIsWin(false);
    setGameActive(true);
  };

  const clickTile = (index: number) => {
    if (!gameActive || grid[index].revealed || gameOver) return;

    const tile = grid[index];

    // RIGGED: If they attempt to click a 5th tile, it is 100% rigged to hit a bomb and lose!
    const nextRevealedCount = revealedCount + 1;
    if (nextRevealedCount >= 5) {
      tile.isMine = true;
    }

    if (tile.isMine) {
      // Hit a mine!
      sound.playBomb();
      const revealedAll = grid.map((t, idx) => {
        if (idx === index) return { revealed: true, isMine: true };
        return { ...t, revealed: true };
      });
      setGrid(revealedAll);
      setGameOver(true);
      setGameActive(false);
      setIsWin(false);
      recordBet('mines', betAmount, 0, false, { mineCount, revealedCount });
      return;
    }

    // Safe gem (Only allowed on tiles 1 to 4 and strictly below 5.00x)
    sound.playGem();
    const newGrid = [...grid];
    newGrid[index] = { ...tile, revealed: true };
    setGrid(newGrid);

    const nextCount = revealedCount + 1;
    setRevealedCount(nextCount);

    // Safeguard: If somehow nextCount >= 5, explode immediately
    if (nextCount >= 5) {
      sound.playBomb();
      const revealedAll = newGrid.map((t, idx) => idx === index ? { revealed: true, isMine: true } : { ...t, revealed: true });
      setGrid(revealedAll);
      setGameOver(true);
      setGameActive(false);
      setIsWin(false);
      recordBet('mines', betAmount, 0, false, { mineCount, revealedCount });
      return;
    }

    // Check if all safe tiles cleared
    if (nextCount === 25 - mineCount) {
      handleCashout(calculateMultiplier(mineCount, nextCount));
    }
  };

  const handleCashout = (overrideMult?: number) => {
    if (!gameActive || revealedCount === 0) return;

    sound.playWin();
    const finalMult = overrideMult || currentMultiplier;
    // Reveal all remaining
    const revealedAll = grid.map(t => ({ ...t, revealed: true }));
    setGrid(revealedAll);
    setGameOver(true);
    setGameActive(false);
    setIsWin(true);

    recordBet('mines', betAmount, finalMult, true, { mineCount, revealedCount });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bomb className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-white tracking-wide">DONUT MINES</h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              5x5 GRID &bull; UP TO 25.00x+
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Uncover golden gems, dodge the rotten donut bombs, and cash out anytime.</p>
        </div>

        {gameActive && (
          <div className="flex items-center gap-3 bg-[#0b0c10] border border-orange-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-neutral-400">Current Payout:</span>
            <span className="text-amber-400 font-extrabold font-mono text-sm">
              {formatCash(betAmount * currentMultiplier)} ({currentMultiplier}x)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Bet & Mine Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
              Bet Amount
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                disabled={gameActive}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 pl-9 pr-24 text-white font-mono font-bold outline-none focus:border-orange-500 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
                  disabled={gameActive}
                  className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold"
                >
                  ½
                </button>
                <button
                  type="button"
                  onClick={() => setBetAmount(prev => Math.min(user?.balance ?? 0, prev * 2))}
                  disabled={gameActive}
                  className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold"
                >
                  2x
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex justify-between">
              <span>Mines Count: {mineCount}</span>
              <span className="text-neutral-500">{25 - mineCount} Gems</span>
            </label>
            <select
              value={mineCount}
              disabled={gameActive}
              onChange={(e) => setMineCount(Number(e.target.value))}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 px-3 text-white font-bold outline-none focus:border-orange-500 transition"
            >
              {[1, 2, 3, 4, 5, 7, 10, 15, 20, 24].map(n => (
                <option key={n} value={n} className="bg-neutral-900">{n} Mines</option>
              ))}
            </select>
          </div>

          {gameActive && (
            <div className="bg-[#0b0c10] border border-white/5 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="text-neutral-400">Next Tile Multiplier:</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">+{nextMultiplier}x</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          {gameActive ? (
            <button
              type="button"
              onClick={() => handleCashout()}
              disabled={revealedCount === 0}
              className={`w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                revealedCount > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 text-black shadow-emerald-500/25 animate-pulse'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {revealedCount > 0 ? `CASHOUT ${formatCash(betAmount * currentMultiplier)} CASH` : 'PICK A TILE FIRST'}
            </button>
          ) : (
            <button
              type="button"
              onClick={startGame}
              disabled={!user || user.balance <= 0}
              className="w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 transform active:scale-[0.98] transition"
            >
              BET & START MINES
            </button>
          )}
        </div>

        {/* Right Side: 5x5 Grid */}
        <div className="lg:col-span-7 bg-[#0b0c10] border border-white/5 p-4 sm:p-6 rounded-2xl flex flex-col items-center justify-center">
          <div className="grid grid-cols-5 gap-2.5 sm:gap-3 w-full max-w-[360px] aspect-square">
            {grid.map((tile, i) => (
              <button
                key={i}
                type="button"
                onClick={() => clickTile(i)}
                disabled={!gameActive || tile.revealed}
                className={`rounded-xl border flex items-center justify-center transition-all transform active:scale-95 aspect-square ${
                  tile.revealed
                    ? tile.isMine
                      ? 'bg-red-500/25 border-red-500 shadow-lg shadow-red-500/30 animate-shake'
                      : 'bg-emerald-500/25 border-emerald-400 shadow-lg shadow-emerald-500/30'
                    : gameActive
                    ? 'bg-gradient-to-b from-[#232734] to-[#13161f] border-t border-white/20 border-b border-black/80 hover:from-[#2c3142] hover:to-[#181c28] hover:border-orange-500/50 cursor-pointer shadow-md'
                    : 'bg-[#14161f] border-white/5 opacity-80 cursor-default shadow-inner'
                }`}
              >
                {tile.revealed ? (
                  tile.isMine ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]">
                      <svg viewBox="0 0 40 40" className="w-full h-full">
                        <rect x="5" y="8" width="30" height="26" rx="4" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
                        <rect x="5" y="17" width="30" height="8" fill="#F8FAFC" />
                        <text x="20" y="23.5" fontSize="6.5" fontWeight="900" fill="#0F172A" textAnchor="middle" fontFamily="monospace">TNT</text>
                        <path d="M20,8 Q24,3 27,4" fill="none" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="27" cy="4" r="2.5" fill="#FBBF24" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center filter drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse">
                      <svg viewBox="0 0 40 40" className="w-full h-full">
                        <polygon points="20,2 37,12 37,28 20,38 3,28 3,12" fill="#10B981" stroke="#34D399" strokeWidth="1.5" />
                        <polygon points="20,6 33,14 20,22 7,14" fill="#6EE7B7" opacity="0.8" />
                        <polygon points="7,14 20,22 20,34 7,26" fill="#059669" />
                        <polygon points="33,14 20,22 20,34 33,26" fill="#047857" />
                        <polygon points="20,6 20,22 7,14" fill="#A7F3D0" opacity="0.6" />
                      </svg>
                    </div>
                  )
                ) : (
                  <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-white/20 to-white/5 border border-white/10 shadow-sm" />
                )}
              </button>
            ))}
          </div>

          {/* Outcome Status */}
          {gameOver && (
            <div className="mt-4 text-center">
              {isWin ? (
                <p className="text-emerald-400 font-extrabold text-sm">
                  🎉 CASHOUT SUCCESSFUL! {formatCash(betAmount * currentMultiplier, { showPlus: true })} CASH
                </p>
              ) : (
                <p className="text-red-400 font-extrabold text-sm">
                  💥 BOOM! Hit a Rotten Mine. Better luck next time!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
